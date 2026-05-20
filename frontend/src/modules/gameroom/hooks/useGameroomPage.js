import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gameroomService } from '../services/gameroomService.js';
import { getStoredAuthIdentity, resolveAuthIdentity } from '../utils/authIdentity.js';
import { SAFE_MARKER_OPTIONS, isSafeMarker } from '../../../shared/utils/marker.utils.js';
import { socialService } from '../../social/services/socialService.js';
import {
  HOST_APPROVAL_SECONDS,
  buildEmptyPlayers,
  mapRoomPlayersToSlots,
  mapSlotsToRoomPlayers,
  normalizeRoomPlayersForSync,
  arePlayerSlotsEqual,
  areRoomPayloadsEqual,
  normalizeSupportedRoomSize,
} from '../utils/gameroom.page.utils.js';
import { attachGameroomSocketListeners } from '../utils/gameroomSocketListeners.js';
import { useGameroomActions } from './useGameroomActions.js';
import { useGameroomInvites } from './useGameroomInvites.js';

export function useGameroomPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authIdentity, setAuthIdentity] = useState(getStoredAuthIdentity);
  const [roomSize, setRoomSize] = useState(2);
  const [players, setPlayers] = useState(buildEmptyPlayers);
  const [roomData, setRoomData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [friends, setFriends] = useState([]);
  const [returnToRoute, setReturnToRoute] = useState(location.state?.returnTo || '/createroom');
  const [hasHydratedRoomPlayers, setHasHydratedRoomPlayers] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [pendingInviteApproval, setPendingInviteApproval] = useState(null);
  const [approvalCountdown, setApprovalCountdown] = useState(HOST_APPROVAL_SECONDS);
  const roomDataRef = useRef(null);
  const hasLocalSlotChangesRef = useRef(false);
  const authIdentityRef = useRef(null);
  const buildGameStartPayloadRef = useRef(null);
  const hasNavigatedToGameRef = useRef(false);

  useEffect(() => {
    roomDataRef.current = roomData;
  }, [roomData]);

  useEffect(() => {
    authIdentityRef.current = authIdentity;
  }, [authIdentity]);

  const currentUserId = authIdentity?.userId || authIdentity?.id || 'anonymous';
  const currentUserName = authIdentity?.name || authIdentity?.username || 'Player';

  const normalizeChatMessageForClient = useCallback((message = {}) => {
    const senderId = String(message.senderId || '');
    const isOwn = Boolean(senderId && senderId === String(currentUserId));
    return {
      id: String(message.id || `${message.createdAt || Date.now()}-${senderId}`),
      senderId,
      author: isOwn ? 'You' : (message.senderName || 'Player'),
      text: String(message.text || ''),
      createdAt: message.createdAt,
      isOwn,
    };
  }, [currentUserId]);

  const isCurrentUserHost = Boolean(
    authIdentity?.userId && roomData?.host && String(authIdentity.userId) === String(roomData.host)
  );
  const roomPlayerIds = useMemo(() => new Set(
    (roomData?.players || [])
      .filter((player) => player?.type !== 'ai')
      .map((player) => String(player?.userId || ''))
      .filter(Boolean)
  ), [roomData?.players]);
  const hasOpenRoomSlot = (roomData?.players || []).filter(Boolean).length
    < normalizeSupportedRoomSize(roomData?.size || roomSize);

  const {
    buildGameStartPayload, navigateToGameStart, resetRoom,
    handleCreateRoom, handleAddAI, handleAddLocalPlayer, handleRemoveAI, handleSendMessage,
    canChangePlayerMarker, handleChangePlayerMarker, handleStartGame, handleBack, handleSettings,
  } = useGameroomActions({
    authIdentity, authIdentityRef, currentUserId, currentUserName, isCurrentUserHost,
    roomData, roomDataRef, players, isStartingGame, returnToRoute, location, navigate,
    hasLocalSlotChangesRef, hasNavigatedToGameRef, buildGameStartPayloadRef,
    normalizeChatMessageForClient,
    setPlayers, setRoomData, setRoomSize, setMessages, setHasHydratedRoomPlayers, setIsStartingGame,
  });

  const { respondToInviteApproval, handleInvite } = useGameroomInvites({
    currentUserId, currentUserName, isCurrentUserHost, roomData, roomDataRef,
    roomPlayerIds, hasOpenRoomSlot, friends, pendingInviteApproval, setPendingInviteApproval,
  });

  useEffect(() => {
    buildGameStartPayloadRef.current = buildGameStartPayload;
  }, [buildGameStartPayload]);

  useEffect(() => {
    let isMounted = true;
    const hydrateAuthIdentity = async () => {
      const resolvedIdentity = await resolveAuthIdentity();
      if (!isMounted) return;
      setAuthIdentity(resolvedIdentity);
    };
    hydrateAuthIdentity();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!pendingInviteApproval || !isCurrentUserHost) return undefined;

    const startedAt = Date.now();
    queueMicrotask(() => setApprovalCountdown(HOST_APPROVAL_SECONDS));

    const timer = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      const remainingSeconds = Math.max(0, HOST_APPROVAL_SECONDS - elapsedSeconds);
      setApprovalCountdown(remainingSeconds);

      if (remainingSeconds <= 0) {
        window.clearInterval(timer);
        respondToInviteApproval(false, 'timeout');
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [isCurrentUserHost, pendingInviteApproval, respondToInviteApproval]);

  useEffect(() => {
    let isMounted = true;
    const loadFriends = async () => {
      try {
        const summary = await socialService.getSummary();
        if (!isMounted) return;
        setFriends((summary?.friends || []).map((friend) => ({
          ...friend,
          id: friend.userId,
          isOnline: Boolean(friend.isOnline),
        })));
      } catch (error) {
        if (isMounted) {
          console.error('Error loading friends:', error);
          setFriends([]);
        }
      }
    };
    loadFriends();
    const refreshTimer = window.setInterval(loadFriends, 10000);
    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    const createdRoom = location.state?.createdRoom;
    const nextReturnToRoute = location.state?.returnTo;
    const timer = window.setTimeout(() => {
      if (nextReturnToRoute) setReturnToRoute(nextReturnToRoute);
      if (createdRoom && !roomData) {
        handleCreateRoom(createdRoom);
        navigate(location.pathname, { replace: true, state: null });
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [handleCreateRoom, location.pathname, location.state, navigate, roomData]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!roomData) {
        resetRoom();
        return;
      }
      const nextPlayers = mapRoomPlayersToSlots(roomData, authIdentity);
      setPlayers((currentPlayers) => (
        arePlayerSlotsEqual(currentPlayers, nextPlayers) ? currentPlayers : nextPlayers
      ));
      setHasHydratedRoomPlayers(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [authIdentity, resetRoom, roomData, roomSize]);

  useEffect(() => {
    if (!roomData?._id || !hasHydratedRoomPlayers) return;
    if (!hasLocalSlotChangesRef.current) return;
    if (!authIdentity?.userId || String(authIdentity.userId) !== String(roomData.host)) return;

    const nextRoomPlayers = mapSlotsToRoomPlayers(players, roomData);
    const currentRoomPlayers = JSON.stringify(normalizeRoomPlayersForSync(roomData.players));
    const nextPlayersJson = JSON.stringify(nextRoomPlayers);
    if (currentRoomPlayers === nextPlayersJson) return;

    const syncPlayers = async () => {
      try {
        const updatedRoom = await gameroomService.updateRoomPlayers(roomData._id, nextRoomPlayers);
        hasLocalSlotChangesRef.current = false;
        setRoomData((currentRoom) => (
          areRoomPayloadsEqual(currentRoom, updatedRoom) ? currentRoom : updatedRoom
        ));
      } catch (error) {
        console.error('Error syncing room players:', error);
      }
    };
    syncPlayers();
  }, [authIdentity, hasHydratedRoomPlayers, players, roomData]);

  useEffect(() => {
    const activeRoomId = roomData?.roomId;
    const activeRoomMongoId = roomData?._id;
    if (!activeRoomId || !activeRoomMongoId) return undefined;

    const closeLocalRoom = () => {
      setRoomData(null);
      resetRoom();
      navigate(returnToRoute);
    };

    return attachGameroomSocketListeners({
      activeRoomId, activeRoomMongoId, currentUserId, currentUserName, isCurrentUserHost,
      navigateToGameStart, normalizeChatMessageForClient, hasNavigatedToGameRef,
      roomDataRef, setRoomData, setMessages, setPendingInviteApproval, closeLocalRoom,
    });
  }, [
    currentUserId, currentUserName, isCurrentUserHost, navigate, navigateToGameStart,
    normalizeChatMessageForClient, resetRoom, returnToRoute, roomData?._id, roomData?.roomId,
  ]);

  const activePlayers = players.filter(Boolean);
  const allPlayersHaveMarkers = activePlayers.every((player) => isSafeMarker(player.marker));
  const canStartGame = activePlayers.length >= 2
    && activePlayers.some((player) => player.type !== 'ai')
    && allPlayersHaveMarkers;
  const startGameDisabledReason = canStartGame
    ? ''
    : activePlayers.length >= 2 && !allPlayersHaveMarkers
      ? 'Every player must choose a marker before starting the game.'
      : 'Add one more player or AI before starting the game.';

  return {
    roomSize,
    players,
    roomData,
    messages,
    friends,
    markerOptions: SAFE_MARKER_OPTIONS,
    pendingInviteApproval,
    approvalCountdown,
    isCurrentUserHost,
    canStartGame: canStartGame && !isStartingGame,
    startGameDisabledReason,
    handleCreateRoom,
    handleAddAI,
    handleAddLocalPlayer,
    handleRemoveAI,
    handleSendMessage,
    handleInvite,
    canChangePlayerMarker,
    handleChangePlayerMarker,
    handleApproveInviteApproval: () => respondToInviteApproval(true, 'approved'),
    handleDeclineInviteApproval: () => respondToInviteApproval(false, 'declined'),
    handleStartGame,
    handleBack,
    handleSettings,
  };
}

export default useGameroomPage;

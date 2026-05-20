import { useCallback } from 'react';
import { gameroomService } from '../services/gameroomService.js';
import ROUTES from '../../../router/routes.config.js';
import { isSafeMarker } from '../../../shared/utils/marker.utils.js';
import {
  mapRoomPlayersToSlots,
  mapSlotsToRoomPlayers,
  normalizeRoomPlayersForSync,
  areRoomPayloadsEqual,
  buildEmptyPlayers,
  buildAISlot,
  buildLocalPlayerSlot,
  isRemovableSlot,
  normalizeSupportedRoomSize,
  buildGameStartPayload as buildGameStartPayloadPure,
  validateStartGame,
} from '../utils/gameroom.page.utils.js';

export function useGameroomActions({
  authIdentity,
  authIdentityRef,
  currentUserId,
  currentUserName,
  isCurrentUserHost,
  roomData,
  roomDataRef,
  players,
  isStartingGame,
  returnToRoute,
  location,
  navigate,
  hasLocalSlotChangesRef,
  hasNavigatedToGameRef,
  buildGameStartPayloadRef,
  normalizeChatMessageForClient,
  setPlayers,
  setRoomData,
  setRoomSize,
  setMessages,
  setHasHydratedRoomPlayers,
  setIsStartingGame,
}) {
  const buildGameStartPayload = useCallback(
    (room, roomPlayers) => buildGameStartPayloadPure(room, roomPlayers, returnToRoute),
    [returnToRoute],
  );

  const navigateToGameStart = useCallback((startedRoom) => {
    if (!startedRoom || hasNavigatedToGameRef.current) return;
    const buildPayload = buildGameStartPayloadRef.current;
    if (typeof buildPayload !== 'function') return;

    hasNavigatedToGameRef.current = true;
    const roomPlayers = mapRoomPlayersToSlots(startedRoom, authIdentityRef.current).filter(Boolean);
    const target = buildPayload(startedRoom, roomPlayers);
    navigate(ROUTES.GAME_LOADING, {
      state: { targetRoute: target.route, targetState: target.state },
    });
  }, [authIdentityRef, buildGameStartPayloadRef, hasNavigatedToGameRef, navigate]);

  const handleCreateRoom = useCallback((room) => {
    if (!room) return;
    setRoomData(room);
    setRoomSize(normalizeSupportedRoomSize(room.size));
    setPlayers(mapRoomPlayersToSlots(room, authIdentity));
    setHasHydratedRoomPlayers(true);
  }, [authIdentity, setHasHydratedRoomPlayers, setPlayers, setRoomData, setRoomSize]);

  const handleAddAI = (slotIndex, difficulty) => {
    hasLocalSlotChangesRef.current = true;
    setPlayers((current) => {
      const next = [...current];
      next[slotIndex] = buildAISlot(slotIndex, difficulty);
      return next;
    });
  };

  const handleAddLocalPlayer = (slotIndex, rawName) => {
    if (!String(rawName || '').trim()) return;
    hasLocalSlotChangesRef.current = true;
    setPlayers((current) => {
      const next = [...current];
      next[slotIndex] = buildLocalPlayerSlot(slotIndex, rawName);
      return next;
    });
  };

  const handleRemoveAI = (slotIndex) => {
    setPlayers((prev) => {
      if (!isRemovableSlot(prev[slotIndex])) return prev;
      hasLocalSlotChangesRef.current = true;
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const resetRoom = useCallback(() => {
    setPlayers(buildEmptyPlayers());
    setHasHydratedRoomPlayers(false);
  }, [setHasHydratedRoomPlayers, setPlayers]);

  const handleSendMessage = useCallback(async (message) => {
    const text = String(message || '').trim();
    if (!text || !roomData?._id) return;

    try {
      const saved = await gameroomService.sendRoomChatMessage(roomData._id, {
        senderId: currentUserId, senderName: currentUserName, text,
      });
      const normalized = normalizeChatMessageForClient(saved);
      setMessages((current) => (
        current.some((item) => item.id === normalized.id) ? current : [...current, normalized]
      ));
    } catch (error) {
      console.error('Error sending room chat:', error);
      alert(error.message || 'Could not send chat message.');
    }
  }, [currentUserId, currentUserName, normalizeChatMessageForClient, roomData?._id, setMessages]);

  const canChangePlayerMarker = useCallback((player) => {
    if (!player) return false;
    const playerUserId = String(player.userId || '');
    const viewerId = String(currentUserId || '');
    const isOwnHumanPlayer = player.type !== 'ai' && playerUserId && playerUserId === viewerId;
    const isHostManagedSlot = isCurrentUserHost && (
      player.type === 'ai' || playerUserId.startsWith('local_player_')
    );
    return Boolean(isOwnHumanPlayer || isHostManagedSlot);
  }, [currentUserId, isCurrentUserHost]);

  const handleChangePlayerMarker = useCallback(async (slotIndex, nextMarker) => {
    if (!roomData?._id || !isSafeMarker(nextMarker)) return;
    if (!canChangePlayerMarker(players[slotIndex])) return;

    const nextPlayers = players.map((player, index) => (
      index === slotIndex && player ? { ...player, marker: nextMarker } : player
    ));
    setPlayers(nextPlayers);

    try {
      const updated = await gameroomService.updateRoomPlayers(
        roomData._id, mapSlotsToRoomPlayers(nextPlayers, roomData),
      );
      setRoomData((current) => (areRoomPayloadsEqual(current, updated) ? current : updated));
    } catch (error) {
      console.error('Error updating player marker:', error);
      alert(error.message || 'Could not update marker.');
      setPlayers(mapRoomPlayersToSlots(roomDataRef.current || roomData, authIdentity));
    }
  }, [authIdentity, canChangePlayerMarker, players, roomData, roomDataRef, setPlayers, setRoomData]);

  const handleStartGame = async () => {
    if (!roomData || isStartingGame) return;

    const validationError = validateStartGame(players);
    if (validationError) {
      alert(validationError);
      return;
    }

    const nextRoom = { ...roomData, players: mapSlotsToRoomPlayers(players, roomData) };
    setIsStartingGame(true);
    try {
      let startedRoom = nextRoom;
      if (roomData._id) {
        const currentPlayers = JSON.stringify(normalizeRoomPlayersForSync(roomData.players));
        const nextPlayers = JSON.stringify(normalizeRoomPlayersForSync(nextRoom.players));
        if (currentPlayers !== nextPlayers) {
          startedRoom = await gameroomService.updateRoomPlayers(roomData._id, nextRoom.players);
        }
        const startPayload = await gameroomService.startRoom(roomData._id, nextRoom.players);
        startedRoom = startPayload?.room || startedRoom;
      }
      navigateToGameStart(startedRoom);
    } catch (error) {
      console.error('Error starting room:', error);
      alert(error.message || 'Could not start the room.');
    } finally {
      setIsStartingGame(false);
    }
  };

  const handleBack = async () => {
    if (roomData?._id) {
      try {
        await gameroomService.removeCurrentPlayerFromRoom(roomData._id);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }
    setRoomData(null);
    setRoomSize(2);
    setMessages([]);
    resetRoom();
    navigate(returnToRoute);
  };

  const handleSettings = () => {
    navigate(ROUTES.SETTINGS, {
      state: {
        returnTo: location.pathname,
        returnState: { createdRoom: roomData, returnTo: returnToRoute },
      },
    });
  };

  return {
    buildGameStartPayload,
    navigateToGameStart,
    resetRoom,
    handleCreateRoom,
    handleAddAI,
    handleAddLocalPlayer,
    handleRemoveAI,
    handleSendMessage,
    canChangePlayerMarker,
    handleChangePlayerMarker,
    handleStartGame,
    handleBack,
    handleSettings,
  };
}

export default useGameroomActions;

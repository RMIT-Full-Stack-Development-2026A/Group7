import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gameroomService } from '../services/gameroomService.js';
import { getStoredAuthIdentity, resolveAuthIdentity } from '../utils/authIdentity.js';
import ROUTES from '../../../router/routes.config.js';
import { AI_AVATAR, getRawAvatarValue, resolveAvatarUrl } from '../../../shared/utils/avatar.utils.js';

const DEFAULT_FRIENDS = [
  {
    id: 1,
    name: 'Sarah Chen',
    avatar:
      'https://images.unsplash.com/photo-1743247299142-8f1c919776c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200',
    isOnline: true,
  },
  {
    id: 2,
    name: 'Mike Johnson',
    avatar:
      'https://images.unsplash.com/photo-1759701546655-d90ec831aa52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200',
    isOnline: true,
  },
  {
    id: 3,
    name: 'Alex Rivera',
    avatar:
      'https://images.unsplash.com/photo-1637767125552-b89f5e1ab923?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200',
    isOnline: false,
  },
  {
    id: 4,
    name: 'Emily Davis',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    isOnline: true,
  },
];

const getActiveSlotIndices = (size) => {
  if (size === 2) {
    return [0, 2];
  }

  if (size === 3) {
    return [0, 2, 3];
  }

  return [0, 1, 2, 3];
};

const buildEmptyPlayers = () => [null, null, null, null];
const getHumanSlotName = (slotIndex, isHostPlayer = false) => (isHostPlayer ? 'Host' : `p${slotIndex + 1}`);
const getAISlotName = (slotIndex) => `AI-${slotIndex + 1}`;
const isLegacySlotLabel = (value = '') => /^p\d+$/i.test(String(value).trim());

const resolveHumanPlayerIdentity = (player, slotIndex, isHostPlayer, authIdentity) => {
  const isCurrentUser = Boolean(
    authIdentity?.userId && player?.userId && String(authIdentity.userId) === String(player.userId)
  );

  return {
    name: player?.name || (isCurrentUser ? (authIdentity.name || authIdentity.username) : null) || getHumanSlotName(slotIndex, isHostPlayer),
    avatar: player?.avatar || player?.avatarUrl || (isCurrentUser ? authIdentity.avatar : '') || '',
  };
};

const mapRoomPlayersToSlots = (room, authIdentity = null) => {
  const nextPlayers = buildEmptyPlayers();
  const activeSlots = getActiveSlotIndices(Number(room?.size) || 4);
  const roomPlayers = Array.isArray(room?.players) ? room.players : [];
  const hostUserId = room?.host ? String(room.host) : null;

  const hostPlayer = hostUserId
    ? roomPlayers.find((player) => String(player?.userId) === hostUserId)
    : null;
  const guestPlayers = roomPlayers.filter((player) => String(player?.userId) !== hostUserId);
  const orderedPlayers = hostPlayer ? [hostPlayer, ...guestPlayers] : roomPlayers;

  orderedPlayers.forEach((player, index) => {
    const slotIndex = activeSlots[index];

    if (slotIndex === undefined) {
      return;
    }

    const isHostPlayer = hostUserId && String(player?.userId) === hostUserId;
    const humanIdentity = player?.type === 'ai'
      ? null
      : resolveHumanPlayerIdentity(player, slotIndex, Boolean(isHostPlayer), authIdentity);
    const normalizedAIName = getAISlotName(slotIndex);
    const normalizedHumanName = player?.name && !isLegacySlotLabel(player.name)
      ? player.name
      : (humanIdentity?.name || getHumanSlotName(slotIndex, Boolean(isHostPlayer)));

    nextPlayers[slotIndex] = {
      id: slotIndex + 1,
      name: player?.type === 'ai' ? normalizedAIName : normalizedHumanName,
      avatar: player?.type === 'ai'
        ? resolveAvatarUrl(player?.avatar || AI_AVATAR, { isAI: true })
        : resolveAvatarUrl(humanIdentity?.avatar),
      isHost: Boolean(isHostPlayer),
      type: player.type || 'human',
      aiDifficulty: player.aiDifficulty,
      userId: player?.userId,
    };
  });

  return nextPlayers;
};

const mapSlotsToRoomPlayers = (players, room) => {
  const activeSlots = getActiveSlotIndices(Number(room?.size) || 4);
  const hostUserId = room?.host ? String(room.host) : null;

  return activeSlots
    .map((slotIndex) => {
      const player = players[slotIndex];

      if (!player) {
        return null;
      }

      const isHostPlayer = Boolean(
        (player.userId && hostUserId && String(player.userId) === hostUserId) || player.isHost
      );

      return {
        userId: player.userId || (player.type === 'ai' ? `ai_slot_${slotIndex + 1}` : (isHostPlayer ? room.host : null)),
        name: player.type === 'ai'
          ? getAISlotName(slotIndex)
          : ((player.name && !isLegacySlotLabel(player.name))
            ? player.name
            : getHumanSlotName(slotIndex, isHostPlayer)),
        avatar: player.type === 'ai'
          ? getRawAvatarValue(player.avatar || AI_AVATAR)
          : getRawAvatarValue(player.avatar),
        type: player.type || 'human',
        ...(player.aiDifficulty ? { aiDifficulty: player.aiDifficulty } : {}),
      };
    })
    .filter(Boolean);
};

const normalizeRoomPlayersForSync = (players = []) =>
  players.map((player) => ({
    userId: player.userId,
    name: player.name,
    avatar: getRawAvatarValue(player.avatar),
    type: player.type || 'human',
    ...(player.aiDifficulty ? { aiDifficulty: player.aiDifficulty } : {}),
  }));

export function useGameroomPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authIdentity, setAuthIdentity] = useState(getStoredAuthIdentity);
  const [roomSize, setRoomSize] = useState(4);
  const [players, setPlayers] = useState(buildEmptyPlayers);
  const [roomData, setRoomData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [friends] = useState(DEFAULT_FRIENDS);
  const [returnToRoute, setReturnToRoute] = useState(location.state?.returnTo || '/createroom');
  const [hasHydratedRoomPlayers, setHasHydratedRoomPlayers] = useState(false);

  const buildGameStartPayload = (room, roomPlayers) => {
    const settings = room?.gameSettings || {};
    const rawBoardSize = typeof settings.boardSize === 'number'
      ? settings.boardSize
      : Number(String(settings.boardSize || '10').match(/(?:^|\D)(10|15)(?=\D|$)/)?.[1] || 10);
    const normalizedBoardSize = rawBoardSize === 15 ? 15 : 10;
    const aiPlayer = roomPlayers.find((player) => player?.type === 'ai');
    const hasHumanOpponent = roomPlayers.filter(Boolean).some((player) => player?.type !== 'ai' && !player?.isHost);
    const shouldUseSingleplayerRoute = Boolean(aiPlayer) && roomPlayers.length === 2;

    return {
      route: shouldUseSingleplayerRoute ? ROUTES.VS_COMPUTER : ROUTES.VS_FRIEND,
      state: {
        roomId: room?.roomId,
        roomDbId: room?._id,
        boardSize: normalizedBoardSize,
        timeControl: settings.timeToThink || 60,
        aiDifficulty: aiPlayer?.aiDifficulty || 'medium',
        returnTo: ROUTES.GAMEROOM,
        roomState: {
          createdRoom: room,
          returnTo: returnToRoute,
        },
        hasHumanOpponent,
      },
    };
  };

  useEffect(() => {
    let isMounted = true;

    const hydrateAuthIdentity = async () => {
      const resolvedIdentity = await resolveAuthIdentity();

      if (!isMounted) {
        return;
      }

      setAuthIdentity(resolvedIdentity);
    };

    hydrateAuthIdentity();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateRoom = useCallback((room) => {
    if (!room) {
      return;
    }

    setRoomData(room);
    setRoomSize(Number(room.size) || 4);
    setPlayers(mapRoomPlayersToSlots(room, authIdentity));
    setHasHydratedRoomPlayers(true);
  }, [authIdentity]);

  const handleAddAI = (slotIndex, difficulty) => {
    setPlayers((currentPlayers) => {
      const nextPlayers = [...currentPlayers];
      nextPlayers[slotIndex] = {
        id: slotIndex + 1,
        name: getAISlotName(slotIndex),
        avatar: AI_AVATAR,
        isHost: false,
        type: 'ai',
        aiDifficulty: difficulty,
      };
      return nextPlayers;
    });
  };

  const handleRemoveAI = (slotIndex) => {
    setPlayers((prevPlayers) => {
      const nextPlayers = [...prevPlayers];
      const player = nextPlayers[slotIndex];

      if (!player || player.type !== 'ai') {
        return prevPlayers;
      }

      nextPlayers[slotIndex] = null;
      return nextPlayers;
    });
  };

  const resetRoom = useCallback(() => {
    setPlayers(buildEmptyPlayers());
    setHasHydratedRoomPlayers(false);
  }, []);

  useEffect(() => {
    const createdRoom = location.state?.createdRoom;
    const nextReturnToRoute = location.state?.returnTo;
    const timer = window.setTimeout(() => {
      if (nextReturnToRoute) {
        setReturnToRoute(nextReturnToRoute);
      }

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

      setPlayers(mapRoomPlayersToSlots(roomData, authIdentity));
      setHasHydratedRoomPlayers(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [authIdentity, resetRoom, roomData, roomSize]);

  useEffect(() => {
    if (!roomData?._id || !hasHydratedRoomPlayers) {
      return;
    }

    if (!authIdentity?.userId || String(authIdentity.userId) !== String(roomData.host)) {
      return;
    }

    const nextRoomPlayers = mapSlotsToRoomPlayers(players, roomData);
    const currentRoomPlayers = JSON.stringify(normalizeRoomPlayersForSync(roomData.players));
    const nextPlayersJson = JSON.stringify(nextRoomPlayers);

    if (currentRoomPlayers === nextPlayersJson) {
      return;
    }

    const syncPlayers = async () => {
      try {
        const updatedRoom = await gameroomService.updateRoomPlayers(roomData._id, nextRoomPlayers);
        setRoomData(updatedRoom);
      } catch (error) {
        console.error('Error syncing room players:', error);
      }
    };

    syncPlayers();
  }, [authIdentity, hasHydratedRoomPlayers, players, roomData]);

  const handleSendMessage = (message) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: `${Date.now()}-${prevMessages.length}`,
        author: 'You',
        text: message,
      },
    ]);
  };

  const handleInvite = (friendId) => {
    const friend = friends.find((item) => item.id === friendId);
    console.log('Invited friend:', friend?.name);
  };

  const handleStartGame = () => {
    if (!roomData) {
      return;
    }

    const activePlayers = players.filter(Boolean);
    const humanPlayers = activePlayers.filter((player) => player.type !== 'ai');

    if (activePlayers.length < 2) {
      alert('Add one more player or AI before starting the game.');
      return;
    }

    if (humanPlayers.length === 0) {
      alert('At least one human player is required to start the game.');
      return;
    }

    const nextRoom = {
      ...roomData,
      players: mapSlotsToRoomPlayers(players, roomData),
    };

    const target = buildGameStartPayload(nextRoom, activePlayers);
    navigate(ROUTES.GAME_LOADING, {
      state: {
        targetRoute: target.route,
        targetState: target.state,
      },
    });

    if (roomData._id) {
      window.setTimeout(() => {
        gameroomService.startRoom(roomData._id).catch((error) => {
          console.error('Error starting room:', error);
        });
      }, 0);
    }
  };

  const handleBack = async () => {
    if (roomData?._id && !isCurrentUserHost) {
      try {
        await gameroomService.removeCurrentPlayerFromRoom(roomData._id);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }

    setRoomData(null);
    setRoomSize(4);
    setMessages([]);
    resetRoom();
    navigate(returnToRoute);
  };

  const handleSettings = () => {
    navigate(ROUTES.SETTINGS, {
      state: {
        returnTo: location.pathname,
        returnState: {
          createdRoom: roomData,
          returnTo: returnToRoute,
        },
      },
    });
  };

  const isCurrentUserHost = Boolean(
    authIdentity?.userId && roomData?.host && String(authIdentity.userId) === String(roomData.host)
  );

  return {
    roomSize,
    players,
    roomData,
    messages,
    friends,
    isCurrentUserHost,
    handleCreateRoom,
    handleAddAI,
    handleRemoveAI,
    handleSendMessage,
    handleInvite,
    handleStartGame,
    handleBack,
    handleSettings,
  };
}

export default useGameroomPage;

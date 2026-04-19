import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gameroomService } from '../services/gameroomService.js';
import { getStoredAuthIdentity, resolveAuthIdentity } from '../utils/authIdentity.js';
import ROUTES from '../../../router/routes.config.js';

const AI_AVATAR =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdDSVVP_wL7wjVO9MdHRFNITzjGa_LYBJNgA&s';

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

const mapRoomPlayersToSlots = (room) => {
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

    nextPlayers[slotIndex] = {
      id: slotIndex + 1,
      name: player?.name || (isHostPlayer ? 'Host' : `p${slotIndex + 1}`),
      avatar: player?.avatar || (player?.type === 'ai' ? AI_AVATAR : ''),
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
        name: player.name || (isHostPlayer ? 'Host' : `p${slotIndex + 1}`),
        avatar: player.avatar || (player.type === 'ai' ? AI_AVATAR : ''),
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
    avatar: player.avatar,
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

  const handleCreateRoom = (room) => {
    if (!room) {
      return;
    }

    setRoomData(room);
    setRoomSize(Number(room.size) || 4);
    setPlayers(mapRoomPlayersToSlots(room, authIdentity));
    setHasHydratedRoomPlayers(true);
  };

  const handleAddAI = (slotIndex, difficulty) => {
    setPlayers((currentPlayers) => {
      const nextPlayers = [...currentPlayers];
      nextPlayers[slotIndex] = {
        id: slotIndex + 1,
        name: `p${slotIndex + 1}`,
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

  const resetRoom = () => {
    setPlayers(buildEmptyPlayers());
    setHasHydratedRoomPlayers(false);
  };

  useEffect(() => {
    const createdRoom = location.state?.createdRoom;
    const nextReturnToRoute = location.state?.returnTo;

    if (nextReturnToRoute) {
      setReturnToRoute(nextReturnToRoute);
    }

    if (createdRoom && !roomData) {
      handleCreateRoom(createdRoom);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate, roomData]);

  useEffect(() => {
    if (!roomData) {
      resetRoom();
      return;
    }

    setPlayers(mapRoomPlayersToSlots(roomData));
    setHasHydratedRoomPlayers(true);
  }, [authIdentity, roomData, roomSize]);

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

    setRoomData((prevRoom) => (
      prevRoom
        ? {
            ...prevRoom,
            players: nextRoomPlayers,
          }
        : prevRoom
    ));

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
    console.log('Starting game...');
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

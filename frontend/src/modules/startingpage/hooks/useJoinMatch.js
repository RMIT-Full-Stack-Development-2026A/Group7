import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../../router/routes.config';
import { gameroomService } from '../../gameroom/services/gameroomService.js';
import { getStoredAuthIdentity, resolveAuthIdentity } from '../../gameroom/utils/authIdentity.js';

const getIdentityUserId = (identity = {}) =>
  identity.userId || identity.id || identity._id || null;

const getRoomHostId = (room) => {
  if (!room?.host) return null;
  if (typeof room.host === 'object') return room.host.userId || room.host.id || room.host._id || null;
  return room.host;
};

const isUserInRoom = (room, userId) => {
  const normalized = userId ? String(userId) : null;
  if (!room || !normalized) return false;
  const hostId = getRoomHostId(room);
  if (hostId && String(hostId) === normalized) return true;
  return (room.players || []).some((player) => String(player?.userId || '') === normalized);
};

const isJoinableRoom = (room, userId = null) => {
  if (!room) return false;
  if (room.status === 'completed' || room.status === 'in-battle') return false;
  if (isUserInRoom(room, userId)) return true;
  return (room.players || []).length < room.size;
};

export function useJoinMatch() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getStoredAuthIdentity);
  const [rooms, setRooms] = useState([]);
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [joiningRoomId, setJoiningRoomId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRooms = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const resolvedUser = await resolveAuthIdentity();
        const resolvedUserId = getIdentityUserId(resolvedUser);
        const liveRooms = await gameroomService.listRooms();
        if (!isMounted) return;
        setCurrentUser(resolvedUser);
        setRooms(liveRooms.filter((room) => isJoinableRoom(room, resolvedUserId)));
      } catch (error) {
        if (isMounted) setErrorMessage(error.message || 'Failed to load active rooms.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const handleRefresh = () => fetchRooms();
    fetchRooms();
    window.addEventListener('profile-updated', handleRefresh);
    window.addEventListener('storage', handleRefresh);
    return () => {
      isMounted = false;
      window.removeEventListener('profile-updated', handleRefresh);
      window.removeEventListener('storage', handleRefresh);
    };
  }, []);

  const liveRoomCountLabel = useMemo(
    () => `${rooms.length} room${rooms.length === 1 ? '' : 's'} live`,
    [rooms.length],
  );

  const getCurrentUserId = useCallback(() => getIdentityUserId(currentUser), [currentUser]);

  const isCurrentUserRoomHost = useCallback((room) => {
    const userId = getCurrentUserId();
    const hostId = getRoomHostId(room);
    return Boolean(userId && hostId && String(hostId) === String(userId));
  }, [getCurrentUserId]);

  const ensureRoomJoined = async (room) => {
    const latestRoom = await gameroomService.getRoomById(room._id);
    const currentUserId = getCurrentUserId() ? String(getCurrentUserId()) : null;
    if (!currentUserId) return latestRoom;

    const alreadyJoined = latestRoom.players.some((player) => String(player.userId) === currentUserId);
    if (alreadyJoined) return latestRoom;

    return gameroomService.addPlayerToRoom(latestRoom._id, {
      userId: currentUser.userId,
      name: currentUser.name || currentUser.username || 'Player',
      avatar: currentUser.avatar || '',
      type: 'human',
    });
  };

  const openRoom = async (room) => {
    setJoiningRoomId(room._id);
    setErrorMessage('');
    try {
      if (!isJoinableRoom(room, getCurrentUserId())) {
        throw new Error('This room is no longer available.');
      }
      const latestRoom = await ensureRoomJoined(room);
      navigate(ROUTES.GAMEROOM, { state: { createdRoom: latestRoom, returnTo: ROUTES.JOIN_MATCH } });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to open the selected room.');
    } finally {
      setJoiningRoomId(null);
    }
  };

  const handleJoinByCode = async () => {
    const normalizedCode = roomCode.trim();
    if (!normalizedCode) {
      setErrorMessage('Please enter a room code.');
      return;
    }
    setJoiningRoomId(normalizedCode);
    setErrorMessage('');
    try {
      const room = await gameroomService.getRoomByRoomId(normalizedCode);
      const joinedRoom = await ensureRoomJoined(room);
      navigate(ROUTES.GAMEROOM, { state: { createdRoom: joinedRoom, returnTo: ROUTES.JOIN_MATCH } });
    } catch (error) {
      setErrorMessage(error.message || 'Room not found.');
    } finally {
      setJoiningRoomId(null);
    }
  };

  const handleDeleteRoom = async (event, room) => {
    event.stopPropagation();
    if (!window.confirm(`Delete room "${room.roomName}" (${room.roomId})?`)) return;
    setJoiningRoomId(room._id);
    setErrorMessage('');
    try {
      await gameroomService.deleteRoom(room._id);
      setRooms((current) => current.filter((entry) => entry._id !== room._id));
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete the room.');
    } finally {
      setJoiningRoomId(null);
    }
  };

  const getRoomStatusLabel = (room) => {
    if (room.status === 'full' || room.players.length >= room.size) return 'Full';
    if (room.status === 'in-battle') return 'Battling';
    if (room.status === 'completed') return 'Completed';
    return 'Available';
  };

  const getRoomStatusClasses = (room) => {
    const label = getRoomStatusLabel(room);
    if (label === 'Available') return 'join-match-status join-match-status-available border-emerald-400/30 bg-emerald-500/15 text-emerald-200';
    if (label === 'Battling') return 'join-match-status join-match-status-battling border-amber-400/30 bg-amber-500/15 text-amber-200';
    if (label === 'Full') return 'join-match-status join-match-status-full border-rose-400/30 bg-rose-500/15 text-rose-200';
    return 'join-match-status join-match-status-neutral border-slate-400/20 bg-slate-500/10 text-slate-200';
  };

  return {
    rooms, roomCode, setRoomCode, isLoading, errorMessage, joiningRoomId,
    liveRoomCountLabel, openRoom, handleJoinByCode, handleDeleteRoom,
    isCurrentUserRoomHost, getRoomStatusLabel, getRoomStatusClasses,
  };
}

export default useJoinMatch;

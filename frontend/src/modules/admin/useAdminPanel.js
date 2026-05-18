import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchAllUsers,
  updateUser,
  fetchOnlineRooms,
  abortGameRoom,
} from './services/adminService';
import {
  getPlayerId,
  getPlayerName,
  getTimeoutTime,
} from './adminPanel.utils';

export function useAdminPanel() {
  const [activeTab, setActiveTab] = useState('players');

  // Players state
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [draftName, setDraftName] = useState('');
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [savingAction, setSavingAction] = useState('');
  const [playerError, setPlayerError] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');
  const [now, setNow] = useState(0);

  // Rooms state
  const [rooms, setRooms] = useState([]);
  const [roomSearch, setRoomSearch] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [roomError, setRoomError] = useState('');
  const [closingRoomId, setClosingRoomId] = useState('');

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Initial load of users
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoadingPlayers(true);
      setPlayerError('');
      const response = await fetchAllUsers();
      if (cancelled) return;
      if (!response.ok || !response.data?.ok) {
        setPlayers([]);
        setSelectedPlayerId('');
        setPlayerError(response.data?.error || response.data?.message || 'Could not load users.');
        setIsLoadingPlayers(false);
        return;
      }
      const loaded = response.data.data || [];
      setPlayers(loaded);
      setSelectedPlayerId((current) => current || getPlayerId(loaded[0]) || '');
      setIsLoadingPlayers(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredPlayers = useMemo(() => {
    const query = playerSearch.trim().toLowerCase();
    if (!query) return players;
    return players.filter((player) => {
      const haystack = [player.username, player.email, player.name]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [players, playerSearch]);

  const selectedPlayer = useMemo(
    () => players.find((player) => getPlayerId(player) === selectedPlayerId) || players[0],
    [players, selectedPlayerId],
  );

  useEffect(() => {
    setDraftName(getPlayerName(selectedPlayer));
  }, [selectedPlayer]);

  const timeoutRemaining = (player) => {
    const t = getTimeoutTime(player);
    if (!t || !now) return 0;
    return Math.max(0, Math.ceil((t - now) / 1000));
  };

  const applyUpdatedPlayer = (updatedPlayer) => {
    setPlayers((current) => current.map(
      (player) => getPlayerId(player) === getPlayerId(updatedPlayer) ? updatedPlayer : player,
    ));
  };

  const patchSelectedPlayer = async (changes, actionName) => {
    if (!selectedPlayer) return false;
    const id = getPlayerId(selectedPlayer);
    setSavingAction(actionName);
    setPlayerError('');
    const response = await updateUser(id, changes);
    setSavingAction('');
    if (!response.ok || !response.data?.ok) {
      const msg = [401, 403].includes(response.status)
        ? 'Admin session expired. Log in again as admin to update users.'
        : response.data?.error || response.data?.message || 'Update failed.';
      setPlayerError(msg);
      return false;
    }
    applyUpdatedPlayer(response.data.data);
    return true;
  };

  const saveName = async () => {
    const name = draftName.trim();
    if (name.length < 3) {
      setPlayerError('Name must be at least 3 characters.');
      return;
    }
    await patchSelectedPlayer({ name }, 'name');
  };

  const handleTimeout = () => {
    const timeoutUntil = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    patchSelectedPlayer({ timeoutUntil }, 'timeout');
  };

  const clearPlayerTimeout = () =>
    patchSelectedPlayer({ timeoutUntil: null }, 'timeout');

  const toggleDeactivation = () => {
    const isDeactivated = selectedPlayer?.accountStatus === 'inactive';
    patchSelectedPlayer(
      { accountStatus: isDeactivated ? 'active' : 'inactive', timeoutUntil: null },
      'ban',
    );
  };

  const togglePremium = (checked) =>
    patchSelectedPlayer({ isPremium: checked }, 'premium');

  // Rooms tab
  const loadRooms = useCallback(async (searchTerm = '') => {
    setIsLoadingRooms(true);
    setRoomError('');
    const response = await fetchOnlineRooms({ q: searchTerm.trim() });
    if (!response.ok || !response.data?.ok) {
      const msg = [401, 403].includes(response.status)
        ? 'Admin session expired. Log in again as admin to view rooms.'
        : response.data?.error || response.data?.message || 'Could not load rooms.';
      setRoomError(msg);
      setRooms([]);
      setIsLoadingRooms(false);
      return;
    }
    setRooms(response.data.data || []);
    setIsLoadingRooms(false);
  }, []);

  useEffect(() => {
    if (activeTab !== 'rooms') return undefined;
    loadRooms(roomSearch);
    const timer = window.setInterval(() => loadRooms(roomSearch), 5000);
    return () => window.clearInterval(timer);
  }, [activeTab, loadRooms, roomSearch]);

  const handleCloseRoom = async (room) => {
    if (!room?._id) return;
    if (!window.confirm(`Close room ${room.roomId}? Players will be kicked.`)) return;

    setClosingRoomId(String(room._id));
    setRoomError('');
    const response = await abortGameRoom(room._id);
    setClosingRoomId('');

    if (!response.ok || !response.data?.ok) {
      const msg = [401, 403].includes(response.status)
        ? 'Admin session expired. Log in again as admin to close rooms.'
        : response.data?.error || response.data?.message || 'Could not close the room.';
      setRoomError(msg);
      return;
    }
    setRooms((current) => current.filter((entry) => String(entry._id) !== String(room._id)));
  };

  const selectedRemaining = timeoutRemaining(selectedPlayer);
  const selectedIsDeactivated = selectedPlayer?.accountStatus === 'inactive';
  const selectedHasActiveTimeout = selectedRemaining > 0;
  const hasPlayers = filteredPlayers.length > 0;

  return {
    activeTab, setActiveTab,
    // Players
    players, filteredPlayers, selectedPlayer, selectedPlayerId, setSelectedPlayerId,
    draftName, setDraftName, isLoadingPlayers, savingAction, playerError, playerSearch, setPlayerSearch,
    hasPlayers, selectedRemaining, selectedIsDeactivated, selectedHasActiveTimeout,
    timeoutRemaining, saveName, handleTimeout, clearPlayerTimeout, toggleDeactivation, togglePremium,
    // Rooms
    rooms, roomSearch, setRoomSearch, isLoadingRooms, roomError, closingRoomId,
    loadRooms, handleCloseRoom,
  };
}

export default useAdminPanel;

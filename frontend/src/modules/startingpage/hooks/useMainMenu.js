import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../../router/routes.config';
import { useApi } from './useApi';
import { httpHelper } from '../../../services/httpHelper.js';
import { getApiBaseUrl } from '../../../config/api/baseUrl.js';
import { getStoredAuthIdentity, resolveAuthIdentity } from '../../gameroom/utils/authIdentity.js';
import { resolveAvatarUrl } from '../../../shared/utils/avatar.utils.js';
import { socialService } from '../../social/services/socialService.js';
import {
  SUSPENSION_MESSAGE,
  SUSPENDED_ALLOWED_TABS,
  emptySocialSummary,
  getOtherPlayers,
  getSocialSectionCounts,
  shuffleItems,
} from '../logic/mainMenu.utils.js';

export function useMainMenu() {
  const navigate = useNavigate();
  const { call } = useApi();
  const [sidebarTab, setSidebarTab] = useState('friends');
  const [playerProfile, setPlayerProfile] = useState(null);
  const [storedIdentity, setStoredIdentity] = useState(getStoredAuthIdentity);
  const [recentMatch, setRecentMatch] = useState(null);
  const [socialSummary, setSocialSummary] = useState(emptySocialSummary);
  const [seenTabItemCounts, setSeenTabItemCounts] = useState({
    friends: 0, recent: 0, alerts: 0, requests: 0,
  });
  const [otherPlayerPreview, setOtherPlayerPreview] = useState([]);
  const [socialStatus, setSocialStatus] = useState({ type: 'idle', message: '' });
  const [otherPlayersExpanded, setOtherPlayersExpanded] = useState(false);
  const activeSidebarTabRef = useRef('friends');

  // Poll profile every 5s so admin-triggered suspension propagates near real-time.
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (!storedIdentity.userId) return;
      const data = await call(`/api/profile?userId=${encodeURIComponent(storedIdentity.userId)}`);
      if (isMounted && data) setPlayerProfile(data);
    };
    fetchProfile();
    const timer = window.setInterval(fetchProfile, 5000);
    return () => { isMounted = false; window.clearInterval(timer); };
  }, [call, storedIdentity.userId]);

  useEffect(() => {
    const handler = (event) => {
      setStoredIdentity(getStoredAuthIdentity());
      if (event.detail?.profile) setPlayerProfile(event.detail.profile);
    };
    window.addEventListener('profile-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('profile-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  // Resolve identity + load most recent match for the sidebar.
  useEffect(() => {
    let isMounted = true;
    const fetchRecent = async () => {
      const identity = await resolveAuthIdentity();
      const userId = identity.userId || identity.username || identity.email;
      if (!userId || !isMounted) return;
      setStoredIdentity(identity);

      const queryParams = new URLSearchParams({ userId, limit: '1' });
      if (identity.username) queryParams.set('username', identity.username);
      if (identity.email) queryParams.set('email', identity.email);

      const response = await httpHelper.get(`${getApiBaseUrl()}/games/user/history?${queryParams.toString()}`);
      const games = response?.data?.data?.games || [];
      if (!isMounted) return;

      const next = games[0] || null;
      setRecentMatch(next);
      if (activeSidebarTabRef.current === 'recent') {
        setSeenTabItemCounts((current) => ({ ...current, recent: next ? 1 : 0 }));
      }
    };
    fetchRecent();
    return () => { isMounted = false; };
  }, []);

  const playerData = useMemo(() => ({
    name: playerProfile?.name || storedIdentity.name || storedIdentity.username || 'Player',
    isAdmin: ((playerProfile?.role || storedIdentity.role || '')).toLowerCase() === 'admin',
    isPremium: Boolean(playerProfile?.premiumStatus ?? storedIdentity.premiumStatus ?? storedIdentity.isPremium),
    profilePic: resolveAvatarUrl(playerProfile?.avatarUrl || storedIdentity.avatar),
    isSuspended: playerProfile ? playerProfile.isActive === false : false,
  }), [
    playerProfile, storedIdentity.avatar, storedIdentity.isPremium, storedIdentity.name,
    storedIdentity.premiumStatus, storedIdentity.role, storedIdentity.username,
  ]);

  const blockIfSuspended = (event) => {
    if (!playerData.isSuspended) return false;
    if (event) { event.preventDefault(); event.stopPropagation(); }
    window.alert(SUSPENSION_MESSAGE);
    return true;
  };

  const loadSocialSummary = async () => {
    try {
      const summary = await socialService.getSummary();
      const normalized = {
        friends: summary?.friends || [],
        requests: summary?.requests || [],
        roomInvites: summary?.roomInvites || [],
        players: summary?.players || [],
      };
      setSocialSummary(normalized);
      const tab = activeSidebarTabRef.current;
      const counts = getSocialSectionCounts(normalized);
      if (tab !== 'recent') setSeenTabItemCounts((c) => ({ ...c, [tab]: counts[tab] || 0 }));
      setOtherPlayerPreview(shuffleItems(getOtherPlayers(normalized.players)).slice(0, 3));
      setSocialStatus({ type: 'idle', message: '' });
    } catch (error) {
      setSocialSummary(emptySocialSummary);
      setOtherPlayerPreview([]);
      setSocialStatus({ type: 'error', message: error.message || 'Could not load social data.' });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const summary = await socialService.getSummary();
        if (!isMounted) return;
        const normalized = {
          friends: summary?.friends || [],
          requests: summary?.requests || [],
          roomInvites: summary?.roomInvites || [],
          players: summary?.players || [],
        };
        setSocialSummary(normalized);
        const tab = activeSidebarTabRef.current;
        const counts = getSocialSectionCounts(normalized);
        if (tab !== 'recent') setSeenTabItemCounts((c) => ({ ...c, [tab]: counts[tab] || 0 }));
        setOtherPlayerPreview(shuffleItems(getOtherPlayers(normalized.players)).slice(0, 3));
      } catch (error) {
        if (isMounted) setSocialStatus({ type: 'error', message: error.message || 'Could not load social data.' });
      }
    };
    load();
    const timer = window.setInterval(load, 10000);
    return () => { isMounted = false; window.clearInterval(timer); };
  }, []);

  const incomingFriendRequests = socialSummary.requests.filter((r) => r.direction === 'incoming');
  const outgoingFriendRequests = socialSummary.requests.filter((r) => r.direction === 'outgoing');
  const requestCount = incomingFriendRequests.length + outgoingFriendRequests.length;
  const roomInvites = socialSummary.roomInvites;
  const otherPlayers = useMemo(() => getOtherPlayers(socialSummary.players), [socialSummary.players]);
  const onlineFriends = socialSummary.friends.filter((f) => f.isOnline).length;
  const currentTabItemCounts = useMemo(() => ({
    friends: socialSummary.friends.length,
    recent: recentMatch ? 1 : 0,
    alerts: roomInvites.length,
    requests: requestCount,
  }), [recentMatch, requestCount, roomInvites.length, socialSummary.friends.length]);
  const tabBadgeCounts = useMemo(() => ({
    friends: Math.max(0, currentTabItemCounts.friends - seenTabItemCounts.friends),
    recent: Math.max(0, currentTabItemCounts.recent - seenTabItemCounts.recent),
    alerts: Math.max(0, currentTabItemCounts.alerts - seenTabItemCounts.alerts),
    requests: Math.max(0, currentTabItemCounts.requests - seenTabItemCounts.requests),
  }), [currentTabItemCounts, seenTabItemCounts]);

  useEffect(() => {
    if (playerData.isSuspended && !SUSPENDED_ALLOWED_TABS.has(sidebarTab)) {
      activeSidebarTabRef.current = 'friends';
      setSidebarTab('friends');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerData.isSuspended]);

  const handleSidebarTabClick = (tabId) => {
    if (playerData.isSuspended && !SUSPENDED_ALLOWED_TABS.has(tabId)) {
      window.alert(SUSPENSION_MESSAGE);
      return;
    }
    activeSidebarTabRef.current = tabId;
    setSeenTabItemCounts((c) => ({ ...c, [tabId]: currentTabItemCounts[tabId] || 0 }));
    setSidebarTab(tabId);
  };

  const sendFriendRequest = async (player) => {
    if (blockIfSuspended()) return;
    try {
      await socialService.sendFriendRequest(player.userId);
      setSocialStatus({ type: 'success', message: `Friend request sent to ${player.name}.` });
      await loadSocialSummary();
    } catch (error) {
      setSocialStatus({ type: 'error', message: error.message || 'Could not send friend request.' });
    }
  };

  const acceptFriendRequest = async (requestId) => {
    if (blockIfSuspended()) return;
    try {
      const summary = await socialService.acceptFriendRequest(requestId);
      setSocialSummary(summary || emptySocialSummary);
      setOtherPlayerPreview(shuffleItems(getOtherPlayers(summary?.players)).slice(0, 3));
      setSocialStatus({ type: 'success', message: 'Friend request accepted.' });
    } catch (error) {
      setSocialStatus({ type: 'error', message: error.message || 'Could not accept friend request.' });
    }
  };

  const declineFriendRequest = async (requestId) => {
    if (blockIfSuspended()) return;
    try {
      const summary = await socialService.declineFriendRequest(requestId);
      setSocialSummary(summary || emptySocialSummary);
      setOtherPlayerPreview(shuffleItems(getOtherPlayers(summary?.players)).slice(0, 3));
      setSocialStatus({ type: 'success', message: 'Friend request declined.' });
    } catch (error) {
      setSocialStatus({ type: 'error', message: error.message || 'Could not decline friend request.' });
    }
  };

  const acceptRoomInvite = async (inviteId) => {
    if (blockIfSuspended()) return;
    try {
      const result = await socialService.acceptRoomInvite(inviteId);
      navigate(ROUTES.GAMEROOM, {
        state: { createdRoom: result.room, returnTo: ROUTES.MAIN_MENU },
      });
    } catch (error) {
      setSocialStatus({ type: 'error', message: error.message || 'Could not accept room invite.' });
    }
  };

  const declineRoomInvite = async (inviteId) => {
    if (blockIfSuspended()) return;
    try {
      const summary = await socialService.declineRoomInvite(inviteId);
      setSocialSummary(summary || emptySocialSummary);
      setSocialStatus({ type: 'success', message: 'Room invite declined.' });
    } catch (error) {
      setSocialStatus({ type: 'error', message: error.message || 'Could not decline room invite.' });
    }
  };

  return {
    playerData,
    storedIdentity,
    playerProfile,
    sidebarTab,
    socialSummary,
    socialStatus,
    recentMatch,
    roomInvites,
    otherPlayers,
    otherPlayerPreview,
    otherPlayersExpanded,
    incomingFriendRequests,
    outgoingFriendRequests,
    requestCount,
    onlineFriends,
    tabBadgeCounts,
    blockIfSuspended,
    handleSidebarTabClick,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    acceptRoomInvite,
    declineRoomInvite,
    setOtherPlayersExpanded,
  };
}

export default useMainMenu;

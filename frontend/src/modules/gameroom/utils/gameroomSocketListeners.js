// Socket-listener wiring for the Gameroom page. Returns a cleanup function.
import { gameroomService } from '../services/gameroomService.js';
import { gameroomSocketService } from '../services/gameroomSocketService.js';
import { areRoomPayloadsEqual } from './gameroom.page.utils.js';

const ROOM_HEALTH_INTERVAL_MS = 5000;
const CHAT_HISTORY_INTERVAL_MS = 2500;

const sanitizeMessages = (rawMessages, normalize) =>
  rawMessages.map(normalize).filter((message) => message.id && message.text);

const handleInviteRequest = ({
  request, activeRoomId, currentUserId, currentUserName, isCurrentUserHost,
  roomDataRef, setPendingInviteApproval,
}) => {
  if (String(request?.roomId) !== String(activeRoomId)) return;
  if (!isCurrentUserHost || String(request.requesterId) === String(currentUserId)) return;

  const currentRoom = roomDataRef.current;
  const responseBase = {
    roomId: request.roomId,
    requestId: request.requestId,
    requesterId: request.requesterId,
    requesterName: request.requesterName,
    targetFriendId: request.targetFriendId,
    targetFriendName: request.targetFriendName,
    hostName: currentUserName,
  };
  const roomIsFull = (currentRoom?.players || []).filter(Boolean).length >= Number(currentRoom?.size || 0);
  if (roomIsFull) {
    gameroomSocketService.emit('room-invite-approval-response', { ...responseBase, status: 'declined', reason: 'room-full' });
    return;
  }
  const targetAlreadyInRoom = (currentRoom?.players || []).some((player) =>
    player?.type !== 'ai' && String(player?.userId) === String(request.targetFriendId)
  );
  if (targetAlreadyInRoom) {
    gameroomSocketService.emit('room-invite-approval-response', { ...responseBase, status: 'declined', reason: 'already-in-room' });
    return;
  }
  setPendingInviteApproval(request);
};

const handleInviteResponse = ({ response, activeRoomId, currentUserId }) => {
  if (String(response?.roomId) !== String(activeRoomId)) return;
  if (String(response.requesterId) !== String(currentUserId)) return;
  if (response.status === 'approved') {
    alert(`${response.hostName || 'Host'} approved your invite request for ${response.targetFriendName}.`);
    return;
  }
  const message = response.reason === 'timeout'
    ? `${response.hostName || 'Host'} did not approve the invite request for ${response.targetFriendName} in time.`
    : response.reason === 'room-full'
      ? 'The room is fulled - Invalid request.'
    : response.reason === 'already-in-room'
      ? `${response.targetFriendName} is already in this room.`
      : response.errorMessage || `${response.hostName || 'Host'} refused your invite request for ${response.targetFriendName}.`;
  alert(message);
};

export function attachGameroomSocketListeners({
  activeRoomId, activeRoomMongoId, currentUserId, currentUserName, isCurrentUserHost,
  navigateToGameStart, normalizeChatMessageForClient, hasNavigatedToGameRef,
  roomDataRef, setRoomData, setMessages, setPendingInviteApproval,
  closeLocalRoom,
}) {
  gameroomSocketService.joinRoom({ roomId: activeRoomId, playerId: currentUserId, playerName: currentUserName });
  setMessages([]);

  const closeLocalRoomDueToAdmin = (message) => {
    if (hasNavigatedToGameRef.current) return;
    hasNavigatedToGameRef.current = true;
    if (message) window.alert(message);
    closeLocalRoom();
  };

  const refreshChatHistory = async () => {
    try {
      const roomMessages = await gameroomService.getRoomChatMessages(activeRoomMongoId);
      setMessages(sanitizeMessages(roomMessages, normalizeChatMessageForClient));
    } catch (error) {
      console.error('Error loading room chat:', error);
    }
  };

  const refreshActiveRoom = async () => {
    const currentRoom = roomDataRef.current;
    if (!currentRoom?._id) return;
    try {
      const refreshedRoom = await gameroomService.getRoomById(currentRoom._id);
      if (String(refreshedRoom?.roomId) !== String(activeRoomId)) return;
      setRoomData((existing) => (areRoomPayloadsEqual(existing, refreshedRoom) ? existing : refreshedRoom));
      if (refreshedRoom?.status === 'in-battle') {
        navigateToGameStart(refreshedRoom);
        return;
      }
      if (refreshedRoom?.status === 'completed') {
        closeLocalRoomDueToAdmin('This room has been closed by an admin.');
      }
    } catch (error) {
      console.error('Error refreshing room after player leave:', error);
      closeLocalRoom();
    }
  };

  const unsubscribeRoomUpdated = gameroomSocketService.on('room-updated', (updatedRoom) => {
    if (String(updatedRoom?.roomId) === String(activeRoomId)) {
      setRoomData((current) => (areRoomPayloadsEqual(current, updatedRoom) ? current : updatedRoom));
    }
  });
  const unsubscribeRoomDeleted = gameroomSocketService.on('room-deleted', (deletedRoom) => {
    if (String(deletedRoom?.roomId) === String(activeRoomId)) closeLocalRoom();
  });
  const unsubscribeRoomClosedByAdmin = gameroomSocketService.on('room-closed-by-admin', (payload = {}) => {
    if (String(payload?.roomId) !== String(activeRoomId)) return;
    closeLocalRoomDueToAdmin(payload?.message || 'This room has been closed by an admin.');
  });
  const unsubscribeChatHistory = gameroomSocketService.on('chat-history', ({ roomId, messages: roomMessages = [] } = {}) => {
    if (String(roomId) !== String(activeRoomId)) return;
    setMessages(sanitizeMessages(roomMessages, normalizeChatMessageForClient));
  });
  const unsubscribeChatMessage = gameroomSocketService.on('chat-message', ({ roomId, message } = {}) => {
    if (String(roomId) !== String(activeRoomId)) return;
    const normalized = normalizeChatMessageForClient(message);
    if (!normalized.id || !normalized.text) return;
    setMessages((current) => current.some((item) => item.id === normalized.id) ? current : [...current, normalized]);
  });
  const unsubscribePlayerLeft = gameroomSocketService.on('player-left', refreshActiveRoom);
  const unsubscribeGameStarted = gameroomSocketService.on('game-started', ({ payload } = {}) => {
    const currentRoomData = roomDataRef.current;
    if (!payload && !currentRoomData) return;
    const startedRoom = payload?.room || payload?.roomState?.createdRoom || currentRoomData;
    if (String(startedRoom?.roomId) !== String(activeRoomId)) return;
    navigateToGameStart(startedRoom);
  });
  const unsubscribeInviteApprovalRequest = gameroomSocketService.on('room-invite-approval-request', (request = {}) => {
    handleInviteRequest({
      request, activeRoomId, currentUserId, currentUserName,
      isCurrentUserHost, roomDataRef, setPendingInviteApproval,
    });
  });
  const unsubscribeInviteApprovalResponse = gameroomSocketService.on('room-invite-approval-response', (response = {}) => {
    handleInviteResponse({ response, activeRoomId, currentUserId });
  });

  refreshChatHistory();
  gameroomSocketService.emit('request-chat-history', { roomId: activeRoomId });
  const roomHealthTimer = window.setInterval(refreshActiveRoom, ROOM_HEALTH_INTERVAL_MS);
  const chatHistoryTimer = window.setInterval(refreshChatHistory, CHAT_HISTORY_INTERVAL_MS);

  return () => {
    unsubscribeRoomUpdated();
    unsubscribeRoomDeleted();
    unsubscribeRoomClosedByAdmin();
    unsubscribeChatHistory();
    unsubscribeChatMessage();
    unsubscribePlayerLeft();
    unsubscribeGameStarted();
    unsubscribeInviteApprovalRequest();
    unsubscribeInviteApprovalResponse();
    window.clearInterval(roomHealthTimer);
    window.clearInterval(chatHistoryTimer);
    gameroomSocketService.leaveRoom(activeRoomId);
  };
}

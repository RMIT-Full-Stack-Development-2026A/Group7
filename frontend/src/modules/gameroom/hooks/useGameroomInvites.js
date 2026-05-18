import { useCallback } from 'react';
import { gameroomSocketService } from '../services/gameroomSocketService.js';
import { socialService } from '../../social/services/socialService.js';

export function useGameroomInvites({
  currentUserId,
  currentUserName,
  isCurrentUserHost,
  roomData,
  roomDataRef,
  roomPlayerIds,
  hasOpenRoomSlot,
  friends,
  pendingInviteApproval,
  setPendingInviteApproval,
}) {
  const respondToInviteApproval = useCallback(async (approved, reason = 'host') => {
    const request = pendingInviteApproval;
    if (!request) return;

    let status = approved ? 'approved' : 'declined';
    let responseReason = reason;
    let errorMessage = '';

    if (approved) {
      const currentRoom = roomDataRef.current;
      const roomIsFull = (currentRoom?.players || []).filter(Boolean).length >= Number(currentRoom?.size || 0);

      if (roomIsFull) {
        status = 'declined';
        responseReason = 'room-full';
      } else {
        try {
          await socialService.sendRoomInvite({
            recipientId: request.targetFriendId,
            roomMongoId: request.roomMongoId,
          });
        } catch (error) {
          status = 'declined';
          errorMessage = error.message || 'Could not send room invite.';
        }
      }
    }

    gameroomSocketService.emit('room-invite-approval-response', {
      roomId: request.roomId,
      requestId: request.requestId,
      requesterId: request.requesterId,
      requesterName: request.requesterName,
      targetFriendId: request.targetFriendId,
      targetFriendName: request.targetFriendName,
      hostName: currentUserName,
      status,
      reason: responseReason,
      errorMessage,
    });

    setPendingInviteApproval(null);

    if (approved && status === 'approved') {
      alert(`Room invite sent to ${request.targetFriendName}.`);
    } else if (responseReason === 'room-full') {
      alert('The room is fulled - Invalid request.');
    } else if (errorMessage) {
      alert(errorMessage);
    }
  }, [currentUserName, pendingInviteApproval, roomDataRef, setPendingInviteApproval]);

  const handleInvite = async (friendId) => {
    const friend = friends.find((item) => item.id === friendId);
    if (!friend || !roomData?._id) return;

    const targetFriendId = String(friend.userId || friend.id || '');
    if (!hasOpenRoomSlot) {
      alert('The room is fulled - Invalid request.');
      return;
    }

    if (roomPlayerIds.has(targetFriendId)) {
      alert(`${friend.name} is already in this room.`);
      return;
    }

    if (!isCurrentUserHost) {
      gameroomSocketService.emit('room-invite-approval-request', {
        requestId: `${roomData._id}-${currentUserId}-${targetFriendId}-${Date.now()}`,
        roomId: roomData.roomId,
        roomMongoId: roomData._id,
        requesterId: currentUserId,
        requesterName: currentUserName,
        targetFriendId,
        targetFriendName: friend.name,
        targetFriendAvatar: friend.avatar,
      });
      alert(`Asked the host to approve your invite request for ${friend.name}.`);
      return;
    }

    try {
      await socialService.sendRoomInvite({
        recipientId: targetFriendId,
        roomMongoId: roomData._id,
      });
      alert(`Room invite sent to ${friend.name}.`);
    } catch (error) {
      console.error('Error inviting friend:', error);
      alert(error.message || 'Could not send room invite.');
    }
  };

  return { respondToInviteApproval, handleInvite };
}

export default useGameroomInvites;

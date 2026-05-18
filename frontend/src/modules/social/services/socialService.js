import { getApiBaseUrl } from '../../../config/api/baseUrl.js';
import { httpHelper } from '../../../services/httpHelper.js';

const SOCIAL_BASE_URL = `${getApiBaseUrl()}/social`;

const unwrapResponse = (response, fallbackMessage) => {
  if (!response.ok) {
    throw new Error(response.data?.message || response.data?.error || fallbackMessage);
  }

  return response.data?.data ?? response.data;
};

export const socialService = {
  async getSummary() {
    return unwrapResponse(
      await httpHelper.get(`${SOCIAL_BASE_URL}/summary`),
      'Failed to load social data.',
    );
  },

  async updatePresence(online = true) {
    return unwrapResponse(
      await httpHelper.post(`${SOCIAL_BASE_URL}/presence`, { online }),
      'Failed to update presence.',
    );
  },

  async sendFriendRequest(recipientId) {
    return unwrapResponse(
      await httpHelper.post(`${SOCIAL_BASE_URL}/friend-requests`, { recipientId }),
      'Failed to send friend request.',
    );
  },

  async acceptFriendRequest(requestId) {
    return unwrapResponse(
      await httpHelper.post(`${SOCIAL_BASE_URL}/friend-requests/${requestId}/accept`),
      'Failed to accept friend request.',
    );
  },

  async declineFriendRequest(requestId) {
    return unwrapResponse(
      await httpHelper.post(`${SOCIAL_BASE_URL}/friend-requests/${requestId}/decline`),
      'Failed to decline friend request.',
    );
  },

  async sendRoomInvite({ recipientId, roomMongoId }) {
    return unwrapResponse(
      await httpHelper.post(`${SOCIAL_BASE_URL}/room-invites`, { recipientId, roomMongoId }),
      'Failed to send room invite.',
    );
  },

  async acceptRoomInvite(inviteId) {
    return unwrapResponse(
      await httpHelper.post(`${SOCIAL_BASE_URL}/room-invites/${inviteId}/accept`),
      'Failed to accept room invite.',
    );
  },

  async declineRoomInvite(inviteId) {
    return unwrapResponse(
      await httpHelper.post(`${SOCIAL_BASE_URL}/room-invites/${inviteId}/decline`),
      'Failed to decline room invite.',
    );
  },
};

export default socialService;

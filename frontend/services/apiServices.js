/**
 * Services for interacting with backend APIs
 */
export const startingPageService = (api) => ({
  getMenu: () => api.call('/starting-page/menu', { method: 'GET' }),
  getGames: () => api.call('/starting-page/games', { method: 'GET' }),
  createMatch: (matchData) => api.call('/starting-page/match', {
    method: 'POST',
    body: JSON.stringify(matchData),
  }),
});

export const profileService = (api) => ({
  getProfile: () => api.call('/profile', { method: 'GET' }),
  updateProfile: (updates) => api.call('/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  getSettings: () => api.call('/profile/settings', { method: 'GET' }),
  updateSettings: (settings) => api.call('/profile/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }),
  getMailbox: () => api.call('/profile/mailbox', { method: 'GET' }),
  manageSubscription: (subscriptionData) => api.call('/profile/subscription', {
    method: 'POST',
    body: JSON.stringify(subscriptionData),
  }),
});

export default {
  startingPageService,
  profileService,
};


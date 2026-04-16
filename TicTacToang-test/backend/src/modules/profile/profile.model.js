const PROFILE_COLLECTIONS = {
  profiles: 'profiles',
  settings: 'settings',
  mailbox: 'mailbox',
};

const buildDefaultProfile = (userId) => ({
  userId,
  username: 'user123',
  email: 'user@example.com',
  passwordHash: 'hashedPassword123',
  country: 'Thailand',
  role: 'player',
  premiumStatus: false,
  subscriptionEndDate: null,
  isActive: true,
  avatarUrl: 'https://example.com/avatars/default.png',
  createdAt: new Date(),
});

const buildDefaultSettings = (userId) => ({
  userId,
  theme: 'dark',
  notifications: true,
  soundEnabled: true,
  language: 'en',
  twoFactorEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const buildDefaultMailbox = (userId) => ([
  {
    id: 'default-1',
    userId,
    from: 'system',
    message: 'Welcome to the game!',
    timestamp: new Date(),
    read: false,
  },
  {
    id: 'default-2',
    userId,
    from: 'friend',
    message: "Let's play!",
    timestamp: new Date(),
    read: false,
  },
]);

module.exports = {
  PROFILE_COLLECTIONS,
  buildDefaultProfile,
  buildDefaultSettings,
  buildDefaultMailbox,
};

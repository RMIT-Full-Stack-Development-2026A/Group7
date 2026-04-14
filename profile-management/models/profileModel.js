// Data access layer for Profile Management module
// Now uses MongoDB instead of mock data

const { getDB } = require('../database/dbConnect');

const getProfileByUserId = async (userId) => {
  try {
    const db = await getDB();
    const collection = db.collection('profiles');

    const profile = await collection.findOne({ userId: userId });

    if (!profile) {
      // Return default profile if not found
      return {
        userId: userId,
        username: 'user123',
        email: 'user@example.com',
        password: 'hashedPassword123',
        avatar: 'avatar.png',
        level: 5,
        gamesPlayed: 42,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

const updateProfile = async (userId, updates) => {
  try {
    const db = await getDB();
    const collection = db.collection('profiles');

    const result = await collection.updateOne(
      { userId: userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        },
        $setOnInsert: {
          userId: userId,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return {
      success: true,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      matchedCount: result.matchedCount
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

const getSettingsByUserId = async (userId) => {
  try {
    const db = await getDB();
    const collection = db.collection('settings');

    const settings = await collection.findOne({ userId: userId });

    if (!settings) {
      // Return default settings if not found
      return {
        userId: userId,
        theme: 'dark',
        notifications: true,
        soundEnabled: true,
        language: 'en',
        password: 'hashedPassword123',
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

const updateSettings = async (userId, updates) => {
  try {
    const db = await getDB();
    const collection = db.collection('settings');

    const result = await collection.updateOne(
      { userId: userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        },
        $setOnInsert: {
          userId: userId,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return {
      success: true,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      matchedCount: result.matchedCount
    };
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

const getMailboxByUserId = async (userId) => {
  try {
    const db = await getDB();
    const collection = db.collection('mailbox');

    const messages = await collection.find({ userId: userId }).sort({ timestamp: -1 }).toArray();

    if (messages.length === 0) {
      // Return default messages if none found
      return [
        {
          id: 'default-1',
          userId: userId,
          from: 'system',
          message: 'Welcome to the game!',
          timestamp: new Date(),
          read: false
        },
        {
          id: 'default-2',
          userId: userId,
          from: 'friend',
          message: 'Let\'s play!',
          timestamp: new Date(),
          read: false
        }
      ];
    }

    return messages;
  } catch (error) {
    console.error('Error fetching mailbox:', error);
    throw error;
  }
};

const manageSubscription = async (userId, subscriptionData) => {
  try {
    const db = await getDB();
    const collection = db.collection('subscriptions');

    const result = await collection.updateOne(
      { userId: userId },
      {
        $set: {
          ...subscriptionData,
          updatedAt: new Date()
        },
        $setOnInsert: {
          userId: userId,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return {
      success: true,
      subscription: subscriptionData,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    };
  } catch (error) {
    console.error('Error managing subscription:', error);
    throw error;
  }
};

module.exports = {
  getProfileByUserId,
  updateProfile,
  getSettingsByUserId,
  updateSettings,
  getMailboxByUserId,
  manageSubscription
};
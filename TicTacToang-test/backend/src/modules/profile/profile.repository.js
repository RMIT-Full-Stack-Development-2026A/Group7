const { getDB } = require('../../profile-management/database/dbConnect');
const {
  PROFILE_COLLECTIONS,
  buildDefaultProfile,
  buildDefaultSettings,
  buildDefaultMailbox,
} = require('./profile.model');

const getProfileByUserId = async (userId) => {
  const db = await getDB();
  const collection = db.collection(PROFILE_COLLECTIONS.profiles);
  const profile = await collection.findOne({ userId });

  return profile || buildDefaultProfile(userId);
};

const updateProfileByUserId = async (userId, updates) => {
  const db = await getDB();
  const collection = db.collection(PROFILE_COLLECTIONS.profiles);

  const result = await collection.updateOne(
    { userId },
    {
      $set: {
        ...updates,
      },
      $setOnInsert: {
        ...buildDefaultProfile(userId),
      },
    },
    { upsert: true }
  );

  return {
    success: true,
    modifiedCount: result.modifiedCount,
    upsertedCount: result.upsertedCount,
    matchedCount: result.matchedCount,
  };
};

const getSettingsByUserId = async (userId) => {
  const db = await getDB();
  const collection = db.collection(PROFILE_COLLECTIONS.settings);
  const settings = await collection.findOne({ userId });

  return settings || buildDefaultSettings(userId);
};

const updateSettingsByUserId = async (userId, updates) => {
  const db = await getDB();
  const collection = db.collection(PROFILE_COLLECTIONS.settings);

  const result = await collection.updateOne(
    { userId },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        userId,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  return {
    success: true,
    modifiedCount: result.modifiedCount,
    upsertedCount: result.upsertedCount,
    matchedCount: result.matchedCount,
  };
};

const getMailboxByUserId = async (userId) => {
  const db = await getDB();
  const collection = db.collection(PROFILE_COLLECTIONS.mailbox);
  const messages = await collection.find({ userId }).sort({ timestamp: -1 }).toArray();

  return messages.length ? messages : buildDefaultMailbox(userId);
};

const upsertSubscriptionByUserId = async (userId, subscriptionData) => {
  const db = await getDB();
  const collection = db.collection(PROFILE_COLLECTIONS.profiles);

  const result = await collection.updateOne(
    { userId },
    {
      $set: {
        premiumStatus: Boolean(subscriptionData.premiumStatus),
        subscriptionEndDate: subscriptionData.subscriptionEndDate || null,
      },
      $setOnInsert: {
        ...buildDefaultProfile(userId),
      },
    },
    { upsert: true }
  );

  return {
    success: true,
    premiumStatus: Boolean(subscriptionData.premiumStatus),
    subscriptionEndDate: subscriptionData.subscriptionEndDate || null,
    modifiedCount: result.modifiedCount,
    upsertedCount: result.upsertedCount,
  };
};

module.exports = {
  getProfileByUserId,
  updateProfileByUserId,
  getSettingsByUserId,
  updateSettingsByUserId,
  getMailboxByUserId,
  upsertSubscriptionByUserId,
};

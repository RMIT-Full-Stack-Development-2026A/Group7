const { MongoClient } = require("mongodb");

const url = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "ProfileManagementDB";

let client;
let db;

async function connectDB() {
  try {
    if (!client) {
      client = new MongoClient(url, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      });

      await client.connect();
      console.log("✅ Connected to MongoDB successfully");

      db = client.db(dbName);
      console.log(`📊 Using database: ${dbName}`);
    }

    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
}

async function closeDB() {
  if (client) {
    await client.close();
    console.log("🔌 MongoDB connection closed");
  }
}

async function getDB() {
  if (!db) {
    await connectDB();
  }
  return db;
}

module.exports = {
  connectDB,
  closeDB,
  getDB
};
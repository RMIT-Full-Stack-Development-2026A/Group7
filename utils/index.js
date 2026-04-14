// Utility functions
const logger = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

const errorHandler = (error, res) => {
  logger(`Error: ${error.message}`);
  res.status(500).json({ error: 'Internal server error' });
};

const connectDB = require("./db");

async function run() {
  const db = await connectDB();

  const users = db.collection("users");

  // Insert data (this creates DB + collection automatically)
  await users.insertOne({
    name: "John",
    age: 25,
  });

  console.log("User added");
}

run();

module.exports = {
  logger,
  errorHandler
};
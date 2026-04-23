const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
    const dbName = process.env.MONGODB_DB_NAME || 'tictactoang'

    await mongoose.connect(mongoUri, {
      dbName,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    })
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`)
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB

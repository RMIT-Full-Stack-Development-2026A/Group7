const mongoose = require('mongoose');

const validMarkers = [
  'X-O',
  'Circle-Star',
  'Square-Triangle',
  'Moon-Sun',
  'Heart-Spade',
  'Diamond-Club',
  'X-O-Triangle',
  'Circle-Star-Square',
  'Moon-Sun-Cloud',
  'Heart-Spade-Diamond',
  'Club-Diamond-Star',
  'Triangle-Square-Circle',
  'X-O-Triangle-Square',
  'Circle-Star-Square-Triangle',
  'Moon-Sun-Cloud-Lightning',
  'Heart-Spade-Diamond-Club',
  'Star-Circle-Heart-Diamond',
  'Triangle-Square-Club-Spade',
];

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: Number,
      required: true,
      unique: true,
    },
    roomName: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      enum: [2, 3, 4],
      required: true,
    },
    host: {
      type: String,
      required: true,
    },
    players: [
      {
        userId: {
          type: String,
        },
        name: String,
        type: {
          type: String,
          enum: ['human', 'ai'],
          default: 'human',
        },
        aiDifficulty: {
          type: String,
          enum: ['Easy', 'Medium', 'Hard'],
        },
      },
    ],
    gameSettings: {
      boardStyle: {
        type: String,
        enum: ['Classic', 'Modern', 'Minimal'],
        default: 'Classic',
      },
      boardSize: {
        type: String,
        enum: ['10x10', '15x15'],
        default: '10x10',
      },
      marker: {
        type: String,
        enum: validMarkers,
        default: 'X-O',
      },
      timeToThink: {
        type: Number,
        default: 60,
      },
      gameMode: {
        type: String,
        default: 'classic',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'ready', 'started', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);

// Public interface for the Gameroom module. Other modules MUST import from
// this file (e.g. require('../gameroom')) instead of reaching into
// gameroom.service.js, gameroom.repository.js, or gameroom.model.js directly.
// This is the A.3.1 "interface module per bounded context" boundary.

const gameroomService = require('./gameroom.service')

module.exports = {
  // Read
  getGameroomById: gameroomService.getGameroomById,
  getGameroomByRoomId: gameroomService.getGameroomByRoomId,
  getAllGamerooms: gameroomService.getAllGamerooms,
  getGameroomChatMessages: gameroomService.getGameroomChatMessages,

  // Write
  createGameroom: gameroomService.createGameroom,
  updateGameroomSettings: gameroomService.updateGameroomSettings,
  updateGameroomPlayers: gameroomService.updateGameroomPlayers,
  addPlayerToGameroom: gameroomService.addPlayerToGameroom,
  removePlayerFromGameroom: gameroomService.removePlayerFromGameroom,
  updateGameroomStatus: gameroomService.updateGameroomStatus,
  deleteGameroom: gameroomService.deleteGameroom,
  addGameroomChatMessage: gameroomService.addGameroomChatMessage,

  // Helpers shared with related modules (identity resolution).
  resolveUserIdFromRequest: gameroomService.resolveUserIdFromRequest,
}

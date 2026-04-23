import { gameroomService } from './gameroomService.js';

export const waitingRoomService = {
  getRoomById: gameroomService.getRoomById,
  getRoomByRoomId: gameroomService.getRoomByRoomId,
  updateRoomPlayers: gameroomService.updateRoomPlayers,
  updateRoomSettings: gameroomService.updateRoomSettings,
};

export default waitingRoomService;

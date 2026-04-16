export const toCreateGameroomInput = (body = {}) => {
  const { roomName, size, boardStyle, boardSize, marker, timeToThink } = body

  return {
    roomName,
    size,
    boardStyle,
    boardSize,
    marker,
    timeToThink,
  }
}

export const toUpdateGameroomSettingsInput = (body = {}) => body.gameSettings

export const toUpdateGameroomPlayersInput = (body = {}) => body.players

export const toAddGameroomPlayerInput = (body = {}) => body.playerData

export const toGameroomResponse = (room) => room

export const toStartGameroomResponse = ({ room, gameSession }) => ({
  room,
  gameSession,
})

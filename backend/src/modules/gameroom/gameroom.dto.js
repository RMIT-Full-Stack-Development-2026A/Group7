const toCreateGameroomInput = (body = {}) => {
  const { roomName, size, boardStyle, boardSize, marker, timeToThink, hostPosition, userId, username, email, hostName, hostAvatar } = body

  return {
    roomName,
    size,
    boardStyle,
    boardSize,
    marker,
    timeToThink,
    hostPosition,
    userId,
    username,
    email,
    hostName,
    hostAvatar,
  }
}

const toUpdateGameroomSettingsInput = (body = {}) => body.gameSettings

const toUpdateGameroomPlayersInput = (body = {}) => body.players

const toAddGameroomPlayerInput = (body = {}) => body.playerData

const toGameroomResponse = (room) => room

const toStartGameroomResponse = ({ room, gameSession }) => ({
  room,
  gameSession,
})

module.exports = {
  toCreateGameroomInput,
  toUpdateGameroomSettingsInput,
  toUpdateGameroomPlayersInput,
  toAddGameroomPlayerInput,
  toGameroomResponse,
  toStartGameroomResponse,
}

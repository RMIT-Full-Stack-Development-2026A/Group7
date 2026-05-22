// Stateless helpers used by game.controller.js: identity resolution, guest
// fallback, participant normalization, and player construction for /games POST.
// Use the profile module's published interface (../profile) rather than its
// internal service file — see backend/src/modules/profile/index.js for the
// contract that bounds what game can call.
const profileService = require('../profile')

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

const resolveUserId = (user) => user?.userId || user?.id || null

const resolveExistingRequestUserId = async (req) => (
  profileService.resolveExistingUserId({
    authenticatedUserId: resolveUserId(req.user),
    userId: req.query?.userId || req.body?.userId,
    username: req.query?.username || req.body?.username,
    email: req.query?.email || req.body?.email,
  })
)

const buildGuestUser = () => {
  const guestId = `guest_${Date.now()}`
  return {
    id: guestId,
    userId: guestId,
    username: 'Guest Player',
    rank: 1200,
    isAdmin: false,
  }
}

const normalizeParticipants = (participants = []) => (
  Array.isArray(participants)
    ? participants
      .filter((participant) => participant && participant.playerName)
      .map((participant, index) => ({
        playerId: participant.playerId || participant.id || null,
        playerName: participant.playerName || participant.name || `Player ${index + 1}`,
        avatar: participant.avatar || '',
        playerSymbol: participant.playerSymbol || participant.symbol || participant.token || '',
        marker: participant.marker || participant.playerSymbol || participant.symbol || participant.token || '',
        order: Number(participant.order) || index + 1,
        isAI: Boolean(participant.isAI),
        aiDifficulty: participant.isAI ? (participant.aiDifficulty || null) : null,
      }))
    : []
)

const resolveAIRank = (difficulty) => (
  difficulty === 'easy' ? 1000 : difficulty === 'hard' ? 1400 : 1200
)

const buildPlayerX = ({ requestedPlayerX, playerXIsAI, currentUser, aiDifficulty }) => ({
  playerId: requestedPlayerX.playerId
    || (playerXIsAI ? `ai_${Date.now()}_x` : currentUser.userId || currentUser.id),
  playerName: requestedPlayerX.playerName
    || (playerXIsAI ? `AI (${requestedPlayerX.aiDifficulty || aiDifficulty || 'medium'})` : currentUser.name || currentUser.username),
  avatar: requestedPlayerX.avatar || '',
  playerRank: requestedPlayerX.playerRank
    || (playerXIsAI ? resolveAIRank(requestedPlayerX.aiDifficulty || aiDifficulty || 'medium') : currentUser.rank || 1200),
  isAI: playerXIsAI,
  aiDifficulty: playerXIsAI ? (requestedPlayerX.aiDifficulty || aiDifficulty || 'medium') : null,
})

const buildAIPlayerO = (requestedPlayerO, aiDifficulty) => ({
  playerId: requestedPlayerO.playerId || `ai_${Date.now()}_o`,
  playerName: requestedPlayerO.playerName || `AI (${requestedPlayerO.aiDifficulty || aiDifficulty || 'medium'})`,
  avatar: requestedPlayerO.avatar || '',
  playerRank: requestedPlayerO.playerRank
    || resolveAIRank(requestedPlayerO.aiDifficulty || aiDifficulty || 'medium'),
  isAI: true,
  aiDifficulty: requestedPlayerO.aiDifficulty || aiDifficulty || 'medium',
})

const buildHumanPlayerO = (requestedPlayerO) => ({
  playerId: requestedPlayerO.playerId || 'local_player_2',
  playerName: requestedPlayerO.playerName || 'Player 2',
  avatar: requestedPlayerO.avatar || '',
  playerRank: requestedPlayerO.playerRank || 1200,
  isAI: false,
  aiDifficulty: null,
})

const formatActiveGame = (game, currentUserId) => ({
  gameId: game.gameId,
  boardSize: game.boardSize,
  gameMode: game.gameMode,
  status: game.status,
  currentTurn: game.currentTurn,
  opponent: String(game.players.X.playerId) === String(currentUserId) ? game.players.O : game.players.X,
  lastMoveAt: game.lastMoveAt,
})

const formatListedGame = (game) => ({
  gameId: game.gameId,
  boardSize: game.boardSize,
  gameMode: game.gameMode,
  status: game.status,
  currentTurn: game.currentTurn,
  result: game.result,
  participants: Array.isArray(game.participants) ? game.participants : [],
  startedAt: game.startedAt,
  completedAt: game.completedAt,
  totalMoves: game.result?.totalMoves ?? game.moves?.length ?? 0,
})

module.exports = {
  asyncHandler,
  resolveUserId,
  resolveExistingRequestUserId,
  buildGuestUser,
  normalizeParticipants,
  buildPlayerX,
  buildAIPlayerO,
  buildHumanPlayerO,
  formatActiveGame,
  formatListedGame,
}

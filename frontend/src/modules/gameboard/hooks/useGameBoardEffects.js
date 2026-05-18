import { useGameBoardRemoteEffects } from './useGameBoardRemoteEffects.js'
import { useGameBoardLocalEffects } from './useGameBoardLocalEffects.js'

export const useGameBoardEffects = ({
  aiDifficulty,
  aiResponseDelayMs,
  aiSymbol,
  applyLocalMove,
  applyRemoteMoveResult,
  authIdentity,
  board,
  currentLocalPlayer,
  currentPlayer,
  gameId,
  gameMode,
  gameOver,
  humanSymbol,
  isAIGame,
  isExpandedLocalGame,
  isLocalOnlyGame,
  localTurnPlayers,
  normalizedBoardSize,
  normalizedTimeControl,
  onAuthIdentity,
  onExpandedLocalAIMove,
  opponentType,
  players,
  refs,
  resetMatchState,
  roomData,
  shouldRunExpandedLocalAI = true,
  setters,
  timeControl,
  winner,
  winningTiles,
}) => {
  useGameBoardRemoteEffects({
    aiDifficulty, aiResponseDelayMs, aiSymbol, applyRemoteMoveResult, authIdentity,
    currentPlayer, gameId, gameMode, gameOver, humanSymbol, isAIGame, isLocalOnlyGame,
    localTurnPlayers, normalizedBoardSize, onAuthIdentity, opponentType, players, refs,
    resetMatchState, roomData, setters, timeControl,
  })

  useGameBoardLocalEffects({
    aiDifficulty, applyLocalMove, board, currentLocalPlayer, currentPlayer, gameOver,
    isExpandedLocalGame, isLocalOnlyGame, localTurnPlayers, normalizedBoardSize,
    normalizedTimeControl, onExpandedLocalAIMove, players, refs, roomData,
    shouldRunExpandedLocalAI, setters, winner, winningTiles,
  })
}

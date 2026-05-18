import { useCallback, useMemo, useRef, useState } from 'react'

export const useGameBoardState = (emptyBoard, normalizedTimeControl) => {
  const isMakingMoveRef = useRef(false)
  const hasLocalProgressRef = useRef(false)
  const boardRef = useRef(emptyBoard)
  const turnStartedAtRef = useRef(null)
  const timeoutHandledForTurnRef = useRef(null)
  const currentPlayerRef = useRef('X')
  const gameOverRef = useRef(false)
  const roomCleanupDoneRef = useRef(false)
  const matchStartedAtRef = useRef(null)
  const localHistorySavedRef = useRef(false)
  const remoteAIMoveRequestRef = useRef({ id: 0 })
  const localMovesRef = useRef([])
  const lastMoveStartedAtRef = useRef(null)

  const [board, setBoard] = useState(emptyBoard)
  const [currentPlayer, setCurrentPlayer] = useState('X')
  const [lastMove, setLastMove] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [isMovePending, setIsMovePending] = useState(false)
  const [gameId, setGameId] = useState(null)
  const [useRemoteSession, setUseRemoteSession] = useState(false)
  const [winningTiles, setWinningTiles] = useState([])
  const [showWinAnimation, setShowWinAnimation] = useState(false)
  const [winner, setWinner] = useState(null)
  const [resultTone, setResultTone] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(normalizedTimeControl)

  const setMoveMakingState = useCallback((nextValue) => {
    isMakingMoveRef.current = nextValue
    setIsMovePending(nextValue)
  }, [])

  const refs = useMemo(() => ({
    boardRef,
    currentPlayerRef,
    gameOverRef,
    hasLocalProgressRef,
    isMakingMoveRef,
    lastMoveStartedAtRef,
    localHistorySavedRef,
    localMovesRef,
    matchStartedAtRef,
    remoteAIMoveRequestRef,
    roomCleanupDoneRef,
    timeoutHandledForTurnRef,
    turnStartedAtRef,
  }), [
    boardRef,
    currentPlayerRef,
    gameOverRef,
    hasLocalProgressRef,
    isMakingMoveRef,
    lastMoveStartedAtRef,
    localHistorySavedRef,
    localMovesRef,
    matchStartedAtRef,
    remoteAIMoveRequestRef,
    roomCleanupDoneRef,
    timeoutHandledForTurnRef,
    turnStartedAtRef,
  ])

  const setters = useMemo(() => ({
    setBoard,
    setCurrentPlayer,
    setGameId,
    setGameOver,
    setIsMovePending,
    setLastMove,
    setMoveMakingState,
    setResultTone,
    setSecondsLeft,
    setShowGiveUpConfirm,
    setShowPopup,
    setShowSettingsMenu,
    setShowWinAnimation,
    setUseRemoteSession,
    setWinner,
    setWinningTiles,
  }), [setMoveMakingState])

  return {
    refs,
    state: {
      board,
      currentPlayer,
      gameId,
      gameOver,
      isMovePending,
      lastMove,
      resultTone,
      secondsLeft,
      showGiveUpConfirm,
      showPopup,
      showSettingsMenu,
      showWinAnimation,
      useRemoteSession,
      winner,
      winningTiles,
    },
    setters,
  }
}

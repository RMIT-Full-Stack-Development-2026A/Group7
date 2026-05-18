import { useMemo } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import GameBoard from '../../gameboard/GameBoard.jsx'

const normalizeBoardSize = (rawValue, fallback = 10) => {
  if (typeof rawValue === 'number' && !Number.isNaN(rawValue)) {
    return rawValue === 15 ? 15 : 10
  }

  if (typeof rawValue === 'string') {
    const parsed = parseInt(rawValue, 10)
    if (!Number.isNaN(parsed)) {
      return parsed === 15 ? 15 : 10
    }
  }

  return fallback
}

const normalizeTimeControl = (rawValue, fallback = 60) => {
  const parsed = Number(rawValue)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const normalizeDifficulty = (rawValue) => {
  const allowedDifficulties = new Set(['easy', 'medium', 'hard'])
  const normalizedValue = String(rawValue || '').toLowerCase()
  return allowedDifficulties.has(normalizedValue) ? normalizedValue : 'medium'
}

export function GameVsComputer() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const roomData = location.state?.roomState?.createdRoom || null
  const turnSelection = location.state?.turnSelection || null

  const boardSize = useMemo(() => (
    normalizeBoardSize(
      searchParams.get('size') ?? roomData?.gameSettings?.boardSize ?? location.state?.boardSize,
      10
    )
  ), [location.state?.boardSize, roomData?.gameSettings?.boardSize, searchParams])

  const aiDifficulty = useMemo(() => (
    normalizeDifficulty(
      searchParams.get('difficulty') ?? location.state?.aiDifficulty
    )
  ), [location.state?.aiDifficulty, searchParams])

  const timeControl = useMemo(() => (
    normalizeTimeControl(
      searchParams.get('time') ?? location.state?.timeControl,
      60
    )
  ), [location.state?.timeControl, searchParams])

  return (
    <div className="full-bleed-page neon-page">
      <GameBoard
        boardSize={boardSize}
        gameMode="singleplayer"
        opponentType="ai"
        aiDifficulty={aiDifficulty}
        timeControl={timeControl}
        roomData={roomData}
        turnSelection={turnSelection}
        onGameEnd={() => {}}
      />
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ROUTES from '../../../router/routes.config.js'
import { getMarkerSymbols } from '../../../shared/utils/marker.utils.js'

const LOADING_DELAY_MS = 1500
const TURN_DRAW_REVEAL_MS = 2000
const normalizeBoardSize = (value) => {
  if (typeof value === 'number') {
    return value === 15 ? 15 : 10
  }

  const matchedSize = String(value || '10').match(/(?:^|\D)(10|15)(?=\D|$)/)
  const parsed = matchedSize ? Number(matchedSize[1]) : 10

  return parsed === 15 ? 15 : 10
}

const createSeededRandom = (seedValue) => {
  let seed = String(seedValue || 'tictactoang')
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0)

  return () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

const shuffleArray = (items, random = Math.random) => {
  const nextItems = [...items]

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const currentItem = nextItems[index]
    nextItems[index] = nextItems[swapIndex]
    nextItems[swapIndex] = currentItem
  }

  return nextItems
}

const buildFallbackPlayers = (payload) => {
  if (payload.aiDifficulty) {
    return [
      { name: 'You', avatar: '', type: 'human' },
      { name: `AI (${String(payload.aiDifficulty).toLowerCase()})`, avatar: '', type: 'ai' },
    ]
  }

  return [
    { name: 'Player 1', avatar: '', type: 'human' },
    { name: 'Player 2', avatar: '', type: 'human' },
  ]
}

const createTurnSelection = (payload) => {
  if (payload.turnSelection) {
    return payload.turnSelection
  }

  const room = payload.roomState?.createdRoom || null
  const roomPlayers = Array.isArray(room?.players) && room.players.length > 0
    ? room.players
    : buildFallbackPlayers(payload)
  const playerCount = roomPlayers.length
  const markers = getMarkerSymbols(room?.gameSettings?.marker, playerCount)
  const isClassicTwoPlayerMarkers = playerCount === 2 && markers[0] === 'X' && markers[1] === 'O'
  const random = createSeededRandom(`${room?.roomId || payload.roomId || 'local'}:${playerCount}:${markers.join('|')}`)

  if (isClassicTwoPlayerMarkers) {
    const randomizedPlayers = shuffleArray(roomPlayers, random)
    const assignments = {
      X: {
        userId: randomizedPlayers[0]?.userId || randomizedPlayers[0]?._id || null,
        name: randomizedPlayers[0]?.name || 'Player 1',
        avatar: randomizedPlayers[0]?.avatar || '',
        marker: 'X',
        type: randomizedPlayers[0]?.type || 'human',
        aiDifficulty: randomizedPlayers[0]?.aiDifficulty || null,
      },
      O: {
        userId: randomizedPlayers[1]?.userId || randomizedPlayers[1]?._id || null,
        name: randomizedPlayers[1]?.name || 'Player 2',
        avatar: randomizedPlayers[1]?.avatar || '',
        marker: 'O',
        type: randomizedPlayers[1]?.type || 'human',
        aiDifficulty: randomizedPlayers[1]?.aiDifficulty || null,
      },
    }

    return {
      playerCount,
      markers,
      turns: [
        { order: 1, ...assignments.X },
        { order: 2, ...assignments.O },
      ],
      playerAssignments: assignments,
      markerAssignments: {
        X: assignments.X,
        O: assignments.O,
      },
    }
  }

  const randomizedPlayers = shuffleArray(roomPlayers, random)
  const randomizedMarkers = shuffleArray(markers, random)
  const turns = randomizedPlayers.map((player, index) => ({
    order: index + 1,
    userId: player?.userId || player?._id || null,
    name: player?.name || `Player ${index + 1}`,
    avatar: player?.avatar || '',
    marker: randomizedMarkers[index] || `Marker ${index + 1}`,
    type: player?.type || 'human',
    aiDifficulty: player?.aiDifficulty || null,
  }))
  const markerAssignments = turns.reduce((accumulator, turn) => {
    accumulator[turn.marker] = {
      userId: turn.userId,
      name: turn.name,
      avatar: turn.avatar,
      marker: turn.marker,
      type: turn.type,
      order: turn.order,
      aiDifficulty: turn.aiDifficulty,
    }
    return accumulator
  }, {})

  return {
    playerCount,
    markers,
    turns,
    playerAssignments: {
      X: turns[0]
        ? {
            userId: turns[0].userId,
            name: turns[0].name,
            avatar: turns[0].avatar,
            marker: turns[0].marker,
            type: turns[0].type,
            aiDifficulty: turns[0].aiDifficulty,
          }
        : null,
      O: turns[1]
        ? {
            userId: turns[1].userId,
            name: turns[1].name,
            avatar: turns[1].avatar,
            marker: turns[1].marker,
            type: turns[1].type,
            aiDifficulty: turns[1].aiDifficulty,
          }
        : null,
    },
    markerAssignments,
  }
}

export function GameLoadingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [phase, setPhase] = useState('loading')

  const target = useMemo(() => {
    const rawTarget = location.state?.targetRoute
    return rawTarget === ROUTES.VS_FRIEND ? ROUTES.VS_FRIEND : ROUTES.VS_COMPUTER
  }, [location.state?.targetRoute])

  const payload = useMemo(() => {
    const targetState = location.state?.targetState || {}
    const roomBoardSize = targetState.roomState?.createdRoom?.gameSettings?.boardSize

    return {
      ...targetState,
      boardSize: normalizeBoardSize(roomBoardSize ?? targetState.boardSize),
    }
  }, [location.state?.targetState])

  const turnSelection = useMemo(() => createTurnSelection(payload), [payload])
  const payloadWithSelection = useMemo(() => ({
    ...payload,
    turnSelection,
  }), [payload, turnSelection])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (phase === 'loading') {
        setPhase('turn-draw')
        return
      }

      navigate(target, {
        replace: true,
        state: payloadWithSelection,
      })
    }, phase === 'loading' ? LOADING_DELAY_MS : TURN_DRAW_REVEAL_MS)

    return () => window.clearTimeout(timer)
  }, [navigate, payloadWithSelection, phase, target])

  return (
    <div className="full-bleed-page game-loading-page">
      {phase === 'loading' ? (
        <div className="game-loading-panel">
          <div className="game-loading-ring" aria-hidden="true">
            <div className="game-loading-ring-inner" />
          </div>

          <div className="game-loading-copy">
            <div className="game-loading-kicker">Preparing the arena</div>
            <h1>Loading battle board...</h1>
            <p>Synchronizing board size, player slots, and match settings for your next round.</p>

            <div className="game-loading-meta">
              <span className="game-loading-chip">Board {payload.boardSize}x{payload.boardSize}</span>
              {payload.aiDifficulty ? (
                <span className="game-loading-chip">AI {String(payload.aiDifficulty).toUpperCase()}</span>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="game-loading-panel game-loading-panel-turn-draw">
          <div className="game-loading-copy game-loading-copy-turn-draw">
            <div className="game-loading-kicker">Turn Order Ready</div>
            <h1>Random draw completed</h1>
            <p>The turn order is set. Opening the board now.</p>

            <div className="turn-draw-order-list">
              {turnSelection.turns.map((turn) => (
                <div key={`${turn.order}-${turn.name}-${turn.marker}`} className="turn-draw-order-item">
                  <span className="turn-draw-order-badge">{turn.order}</span>
                  <div className="turn-draw-order-copy">
                    <div className="turn-draw-order-name">{turn.name}</div>
                    <div className="turn-draw-order-marker">Marker: {turn.marker}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

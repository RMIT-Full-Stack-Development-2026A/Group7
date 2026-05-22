import React from 'react'
import Tile from '../../shared/components/Tile/Tile.jsx'
import Timer from './Timer.jsx'
import { formatClock } from './timer.utils.js'
import '../../shared/styles/GameBoard.css'
import { useGameBoard } from './hooks/useGameBoard.js'
import { resolveAvatarUrl, MamboAvatar, AI_AVATAR } from '../../shared/utils/avatar.utils.js'
import GameBoardChat from './GameBoardChat.jsx'

const COLUMN_LETTERS = 'ABCDEFGHIJKLMNO'.split('')

const buildColumnLabels = (size) => COLUMN_LETTERS.slice(0, size)
const buildRowLabels = (size) => Array.from({ length: size }, (_, index) => size - index)

const handleAvatarImageError = (event, isAI) => {
  const fallback = isAI ? AI_AVATAR : MamboAvatar
  if (event?.currentTarget && event.currentTarget.src !== fallback) {
    event.currentTarget.src = fallback
  }
}

export default function GameBoard(props) {
  const {
    baseBoardSize,
    board,
    boardStyleVariant,
    closeSettingsMenu,
    currentPlayer,
    currentLocalPlayer,
    gameOver,
    getPlayerClockSeconds,
    handleAbort,
    handleGiveUp,
    handleTileClick,
    isOnlineGame,
    humanSymbol,
    isExpandedLocalGame,
    isAIGame,
    isMovePending,
    lastMove,
    localMarkerColorByToken,
    localMarkerDisplayByToken,
    localPlayerByToken,
    markerColorBySymbol,
    markerDisplayBySymbol,
    normalizedBoardSize,
    openSettingsMenu,
    players,
    playerOrder,
    returnToMainMenu,
    setShowGiveUpConfirm,
    showGiveUpConfirm,
    showPopup,
    showSettingsMenu,
    showWinAnimation,
    winnerPresentation,
    winningTiles,
    openTileCount,
  } = useGameBoard(props)

  const resolvePlayerAvatar = (symbol) => {
    const player = players[symbol]
    const isAIPlayer = isAIGame && symbol !== humanSymbol
    return resolveAvatarUrl(player?.avatar, { isAI: isAIPlayer })
  }
  const resolveLocalPlayerAvatar = (player) => resolveAvatarUrl(player?.avatar, { isAI: player?.type === 'ai' })
  const markerToneClassByIndex = ['tone-a', 'tone-b', 'tone-c', 'tone-d']
  const columnLabels = buildColumnLabels(normalizedBoardSize)
  const rowLabels = buildRowLabels(normalizedBoardSize)
  const isAIOpponent = (symbol) => isAIGame && symbol !== humanSymbol

  const renderExpandedBoard = () => {
    const boardShellClassName = baseBoardSize === 15 ? 'board-shell-15' : 'board-shell-10'
    const boardClassName = `game-board game-board-intersections ${baseBoardSize === 15 ? 'game-board-15' : 'game-board-10'}`
    const markerScaleClass = baseBoardSize === 15 ? 'intersection-size-15' : 'intersection-size-10'

    return (
      <div className="gameboard-lines-shell">
        <div className="gameboard-lines-players">
          {playerOrder.map((player, index) => {
            const isActive = currentPlayer === player.token && !gameOver
            const clockSeconds = getPlayerClockSeconds(player.token)
            return (
              <div
                key={player.token}
                className={`gameboard-lines-player ${isActive ? 'active' : ''}`}
              >
                <img
                  src={resolveLocalPlayerAvatar(player)}
                  alt={player.name}
                  className="gameboard-lines-avatar"
                  onError={(event) => handleAvatarImageError(event, player?.type === 'ai')}
                />
                <div className="gameboard-lines-player-copy">
                  <div className="gameboard-lines-name">{player.displayName || player.name}</div>
                  <div
                    className={`gameboard-lines-marker marker-${markerToneClassByIndex[index] || 'tone-a'}`}
                    style={player.markerColor ? { color: player.markerColor } : undefined}
                  >
                    {player.marker}
                  </div>
                </div>
                <div className="gameboard-lines-clock-slot">
                  {gameOver ? (
                    <div className="timer-display timer-display-compact timer-idle">
                      <i className="bi bi-clock" />
                      <div className="timer-value">{formatClock(clockSeconds)}</div>
                    </div>
                  ) : (
                    <Timer seconds={clockSeconds} isActive={isActive} compact />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="gameboard-lines-status-row">
          <div className="gameboard-lines-turn-copy">
            {currentLocalPlayer
              ? `${currentLocalPlayer.name}'s turn`
              : 'Waiting for players'}
          </div>
        </div>

        <div className={`board-container gameboard-lite-board-container ${boardShellClassName}`}>
          <div className="gameboard-coords-frame">
            <div className="gameboard-coords-row gameboard-coords-row-top" aria-hidden="true">
              <span className="gameboard-coords-corner" />
              {columnLabels.map((letter) => (
                <span key={`top-${letter}`} className="gameboard-coords-cell">{letter}</span>
              ))}
              <span className="gameboard-coords-corner" />
            </div>
            <div className="gameboard-coords-body">
              <div className="gameboard-coords-col gameboard-coords-col-left" aria-hidden="true">
                {rowLabels.map((rowNumber) => (
                  <span key={`left-${rowNumber}`} className="gameboard-coords-cell">{rowNumber}</span>
                ))}
              </div>
              <div className={boardClassName}>
                <div
                  className="game-board-intersections-surface"
                  style={{
                    '--grid-lines': normalizedBoardSize - 1,
                  }}
                >
                  <div className="game-board-intersections-grid" aria-hidden="true" />

                  {board.map((boardRow, rowIndex) => (
                    boardRow.map((cell, colIndex) => {
                      const isWinningTile = winningTiles.some((tile) => tile.row === rowIndex && tile.col === colIndex)
                      const playerIndex = playerOrder.findIndex((player) => player.token === cell)
                      const toneClass = markerToneClassByIndex[playerIndex] || 'tone-a'

                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          type="button"
                          className={`game-board-intersection ${cell ? `occupied marker-${toneClass}` : ''} ${isWinningTile && showWinAnimation ? 'winning' : ''} ${markerScaleClass}`}
                          style={{
                            left: `${(colIndex / (normalizedBoardSize - 1)) * 100}%`,
                            top: `${(rowIndex / (normalizedBoardSize - 1)) * 100}%`,
                            ...(cell && localMarkerColorByToken[cell] ? { color: localMarkerColorByToken[cell] } : {}),
                          }}
                          onClick={() => handleTileClick(rowIndex, colIndex)}
                          disabled={gameOver || cell !== null || isMovePending}
                          aria-label={cell ? `${localPlayerByToken[cell]?.name || 'Player'} marker` : `Place marker at row ${rowIndex + 1}, column ${colIndex + 1}`}
                        >
                          {cell ? localMarkerDisplayByToken[cell] || cell : ''}
                        </button>
                      )
                    })
                  ))}
                </div>
              </div>
              <div className="gameboard-coords-col gameboard-coords-col-right" aria-hidden="true">
                {rowLabels.map((rowNumber) => (
                  <span key={`right-${rowNumber}`} className="gameboard-coords-cell">{rowNumber}</span>
                ))}
              </div>
            </div>
            <div className="gameboard-coords-row gameboard-coords-row-bottom" aria-hidden="true">
              <span className="gameboard-coords-corner" />
              {columnLabels.map((letter) => (
                <span key={`bottom-${letter}`} className="gameboard-coords-cell">{letter}</span>
              ))}
              <span className="gameboard-coords-corner" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`game-container gameboard-lite-shell gameboard-style-${boardStyleVariant}`}>
      {showPopup && (
        <div className="winner-popup-overlay">
          <div className={`winner-popup ${winnerPresentation.badge === 'LOSE' ? 'winner-popup-lose' : winnerPresentation.badge === 'DRAW' ? 'winner-popup-draw' : ''}`}>
            <div className="winner-popup-content">
              <div className="winner-icon">{winnerPresentation.badge}</div>
              <h2 className="winner-name">{winnerPresentation.title}</h2>
              <p className="winner-message">{winnerPresentation.message}</p>
              <button className="winner-close-btn" onClick={returnToMainMenu}>Return to Main Menu</button>
            </div>
          </div>
        </div>
      )}

      {showSettingsMenu && (
        <div className="game-settings-overlay" onClick={closeSettingsMenu}>
          <div className="game-settings-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="game-settings-header">
              <div>
                <p className="game-settings-kicker">Battle Settings</p>
                <h3>Pause Menu</h3>
              </div>
              <button type="button" className="game-settings-close" onClick={closeSettingsMenu}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {!showGiveUpConfirm ? (
              <div className="game-settings-actions">
                <button type="button" className="game-settings-primary" onClick={closeSettingsMenu}>
                  Return to the battle
                </button>
                <button type="button" className="game-settings-danger" onClick={() => setShowGiveUpConfirm(true)}>
                  Give up
                </button>
                {!isOnlineGame && (
                  <button type="button" className="game-settings-secondary" onClick={handleAbort}>
                    Aborted
                  </button>
                )}
              </div>
            ) : (
              <div className="game-settings-confirm">
                <p className="game-settings-confirm-title">Are you sure you want to give up?</p>
                <p className="game-settings-confirm-copy">This will end the match immediately and count as a loss.</p>
                <div className="game-settings-actions">
                  <button type="button" className="game-settings-secondary" onClick={() => setShowGiveUpConfirm(false)}>
                    Keep fighting
                  </button>
                  <button type="button" className="game-settings-danger" onClick={handleGiveUp}>
                    Confirm give up
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <button type="button" className="gameboard-settings-toggle" onClick={openSettingsMenu} aria-label="Open game settings">
        <i className="bi bi-gear-fill" />
      </button>

      <div className="gameboard-lite-layout">
        {isExpandedLocalGame ? (
          renderExpandedBoard()
        ) : (
          <>
            <div className="gameboard-lite-header gameboard-lite-header-split">
              {['X', 'O'].map((symbol) => {
                const player = players[symbol]
                const isActive = currentPlayer === symbol && !gameOver
                const clockSeconds = getPlayerClockSeconds(symbol)
                return (
                  <div
                    key={symbol}
                    className={`gameboard-lite-player ${isActive ? 'active' : ''}`}
                  >
                    <img
                      src={resolvePlayerAvatar(symbol)}
                      alt={player.name}
                      className="gameboard-lite-avatar"
                      onError={(event) => handleAvatarImageError(event, isAIOpponent(symbol))}
                    />
                    <div className="gameboard-lite-player-copy">
                      <div className="gameboard-lite-name">{player.displayName || player.name}</div>
                      <div className="gameboard-lite-subtitle" style={player.markerColor ? { color: player.markerColor } : undefined}>{player.marker}</div>
                    </div>
                    <div className="gameboard-lite-clock-slot">
                      {gameOver ? (
                        <div className="timer-display timer-display-compact timer-idle">
                          <i className="bi bi-clock" />
                          <div className="timer-value">{formatClock(clockSeconds)}</div>
                        </div>
                      ) : (
                        <Timer seconds={clockSeconds} isActive={isActive} compact />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className={`board-container gameboard-lite-board-container board-shell-${normalizedBoardSize}`}>
              <div className="gameboard-coords-frame">
                <div className="gameboard-coords-row gameboard-coords-row-top" aria-hidden="true">
                  <span className="gameboard-coords-corner" />
                  {columnLabels.map((letter) => (
                    <span key={`top-${letter}`} className="gameboard-coords-cell">{letter}</span>
                  ))}
                  <span className="gameboard-coords-corner" />
                </div>
                <div className="gameboard-coords-body">
                  <div className="gameboard-coords-col gameboard-coords-col-left" aria-hidden="true">
                    {rowLabels.map((rowNumber) => (
                      <span key={`left-${rowNumber}`} className="gameboard-coords-cell">{rowNumber}</span>
                    ))}
                  </div>
                  <div
                    className={`game-board game-board-${normalizedBoardSize}`}
                    style={{
                      gridTemplateColumns: `repeat(${normalizedBoardSize}, 1fr)`,
                      gridTemplateRows: `repeat(${normalizedBoardSize}, 1fr)`,
                    }}
                  >
                    {board.map((boardRow, rowIndex) => (
                      boardRow.map((cell, colIndex) => {
                        const isWinningTile = winningTiles.some((tile) => tile.row === rowIndex && tile.col === colIndex)

                        return (
                          <Tile
                            key={`${rowIndex}-${colIndex}`}
                            value={cell}
                            displayValue={cell ? markerDisplayBySymbol[cell] : ''}
                            markerColor={cell ? markerColorBySymbol[cell] : ''}
                            onClick={() => handleTileClick(rowIndex, colIndex)}
                            isWinning={isWinningTile && showWinAnimation}
                            disabled={gameOver || (isAIGame && currentPlayer !== humanSymbol) || cell !== null || isMovePending}
                          />
                        )
                      })
                    ))}
                  </div>
                  <div className="gameboard-coords-col gameboard-coords-col-right" aria-hidden="true">
                    {rowLabels.map((rowNumber) => (
                      <span key={`right-${rowNumber}`} className="gameboard-coords-cell">{rowNumber}</span>
                    ))}
                  </div>
                </div>
                <div className="gameboard-coords-row gameboard-coords-row-bottom" aria-hidden="true">
                  <span className="gameboard-coords-corner" />
                  {columnLabels.map((letter) => (
                    <span key={`bottom-${letter}`} className="gameboard-coords-cell">{letter}</span>
                  ))}
                  <span className="gameboard-coords-corner" />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="gameboard-lite-footer">
          {lastMove
            ? `Last move: row ${lastMove.row + 1}, col ${lastMove.col + 1}`
            : `Open tiles: ${openTileCount}`}
        </div>

        {isOnlineGame ? <GameBoardChat roomData={props.roomData} /> : null}
      </div>
    </div>
  )
}

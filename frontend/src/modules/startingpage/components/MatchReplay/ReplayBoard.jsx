import { Fragment } from 'react';
import { columnLetter, resolveSymbolColor } from '../../logic/matchReplay.utils.js';

const BoardCell = ({ symbol, isLastMove, isWinning, color, ariaLabel }) => (
  <div
    className={`match-replay-cell ${symbol ? 'match-replay-cell-occupied' : ''} ${
      isLastMove ? 'match-replay-cell-last' : ''
    } ${isWinning ? 'match-replay-cell-winning' : ''}`}
    style={color ? { color } : undefined}
    aria-label={ariaLabel}
  >
    {symbol}
  </div>
);

export function ReplayBoard({
  boardSize, board, currentMove, winningTiles, showWinningHighlight, participants,
}) {
  return (
    <div className="match-replay-board-wrapper">
      <div
        className="match-replay-board"
        style={{
          '--replay-size': boardSize,
          gridTemplateColumns: `auto repeat(${boardSize}, 1fr) auto`,
          gridTemplateRows: `auto repeat(${boardSize}, 1fr) auto`,
        }}
      >
        <div className="match-replay-corner" />
        {Array.from({ length: boardSize }).map((_, colIndex) => (
          <div key={`top-${colIndex}`} className="match-replay-axis-label match-replay-axis-col">
            {columnLetter(colIndex)}
          </div>
        ))}
        <div className="match-replay-corner" />

        {board.map((rowCells, rowIndex) => {
          const rowNumber = boardSize - rowIndex; // chess-style: bottom row = 1
          return (
            <Fragment key={`row-${rowIndex}`}>
              <div className="match-replay-axis-label match-replay-axis-row">{rowNumber}</div>
              {rowCells.map((symbol, colIndex) => {
                const isLastMove = currentMove
                  && currentMove.row === rowIndex
                  && currentMove.col === colIndex;
                const isWinning = showWinningHighlight
                  && winningTiles.some((tile) => tile.row === rowIndex && tile.col === colIndex);
                return (
                  <BoardCell
                    key={`cell-${rowIndex}-${colIndex}`}
                    symbol={symbol}
                    isLastMove={isLastMove}
                    isWinning={isWinning}
                    color={symbol ? resolveSymbolColor(symbol, participants) : undefined}
                    ariaLabel={`${columnLetter(colIndex)}${rowNumber}${symbol ? ` ${symbol}` : ''}`}
                  />
                );
              })}
              <div className="match-replay-axis-label match-replay-axis-row">{rowNumber}</div>
            </Fragment>
          );
        })}

        <div className="match-replay-corner" />
        {Array.from({ length: boardSize }).map((_, colIndex) => (
          <div key={`bottom-${colIndex}`} className="match-replay-axis-label match-replay-axis-col">
            {columnLetter(colIndex)}
          </div>
        ))}
        <div className="match-replay-corner" />
      </div>
    </div>
  );
}

export default ReplayBoard;

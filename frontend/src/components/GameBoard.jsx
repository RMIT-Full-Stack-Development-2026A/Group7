/**
 * GameBoard – renders the 10×10 (or 15×15) grid.
 * Props:
 *   board       – flat string[] of length size*size
 *   size        – 10 or 15
 *   winLine     – number[] of winning cell indices (optional)
 *   onCellClick – (row, col) => void
 *   disabled    – bool
 */
export default function GameBoard({ board, size = 10, winLine = [], onCellClick, disabled }) {
  const winSet = new Set(winLine);

  // Algebraic notation: cols = a,b,c… rows = 1,2,3… (bottom-up)
  const colLabels = Array.from({ length: size }, (_, i) => String.fromCharCode(97 + i));
  const rowLabels = Array.from({ length: size }, (_, i) => size - i);

  const cellSize = size === 10 ? 52 : 38;

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Column headers */}
      <div style={{ display: 'flex', marginLeft: cellSize, marginBottom: 2 }}>
        {colLabels.map((l) => (
          <div key={l} style={{ width: cellSize, textAlign: 'center', fontSize: '0.7rem', color: 'var(--muted)' }}>{l}</div>
        ))}
      </div>

      {Array.from({ length: size }, (_, rowIdx) => (
        <div key={rowIdx} style={{ display: 'flex', alignItems: 'center' }}>
          {/* Row label */}
          <div style={{ width: cellSize, textAlign: 'center', fontSize: '0.7rem', color: 'var(--muted)', flexShrink: 0 }}>
            {rowLabels[rowIdx]}
          </div>
          {Array.from({ length: size }, (_, colIdx) => {
            const idx = rowIdx * size + colIdx;
            const mark = board[idx];
            const isWin = winSet.has(idx);
            return (
              <div
                key={colIdx}
                className={isWin ? 'win-cell' : ''}
                onClick={() => !disabled && !mark && onCellClick(rowIdx, colIdx)}
                style={{
                  width: cellSize, height: cellSize,
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: size === 10 ? '1.4rem' : '1rem',
                  cursor: (!disabled && !mark) ? 'pointer' : 'default',
                  userSelect: 'none',
                  transition: 'background .1s',
                  background: isWin ? 'rgba(108,99,255,.25)' : 'var(--bg)',
                  color: mark === 'X' ? '#6c63ff' : '#f59e0b',
                  fontWeight: 700,
                }}
                title={`${colLabels[colIdx]}${rowLabels[rowIdx]}`}
              >
                {mark}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

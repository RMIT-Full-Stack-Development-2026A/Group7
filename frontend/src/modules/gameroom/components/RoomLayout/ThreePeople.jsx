import { PlayerSlot } from '../PlayerSlot/PlayerSlots.jsx';
import { AISlots } from '../AISlot/AISlots.jsx';

function DefaultCenterContent() {
  return (
    <div className="vs-box-wrapper">
      <div className="vs-box-glow" />
      <div className="vs-box">
        <span className="vs-text">VS</span>
      </div>
    </div>
  );
}

function PlayerCell({ player, slotId, onAddAI, onRemoveAI, alignClass, canManageAI }) {
  return (
    <div className={alignClass}>
      {player ? (
        <PlayerSlot player={player} onRemove={canManageAI ? () => onRemoveAI(slotId) : undefined} />
      ) : (
        <AISlots
          slotId={slotId}
          onSelectAI={(difficulty) => onAddAI(slotId, difficulty)}
          disabled={!canManageAI}
        />
      )}
    </div>
  );
}

export function ThreePeople({
  players,
  onAddAI,
  onRemoveAI,
  centerContent,
  canManageAI = false,
}) {
  const centerNode = centerContent ?? <DefaultCenterContent />;

  return (
    <div style={{ paddingTop: '96px', paddingBottom: '128px', minHeight: '100vh' }}>
      <div
        className="container d-flex align-items-center justify-content-center"
        style={{ minHeight: 'calc(100vh - 240px)' }}
      >
        <div style={{ width: '100%', maxWidth: '900px' }}>
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ gap: '96px' }}
          >
            <div className="d-flex align-items-center justify-content-center">
              <PlayerCell
                player={players[0]}
                slotId={0}
                onAddAI={onAddAI}
                onRemoveAI={onRemoveAI}
                canManageAI={canManageAI}
                alignClass="d-flex justify-content-center"
              />
            </div>
            <div className="d-flex align-items-center justify-content-center">
              {centerNode}
            </div>
            <div
              className="d-flex flex-column align-items-center"
              style={{ gap: '48px' }}
            >
              <PlayerCell
                player={players[2]}
                slotId={2}
                onAddAI={onAddAI}
                onRemoveAI={onRemoveAI}
                canManageAI={canManageAI}
                alignClass="d-flex justify-content-center"
              />
              <PlayerCell
                player={players[3]}
                slotId={3}
                onAddAI={onAddAI}
                onRemoveAI={onRemoveAI}
                canManageAI={canManageAI}
                alignClass="d-flex justify-content-center"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

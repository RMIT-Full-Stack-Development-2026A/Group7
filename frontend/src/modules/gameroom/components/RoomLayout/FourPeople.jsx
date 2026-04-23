import { PlayerSlot } from '../PlayerSlot/PlayerSlots.jsx';
import { AISlots } from '../AISlot/AISlots.jsx';

export const initialPlayers = [
  {
    id: 1,
    name: 'p1',
    avatar:
      'https://images.unsplash.com/photo-1772371272167-0117a6573d58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    isHost: true,
    type: 'human',
  },
  null,
  null,
  null,
];

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
    <div className={`col-4 d-flex ${alignClass}`}>
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

export function FourPeople({
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
        <div style={{ width: '100%', maxWidth: '960px' }}>
          <div className="row g-4">
            <PlayerCell
              player={players[0]}
              slotId={0}
              onAddAI={onAddAI}
              onRemoveAI={onRemoveAI}
              canManageAI={canManageAI}
              alignClass="justify-content-end"
            />
            <div className="col-4" />
            <PlayerCell
              player={players[2]}
              slotId={2}
              onAddAI={onAddAI}
              onRemoveAI={onRemoveAI}
              canManageAI={canManageAI}
              alignClass="justify-content-start"
            />

            <div className="col-4" />
            <div className="col-4 d-flex align-items-center justify-content-center">
              {centerNode}
            </div>
            <div className="col-4" />

            <PlayerCell
              player={players[1]}
              slotId={1}
              onAddAI={onAddAI}
              onRemoveAI={onRemoveAI}
              canManageAI={canManageAI}
              alignClass="justify-content-end"
            />
            <div className="col-4" />
            <PlayerCell
              player={players[3]}
              slotId={3}
              onAddAI={onAddAI}
              onRemoveAI={onRemoveAI}
              canManageAI={canManageAI}
              alignClass="justify-content-start"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { PlayerSlot } from '../elements/PlayerSlots';
import { AISlots } from './AISlots';

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

function PlayerCell({ player, slotId, onAddAI, onRemoveAI, alignClass }) {
  return (
    <div className={alignClass}>
      {player ? (
        <PlayerSlot player={player} onRemove={() => onRemoveAI(slotId)} />
      ) : (
        <AISlots slotId={slotId} onSelectAI={(difficulty) => onAddAI(slotId, difficulty)} />
      )}
    </div>
  );
}

export function ThreePeople({
  players,
  onAddAI,
  onRemoveAI,
  centerContent,
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
                alignClass="d-flex justify-content-center"
              />
              <PlayerCell
                player={players[3]}
                slotId={3}
                onAddAI={onAddAI}
                onRemoveAI={onRemoveAI}
                alignClass="d-flex justify-content-center"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

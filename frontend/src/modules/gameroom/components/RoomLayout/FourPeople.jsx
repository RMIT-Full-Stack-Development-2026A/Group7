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

function PlayerCell({ player, slotId, onAddAI, onAddLocalPlayer, onRemoveAI, alignClass, canManageAI, markerOptions, canChangeMarker, onChangeMarker }) {
  return (
    <div className={`col-4 d-flex ${alignClass}`}>
      {player ? (
        <PlayerSlot
          player={player}
          onRemove={canManageAI ? () => onRemoveAI(slotId) : undefined}
          markerOptions={markerOptions}
          canChooseMarker={canChangeMarker?.(player)}
          onChooseMarker={(marker) => onChangeMarker?.(slotId, marker)}
        />
      ) : (
        <AISlots
          slotId={slotId}
          onSelectAI={(difficulty) => onAddAI(slotId, difficulty)}
          onSelectLocalPlayer={(name) => onAddLocalPlayer?.(slotId, name)}
          disabled={!canManageAI}
        />
      )}
    </div>
  );
}

export function FourPeople({
  players,
  onAddAI,
  onAddLocalPlayer,
  onRemoveAI,
  centerContent,
  canManageAI = false,
  markerOptions = [],
  canChangeMarker,
  onChangeMarker,
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
              onAddLocalPlayer={onAddLocalPlayer}
              onRemoveAI={onRemoveAI}
              canManageAI={canManageAI}
              markerOptions={markerOptions}
              canChangeMarker={canChangeMarker}
              onChangeMarker={onChangeMarker}
              alignClass="justify-content-end"
            />
            <div className="col-4" />
            <PlayerCell
              player={players[2]}
              slotId={2}
              onAddAI={onAddAI}
              onAddLocalPlayer={onAddLocalPlayer}
              onRemoveAI={onRemoveAI}
              canManageAI={canManageAI}
              markerOptions={markerOptions}
              canChangeMarker={canChangeMarker}
              onChangeMarker={onChangeMarker}
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
              onAddLocalPlayer={onAddLocalPlayer}
              onRemoveAI={onRemoveAI}
              canManageAI={canManageAI}
              markerOptions={markerOptions}
              canChangeMarker={canChangeMarker}
              onChangeMarker={onChangeMarker}
              alignClass="justify-content-end"
            />
            <div className="col-4" />
            <PlayerCell
              player={players[3]}
              slotId={3}
              onAddAI={onAddAI}
              onAddLocalPlayer={onAddLocalPlayer}
              onRemoveAI={onRemoveAI}
              canManageAI={canManageAI}
              markerOptions={markerOptions}
              canChangeMarker={canChangeMarker}
              onChangeMarker={onChangeMarker}
              alignClass="justify-content-start"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

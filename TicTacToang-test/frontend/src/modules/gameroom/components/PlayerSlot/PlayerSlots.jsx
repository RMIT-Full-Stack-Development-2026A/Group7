import { Crown, X } from "lucide-react";
import { usePlayerSlots } from '../../hooks/usePlayerSlots.js';
import MamboAvatar from '../../../../shared/assets/images/Mambo.png';

const resolveAvatarUrl = (avatar) => {
  if (!avatar || avatar === 'Mambo.png') {
    return MamboAvatar;
  }

  if (avatar.startsWith('blob:') || avatar.startsWith('http') || avatar.startsWith('data:')) {
    return avatar;
  }

  return MamboAvatar;
};

export function PlayerSlot({ player, onRemove }) {
  const { isSquareBorder, canRemove, aiLabel } = usePlayerSlots(player, onRemove);

  return (
    <div className="player-slot-container">
      <div className="player-avatar-wrapper">
        <div className={`player-avatar-border ${isSquareBorder ? 'square' : 'circle'}`}>
          <img
            src={resolveAvatarUrl(player.avatar)}
            alt={player.name}
            className={`player-avatar ${isSquareBorder ? 'square' : 'circle'}`}
            onError={(event) => {
              event.currentTarget.src = MamboAvatar;
            }}
          />
        </div>

        {player.isHost && (
          <div className="host-crown">
            <Crown className="size-13.6 text-black"/>
          </div>
        )}

        {canRemove && (
          <button
            type="button"
            className="player-remove-btn"
            onClick={onRemove}
            aria-label={`Remove ${player.name}`}
            title={`Remove ${player.name}`}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="d-flex flex-column align-items-center gap-1">
        <div className="player-name">{player.name}</div>

        {aiLabel && <div className="ai-badge">{aiLabel}</div>}
      </div>
    </div>
  );
}

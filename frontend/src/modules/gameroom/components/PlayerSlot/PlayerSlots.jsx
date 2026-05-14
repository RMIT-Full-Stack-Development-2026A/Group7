import { memo, useMemo } from 'react';
import { Crown, X } from "lucide-react";
import { usePlayerSlots } from '../../hooks/usePlayerSlots.js';
import { MamboAvatar, resolveAvatarUrl } from '../../../../shared/utils/avatar.utils.js';

function PlayerSlotComponent({ player, onRemove }) {
  const { isSquareBorder, canRemove, aiLabel } = usePlayerSlots(player, onRemove);
  const avatarSrc = useMemo(() => resolveAvatarUrl(player.avatar), [player.avatar]);

  return (
    <div className="player-slot-container">
      <div className="player-avatar-wrapper">
        <div className={`player-avatar-border ${isSquareBorder ? 'square' : 'circle'}`}>
          <img
            src={avatarSrc}
            alt={player.name}
            className={`player-avatar ${isSquareBorder ? 'square' : 'circle'}`}
            onError={(event) => {
              if (event.currentTarget.dataset.fallbackApplied === 'true') {
                return;
              }

              event.currentTarget.dataset.fallbackApplied = 'true';
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

export const PlayerSlot = memo(PlayerSlotComponent);

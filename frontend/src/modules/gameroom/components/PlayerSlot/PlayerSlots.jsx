import { memo, useMemo, useState } from 'react';
import { Crown, Palette, X } from "lucide-react";
import { usePlayerSlots } from '../../hooks/usePlayerSlots.js';
import { MamboAvatar, resolveAvatarUrl } from '../../../../shared/utils/avatar.utils.js';
import { markerTermToSymbol } from '../../../../shared/utils/marker.utils.js';

function PlayerSlotComponent({ player, onRemove, markerOptions = [], canChooseMarker = false, onChooseMarker }) {
  const { isSquareBorder, canRemove, aiLabel } = usePlayerSlots(player, onRemove);
  const avatarSrc = useMemo(() => resolveAvatarUrl(player.avatar), [player.avatar]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const markerSymbol = markerTermToSymbol(player.marker);
  const markerColor = player.markerColor || '';

  const handleChooseMarker = (marker) => {
    onChooseMarker?.(marker);
    setIsPickerOpen(false);
  };

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
        <div className="player-name-row">
          <div className="player-name">
            {player.type === 'ai' && player.aiDifficulty
              ? `${player.name} (${player.aiDifficulty})`
              : player.name}
          </div>

          {markerSymbol ? (
            <span
              className="player-marker-chip"
              style={markerColor ? { color: markerColor, borderColor: markerColor } : undefined}
              title="Selected marker"
            >
              {markerSymbol}
            </span>
          ) : null}

          {canChooseMarker ? (
            <div className="player-marker-picker">
              <button
                type="button"
                className="player-marker-picker-btn"
                onClick={() => setIsPickerOpen((isOpen) => !isOpen)}
                aria-label={`Choose marker for ${player.name}`}
                title="Choose marker"
              >
                <Palette size={14} />
              </button>

              {isPickerOpen ? (
                <div className="player-marker-menu" role="menu">
                  {markerOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`player-marker-option ${player.marker === option.id ? 'active' : ''}`}
                      onClick={() => handleChooseMarker(option.id)}
                      title={option.id}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {aiLabel && <div className="ai-badge">{aiLabel}</div>}
      </div>
    </div>
  );
}

export const PlayerSlot = memo(PlayerSlotComponent);

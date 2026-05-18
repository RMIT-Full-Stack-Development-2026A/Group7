export function usePlayerSlots(player, onRemove) {
  const isLocalGuest = player.type === 'human'
    && typeof player.userId === 'string'
    && player.userId.startsWith('local_player_');

  return {
    isSquareBorder: player.isHost,
    canRemove: (player.type === 'ai' || isLocalGuest) && typeof onRemove === 'function',
    aiLabel: player.type === 'ai' && player.aiDifficulty
      ? `AI - ${player.aiDifficulty}`
      : (isLocalGuest ? 'Local Player' : null),
  };
}

export default usePlayerSlots;

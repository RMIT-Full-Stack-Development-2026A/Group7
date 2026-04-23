export function usePlayerSlots(player, onRemove) {
  return {
    isSquareBorder: player.isHost,
    canRemove: player.type === 'ai' && typeof onRemove === 'function',
    aiLabel: player.type === 'ai' && player.aiDifficulty ? `AI - ${player.aiDifficulty}` : null,
  };
}

export default usePlayerSlots;

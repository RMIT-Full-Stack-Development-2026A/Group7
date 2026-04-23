const DIFFICULTY_OPTIONS = [
  { level: 'Easy', icon: 'bi-robot', color: '#7CFC00' },
  { level: 'Medium', icon: 'bi-lightning-charge-fill', color: '#FFD54F' },
  { level: 'Hard', icon: 'bi-fire', color: '#ffaa0d' },
];

export function useDifficultyMenu() {
  return {
    difficultyOptions: DIFFICULTY_OPTIONS,
  };
}

export default useDifficultyMenu;

export const formatClock = (totalSeconds) => {
  const safe = Math.max(0, Number.isFinite(totalSeconds) ? Math.ceil(totalSeconds) : 0);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

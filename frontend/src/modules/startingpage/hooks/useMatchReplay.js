import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { httpHelper } from '../../../services/httpHelper.js';
import { getApiBaseUrl } from '../../../config/api/baseUrl.js';
import { resolveAuthIdentity, getStoredAuthIdentity } from '../../gameroom/utils/authIdentity.js';
import {
  buildParticipantList,
  isPremiumIdentity,
  reconstructBoardAtStep,
} from '../logic/matchReplay.utils.js';

const DEFAULT_SPEED_MS = 1200;
const DEFAULT_BOARD_SIZE = 15;

const clampStep = (value, totalMoves) => Math.max(0, Math.min(totalMoves, value));

export function useMatchReplay() {
  const { gameId } = useParams();

  const [identity, setIdentity] = useState(() => getStoredAuthIdentity());
  const [isPremiumKnown, setIsPremiumKnown] = useState(false);
  const [replay, setReplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(DEFAULT_SPEED_MS);

  // Resolve identity (premium check) once per mount.
  useEffect(() => {
    let mounted = true;
    resolveAuthIdentity()
      .then((resolved) => { if (mounted) setIdentity(resolved); })
      .catch(() => {})
      .finally(() => { if (mounted) setIsPremiumKnown(true); });
    return () => { mounted = false; };
  }, []);

  const userIsPremium = isPremiumIdentity(identity);

  // Fetch the replay once the premium gate is known to allow access.
  useEffect(() => {
    if (!isPremiumKnown || !userIsPremium || !gameId) return undefined;

    let mounted = true;
    queueMicrotask(() => {
      if (!mounted) return;
      setLoading(true);
      setErrorMessage('');
    });

    httpHelper
      .get(`${getApiBaseUrl()}/games/${encodeURIComponent(gameId)}/replay`)
      .then((response) => {
        if (!mounted) return;
        if (!response.ok) {
          setErrorMessage(response?.data?.error || response?.data?.message || 'Could not load replay.');
          setReplay(null);
          return;
        }
        setReplay(response?.data?.data || null);
        setStep(0);
      })
      .catch((error) => {
        if (mounted) setErrorMessage(error?.message || 'Could not load replay.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [isPremiumKnown, userIsPremium, gameId]);

  const moves = useMemo(() => replay?.moves || [], [replay]);
  const totalMoves = moves.length;
  const boardSize = replay?.gameInfo?.boardSize || DEFAULT_BOARD_SIZE;
  const participants = useMemo(() => buildParticipantList(replay), [replay]);
  const isActivelyPlaying = isPlaying && step < totalMoves;

  // Auto-play timer: advance one step on each tick while actively playing.
  useEffect(() => {
    if (!isActivelyPlaying) return undefined;
    const timer = window.setTimeout(() => {
      setStep((current) => clampStep(current + 1, totalMoves));
    }, speedMs);
    return () => window.clearTimeout(timer);
  }, [isActivelyPlaying, step, totalMoves, speedMs]);

  const board = useMemo(
    () => reconstructBoardAtStep(moves, step, boardSize),
    [moves, step, boardSize],
  );

  const currentMove = step > 0 ? moves[step - 1] : null;
  const winningTiles = replay?.result?.winningTiles
    || replay?.gameInfo?.result?.winningTiles
    || [];
  const showWinningHighlight = step === totalMoves
    && Array.isArray(winningTiles)
    && winningTiles.length > 0;

  const handlePlayPause = () => {
    // Restart from the beginning if the user is at the end.
    if (step >= totalMoves) {
      setStep(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((current) => !current);
  };

  const handleForward = () => {
    setIsPlaying(false);
    setStep((current) => clampStep(current + 1, totalMoves));
  };

  const handleBackward = () => {
    setIsPlaying(false);
    setStep((current) => clampStep(current - 1, totalMoves));
  };

  const handleJumpStart = () => {
    setIsPlaying(false);
    setStep(0);
  };

  const handleJumpEnd = () => {
    setIsPlaying(false);
    setStep(totalMoves);
  };

  const handleScrub = (event) => {
    const next = Number(event.target.value);
    if (Number.isFinite(next)) {
      setIsPlaying(false);
      setStep(clampStep(next, totalMoves));
    }
  };

  const effectiveError = errorMessage || (!gameId ? 'Missing game identifier.' : '');

  return {
    // gating
    gameId,
    isPremiumKnown,
    userIsPremium,
    loading,
    effectiveError,
    replay,
    // replay data
    moves,
    totalMoves,
    boardSize,
    participants,
    board,
    currentMove,
    winningTiles,
    showWinningHighlight,
    // playback state
    step,
    isActivelyPlaying,
    speedMs,
    setSpeedMs,
    // handlers
    handlePlayPause,
    handleForward,
    handleBackward,
    handleJumpStart,
    handleJumpEnd,
    handleScrub,
  };
}

export default useMatchReplay;

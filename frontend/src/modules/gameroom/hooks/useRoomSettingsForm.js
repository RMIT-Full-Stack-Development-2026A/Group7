import { useEffect, useState } from 'react';
import { gameroomService } from '../services/gameroomService.js';
import { resolveAuthIdentity } from '../utils/authIdentity.js';
import { SAFE_MARKER_OPTIONS } from '../../../shared/utils/marker.utils.js';

const MARKER_OPTIONS_BY_PLAYERS = {
  2: SAFE_MARKER_OPTIONS,
  3: SAFE_MARKER_OPTIONS,
};

const BOARD_STYLES = ['Classic', 'Modern', 'Minimal'];
const BOARD_SIZES = ['10x10', '15x15'];
// Max-timer-per-player options: 4, 6, 8, 10, 12 minutes (chess-clock model).
// timeToThink is the storage field name retained for backwards compatibility
// with existing room records; the value now represents the per-player bank.
export const MAX_TIMER_MIN_SECONDS = 240;   // 4 minutes
export const MAX_TIMER_MAX_SECONDS = 720;   // 12 minutes
export const MAX_TIMER_STEP_SECONDS = 120;  // 2 minute step
const TIME_OPTIONS = [240, 360, 480, 600, 720];

export function useRoomSettingsForm(onCreateRoom) {
  const [players, setPlayers] = useState(2);
  const [boardStyle, setBoardStyle] = useState('Classic');
  const [boardSize, setBoardSize] = useState('10x10');
  const [marker, setMarker] = useState(MARKER_OPTIONS_BY_PLAYERS[2][0].id);
  const [timeToThink, setTimeToThink] = useState(MAX_TIMER_MIN_SECONDS);
  const [roomName, setRoomName] = useState('Game Room');
  const [isLoading, setIsLoading] = useState(false);
  const [hostPosition, setHostPosition] = useState(1);

  const markerOptions = MARKER_OPTIONS_BY_PLAYERS[players];
  const showHostPositionPicker = players >= 2;
  const hostPositionOptions = Array.from({ length: players }, (_, index) => index + 1);

  useEffect(() => {
    const markerStillValid = markerOptions.some((option) => option.id === marker);

    if (!markerStillValid) {
      setMarker(markerOptions[0].id);
    }
  }, [marker, markerOptions]);

  useEffect(() => {
    if (hostPosition > players) {
      setHostPosition(1);
    }
  }, [hostPosition, players]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    const paddedSec = String(sec).padStart(2, '0');
    return `${minutes}:${paddedSec}`;
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);

    try {
      const { userId, username, name, email, avatar } = await resolveAuthIdentity();
      const displayName = name || username;

      if (!userId && !username && !email) {
        throw new Error('Please log in again before creating a room.');
      }

      const createdRoom = await gameroomService.createRoom({
        roomName,
        size: players,
        boardStyle,
        boardSize,
        marker,
        timeToThink,
        hostPosition,
        userId,
        username,
        email,
        hostName: displayName,
        hostAvatar: avatar,
      });

      onCreateRoom(createdRoom);
    } catch (error) {
      console.error('Error creating room:', error);
      alert(error.message || 'Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    players,
    boardStyle,
    boardSize,
    marker,
    timeToThink,
    roomName,
    isLoading,
    hostPosition,
    showHostPositionPicker,
    hostPositionOptions,
    boardStyles: BOARD_STYLES,
    boardSizes: BOARD_SIZES,
    markerOptions,
    timeOptions: TIME_OPTIONS,
    timerMinSeconds: MAX_TIMER_MIN_SECONDS,
    timerMaxSeconds: MAX_TIMER_MAX_SECONDS,
    timerStepSeconds: MAX_TIMER_STEP_SECONDS,
    setPlayers,
    setBoardStyle,
    setBoardSize,
    setMarker,
    setTimeToThink,
    setRoomName,
    setHostPosition,
    formatTime,
    handleCreateRoom,
  };
}

export default useRoomSettingsForm;

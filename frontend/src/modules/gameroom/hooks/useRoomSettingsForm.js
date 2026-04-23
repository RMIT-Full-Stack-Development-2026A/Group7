import { useEffect, useState } from 'react';
import { gameroomService } from '../services/gameroomService.js';
import { resolveAuthIdentity } from '../utils/authIdentity.js';

const MARKER_OPTIONS_BY_PLAYERS = {
  2: [
    { id: 'X-O', label: 'X - O' },
    { id: 'Circle-Star', label: '\u25cf - \u2605' },
    { id: 'Square-Triangle', label: '\u25a0 - \u25b2' },
    { id: 'Moon-Sun', label: '\u263e - \u2600' },
    { id: 'Heart-Spade', label: '\u2665 - \u2660' },
    { id: 'Diamond-Club', label: '\u2666 - \u2663' },
  ],
  3: [
    { id: 'X-O-Triangle', label: 'X - O - \u25b2' },
    { id: 'Circle-Star-Square', label: '\u25cf - \u2605 - \u25a0' },
    { id: 'Moon-Sun-Cloud', label: '\u263e - \u2600 - \u2601' },
    { id: 'Heart-Spade-Diamond', label: '\u2665 - \u2660 - \u2666' },
    { id: 'Club-Diamond-Star', label: '\u2663 - \u2666 - \u2605' },
    { id: 'Triangle-Square-Circle', label: '\u25b2 - \u25a0 - \u25cf' },
  ],
  4: [
    { id: 'X-O-Triangle-Square', label: 'X - O - \u25b2 - \u25a0' },
    { id: 'Circle-Star-Square-Triangle', label: '\u25cf - \u2605 - \u25a0 - \u25b2' },
    { id: 'Moon-Sun-Cloud-Lightning', label: '\u263e - \u2600 - \u2601 - \u26a1' },
    { id: 'Heart-Spade-Diamond-Club', label: '\u2665 - \u2660 - \u2666 - \u2663' },
    { id: 'Star-Circle-Heart-Diamond', label: '\u2605 - \u25cf - \u2665 - \u2666' },
    { id: 'Triangle-Square-Club-Spade', label: '\u25b2 - \u25a0 - \u2663 - \u2660' },
  ],
};

const BOARD_STYLES = ['Classic', 'Modern', 'Minimal'];
const BOARD_SIZES = ['10x10', '15x15'];
const TIME_OPTIONS = [60, 75, 90, 105, 120];

export function useRoomSettingsForm(onCreateRoom) {
  const [players, setPlayers] = useState(2);
  const [boardStyle, setBoardStyle] = useState('Classic');
  const [boardSize, setBoardSize] = useState('10x10');
  const [marker, setMarker] = useState(MARKER_OPTIONS_BY_PLAYERS[2][0].id);
  const [timeToThink, setTimeToThink] = useState(60);
  const [roomName, setRoomName] = useState('Game Room');
  const [isLoading, setIsLoading] = useState(false);

  const markerOptions = MARKER_OPTIONS_BY_PLAYERS[players];

  useEffect(() => {
    const markerStillValid = markerOptions.some((option) => option.id === marker);

    if (!markerStillValid) {
      setMarker(markerOptions[0].id);
    }
  }, [marker, markerOptions]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec === 0 ? `${minutes}:00` : `${minutes}:${sec}`;
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);

    try {
      const { userId, username, name, avatar } = await resolveAuthIdentity();
      const displayName = name || username;

      if (!userId || !username) {
        throw new Error('Please log in again before creating a room.');
      }

      const createdRoom = await gameroomService.createRoom({
        roomName,
        size: players,
        boardStyle,
        boardSize,
        marker,
        timeToThink,
        userId,
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
    boardStyles: BOARD_STYLES,
    boardSizes: BOARD_SIZES,
    markerOptions,
    timeOptions: TIME_OPTIONS,
    setPlayers,
    setBoardStyle,
    setBoardSize,
    setMarker,
    setTimeToThink,
    setRoomName,
    formatTime,
    handleCreateRoom,
  };
}

export default useRoomSettingsForm;

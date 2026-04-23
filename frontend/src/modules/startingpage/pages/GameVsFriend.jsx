import { useLocation } from 'react-router-dom';
import GameBoard from '../../gameboard/GameBoard.jsx';

export function GameVsFriend() {
  const location = useLocation();
  const roomData = location.state?.roomState?.createdRoom || null;
  const turnSelection = location.state?.turnSelection || null;
  const rawBoardSize = roomData?.gameSettings?.boardSize ?? location.state?.boardSize;
  const parsedBoardSize = typeof rawBoardSize === 'number'
    ? rawBoardSize
    : parseInt(rawBoardSize || '10', 10);
  const boardSize = parsedBoardSize === 15 ? 15 : 10;
  const timeControl = location.state?.timeControl || 60;

  return (
    <GameBoard
      boardSize={Number.isNaN(boardSize) ? 10 : boardSize}
      gameMode="local"
      opponentType="human"
      timeControl={timeControl}
      roomData={roomData}
      turnSelection={turnSelection}
      onGameEnd={() => {}}
    />
  );
}

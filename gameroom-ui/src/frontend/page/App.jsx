import './App.css';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { TopBar } from '../elements/TopBar';
import { StartGameButton } from '../elements/StartGameButton';
import { ChatBar } from '../modules/ChatBar';
import { FriendList } from '../modules/SidePanel';
import { FourPeople, initialPlayers } from '../modules/4People';
import { ThreePeople } from '../modules/3People';
import { TwoPeople } from '../modules/2People';
import GameSetup from '../modules/GameSetup';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const HOST_AVATAR =
  'https://images.unsplash.com/photo-1772371272167-0117a6573d58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400';
const AI_AVATAR =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdDSVVP_wL7wjVO9MdHRFNITzjGa_LYBJNgA&s';

const getActiveSlotIndices = (size) => {
  if (size === 2) {
    return [0, 2];
  }

  if (size === 3) {
    return [0, 2, 3];
  }

  return [0, 1, 2, 3];
};

const buildEmptyPlayers = () => [null, null, null, null];

const mapRoomPlayersToSlots = (room) => {
  const nextPlayers = buildEmptyPlayers();
  const activeSlots = getActiveSlotIndices(room.size);

  room.players.forEach((player, index) => {
    const slotIndex = activeSlots[index];

    if (slotIndex === undefined) {
      return;
    }

    nextPlayers[slotIndex] = {
      id: slotIndex + 1,
      name: player.name || `p${slotIndex + 1}`,
      avatar: player.type === 'ai' ? AI_AVATAR : HOST_AVATAR,
      isHost: index === 0,
      type: player.type || 'human',
      aiDifficulty: player.aiDifficulty,
      userId: player.userId,
    };
  });

  return nextPlayers;
};

const mapSlotsToRoomPlayers = (players, room) => {
  const activeSlots = getActiveSlotIndices(room.size);

  return activeSlots
    .map((slotIndex, position) => {
      const player = players[slotIndex];

      if (!player) {
        return null;
      }

      return {
        userId: player.userId || (player.type === 'ai' ? `ai_slot_${slotIndex + 1}` : room.host),
        name: player.name || (position === 0 ? 'Host' : `p${slotIndex + 1}`),
        type: player.type || 'human',
        ...(player.aiDifficulty ? { aiDifficulty: player.aiDifficulty } : {}),
      };
    })
    .filter(Boolean);
};

const normalizeRoomPlayersForSync = (players = []) =>
  players.map((player) => ({
    userId: player.userId,
    name: player.name,
    type: player.type || 'human',
    ...(player.aiDifficulty ? { aiDifficulty: player.aiDifficulty } : {}),
  }));

function App() {
  const [roomSize, setRoomSize] = useState(4);
  const [players, setPlayers] = useState(initialPlayers);
  const [roomData, setRoomData] = useState(null);
  const [gameSettings, setGameSettings] = useState(null);
  const [messages, setMessages] = useState([]);

  const [friends] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      avatar:
        'https://images.unsplash.com/photo-1743247299142-8f1c919776c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200',
      isOnline: true,
    },
    {
      id: 2,
      name: 'Mike Johnson',
      avatar:
        'https://images.unsplash.com/photo-1759701546655-d90ec831aa52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200',
      isOnline: true,
    },
    {
      id: 3,
      name: 'Alex Rivera',
      avatar:
        'https://images.unsplash.com/photo-1637767125552-b89f5e1ab923?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200',
      isOnline: false,
    },
    {
      id: 4,
      name: 'Emily Davis',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      isOnline: true,
    },
  ]);

  const handleCreateRoom = (room) => {
    setRoomData(room);
    setGameSettings(room.gameSettings);
    setRoomSize(room.size);
    setPlayers(mapRoomPlayersToSlots(room));
  };

  const handleAddAI = (slotIndex, difficulty) => {
    const newPlayers = [...players];
    newPlayers[slotIndex] = {
      id: slotIndex + 1,
      name: `p${slotIndex + 1}`,
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdDSVVP_wL7wjVO9MdHRFNITzjGa_LYBJNgA&s',
      isHost: false,
      type: 'ai',
      aiDifficulty: difficulty,
    };
    setPlayers(newPlayers);
  };

  const handleRemoveAI = (slotIndex) => {
    setPlayers((prevPlayers) => {
      const nextPlayers = [...prevPlayers];
      const player = nextPlayers[slotIndex];

      if (!player || player.type !== 'ai') {
        return prevPlayers;
      }

      nextPlayers[slotIndex] = null;
      return nextPlayers;
    });
  };

  const resetRoom = () => {
    setPlayers(initialPlayers);
  };

  useEffect(() => {
    if (!roomData) {
      resetRoom();
      return;
    }

    setPlayers(mapRoomPlayersToSlots(roomData));
  }, [roomData, roomSize]);

  useEffect(() => {
    if (!roomData?._id) {
      return;
    }

    const nextRoomPlayers = mapSlotsToRoomPlayers(players, roomData);
    const currentRoomPlayers = JSON.stringify(normalizeRoomPlayersForSync(roomData.players));
    const nextPlayersJson = JSON.stringify(nextRoomPlayers);

    if (currentRoomPlayers === nextPlayersJson) {
      return;
    }

    setRoomData((prevRoom) => (
      prevRoom
        ? {
            ...prevRoom,
            players: nextRoomPlayers,
          }
        : prevRoom
    ));

    const syncPlayers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/room/${roomData._id}/players`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ players: nextRoomPlayers }),
        });

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => null);
          throw new Error(errorPayload?.error || 'Failed to update room players');
        }

        const result = await response.json();
        setRoomData(result.data);
      } catch (error) {
        console.error('Error syncing room players:', error);
      }
    };

    syncPlayers();
  }, [players, roomData]);

  const handleSendMessage = (message) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: `${Date.now()}-${prevMessages.length}`,
        author: 'You',
        text: message,
      },
    ]);
  };

  const handleInvite = (friendId, slotIndex) => {
    const friend = friends.find((f) => f.id === friendId);
    console.log('Invited friend:', friend?.name);
  };

  const handleStartGame = () => {
    console.log('Starting game...');
  };

  const handleBack = () => {
    setRoomData(null);
    setGameSettings(null);
    setRoomSize(4);
    setMessages([]);
    resetRoom();
  };

  const handleSettings = () => {
    console.log('Opening settings...');
  };

  const handleSize = () => {
    if (roomSize === 4) {
      return <FourPeople players={players} onAddAI={handleAddAI} onRemoveAI={handleRemoveAI}/>;
    }
     

    if (roomSize === 3) {
      return <ThreePeople players={players} onAddAI={handleAddAI} onRemoveAI={handleRemoveAI}/>
    }
    

    if (roomSize === 2) {
      return <TwoPeople players={players} onAddAI={handleAddAI} onRemoveAI={handleRemoveAI}/>
    }
    
    return null;
  };

  // Show GameSetup if no room has been created yet
  if (!roomData) {
    return <GameSetup onCreateRoom={handleCreateRoom} />;
  }

  return (
    <div className="game-room-bg">
      <div className="bg-animation">
        <div className="bg-orb-1" />
        <div className="bg-orb-2" />
      </div>

      <div className="content-wrapper">
        <TopBar
          roomID={roomData?.roomId || '4102871'}
          roomSize={roomSize}
          onBack={handleBack}
          onSetting={handleSettings}
        />

        {handleSize()}

        <ChatBar messages={messages} onSendMessage={handleSendMessage} />

        <StartGameButton
          isHost={true}
          disabled={false}
          onClick={handleStartGame}
        />

        <FriendList friends={friends} onInvite={handleInvite} />
      </div>
    </div>
  );
}

export default App;

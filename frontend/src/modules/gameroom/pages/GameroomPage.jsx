import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { TopBar } from '../../../shared/components/TopBar/TopBar.jsx';
import { StartGameButton } from '../../../shared/components/Button/StartGameButton.jsx';
import { ChatBar } from '../components/ChatBar/ChatBar.jsx';
import { FriendList } from '../components/SidePanel/SidePanel.jsx';
import { FourPeople } from '../components/RoomLayout/FourPeople.jsx';
import { ThreePeople } from '../components/RoomLayout/ThreePeople.jsx';
import { TwoPeople } from '../components/RoomLayout/TwoPeople.jsx';
import { useGameroomPage } from '../hooks/useGameroomPage.js';
import '../styles/gameroom.css';
import CreateRoomPage from './CreateRoomPage.jsx';

function GameroomPage() {
  const {
    roomSize,
    players,
    roomData,
    messages,
    friends,
    isCurrentUserHost,
    handleCreateRoom,
    handleAddAI,
    handleRemoveAI,
    handleSendMessage,
    handleInvite,
    handleStartGame,
    handleBack,
    handleSettings,
  } = useGameroomPage();

  const hasValidRoom = Boolean(roomData && Array.isArray(roomData.players));

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

  if (!hasValidRoom) {
    return <CreateRoomPage onCreateRoom={handleCreateRoom} />;
  }

  return (
    <div className="game-room-bg">  
      <div className="bg-animation">
        <div className="bg-orb-1" />
        <div className="bg-orb-2" />
      </div>

      <div className="content-wrapper">
        <TopBar
          roomID={roomData?.roomId}
          roomSize={roomSize}
          onBack={handleBack}
          onSetting={handleSettings}
        />

        {handleSize()}

        <ChatBar messages={messages} onSendMessage={handleSendMessage} />

        {isCurrentUserHost ? (
          <StartGameButton
            isHost={true}
            disabled={false}
            onClick={handleStartGame}
          />
        ) : null}

        <FriendList friends={friends} onInvite={handleInvite} />
      </div>
    </div>
  );
}

export default GameroomPage;

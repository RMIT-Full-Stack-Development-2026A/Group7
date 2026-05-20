import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { TopBar } from '../../../shared/components/TopBar/TopBar.jsx';
import { StartGameButton } from '../../../shared/components/Button/StartGameButton.jsx';
import { ChatBar } from '../components/ChatBar/ChatBar.jsx';
import { FriendList } from '../components/SidePanel/SidePanel.jsx';
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
    markerOptions,
    pendingInviteApproval,
    approvalCountdown,
    isCurrentUserHost,
    canStartGame,
    startGameDisabledReason,
    handleCreateRoom,
    handleAddAI,
    handleAddLocalPlayer,
    handleRemoveAI,
    handleSendMessage,
    handleInvite,
    canChangePlayerMarker,
    handleChangePlayerMarker,
    handleApproveInviteApproval,
    handleDeclineInviteApproval,
    handleStartGame,
    handleBack,
    handleSettings,
  } = useGameroomPage();

  const hasValidRoom = Boolean(roomData && Array.isArray(roomData.players));

  const handleSize = () => {
    const layoutProps = {
      players,
      onAddAI: handleAddAI,
      onAddLocalPlayer: handleAddLocalPlayer,
      onRemoveAI: handleRemoveAI,
      canManageAI: isCurrentUserHost,
      markerOptions,
      canChangeMarker: canChangePlayerMarker,
      onChangeMarker: handleChangePlayerMarker,
    };

    if (roomSize === 3) {
      return <ThreePeople {...layoutProps} />
    }


    if (roomSize === 2) {
      return <TwoPeople {...layoutProps} />
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
            disabled={!canStartGame}
            title={startGameDisabledReason || 'Start game'}
            onClick={handleStartGame}
          />
        ) : null}

        <FriendList friends={friends} onInvite={handleInvite} />

        {isCurrentUserHost && pendingInviteApproval ? (
          <div className="host-approval-toast" role="dialog" aria-live="assertive" aria-label="Room invite approval">
            <div className="host-approval-copy">
              <p className="host-approval-eyebrow">{approvalCountdown}s</p>
              <p className="host-approval-title">Approve invite?</p>
              <p className="host-approval-message">
                {pendingInviteApproval.requesterName} wants {pendingInviteApproval.targetFriendName} to join this room.
              </p>
            </div>
            <div className="host-approval-actions">
              <button
                type="button"
                className="host-approval-btn host-approval-btn-approve"
                onClick={handleApproveInviteApproval}
              >
                Approve
              </button>
              <button
                type="button"
                className="host-approval-btn host-approval-btn-refuse"
                onClick={handleDeclineInviteApproval}
              >
                Refuse
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default GameroomPage;

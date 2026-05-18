import { useMainMenu } from '../hooks/useMainMenu.js';
import MainMenuHeader from '../components/MainMenu/MainMenuHeader.jsx';
import MainMenuHero from '../components/MainMenu/MainMenuHero.jsx';
import MainMenuTabs from '../components/MainMenu/MainMenuTabs.jsx';
import FriendsPanel from '../components/MainMenu/FriendsPanel.jsx';
import RecentPanel from '../components/MainMenu/RecentPanel.jsx';
import AlertsPanel from '../components/MainMenu/AlertsPanel.jsx';
import RequestsPanel from '../components/MainMenu/RequestsPanel.jsx';
import PlayerDirectoryModal from '../components/MainMenu/PlayerDirectoryModal.jsx';

export function MainMenu() {
  const {
    playerData,
    storedIdentity,
    playerProfile,
    sidebarTab,
    socialSummary,
    socialStatus,
    recentMatch,
    roomInvites,
    otherPlayers,
    otherPlayerPreview,
    otherPlayersExpanded,
    incomingFriendRequests,
    outgoingFriendRequests,
    requestCount,
    onlineFriends,
    tabBadgeCounts,
    blockIfSuspended,
    handleSidebarTabClick,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    acceptRoomInvite,
    declineRoomInvite,
    setOtherPlayersExpanded,
  } = useMainMenu();

  return (
    <div className="neon-page p-4 pt-8">
      <MainMenuHeader playerData={playerData} />

      <div className="neon-shell max-w-7xl mx-auto lg:flex lg:items-start lg:gap-8">
        <MainMenuHero
          isSuspended={playerData.isSuspended}
          blockIfSuspended={blockIfSuspended}
        />

        <aside className="mt-10 lg:mt-0 w-full lg:w-110 shrink-0 space-y-6">
          <MainMenuTabs
            activeTab={sidebarTab}
            isSuspended={playerData.isSuspended}
            tabBadgeCounts={tabBadgeCounts}
            onTabClick={handleSidebarTabClick}
          />

          {sidebarTab === 'friends' && (
            <FriendsPanel
              friends={socialSummary.friends}
              onlineFriends={onlineFriends}
            />
          )}

          {sidebarTab === 'recent' && (
            <RecentPanel
              recentMatch={recentMatch}
              storedIdentity={storedIdentity}
              playerProfile={playerProfile}
            />
          )}

          {sidebarTab === 'alerts' && (
            <AlertsPanel
              roomInvites={roomInvites}
              onAccept={acceptRoomInvite}
              onDecline={declineRoomInvite}
            />
          )}

          {sidebarTab === 'requests' && (
            <RequestsPanel
              incomingFriendRequests={incomingFriendRequests}
              outgoingFriendRequests={outgoingFriendRequests}
              requestCount={requestCount}
              otherPlayerPreview={otherPlayerPreview}
              socialStatus={socialStatus}
              onAcceptFriendRequest={acceptFriendRequest}
              onDeclineFriendRequest={declineFriendRequest}
              onSendFriendRequest={sendFriendRequest}
              onExpandOtherPlayers={() => setOtherPlayersExpanded(true)}
            />
          )}
        </aside>
      </div>

      {otherPlayersExpanded ? (
        <PlayerDirectoryModal
          otherPlayers={otherPlayers}
          socialStatus={socialStatus}
          onClose={() => setOtherPlayersExpanded(false)}
          onSendFriendRequest={sendFriendRequest}
        />
      ) : null}
    </div>
  );
}

export default MainMenu;

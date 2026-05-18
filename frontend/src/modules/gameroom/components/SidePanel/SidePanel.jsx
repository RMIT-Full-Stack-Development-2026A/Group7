import { resolveAvatarUrl } from '../../../../shared/utils/avatar.utils.js';

export function FriendList({friends, onInvite}) {
    return(
        <div className="friend-list-panel">
            <div className="friend-list-header">
                <h3 className="friend-list-title"> 
                    Friends Online
                </h3>
                <p className="friend-list-summary">
                    {friends.filter(f => f.isOnline).length} of {friends.length} online
                </p>
            </div>

            <div className="friend-list-content">
                {friends.length ? friends.map(f => 
                    <div key={f.id} className="friend-item"> 
                        <div className="friend-avatar-wrapper"> 
                            <img src={resolveAvatarUrl(f.avatar)}
                                 alt={f.name}
                                 className="friend-avatar"/>
                            <div className={`online-indicator ${f.isOnline ? 'online' : 'offline'}`}/> 
                        </div>

                        <div className="friend-info"> 
                            <p className="friend-name">{f.name} </p>
                            <p className="friend-status">
                                {f.isOnline ? 'Online' : 'Offline'}
                            </p>
                        </div>

                        <button
                                type="button"
                                onClick={() => onInvite(f.id)}
                                className="btn-invite"
                                aria-label={`Send room invite to ${f.name}`}>
                        <i className="bi bi-send-fill"> </i>
                        </button>
                    </div>
                ) : (
                    <div className="friend-item">
                        <div className="friend-info">
                            <p className="friend-name">No friends available</p>
                            <p className="friend-status">Add friends from the main menu.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

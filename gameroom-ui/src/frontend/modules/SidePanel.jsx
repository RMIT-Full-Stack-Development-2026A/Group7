export function FriendList({friends, onInvite}) {
    return(
        <div className="friend-list-panel">
            <div className="friend-list-header">
                <h3 style={{fontSize: '0.875rem', fontWeight: 500, color: 'white', margin: 0 }}> 
                    Friends Online
                </h3>
                <p style={{fontSize: '0.75rem', color: '#9ca3af', margin: '4px 0 0'}}>
                    {friends.filter(f => f.isOnline).length} of {friends.length} online
                </p>
            </div>

            <div className="friend-list-content">
                {friends.map(f => 
                    <div key={f.id} className="friend-item"> 
                        <div className="friend-avatar-wrapper"> 
                            <img src={f.avatar}
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

                        <button onClick={() => onInvite(f.id)}
                                disabled={!f.isOnline}
                                className="btn-invite">
                        <i className="bi bi-person-plus-fill"> </i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

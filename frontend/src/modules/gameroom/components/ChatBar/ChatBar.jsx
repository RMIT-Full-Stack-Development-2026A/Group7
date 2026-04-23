import { useChatBar } from '../../hooks/useChatBar.js';

export function ChatBar({ messages, onSendMessage }) {
    const { message, historyRef, canSend, handleMessageChange, handleSubmit } = useChatBar(messages, onSendMessage);

    return(
        <div className="chat-bar">
            <div className="chat-history">
                <div className="chat-history-header">Chat History</div>
                <div ref={historyRef} className="chat-history-list">
                    {messages.length ? (
                        messages.map((item) => (
                            <div key={item.id} className="chat-message-item">
                                <div className="chat-message-author">{item.author}</div>
                                <div className="chat-message-text">{item.text}</div>
                            </div>
                        ))
                    ) : (
                        <div className="chat-empty-state">No messages yet. Start chatting here.</div>
                    )}
                </div>
            </div>
            <form onSubmit={handleSubmit} className="d-flex align-items-center gap-2 p-3">
                <input type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={handleMessageChange}
                        className="chat-input flex-grow-1"/>
                <button type="submit"
                        disabled={!canSend}
                        className="btn btn-send">
                    <i className="bi bi-send-fill btn-send-icon"> </i>    
                </button>
            </form>
        </div>
    )
}

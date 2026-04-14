import { useEffect, useRef, useState } from "react";

export function ChatBar({ messages, onSendMessage }) {
    const [message, setMessage] = useState('');
    const historyRef = useRef(null);

    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if(message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

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
                        onChange={(e) => setMessage(e.target.value)}
                        className="chat-input flex-grow-1"/>
                <button type="submit"
                        disabled={!message.trim()}
                        className="btn btn-send">
                    <i className="bi bi-send-fill" style={{fontSize: '1.25rem'}}> </i>    
                </button>
            </form>
        </div>
    )
}

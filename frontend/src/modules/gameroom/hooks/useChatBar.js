import { useEffect, useRef, useState } from 'react';

export function useChatBar(messages, onSendMessage) {
  const [message, setMessage] = useState('');
  const historyRef = useRef(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    onSendMessage(message);
    setMessage('');
  };

  return {
    message,
    historyRef,
    canSend: Boolean(message.trim()),
    handleMessageChange,
    handleSubmit,
  };
}

export default useChatBar;

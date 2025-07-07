import React, { useState, useCallback } from 'react';
import { useChatSocket, ChatSocketEvent } from '../../hooks/useChatSocket';
import { ThreadedView } from './ThreadedView';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  threadParentId?: string;
}

interface ChatWindowProps {
  conversationId: string;
  userId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch message history when conversationId changes
  React.useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/chat/${conversationId}/messages`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load messages');
        setLoading(false);
      });
  }, [conversationId]);

  // Handle real-time events
  const onEvent = useCallback((event: ChatSocketEvent) => {
    if (event.type === 'new_message') {
      setMessages((msgs) => {
        // Avoid duplicate messages
        if (msgs.some((m) => m.id === event.message.id)) return msgs;
        return [...msgs, event.message];
      });
    }
    if (event.type === 'typing' && event.userId !== userId) {
      setTyping(true);
      setTimeout(() => setTyping(false), 1000);
    }
  }, [userId]);

  const { send } = useChatSocket({ conversationId, onEvent });

  // Track which message (if any) is being replied to (threaded)
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const handleSend = () => {
    if (input.trim()) {
      send({
        type: 'send_message',
        conversationId,
        senderId: userId,
        content: input,
        ...(replyTo ? { threadParentId: replyTo } : {})
      });
      setInput('');
      setReplyTo(null);
    }
  };


  if (loading) return <div>Loading messages...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.filter(m => !m.threadParentId).map((msg) => (
          <div key={msg.id} className={msg.senderId === userId ? 'mine' : 'theirs'}>
            <span>{msg.content}</span>
            <button style={{marginLeft:8}} onClick={() => setReplyTo(msg.id)}>Reply</button>
            {/* Render replies (threaded) */}
            <ThreadedView messages={messages} parentId={msg.id} userId={userId} />
          </div>
        ))}
        {typing && <div className="typing">Someone is typing...</div>}
      </div>
      <div className="input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSend();
            else send({ type: 'typing', conversationId });
          }}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

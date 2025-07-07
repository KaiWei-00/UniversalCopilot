import React from 'react';

interface MessageBubbleProps {
  content: string;
  mine: boolean;
  senderEmail?: string;
  createdAt?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ content, mine, senderEmail, createdAt }) => (
  <div className={`message-bubble ${mine ? 'mine' : 'theirs'}`}>
    {!mine && senderEmail && <div className="sender">{senderEmail}</div>}
    <div className="content">{content}</div>
    {createdAt && <div className="timestamp">{new Date(createdAt).toLocaleTimeString()}</div>}
  </div>
);

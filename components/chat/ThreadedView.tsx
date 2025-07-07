import React from 'react';
import { MessageBubble } from './MessageBubble';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  threadParentId?: string;
  senderEmail?: string;
}

interface ThreadedViewProps {
  messages: Message[];
  parentId: string;
  userId: string;
}

export const ThreadedView: React.FC<ThreadedViewProps> = ({ messages, parentId, userId }) => {
  const thread = messages.filter(m => m.threadParentId === parentId);
  return (
    <div className="threaded-view">
      {thread.map(msg => (
        <MessageBubble
          key={msg.id}
          content={msg.content}
          mine={msg.senderId === userId}
          senderEmail={msg.senderEmail}
          createdAt={msg.createdAt}
        />
      ))}
    </div>
  );
};

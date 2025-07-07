'use client';
import React, { useState } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ConversationList } from '@/components/chat/ConversationList';
import { useSession } from 'next-auth/react';

export default function ChatPage() {
  const { data: session, status } = useSession();
  // Type assertion to match backend user shape
  const user = session?.user as { id: string; tenantId?: string } | undefined;
  const userId = user?.id;
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = React.useCallback(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    fetch('/api/chat/conversations')
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setConversations(data);
        setActiveConversation(data[0]?.id || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load conversations');
        setLoading(false);
      });
  }, [status]);

  React.useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  if (status === 'loading') return <div>Loading session...</div>;
  if (status !== 'authenticated') return <div>Please log in to access chat.</div>;

  if (loading) return <div>Loading conversations...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!userId) return <div>Invalid user session.</div>;

  return (
    <div className="chat-layout" style={{ display: 'flex', height: '80vh' }}>
      <div style={{ width: 300, borderRight: '1px solid #eee', padding: 16 }}>
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversation}
          onSelect={setActiveConversation}
          onRefresh={loadConversations}
        />
      </div>
      <div style={{ flex: 1, padding: 16 }}>
        {activeConversation && (
          <ChatWindow conversationId={activeConversation} userId={userId} />
        )}
      </div>
    </div>
  );
}

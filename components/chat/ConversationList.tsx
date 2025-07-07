import React, { useState } from 'react';

interface Conversation {
  id: string;
  title: string;
  participants: { id: string; email: string }[];
  messages?: { createdAt: string }[]; // last message info
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onRefresh?: () => void; // optional, to reload conversation list
}

export const ConversationList: React.FC<ConversationListProps> = ({ conversations, activeConversationId, onSelect, onRefresh }) => {
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newParticipants, setNewParticipants] = useState(''); // comma-separated emails
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          participantIds: newParticipants.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      if (!res.ok) throw new Error(await res.text());
      setShowNew(false);
      setNewTitle('');
      setNewParticipants('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create conversation');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;
    await fetch(`/api/chat/conversations/${id}`, { method: 'DELETE' });
    if (onRefresh) onRefresh();
  }

  return (
    <div className="conversation-list">
      <button onClick={() => setShowNew(v => !v)} style={{ marginBottom: 8 }}>
        {showNew ? 'Cancel' : 'New Conversation'}
      </button>
      {showNew && (
        <form onSubmit={handleCreate} style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            required
            className="input"
            style={{ marginRight: 4 }}
          />
          <input
            type="text"
            placeholder="Participant IDs (comma-separated)"
            value={newParticipants}
            onChange={e => setNewParticipants(e.target.value)}
            required
            className="input"
            style={{ marginRight: 4 }}
          />
          <button type="submit" disabled={creating}>Create</button>
          {error && <span style={{ color: 'red', marginLeft: 8 }}>{error}</span>}
        </form>
      )}
      {conversations.map(conv => {
        const lastMsgTime = conv.messages && conv.messages.length > 0 ?
          new Date(conv.messages[0].createdAt).toLocaleString() : null;
        return (
          <div
            key={conv.id}
            className={conv.id === activeConversationId ? 'active' : ''}
            onClick={() => onSelect(conv.id)}
            style={{ position: 'relative', paddingRight: 32 }}
          >
            <div className="title">{conv.title}</div>
            <div className="participants">
              {conv.participants.map(p => p.email).join(', ')}
            </div>
            {lastMsgTime && <div className="last-msg">Last: {lastMsgTime}</div>}
            <button
              onClick={e => handleDelete(conv.id, e)}
              style={{ position: 'absolute', right: 0, top: 0 }}
              title="Delete conversation"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

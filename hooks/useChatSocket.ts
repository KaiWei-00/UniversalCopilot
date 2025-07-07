import { useEffect, useRef, useCallback } from 'react';

export type ChatSocketEvent =
  | { type: 'joined'; roomId: string }
  | { type: 'new_message'; message: any }
  | { type: 'typing'; userId: string }
  | { type: 'read_receipt'; userId: string }
  | { type: 'error'; error: string };

export function useChatSocket({
  conversationId,
  onEvent,
  enabled = true
}: {
  conversationId: string | null;
  onEvent: (event: ChatSocketEvent) => void;
  enabled?: boolean;
}) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled || !conversationId) return;
    const ws = new window.WebSocket('ws://localhost:3001');
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join_room', conversationId }));
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onEvent(data);
      } catch (err) {
        // Ignore
      }
    };
    ws.onerror = (e) => {
      onEvent({ type: 'error', error: 'WebSocket error' });
    };
    ws.onclose = () => {
      wsRef.current = null;
    };
    return () => {
      ws.close();
    };
  }, [conversationId, enabled, onEvent]);

  const send = useCallback((msg: object) => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { send };
}

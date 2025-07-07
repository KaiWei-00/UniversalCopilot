// Enhanced Node.js WebSocket server for real-time chat with persistence and threading
const WebSocket = require('ws');
const PORT = 3001;
const wss = new WebSocket.Server({ port: PORT });

// Track which clients are in which conversation (room)
const clientsByRoom = new Map(); // conversationId -> Set of ws
const wsToRoom = new Map(); // ws -> conversationId

// Helper: broadcast to all clients in a room
function broadcastToRoom(conversationId, data) {
  const clients = clientsByRoom.get(conversationId);
  if (!clients) return;
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
}

wss.on('connection', function connection(ws) {
  console.log('A client connected');
  ws.on('message', async function incoming(message) {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
      return;
    }
    // Handle join_room
    if (msg.type === 'join_room' && msg.conversationId) {
      // Remove from previous room
      const prevRoom = wsToRoom.get(ws);
      if (prevRoom && clientsByRoom.has(prevRoom)) {
        clientsByRoom.get(prevRoom).delete(ws);
      }
      // Add to new room
      wsToRoom.set(ws, msg.conversationId);
      if (!clientsByRoom.has(msg.conversationId)) {
        clientsByRoom.set(msg.conversationId, new Set());
      }
      clientsByRoom.get(msg.conversationId).add(ws);
      ws.send(JSON.stringify({ type: 'joined', roomId: msg.conversationId }));
      return;
    }
    // Handle send_message
    if (msg.type === 'send_message') {
      const { conversationId, senderId, content, threadParentId } = msg;
      if (!conversationId || !senderId || !content) {
        ws.send(JSON.stringify({ type: 'error', error: 'Missing fields' }));
        return;
      }
      // Persist to DB using Prisma
      let prisma;
      try {
        prisma = (await import('./lib/prisma')).prisma;
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', error: 'Prisma not available' }));
        return;
      }
      try {
        // Ensure conversation exists
        const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
        if (!conversation) {
          ws.send(JSON.stringify({ type: 'error', error: 'Conversation not found' }));
          return;
        }
        // Create message
        const newMsg = await prisma.message.create({
          data: { conversationId, senderId, content, threadParentId },
        });
        // Broadcast new message to all in room
        broadcastToRoom(conversationId, { type: 'new_message', message: newMsg });
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', error: err.message }));
      }
      return;
    }
    ws.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }));
  });

  ws.on('close', function () {
    // Remove from room
    const room = wsToRoom.get(ws);
    if (room && clientsByRoom.has(room)) {
      clientsByRoom.get(room).delete(ws);
    }
    wsToRoom.delete(ws);
    console.log('A client disconnected');
  });
});

console.log(`WebSocket server running at ws://localhost:${PORT}`);

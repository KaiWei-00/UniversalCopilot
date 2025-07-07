// WebSocket API Route (Unsupported)
// =================================
// Real WebSocket support is handled by websocket-server.js (Node.js server) at ws://localhost:3001.
// This file is intentionally non-functional. All WebSocket logic should use the Node.js server directly.
// See README.md for setup instructions.

export async function GET() {
  return new Response(
    JSON.stringify({ error: 'WebSocket is only available via websocket-server.js (Node.js). See README.md.' }),
    {
      status: 501,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

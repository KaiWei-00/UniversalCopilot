# TASK.md - Chat System Implementation for Multi-Tenant Platform

## Overview
Implement a real-time chat system with support for:
- API endpoints for message/conversation management
- WebSocket-based real-time messaging
- Persistent message storage and retrieval
- Threaded and multi-turn conversation handling
- Per-tenant chat isolation

---

## Epic: Chat API and Backend Logic

### Task 1: Chat Data Models (Database Schema)
- [x] Design `conversations` table (id, tenantId, title, participants, timestamps)
- [x] Design `messages` table (id, conversationId, senderId, threadParentId, content, timestamp)
- [x] Design `threads` if needed as an abstraction (or recursive threadParentId on `messages`)
- [x] Associate all chat objects with tenantId for multi-tenancy isolation

### Task 2: REST API Endpoints
- [x] `POST /api/chat/start`: Create new conversation
- [x] `POST /api/chat/send`: Send message (with optional threadParentId)
- [x] `GET /api/chat/conversations`: List user's conversations
- [x] `GET /api/chat/:conversationId/messages`: Get message history (paginated)
- [x] `POST /api/chat/thread/:id/reply`: Post a reply in a thread
- [x] Auth middleware to ensure tenant-bound access control

---

## Epic: Real-Time Messaging System

### Task 3: WebSocket Infrastructure
- [x] Integrate WebSocket server (Socket.IO, WS, or Next.js custom server)
- [x] Define events: `join_room`, `new_message`, `typing`, `read_receipt`
- [x] Room structure: `tenantId:conversationId`
- [x] Emit messages to all clients in room upon send

### Task 4: Frontend WebSocket Client (React)
- [x] Connect to WebSocket server
- [x] Join conversation room on mount
- [x] Emit message/send events from chat form
- [x] Update UI in real time on incoming messages

---

## Epic: UI/UX Integration

### Task 5: Chat UI Components
- [x] ChatWindow: renders message history and form
- [x] MessageBubble: supports main and threaded messages
- [x] ConversationList: shows recent conversations
- [x] ThreadedView: inline replies (Slack-style)

### Task 6: Conversation Management
- [ ] Create/close conversations in UI
- [ ] Display conversation titles, timestamps, participants
- [ ] Display message time, sender, thread count

---

## Discovered During Work
- [ ] Add CSS/styling for chat components for production-ready UI
- [ ] Integrate chat UI into a Next.js page and connect to actual user/session context
- [ ] Add frontend integration and unit tests for chat UI and WebSocket hook
- [ ] Address WebSocket server deployment for production (custom Node server or alternative)

---

## Epic: AI and Multi-Turn Support (Optional)

### Task 7: Multi-Turn Chat Agent (CopilotKit/LangGraph)
- [ ] Maintain conversation memory context
- [ ] Respond with AI-generated replies
- [ ] Support summarization endpoint `GET /api/chat/:conversationId/summary`
- [ ] Enable different agents per tenant

---

## Priority

| Task                      | Priority |
|---------------------------|----------|
| Chat Data Models          | High     |
| REST API Endpoints        | High     |
| WebSocket Infrastructure  | High     |
| Frontend Socket Client    | Medium   |
| UI Chat Components        | Medium   |
| Multi-Turn Chat Agent     | Low      |

---

## Notes
- All chat data must be scoped per tenant (strict multitenancy).
- Use Prisma or similar ORM to link models to the `tenants` table.
- JWT or session-based auth required to authorize chat access.


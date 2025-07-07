# Universal Copilot A – Multi-Tenant Authentication System

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- **PostgreSQL** (running locally or accessible via connection string)
- **ws** and **@types/ws** (for WebSocket features)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/universal-copilot-a.git
cd universal-copilot-a
```

### 2. Install Dependencies
> **Note:** If you encounter peer dependency errors (for example, with React 19 and CopilotKit), use `--legacy-peer-deps`:
```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables
- Copy `.env.example` (if present) to `.env`:
  ```bash
  cp .env.example .env
  ```
- Set your PostgreSQL connection string in `.env`:
  ```env
  DATABASE_URL=postgresql://user:password@localhost:5432/yourdb
  ```

### 4. Run Database Migrations
```bash
npx prisma migrate dev --name init
```
### 5. Real WebSocket Support (Node.js Server)

Universal Copilot A uses a standalone Node.js WebSocket server for real-time features (e.g., chat, notifications). **Next.js API routes do NOT support WebSocket upgrades.**

#### How to Run the WebSocket Server

1. **Start the WebSocket server:**
   ```bash
   node websocket-server.js
   ```
   This starts a WebSocket server at `ws://localhost:3001`.

2. **Frontend Connection:**
   - The frontend (React/Next.js) connects directly to `ws://localhost:3001` for all WebSocket features.
   - See `hooks/useChatSocket.ts` for the connection logic.

3. **Do NOT use `/api/ws` API route:**
   - `app/api/ws/route.ts` is intentionally non-functional and only exists to document this limitation.
   - All real WebSocket logic is handled by `websocket-server.js`.

#### Troubleshooting
- Make sure `websocket-server.js` is running before using chat or real-time features.
- If you deploy to production, you must run the WebSocket server on a persistent Node.js host (not serverless/Vercel).
- Update the WebSocket URL in the frontend if you change the port or deploy to a different host.

#### Example: Start Both Servers for Local Development
```bash
# In one terminal:
node websocket-server.js

# In another terminal:
npm run dev
```

---

```bash
npm install ws --legacy-peer-deps
npm install --save-dev @types/ws --legacy-peer-deps
```

###  Database Review

Below is a visual overview of the database structure used by Universal Copilot A:

![Database Table Overview](./image/readme/DatabaseTable.png)

### 5. (Optional) Seed the Database
```bash
npx prisma db seed
```

### 6. Start the Development Server
```bash
npm run dev
```

### 7. Production Build & Run
To create an optimized production build:
```bash
npm run build
```
To start the production server locally:
```bash
npm start
```
- This will serve the app as it would be in production (using the `.next` build output).
- Make sure your environment variables (e.g., `DATABASE_URL`) are set for production.

#### Understanding Build Output
- `○` (Static): This route is prerendered as static content at build time.
- `ƒ` (Dynamic): This route is server-rendered on demand (API routes, dynamic pages).

### 8. Run Tests
```bash
npm test
```
Or to run all tests with verbose output:
```bash
npx jest --runInBand --verbose
```

#### Test Structure
- Model-level tests: `tests/prisma/tenant.test.ts` (Prisma model logic, cascade delete, validation)
- API/integration tests: `tests/api/tenant-api.test.ts` (API endpoints, error handling, permissions)

> **Note:** For API endpoint tests to pass, your Next.js server must be running (`npm run dev`).

#### Troubleshooting
- If you see `fetch failed` in API tests, ensure your server is running at `http://localhost:3000`.
- If you change the Prisma schema, always run:
  ```bash
  npx prisma migrate dev --name <your-migration-name>
  npx prisma generate
  ```

#### Features
A robust, scalable, and modern SaaS authentication platform with:
- Multi-tenant support
- Secure user authentication (NextAuth.js + Prisma + bcryptjs)
- API key management
- Per-tenant rate limiting
- CopilotKit AI assistant UI (always rendered globally via `CopilotAssistant` in `app/layout.tsx`)
- Comprehensive test coverage for model and API logic
- Cascade delete and validation logic enforced and tested

- Modular, tested, and well-documented codebase

## Tech Stack
- Next.js (App Router, TypeScript)
- Tailwind CSS
- Prisma ORM (PostgreSQL)
- NextAuth.js (Prisma adapter)
- bcryptjs
- CopilotKit (AI assistant)
- Jest (unit tests)

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Setup your PostgreSQL database and set the `DATABASE_URL` in a `.env` file.
3. Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
4. (Optional) Seed the database:
   ```bash
   npx prisma db seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. (Optional) View and edit your database visually:
   ```bash
   npx prisma studio
   ```

## Directory Structure
- `/app` – Next.js app directory (pages, layouts, API routes)
- `/components` – React components
- `/prisma` – Prisma schema and client
- `/tests` – Unit tests (mirrors app structure)

## Features
- Tenant registration, login, dashboard
- User registration/login within tenants
- API key generation, revocation, regeneration
- Per-tenant rate limiting
- Admin panel for tenant and API key management
- CopilotKit AI assistant integration

---

## 🗨️ Multi-Tenant Real-Time Chat System

### Overview
A robust, fully integrated chat system supporting:
- Multi-tenant, tenant-isolated conversations
- Threaded messages (reply to any message)
- Real-time updates via WebSocket
- Secure, session-based access control
- Modular React UI components

### Data Model (Prisma)
- `Conversation`: Linked to a tenant, has many participants (users) and messages
- `Message`: Linked to a conversation and sender, supports threading via `threadParentId`

### API Endpoints
- `POST /api/chat/start` – Create a new conversation
- `POST /api/chat/send` – Send a message (optionally threaded)
- `GET /api/chat/conversations` – List user’s conversations
- `GET /api/chat/[conversationId]/messages` – Paginated message history
- `POST /api/chat/thread/[id]/reply` – Post a threaded reply

All endpoints enforce tenant isolation and session authentication.

### WebSocket Infrastructure
- Endpoint: `ws://localhost:3000/api/ws`
- Events:
  - `join_room`: Join a conversation (room = `tenantId:conversationId`)
  - `new_message`: Send/receive new messages
  - `typing`: Typing indicator
  - `read_receipt`: Mark messages as read
- Only authenticated users can connect and join rooms.

### Frontend Components
- `useChatSocket`: React hook for connecting, sending, and receiving chat events
- `ChatWindow`: Main chat area, message list, input, typing indicator
- `ConversationList`: Shows all user conversations
- `MessageBubble`: Renders a single message
- `ThreadedView`: Displays threaded replies for a parent message

### Usage & Developer Setup
1. **Start the backend** (`npm run dev`) and ensure database is migrated.
2. **WebSocket**: Local development supported out of the box. For production, use a custom server.
3. **Integrate UI**: Use components in your pages (see `/components/chat/`).
4. **Authentication**: All chat features require a logged-in user session.
5. **Testing**: Unit tests for all endpoints and components are in `/tests/api/chat/`.

### Example Usage
```tsx
import { ChatWindow } from '@/components/chat/ChatWindow';

<ChatWindow conversationId={myConversationId} userId={myUserId} />
```

---

### CopilotKit UI
- Current version only exports `Button` and `Card` components from `@copilotkit/react-ui`.
- See `/components/CopilotKitUI.tsx` for usage example.

---

## Test Coverage Summary

Automated tests are provided for all core logic and API endpoints. Tests are written with Jest and live in `/tests`, mirroring the main app structure.

### Tenant Model and API Tests
- **Required Fields:**
  - Ensures tenant creation fails if required fields are missing (at both DB and API levels).
  - Validates that `contactEmail` must be non-empty and a valid email format (checked at API level).
  - Prisma-level test ensures `null` is not accepted for required fields.
- **Duplicate Constraints:**
  - Prevents duplicate subdomains for tenants.
- **API Endpoint Validation:**
  - `/api/tenant` endpoint returns 400 for missing, empty, or invalid email fields.
  - `/api/apikey` endpoint tested for correct payload and response structure.
- **Edge & Failure Cases:**
  - Invalid email formats are rejected.
  - Empty `contactEmail` is rejected at API level, but only `null` is rejected at DB level (by Prisma).
  - Non-admin access to protected endpoints is tested and rejected.

### How to Run Tests
### 8. Run Authentication Test

The authentication test suite (`tests/api/auth.test.ts`) now contains only a single, simple test:
- It verifies that a valid email, password, and tenant combination can successfully authenticate via the API.
- Negative and edge-case tests are commented out for future use and can be re-enabled as needed.

---

### How to Test Real-Time Chat

The chat feature uses a standalone Node.js WebSocket server for real-time communication. Follow these steps to test it:

1. **Start the WebSocket Server**
   - In your project directory, run:
     ```bash
     node websocket-server.js
     ```
   - This starts the server at `ws://localhost:3001`.

2. **Start the Next.js App**
   - In a separate terminal, run:
     ```bash
     npm run dev
     ```
     or
     ```bash
     yarn dev
     ```
   - Visit `http://localhost:3000` in your browser.

3. **Test the Chat UI**
   - Locate the chat (CopilotKit) UI in your app (should be visible globally if setup is correct).
   - Send a message in the chat window. You should see your message appear.
   - If the WebSocket server is set up to echo or broadcast, you’ll see responses accordingly.

4. **(Optional) Multi-User Test**
   - Open the app in another browser or incognito window.
   - Log in as a different user (if possible).
   - Send messages from both windows to verify real-time updates.

#### Troubleshooting
- If chat does not connect, check:
  - The WebSocket server is running and listening on port 3001.
  - The frontend chat client is configured to use `ws://localhost:3001`.
  - Browser console for errors.
- Restart both servers if you make changes to the chat logic or server code.

Run the authentication test with:
```bash
npx jest tests/api/auth.test.ts
```
Or run all tests:
```bash
npm test
```

All tests must pass before deployment or merging changes. For more details, see `/tests` folder.

## Testing
Run all unit and integration tests:
```bash
npm test
```

**Note:** For API endpoint/integration tests to pass, your Next.js server must be running at `http://localhost:3000` in a separate terminal:
```bash
npm run dev
```
Then, in another terminal, run tests as above.



###  Test Result Images

![Automated Test Screenshot](./image/readme/AutomatedTest.png)


## Contributing
## 🗂️ Application Pages & User Guide

### Home Page (`/`)
- **Purpose:** Introduction to Universal Copilot A and its features.
- **What to do:** Use this page to learn about the app. Navigate to Register or Login using the navigation options.

### Register Tenant (`/register`)
- **Purpose:** Register a new organization/tenant.
- **What to do:**
  1. Fill in all required fields:
      - Tenant Name (e.g., `acme`)
      - Subdomain (unique, e.g., `acme`)
      - Contact Email (e.g., `admin@acme.com`)
      - Rate Limit Tier (choose a plan)
      - Max Requests Per Hour (default: 1000)
      - Admin Email (for the first admin user)
      - Admin Password (secure password)
  2. Click **Register**. On success, you'll be redirected to the Login page.

### Login (`/login`)
- **Purpose:** Log in as a user or admin for a specific tenant.
- **What to do:**
  1. Enter your **Email**, **Password**, and **Tenant Subdomain** (provided by your organization).
  2. Click **Login**. On success, you'll be redirected to your Dashboard.

### Dashboard (`/dashboard`)
- **Purpose:** Main user landing page after login. Shows your tenant info and rate limits.
- **What to do:**
  - View your current usage, tenant subdomain, and rate limits.
  - Use navigation to access more features (if available).

### Admin Panel (`/admin`)

---

## 🛠️ Known Issues & Compatibility Notes

- **React 19 and CopilotKit Peer Dependency Conflict**
  - Some CopilotKit packages (e.g., `@copilotkit/react-ui@0.2.0`) require `react@18.2.x`, but this project uses React 19.
  - If you see errors about peer dependency conflicts when running `npm install`, use the `--legacy-peer-deps` flag as shown above:
    ```bash
    npm install --legacy-peer-deps
    npm install ws --legacy-peer-deps
    npm install --save-dev @types/ws --legacy-peer-deps
    ```
  - This workaround is safe for development, but you should monitor for updates to CopilotKit that support React 19 for long-term stability.
  - See the **Install Dependencies** and **WebSocket Support** sections above for details.

- **Purpose:** (Admins only) Manage tenants and API keys.
- **What to do:**
  - View all tenants (if you are a platform admin).
  - Select a tenant to view or manage their API keys.
  - Generate, revoke, or manage API keys as needed.

See comments and inline `# Reason:` explanations for complex logic. Follow modularity and file size rules as described in `PLANNING.md`.

---

## Troubleshooting & Common Issues

### NextAuth Custom Session Fields
- Custom fields like `role`, `tenantId`, etc. must be added to `types/next-auth.d.ts`.
- Use type assertions (e.g. `(session.user as any).role = ...`) in NextAuth callbacks to satisfy TypeScript.

### useSession() and Prerendering
- Always destructure with a fallback: `const { data: session } = useSession() || {}` to avoid build-time errors.

### Database Management
- Start your PostgreSQL server before running the app or tests.
- Use `npx prisma migrate dev` to apply schema changes.
- Use `npx prisma studio` to view/edit data.

### Running Integration Tests
- The Next.js server must be running (`npm run dev`) for API endpoint tests to pass.

### CopilotKit UI
- Only `Button` and `Card` are available from `@copilotkit/react-ui` in this version.

For architecture and design, see `PLANNING.md`.
For tasks and progress, see `TASK.md`.

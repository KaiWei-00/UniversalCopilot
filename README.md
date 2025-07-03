# Universal Copilot A – Multi-Tenant Authentication System

A robust, scalable, and modern SaaS authentication platform with:
- Multi-tenant support
- Secure user authentication (NextAuth.js + Prisma + bcryptjs)
- API key management
- Per-tenant rate limiting
- CopilotKit AI assistant UI
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
4. Start the development server:
   ```bash
   npm run dev
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

## Testing
Run all unit tests:
```bash
npm test
```

## Contributing
See comments and inline `# Reason:` explanations for complex logic. Follow modularity and file size rules as described in `PLANNING.md`.

---

For architecture, see `PLANNING.md`.
For tasks and progress, see `TASK.md`.

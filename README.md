# Universal Copilot A – Multi-Tenant Authentication System

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- **PostgreSQL** (running locally or accessible via connection string)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/universal-copilot-a.git
cd universal-copilot-a
```

### 2. Install Dependencies
```bash
npm install
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

### 5. (Optional) Seed the Database
```bash
npx prisma db seed
```

### 6. Start the Development Server
```bash
npm run dev
```

### 7. Run Tests
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
Run all tests:
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

## Contributing
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

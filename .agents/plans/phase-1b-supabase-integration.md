# Feature: Phase 1B - Supabase Integration

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

## Feature Description

Integrate Supabase for authentication and database. Create browser and server clients, set up auth middleware for protected routes, and deploy the database schema with Row Level Security (RLS) policies for multi-tenancy.

## User Story

As a **developer**, I want to **have Supabase integrated with proper client/server separation and database schema deployed**, so that **I can implement authentication and data persistence with security**.

## Problem Statement

The application needs database persistence and authentication. Supabase provides both, but requires careful setup of browser vs server clients and proper RLS policies for multi-tenant security.

## Solution Statement

Create three Supabase utilities (browser client, server client, middleware helper), implement Next.js middleware for session management, and deploy the database schema from PRD.md with RLS policies.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: Database, Authentication, Middleware
**Dependencies**: Plan 1A completed, Supabase project created by user

## Prerequisites

**CRITICAL**: Plan 1A must be completed first. The following must exist:
- `package.json` with `@supabase/ssr` installed
- `src/lib/` directory

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING!)

| File | Lines | Why |
|------|-------|-----|
| `CLAUDE.md` | Lines 164-178 | Supabase client patterns (browser vs server) |
| `CLAUDE.md` | Lines 237-243 | Next.js 15+ cookies() gotcha |
| `.agents/PRD.md` | Lines 763-822 | Complete database schema with RLS |
| `.agents/decisions/001-project-decisions.md` | Lines 139-175 | Multi-tenancy design decisions |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/lib/supabase/client.ts` | Browser-side Supabase client (RLS protected) |
| `src/lib/supabase/server.ts` | Server-side Supabase client (for Server Components) |
| `src/lib/supabase/middleware.ts` | Session refresh helper for middleware |
| `src/middleware.ts` | Next.js middleware entry point |
| `supabase/migrations/001_initial_schema.sql` | Database schema with RLS |

### Relevant Documentation

| Source | Section | Why |
|--------|---------|-----|
| [Supabase Auth SSR](https://supabase.com/docs/guides/auth/server-side/nextjs) | Full guide | Official Next.js integration |
| [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security) | Policies | Multi-tenant security |
| [pgvector](https://supabase.com/docs/guides/database/extensions/pgvector) | Setup | Vector extension for embeddings |

### Patterns to Follow

**Browser Client (from CLAUDE.md):**
```typescript
// Uses createBrowserClient from @supabase/ssr
// Only uses NEXT_PUBLIC_* variables (safe for client)
// RLS policies apply automatically
```

**Server Client (from CLAUDE.md):**
```typescript
// Uses createServerClient from @supabase/ssr
// Handles cookies for session management
// CRITICAL: cookies() is async in Next.js 15+ - must await
```

**Middleware Pattern:**
```typescript
// Refreshes session on each request
// Redirects unauthenticated users from /dashboard to /login
// Redirects authenticated users from /login to /dashboard
```

---

## IMPLEMENTATION PLAN

### Phase 1: User Environment Setup

User must create .env.local with their Supabase credentials.

### Phase 2: Client Utilities

Create browser and server Supabase clients.

### Phase 3: Middleware

Implement auth protection middleware.

### Phase 4: Database

Deploy schema with RLS policies.

---

## STEP-BY-STEP TASKS

### 🛑 USER ACTION REQUIRED (Before Task 1)

**STOP AND ASK USER:**

```
Before continuing, you need to create `.env.local` with your Supabase credentials.

Create the file `.env.local` in the project root with:

NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...your-key
OPENAI_API_KEY=sk-...your-key

You can find the Supabase values in:
Supabase Dashboard → Project Settings → API

Please confirm when `.env.local` is created.
```

**Wait for user confirmation before proceeding.**

---

### Task 1: CREATE `src/lib/supabase/client.ts`

- **IMPLEMENT**: Browser-side Supabase client for Client Components
- **STRUCTURE**:
  ```typescript
  // Import createBrowserClient from @supabase/ssr
  //
  // Export function createClient() that returns:
  //   createBrowserClient(
  //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  //   )
  //
  // This client:
  // - Is safe for browser (only uses NEXT_PUBLIC_* vars)
  // - Has RLS applied automatically
  // - Used in 'use client' components
  ```
- **IMPORTS**: `createBrowserClient` from `@supabase/ssr`
- **GOTCHA**: Use `!` assertion since env vars are validated at runtime
- **VALIDATE**: File exists, no TypeScript errors

---

### Task 2: CREATE `src/lib/supabase/server.ts`

- **IMPLEMENT**: Server-side Supabase client for Server Components and Route Handlers
- **STRUCTURE**:
  ```typescript
  // Import createServerClient and CookieOptions from @supabase/ssr
  // Import cookies from next/headers
  //
  // Export async function createClient() that:
  // 1. Gets cookie store: const cookieStore = await cookies()
  //    CRITICAL: cookies() returns Promise in Next.js 15+ - MUST await
  //
  // 2. Returns createServerClient with cookie handlers:
  //    {
  //      cookies: {
  //        getAll() {
  //          return cookieStore.getAll()
  //        },
  //        setAll(cookiesToSet) {
  //          try {
  //            cookiesToSet.forEach(({ name, value, options }) =>
  //              cookieStore.set(name, value, options)
  //            )
  //          } catch {
  //            // Called from Server Component - ignore
  //            // Server Components cannot set cookies
  //          }
  //        }
  //      }
  //    }
  ```
- **IMPORTS**:
  - `createServerClient`, `type CookieOptions` from `@supabase/ssr`
  - `cookies` from `next/headers`
- **GOTCHA**: The `await cookies()` is CRITICAL - Next.js 15+ change
- **GOTCHA**: setAll try-catch handles Server Component calls that can't set cookies
- **VALIDATE**: File exists, no TypeScript errors

---

### Task 3: CREATE `src/lib/supabase/middleware.ts`

- **IMPLEMENT**: Session refresh helper for Next.js middleware
- **STRUCTURE**:
  ```typescript
  // Import createServerClient from @supabase/ssr
  // Import NextResponse and NextRequest from next/server
  //
  // Export async function updateSession(request: NextRequest):
  //
  // 1. Create initial response:
  //    let supabaseResponse = NextResponse.next({ request })
  //
  // 2. Create Supabase client with request cookies:
  //    const supabase = createServerClient(URL, ANON_KEY, {
  //      cookies: {
  //        getAll() { return request.cookies.getAll() },
  //        setAll(cookiesToSet) {
  //          // Set on request cookies
  //          cookiesToSet.forEach(({ name, value }) =>
  //            request.cookies.set(name, value)
  //          )
  //          // Create new response with updated request
  //          supabaseResponse = NextResponse.next({ request })
  //          // Set on response cookies
  //          cookiesToSet.forEach(({ name, value, options }) =>
  //            supabaseResponse.cookies.set(name, value, options)
  //          )
  //        }
  //      }
  //    })
  //
  // 3. Refresh session:
  //    const { data: { user } } = await supabase.auth.getUser()
  //
  // 4. Redirect logic:
  //    - If NO user AND path starts with '/dashboard':
  //      → Redirect to /login
  //    - If user AND path is '/login' or '/register':
  //      → Redirect to /dashboard
  //
  // 5. Return supabaseResponse
  ```
- **IMPORTS**:
  - `createServerClient` from `@supabase/ssr`
  - `NextResponse`, `type NextRequest` from `next/server`
- **GOTCHA**: Must update BOTH request.cookies AND response.cookies
- **VALIDATE**: File exists, no TypeScript errors

---

### Task 4: CREATE `src/middleware.ts`

- **IMPLEMENT**: Next.js middleware entry point that calls updateSession
- **STRUCTURE**:
  ```typescript
  // Import NextRequest from next/server
  // Import updateSession from @/lib/supabase/middleware
  //
  // Export async function middleware(request: NextRequest):
  //   return await updateSession(request)
  //
  // Export config with matcher:
  //   Exclude: _next/static, _next/image, favicon.ico, images
  //   Pattern: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ```
- **IMPORTS**:
  - `type NextRequest` from `next/server`
  - `updateSession` from `@/lib/supabase/middleware`
- **GOTCHA**: Matcher pattern must be a valid regex string
- **VALIDATE**: `npm run dev` starts without middleware errors

---

### Task 5: CREATE `supabase/migrations/001_initial_schema.sql`

- **IMPLEMENT**: Database schema with tables and RLS policies
- **SOURCE**: Copy EXACTLY from `.agents/PRD.md` lines 763-822 (Appendix - Database Schema)
- **CONTENT MUST INCLUDE**:
  ```sql
  -- 1. Enable pgvector extension
  CREATE EXTENSION IF NOT EXISTS vector;

  -- 2. Create workspaces table
  --    Columns: id (UUID PK), name (TEXT), owner_id (UUID FK to auth.users), created_at

  -- 3. Create documents table
  --    Columns: id, workspace_id (FK), filename, content_type, metadata (JSONB), created_at

  -- 4. Create document_chunks table
  --    Columns: id, document_id (FK), content, embedding vector(1536), chunk_index, metadata, created_at

  -- 5. Create HNSW index on embedding column
  --    Using: hnsw (embedding vector_cosine_ops)

  -- 6. Enable RLS on all tables
  --    ALTER TABLE xxx ENABLE ROW LEVEL SECURITY

  -- 7. Create RLS policies for workspaces:
  --    - SELECT: owner_id = auth.uid()
  --    - INSERT: owner_id = auth.uid()
  --    - UPDATE: owner_id = auth.uid()
  --    - DELETE: owner_id = auth.uid()

  -- 8. Create RLS policies for documents:
  --    - All operations: workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())

  -- 9. Create RLS policies for document_chunks:
  --    - All operations: document_id IN (SELECT d.id FROM documents d JOIN workspaces w ON d.workspace_id = w.id WHERE w.owner_id = auth.uid())
  ```
- **GOTCHA**: Vector dimension MUST be 1536 (OpenAI text-embedding-3-small)
- **GOTCHA**: Use `vector_cosine_ops` for HNSW index (cosine similarity)
- **VALIDATE**: SQL syntax is valid (no runtime validation yet)

---

### Task 6: DEPLOY Database Migration

- **IMPLEMENT**: Push migration to Supabase Cloud
- **OPTION A - Supabase CLI** (if available):
  ```bash
  # Link to project (if not already linked)
  npx supabase link --project-ref YOUR_PROJECT_REF

  # Push migrations
  npx supabase db push
  ```
- **OPTION B - Manual** (via Dashboard):
  1. Open Supabase Dashboard
  2. Go to SQL Editor
  3. Paste contents of `001_initial_schema.sql`
  4. Click "Run"
- **GOTCHA**: pgvector extension may need to be enabled in Dashboard first
  - Go to Database → Extensions → Search "vector" → Enable
- **VALIDATE**: Tables visible in Supabase Dashboard → Table Editor

---

### Task 7: VERIFY Database Setup

- **IMPLEMENT**: Confirm all tables and RLS are properly configured
- **CHECKS**:
  1. Supabase Dashboard → Table Editor shows:
     - `workspaces` table
     - `documents` table
     - `document_chunks` table
  2. Each table has lock icon (RLS enabled)
  3. Database → Extensions shows `vector` enabled
- **VALIDATE**: All 3 tables exist with RLS enabled

---

## TESTING STRATEGY

### Unit Tests

No unit tests for this phase - infrastructure setup only.

### Integration Tests

Manual verification via Supabase Dashboard.

### Edge Cases

- Middleware should not break static file serving
- Server client should handle Server Component cookie errors gracefully

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
npm run lint
npm run type-check
```

### Level 2: Development Server

```bash
npm run dev
# Should start without errors
# Middleware should be active (check terminal for middleware logs)
```

### Level 3: Database Verification

Check in Supabase Dashboard:
1. Table Editor → 3 tables exist
2. Each table has RLS enabled (lock icon)
3. Database → Extensions → pgvector enabled

### Level 4: Auth Flow Test (Basic)

```bash
# Visit http://localhost:3000/dashboard
# Should redirect to /login (middleware working)
```

---

## ACCEPTANCE CRITERIA

- [ ] User has created `.env.local` with Supabase credentials
- [ ] `src/lib/supabase/client.ts` - Browser client created
- [ ] `src/lib/supabase/server.ts` - Server client with async cookies()
- [ ] `src/lib/supabase/middleware.ts` - Session helper with redirects
- [ ] `src/middleware.ts` - Next.js middleware configured
- [ ] `supabase/migrations/001_initial_schema.sql` - Schema file created
- [ ] Database tables deployed to Supabase Cloud
- [ ] RLS enabled on all tables
- [ ] pgvector extension enabled
- [ ] Visiting /dashboard redirects to /login (no auth)
- [ ] `npm run dev` works without errors

---

## COMPLETION CHECKLIST

- [ ] User confirmed `.env.local` created
- [ ] Task 1: Browser client created
- [ ] Task 2: Server client created (with await cookies())
- [ ] Task 3: Middleware helper created
- [ ] Task 4: Next.js middleware created
- [ ] Task 5: Migration SQL file created
- [ ] Task 6: Migration deployed to Supabase
- [ ] Task 7: Database setup verified
- [ ] All validation commands pass

---

## NOTES

### Critical Gotchas

1. **cookies() is async in Next.js 15+**: MUST use `await cookies()` in server.ts
2. **pgvector dimensions**: Must be exactly 1536 for OpenAI text-embedding-3-small
3. **RLS policies**: Separate policies for SELECT, INSERT, UPDATE, DELETE (not just FOR ALL)

### Security Considerations

- Browser client only uses `NEXT_PUBLIC_*` variables (safe)
- Service role key is NEVER exposed to client
- RLS ensures users can only access their own data

### Next Plan Dependencies

Plan 1C (UI & Auth) depends on:
- All Supabase clients functional
- Middleware protecting /dashboard
- Database tables ready for workspace creation

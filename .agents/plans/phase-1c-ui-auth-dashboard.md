# Feature: Phase 1C - UI, Authentication & Dashboard

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

## Feature Description

Implement the user interface layer: minimal landing page (Steve Jobs style), email/password authentication with automatic workspace creation, and protected dashboard displaying user workspaces.

## User Story

As a **new user**, I want to **register with email/password and immediately access my dashboard with a pre-created workspace**, so that **I can start using Askvault without friction**.

## Problem Statement

Users need a way to register, login, and access their personal workspace. The experience should be frictionless - registration should immediately create a default "My Vault" workspace and redirect to the dashboard.

## Solution Statement

Create a minimal landing page with two CTAs, auth forms (login/register) using shadcn/ui components, automatic workspace creation on registration, and a protected dashboard showing workspace cards.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: Frontend UI, Authentication flow, Database (workspaces)
**Dependencies**: Plan 1A and 1B completed

## Prerequisites

**CRITICAL**: Plans 1A and 1B must be completed. The following must exist:
- shadcn/ui components (Button, Input, Card, Label)
- Supabase clients (`src/lib/supabase/client.ts`, `server.ts`)
- Middleware protecting `/dashboard`
- Database with `workspaces` table and RLS

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING!)

| File | Lines | Why |
|------|-------|-----|
| `CLAUDE.md` | Lines 57-62 | React/Next.js patterns (Server vs Client Components) |
| `CLAUDE.md` | Lines 66-73 | Import order convention |
| `CLAUDE.md` | Lines 205-221 | Error handling patterns |
| `.agents/PRD.md` | Lines 270-298 | Authentication feature spec |
| `.agents/PRD.md` | Lines 285-298 | Workspace management spec |
| `src/lib/supabase/client.ts` | Full | Browser client usage |
| `src/lib/supabase/server.ts` | Full | Server client usage |
| `src/components/ui/` | All files | Available shadcn components |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/types/index.ts` | TypeScript type definitions |
| `src/app/globals.css` | Verify/update Tailwind + shadcn styles |
| `src/app/layout.tsx` | Root layout with metadata |
| `src/app/page.tsx` | Landing page (minimal) |
| `src/app/(auth)/layout.tsx` | Centered auth layout |
| `src/app/(auth)/login/page.tsx` | Login page |
| `src/app/(auth)/register/page.tsx` | Register page |
| `src/components/auth/LoginForm.tsx` | Login form component |
| `src/components/auth/RegisterForm.tsx` | Register form with auto-workspace |
| `src/components/auth/LogoutButton.tsx` | Logout button component |
| `src/app/dashboard/layout.tsx` | Dashboard layout with header |
| `src/app/dashboard/page.tsx` | Dashboard page with workspaces |

### Relevant Documentation

| Source | Section | Why |
|--------|---------|-----|
| [Supabase Auth](https://supabase.com/docs/guides/auth/quickstarts/nextjs) | signUp, signIn | Auth API methods |
| [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing/route-groups) | Route Groups | (auth) folder pattern |
| [shadcn Card](https://ui.shadcn.com/docs/components/card) | Usage | Card component API |

### Patterns to Follow

**Server vs Client Components (from CLAUDE.md):**
```
- Server Components by default
- Add 'use client' only for: hooks (useState, useEffect), browser APIs, interactivity
- Forms with state = Client Component
- Data fetching = Server Component
```

**Import Order (from CLAUDE.md):**
```typescript
// 1. React
// 2. Next.js
// 3. External libraries
// 4. Internal (@/)
// 5. Types
```

**Error Handling (from CLAUDE.md):**
```typescript
// Show user-friendly error messages
// Log technical details to console
// Use try-catch with specific error handling
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation Types

Create TypeScript definitions for data models.

### Phase 2: Layout & Landing

Update root layout, create minimal landing page.

### Phase 3: Auth UI

Create auth layout and form components.

### Phase 4: Dashboard

Create protected dashboard with workspace display.

### Phase 5: Validation

Run all checks and test complete auth flow.

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `src/types/index.ts`

- **IMPLEMENT**: TypeScript interfaces for core data models
- **STRUCTURE**:
  ```typescript
  // Workspace interface:
  //   id: string (UUID)
  //   name: string
  //   owner_id: string (UUID)
  //   created_at: string (ISO timestamp)

  // Document interface:
  //   id: string
  //   workspace_id: string
  //   filename: string
  //   content_type: string
  //   metadata: Record<string, unknown>
  //   created_at: string

  // DocumentChunk interface:
  //   id: string
  //   document_id: string
  //   content: string
  //   embedding: number[] | null
  //   chunk_index: number
  //   metadata: Record<string, unknown>
  //   created_at: string

  // User interface (minimal):
  //   id: string
  //   email: string
  ```
- **NAMING**: Use `interface` not `type` (per CLAUDE.md preference)
- **VALIDATE**: No TypeScript errors

---

### Task 2: VERIFY `src/app/globals.css`

- **IMPLEMENT**: Ensure Tailwind directives and shadcn CSS variables exist
- **EXPECTED CONTENT**:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer base {
    :root {
      --background: ...
      --foreground: ...
      /* All shadcn CSS variables */
    }
  }
  ```
- **GOTCHA**: shadcn init should have created this - verify, don't recreate
- **VALIDATE**: Styles apply correctly when dev server runs

---

### Task 3: UPDATE `src/app/layout.tsx`

- **IMPLEMENT**: Root layout with proper metadata
- **STRUCTURE**:
  ```typescript
  // Import Metadata type from 'next'
  // Import Inter font from 'next/font/google'
  // Import globals.css

  // Configure Inter font with latin subset

  // Export metadata:
  //   title: 'Askvault - Your Knowledge Vault'
  //   description: 'Upload documents, ask questions, get intelligent answers.'

  // Export RootLayout component:
  //   - html lang="en"
  //   - body with font className
  //   - {children}
  //
  // Return type: React.ReactElement
  ```
- **IMPORTS**: `Metadata` from `next`, `Inter` from `next/font/google`
- **VALIDATE**: Page title shows "Askvault" in browser tab

---

### Task 4: CREATE `src/app/page.tsx` (Landing Page)

- **IMPLEMENT**: Minimal landing page - Steve Jobs style
- **DESIGN**:
  ```
  ┌────────────────────────────────────────┐
  │                                        │
  │              Askvault                  │  ← text-6xl, font-bold, tracking-tight
  │                                        │
  │      Your documents. Your answers.     │  ← text-xl, text-muted-foreground
  │                                        │
  │      [Get Started]    [Sign In]        │  ← Two buttons, gap-4
  │                                        │
  └────────────────────────────────────────┘

  Layout: flex min-h-screen items-center justify-center
  Content: centered, max-w-2xl, space-y-8
  ```
- **STRUCTURE**:
  ```typescript
  // Server Component (no 'use client')
  // Import Link from 'next/link'
  // Import Button from '@/components/ui/button'

  // "Get Started" button:
  //   - Link to /register
  //   - Primary variant, size="lg"

  // "Sign In" button:
  //   - Link to /login
  //   - Outline variant, size="lg"
  ```
- **GOTCHA**: No features list, no extra content - minimalism is key
- **VALIDATE**: Visit localhost:3000, see centered landing page

---

### Task 5: CREATE `src/app/(auth)/layout.tsx`

- **IMPLEMENT**: Centered layout for auth pages
- **STRUCTURE**:
  ```typescript
  // Server Component (no 'use client')

  // Layout:
  //   - main: flex min-h-screen items-center justify-center p-4
  //   - div: w-full max-w-md (constrains form width)
  //   - {children}
  ```
- **GOTCHA**: (auth) is a route group - folder name with parentheses doesn't affect URL
- **VALIDATE**: Directory and file exist

---

### Task 6: CREATE `src/components/auth/LoginForm.tsx`

- **IMPLEMENT**: Login form with email/password
- **STRUCTURE**:
  ```typescript
  'use client';

  // State: email, password, error (string | null), loading (boolean)
  // Hooks: useState, useRouter from next/navigation
  // Supabase: createClient() from '@/lib/supabase/client'

  // handleSubmit(e: React.FormEvent):
  //   1. e.preventDefault()
  //   2. setError(null), setLoading(true)
  //   3. Call supabase.auth.signInWithPassword({ email, password })
  //   4. If error: setError(error.message), setLoading(false), return
  //   5. If success: router.push('/dashboard'), router.refresh()

  // UI using shadcn Card:
  //   CardHeader:
  //     - CardTitle: "Sign in"
  //     - CardDescription: "Enter your email and password..."
  //   CardContent:
  //     - Error display (if error): red background, error text
  //     - Email input with Label
  //     - Password input with Label
  //   CardFooter:
  //     - Submit button (disabled when loading)
  //     - Link to /register: "Don't have an account? Sign up"
  ```
- **IMPORTS**: useState from react, useRouter from next/navigation, Link from next/link, createClient, all shadcn components
- **VALIDATE**: No TypeScript errors

---

### Task 7: CREATE `src/components/auth/RegisterForm.tsx`

- **IMPLEMENT**: Registration form with AUTO-WORKSPACE creation
- **STRUCTURE**:
  ```typescript
  'use client';

  // Same state as LoginForm: email, password, error, loading

  // handleSubmit(e: React.FormEvent):
  //   1. e.preventDefault()
  //   2. setError(null), setLoading(true)
  //   3. Call supabase.auth.signUp({ email, password })
  //   4. If error: setError(error.message), setLoading(false), return
  //
  //   5. CRITICAL - Auto-create workspace if user exists:
  //      if (authData.user) {
  //        await supabase.from('workspaces').insert({
  //          name: 'My Vault',
  //          owner_id: authData.user.id
  //        })
  //      }
  //      // Don't block on workspace error - user can create later
  //
  //   6. router.push('/dashboard'), router.refresh()

  // UI: Same Card structure as LoginForm but:
  //   - Title: "Create an account"
  //   - Password hint: "At least 6 characters"
  //   - minLength={6} on password input
  //   - Link to /login: "Already have an account? Sign in"
  ```
- **CRITICAL**: The workspace insert works because RLS policy allows insert when `owner_id = auth.uid()`, and after signUp the user is authenticated
- **GOTCHA**: Log workspace creation errors but don't block registration
- **VALIDATE**: No TypeScript errors

---

### Task 8: CREATE `src/app/(auth)/login/page.tsx`

- **IMPLEMENT**: Login page that renders LoginForm
- **STRUCTURE**:
  ```typescript
  // Server Component wrapper
  // Import LoginForm from '@/components/auth/LoginForm'
  // Return: <LoginForm />
  ```
- **VALIDATE**: Visit /login, see login form

---

### Task 9: CREATE `src/app/(auth)/register/page.tsx`

- **IMPLEMENT**: Register page that renders RegisterForm
- **STRUCTURE**:
  ```typescript
  // Server Component wrapper
  // Import RegisterForm from '@/components/auth/RegisterForm'
  // Return: <RegisterForm />
  ```
- **VALIDATE**: Visit /register, see registration form

---

### Task 10: CREATE `src/components/auth/LogoutButton.tsx`

- **IMPLEMENT**: Logout button for dashboard header
- **STRUCTURE**:
  ```typescript
  'use client';

  // Hooks: useRouter from next/navigation
  // Supabase: createClient() from '@/lib/supabase/client'

  // handleLogout async function:
  //   1. await supabase.auth.signOut()
  //   2. router.push('/')
  //   3. router.refresh()

  // UI: Button variant="outline" size="sm" with "Sign out" text
  ```
- **VALIDATE**: No TypeScript errors

---

### Task 11: CREATE `src/app/dashboard/layout.tsx`

- **IMPLEMENT**: Dashboard layout with header showing user email and logout
- **STRUCTURE**:
  ```typescript
  // ASYNC Server Component

  // 1. Get user:
  //    const supabase = await createClient()  // from server.ts
  //    const { data: { user } } = await supabase.auth.getUser()

  // 2. If no user: redirect('/login')  // from next/navigation

  // 3. Layout:
  //    ┌─────────────────────────────────────────────────┐
  //    │ Askvault (link)        user@email   [Sign out]  │  ← header, border-b
  //    ├─────────────────────────────────────────────────┤
  //    │                                                 │
  //    │                   {children}                    │  ← main, container
  //    │                                                 │
  //    └─────────────────────────────────────────────────┘

  // Header: container mx-auto px-4 py-4 flex items-center justify-between
  // Left: Link to /dashboard with "Askvault" text
  // Right: user.email (muted), LogoutButton
  ```
- **IMPORTS**: Link from next/link, redirect from next/navigation, createClient from server.ts, LogoutButton
- **GOTCHA**: Must use `await createClient()` - server.ts returns async function
- **VALIDATE**: No TypeScript errors

---

### Task 12: CREATE `src/app/dashboard/page.tsx`

- **IMPLEMENT**: Dashboard page showing user's workspaces
- **STRUCTURE**:
  ```typescript
  // ASYNC Server Component

  // 1. Fetch workspaces:
  //    const supabase = await createClient()
  //    const { data: workspaces, error } = await supabase
  //      .from('workspaces')
  //      .select('*')
  //      .order('created_at', { ascending: false })

  // 2. If error: console.error (don't break page)

  // 3. UI:
  //    ┌─────────────────────────────────────────────────┐
  //    │ Welcome to Askvault                             │  ← h1, text-3xl, font-bold
  //    │ Your intelligent document knowledge base        │  ← p, text-muted-foreground
  //    │                                                 │
  //    │ ┌───────────┐ ┌───────────┐ ┌───────────┐      │
  //    │ │ My Vault  │ │           │ │           │      │  ← Grid of Cards
  //    │ │ Created...│ │           │ │           │      │
  //    │ └───────────┘ └───────────┘ └───────────┘      │
  //    └─────────────────────────────────────────────────┘

  // Grid: gap-4 md:grid-cols-2 lg:grid-cols-3

  // Each workspace Card:
  //   - CardHeader: workspace.name as CardTitle
  //   - CardDescription: Created date (formatted)
  //   - CardContent: "Click to open workspace" text
  //   - Hover effect: hover:border-primary transition-colors

  // Empty state (no workspaces):
  //   - Card with border-dashed
  //   - "No workspaces yet" message
  ```
- **IMPORTS**: createClient from server.ts, Card components, Workspace type
- **GOTCHA**: Cast workspaces as `Workspace[] | null` for TypeScript
- **VALIDATE**: No TypeScript errors

---

### Task 13: VERIFY Build & Lint

- **IMPLEMENT**: Run all code quality checks
- **COMMANDS**:
  ```bash
  npm run lint        # Fix any ESLint errors
  npm run type-check  # Fix any TypeScript errors
  npm run build       # Ensure production build works
  ```
- **VALIDATE**: All commands pass with zero errors

---

### Task 14: FINAL Manual Validation

- **IMPLEMENT**: Test complete authentication flow
- **TEST STEPS**:
  1. `npm run dev`
  2. Visit `http://localhost:3000` → See landing page
  3. Click "Get Started" → Navigate to /register
  4. Enter email and password (min 6 chars)
  5. Click "Create account" → Should redirect to /dashboard
  6. See "My Vault" workspace card
  7. Click "Sign out" → Redirect to landing page
  8. Click "Sign In" → Navigate to /login
  9. Enter same credentials
  10. Click "Sign in" → Should redirect to /dashboard
  11. "My Vault" still visible
  12. Try visiting /dashboard in incognito → Should redirect to /login

- **VERIFY IN SUPABASE**:
  - Auth → Users: New user exists
  - Table Editor → workspaces: "My Vault" row with correct owner_id

---

## TESTING STRATEGY

### Unit Tests

No unit tests for Phase 1 - will be added in Phase 4 (Polish).

### Integration Tests

Manual E2E testing as described in Task 14.

### Edge Cases

- [ ] Registration with existing email shows error message
- [ ] Login with wrong password shows error message
- [ ] Empty email/password shows browser validation
- [ ] Password under 6 chars shows validation error
- [ ] Accessing /dashboard without auth redirects to /login
- [ ] Accessing /login while authenticated redirects to /dashboard

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
npm run lint
```

### Level 2: Type Checking

```bash
npm run type-check
```

### Level 3: Build

```bash
npm run build
```

### Level 4: Manual Validation

Complete all 12 steps in Task 14.

---

## ACCEPTANCE CRITERIA

- [ ] `src/types/index.ts` - Type definitions created
- [ ] Landing page shows minimal design (title, tagline, 2 buttons)
- [ ] `/register` page with email/password form
- [ ] `/login` page with email/password form
- [ ] Registration creates user AND "My Vault" workspace automatically
- [ ] Login redirects to dashboard
- [ ] Dashboard shows workspace cards
- [ ] Logout works and redirects to landing
- [ ] Middleware protects /dashboard (redirects to /login if not auth)
- [ ] Middleware redirects authenticated users from /login to /dashboard
- [ ] Error messages display for failed auth attempts
- [ ] All validation commands pass (lint, type-check, build)

---

## COMPLETION CHECKLIST

- [ ] Task 1: Types created
- [ ] Task 2: globals.css verified
- [ ] Task 3: Root layout updated
- [ ] Task 4: Landing page created
- [ ] Task 5: Auth layout created
- [ ] Task 6: LoginForm created
- [ ] Task 7: RegisterForm created (with auto-workspace)
- [ ] Task 8: Login page created
- [ ] Task 9: Register page created
- [ ] Task 10: LogoutButton created
- [ ] Task 11: Dashboard layout created
- [ ] Task 12: Dashboard page created
- [ ] Task 13: All lint/type/build pass
- [ ] Task 14: Manual validation complete

---

## NOTES

### Design Decisions

1. **Steve Jobs Landing Page**: Absolute minimalism - one headline, one tagline, two buttons. No feature lists, no explanations. Trust the user to explore.

2. **Auto-Workspace on Registration**: Zero-friction onboarding. User registers and immediately has something to work with. No "create your first workspace" step.

3. **Server Components for Data Fetching**: Dashboard layout and page are Server Components that fetch data directly. Better performance, no loading states needed.

4. **Client Components for Forms**: Auth forms need useState for input handling, so they must be Client Components.

5. **No Email Verification**: For a recruiting challenge, speed matters more than email verification. Users can use immediately.

### Security Considerations

- Passwords must be at least 6 characters (Supabase default)
- RLS ensures workspace creation only works for authenticated users
- Middleware prevents unauthorized dashboard access
- Error messages are user-friendly (don't leak technical details)

### Next Phase Dependencies

Phase 2 (Document Pipeline) will need:
- User authenticated and on dashboard
- Workspace ID available for document uploads
- OpenAI API key for embeddings (already in .env.local)

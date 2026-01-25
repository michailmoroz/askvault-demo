# Feature: Phase 1 - Foundation

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

## Feature Description

Set up the complete foundation for the Askvault RAG application: Next.js project with TypeScript, Supabase integration for authentication and database, minimal landing page, and protected dashboard with automatic workspace creation. This phase establishes all infrastructure needed for subsequent phases.

## User Story

As a **new user**, I want to **create an account and log in**, so that **I can access my personal workspace and start using Askvault**.

## Problem Statement

The Askvault application needs a solid foundation before implementing RAG features. Users need to authenticate, have isolated workspaces, and navigate a clean interface.

## Solution Statement

Create a Next.js 14+ application with:
- Minimal, elegant landing page (Steve Jobs style: one headline, one CTA)
- Email/password authentication via Supabase Auth
- Automatic "My Vault" workspace creation on registration
- Protected dashboard route with workspace display
- Database schema with RLS policies for multi-tenancy

## Feature Metadata

**Feature Type**: New Capability (Greenfield Project)
**Estimated Complexity**: Medium
**Primary Systems Affected**: Frontend (Next.js), Backend (Supabase), Database (PostgreSQL)
**Dependencies**: Supabase project (user has created), Node.js 18+

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING!)

| File | Lines | Why |
|------|-------|-----|
| `CLAUDE.md` | Full | Coding conventions, patterns, gotchas |
| `.agents/PRD.md` | Section 6, 15 | Directory structure, database schema |
| `.agents/decisions/001-project-decisions.md` | Full | Architecture decisions, security rules |

### New Files to Create

| File | Purpose |
|------|---------|
| `package.json` | Project dependencies |
| `tsconfig.json` | TypeScript configuration (strict mode) |
| `next.config.js` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS for Tailwind |
| `.env.example` | Environment variable template |
| `.env.local` | Local secrets (USER CREATES MANUALLY) |
| `.gitignore` | Git ignore patterns |
| `src/app/layout.tsx` | Root layout with providers |
| `src/app/page.tsx` | Landing page |
| `src/app/globals.css` | Global styles + Tailwind |
| `src/app/(auth)/login/page.tsx` | Login page |
| `src/app/(auth)/register/page.tsx` | Registration page |
| `src/app/(auth)/layout.tsx` | Auth layout (centered) |
| `src/app/dashboard/page.tsx` | Protected dashboard |
| `src/app/dashboard/layout.tsx` | Dashboard layout |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Server Supabase client |
| `src/lib/supabase/middleware.ts` | Auth middleware helper |
| `src/middleware.ts` | Next.js middleware for auth |
| `src/components/ui/button.tsx` | shadcn Button component |
| `src/components/ui/input.tsx` | shadcn Input component |
| `src/components/ui/card.tsx` | shadcn Card component |
| `src/components/ui/label.tsx` | shadcn Label component |
| `src/components/auth/LoginForm.tsx` | Login form component |
| `src/components/auth/RegisterForm.tsx` | Register form component |
| `src/types/index.ts` | TypeScript type definitions |
| `src/types/database.ts` | Supabase generated types |
| `supabase/migrations/001_initial_schema.sql` | Database schema |
| `src/lib/utils.ts` | Utility functions (cn helper) |
| `components.json` | shadcn/ui configuration |

### Relevant Documentation

| Source | Section | Why |
|--------|---------|-----|
| [Next.js App Router](https://nextjs.org/docs/app) | Routing, Layouts | Project structure |
| [Supabase Auth SSR](https://supabase.com/docs/guides/auth/server-side/nextjs) | Full guide | Auth implementation |
| [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security) | Policies | Multi-tenancy |
| [shadcn/ui Installation](https://ui.shadcn.com/docs/installation/next) | Next.js setup | Component library |
| [Tailwind CSS](https://tailwindcss.com/docs/installation) | Configuration | Styling |

### Patterns to Follow

**Import Order (from CLAUDE.md):**
```typescript
// Order: React -> Next -> External -> Internal -> Types
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import type { Document } from '@/types';
```

**Naming Conventions:**
- Components: `PascalCase` (e.g., `LoginForm.tsx`)
- Functions/Variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Files: `kebab-case` for utilities, `PascalCase` for components
- Database tables: `snake_case`

**Server vs Client Components:**
- Server Components by default
- Add `'use client'` only for hooks, browser APIs, interactivity

**Error Handling (API Routes):**
```typescript
if (!workspaceId) {
  return NextResponse.json(
    { error: 'Workspace ID required' },
    { status: 400 }
  );
}
```

**Supabase Client Usage:**
```typescript
// Client-side (with RLS protection)
import { createBrowserClient } from '@supabase/ssr';
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side (bypasses RLS - use carefully)
import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

---

## IMPLEMENTATION PLAN

### Phase 1.1: Project Setup

Initialize Next.js project with TypeScript, Tailwind CSS, and essential configuration files.

**Tasks:**
- Initialize Next.js with `create-next-app`
- Configure TypeScript strict mode
- Set up Tailwind CSS
- Create `.env.example` and `.gitignore`
- Install core dependencies

### Phase 1.2: Supabase Integration

Set up Supabase clients for browser and server, create database schema with RLS.

**Tasks:**
- Create Supabase client utilities
- Create database migration with schema
- Deploy migration to Supabase
- Generate TypeScript types

### Phase 1.3: shadcn/ui Setup

Initialize shadcn/ui and add required components.

**Tasks:**
- Initialize shadcn/ui
- Add Button, Input, Card, Label components
- Create utility functions (cn helper)

### Phase 1.4: Authentication

Implement login and registration pages with Supabase Auth.

**Tasks:**
- Create auth layout
- Create LoginForm component
- Create RegisterForm component
- Implement login/register pages
- Add auto-workspace creation on registration

### Phase 1.5: Protected Routes & Dashboard

Set up middleware for auth protection and create dashboard.

**Tasks:**
- Create Next.js middleware
- Create dashboard layout
- Create dashboard page with workspace display
- Implement redirect logic

### Phase 1.6: Landing Page

Create minimal, elegant landing page.

**Tasks:**
- Design landing page (Steve Jobs style)
- Add navigation to auth pages

---

## STEP-BY-STEP TASKS

> **IMPORTANT:** Execute every task in order, top to bottom. Each task is atomic and independently testable.

---

### 🛑 USER ACTION REQUIRED: Environment Setup

Before starting implementation, the user must create `.env.local` with their credentials.

**STOP HERE AND ASK USER:**
```
I need you to create the file `.env.local` in the project root with your Supabase and API credentials:

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key

Please confirm when done, then I'll continue with the implementation.
```

**Wait for user confirmation before proceeding.**

---

### Task 1: CREATE Next.js Project

- **IMPLEMENT**: Initialize Next.js 14+ with App Router, TypeScript, Tailwind CSS, ESLint
- **COMMAND**:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```
- **GOTCHA**: Run in project root directory. Will create all base files.
- **VALIDATE**: `npm run dev` starts without errors

---

### Task 2: UPDATE `tsconfig.json` for Strict Mode

- **IMPLEMENT**: Enable strict TypeScript options
- **CHANGES**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```
- **VALIDATE**: `npm run type-check` (add script first if needed)

---

### Task 3: CREATE `.env.example`

- **IMPLEMENT**: Template for environment variables (NO real values)
- **CONTENT**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services (needed in Phase 2+)
ANTHROPIC_API_KEY=sk-ant-your-key
OPENAI_API_KEY=sk-your-key
```
- **VALIDATE**: File exists, contains only placeholders

---

### Task 4: UPDATE `.gitignore`

- **IMPLEMENT**: Ensure all sensitive files are ignored
- **ADD**:
```gitignore
# Environment Variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local

# Supabase
supabase/.branches
supabase/.temp
```
- **VALIDATE**: `git status` does not show `.env.local`

---

### Task 5: INSTALL Core Dependencies

- **IMPLEMENT**: Add Supabase, shadcn/ui prerequisites, and utilities
- **COMMAND**:
```bash
npm install @supabase/supabase-js @supabase/ssr zod lucide-react class-variance-authority clsx tailwind-merge
```
- **VALIDATE**: `npm ls @supabase/supabase-js` shows installed version

---

### Task 6: CREATE `src/lib/utils.ts`

- **IMPLEMENT**: Utility function for className merging (required by shadcn/ui)
- **CONTENT**:
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```
- **VALIDATE**: File exists with correct exports

---

### Task 7: INIT shadcn/ui

- **IMPLEMENT**: Initialize shadcn/ui with default configuration
- **COMMAND**:
```bash
npx shadcn@latest init -d
```
- **GOTCHA**: Use `-d` for defaults, or answer prompts: Style=Default, Base color=Slate, CSS variables=Yes
- **VALIDATE**: `components.json` exists in project root

---

### Task 8: ADD shadcn/ui Components

- **IMPLEMENT**: Add required UI components
- **COMMAND**:
```bash
npx shadcn@latest add button input card label
```
- **VALIDATE**: Files exist in `src/components/ui/`

---

### Task 9: CREATE `src/lib/supabase/client.ts`

- **IMPLEMENT**: Browser-side Supabase client (uses anon key, RLS protected)
- **CONTENT**:
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```
- **VALIDATE**: No TypeScript errors

---

### Task 10: CREATE `src/lib/supabase/server.ts`

- **IMPLEMENT**: Server-side Supabase client with cookie handling
- **CONTENT**:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component - ignore
          }
        },
      },
    }
  );
}
```
- **GOTCHA**: `cookies()` returns a Promise in Next.js 15+ - must await
- **VALIDATE**: No TypeScript errors

---

### Task 11: CREATE `src/lib/supabase/middleware.ts`

- **IMPLEMENT**: Middleware helper for session refresh
- **CONTENT**:
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users from protected routes
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from auth pages
  if (
    user &&
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/register')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```
- **VALIDATE**: No TypeScript errors

---

### Task 12: CREATE `src/middleware.ts`

- **IMPLEMENT**: Next.js middleware entry point
- **CONTENT**:
```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```
- **VALIDATE**: No TypeScript errors

---

### Task 13: CREATE `supabase/migrations/001_initial_schema.sql`

- **IMPLEMENT**: Database schema with RLS policies
- **CONTENT**:
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Document chunks with embeddings
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  chunk_index INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create HNSW index for fast similarity search
CREATE INDEX document_chunks_embedding_idx ON document_chunks
USING hnsw (embedding vector_cosine_ops);

-- Row Level Security Policies
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Workspace policies
CREATE POLICY "Users can view own workspaces"
ON workspaces FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can create own workspaces"
ON workspaces FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own workspaces"
ON workspaces FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own workspaces"
ON workspaces FOR DELETE
USING (owner_id = auth.uid());

-- Document policies
CREATE POLICY "Users can view documents in own workspaces"
ON documents FOR SELECT
USING (workspace_id IN (
  SELECT id FROM workspaces WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can create documents in own workspaces"
ON documents FOR INSERT
WITH CHECK (workspace_id IN (
  SELECT id FROM workspaces WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can update documents in own workspaces"
ON documents FOR UPDATE
USING (workspace_id IN (
  SELECT id FROM workspaces WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can delete documents in own workspaces"
ON documents FOR DELETE
USING (workspace_id IN (
  SELECT id FROM workspaces WHERE owner_id = auth.uid()
));

-- Chunk policies
CREATE POLICY "Users can view chunks in own documents"
ON document_chunks FOR SELECT
USING (document_id IN (
  SELECT d.id FROM documents d
  JOIN workspaces w ON d.workspace_id = w.id
  WHERE w.owner_id = auth.uid()
));

CREATE POLICY "Users can create chunks in own documents"
ON document_chunks FOR INSERT
WITH CHECK (document_id IN (
  SELECT d.id FROM documents d
  JOIN workspaces w ON d.workspace_id = w.id
  WHERE w.owner_id = auth.uid()
));

CREATE POLICY "Users can update chunks in own documents"
ON document_chunks FOR UPDATE
USING (document_id IN (
  SELECT d.id FROM documents d
  JOIN workspaces w ON d.workspace_id = w.id
  WHERE w.owner_id = auth.uid()
));

CREATE POLICY "Users can delete chunks in own documents"
ON document_chunks FOR DELETE
USING (document_id IN (
  SELECT d.id FROM documents d
  JOIN workspaces w ON d.workspace_id = w.id
  WHERE w.owner_id = auth.uid()
));
```
- **VALIDATE**: SQL syntax is valid

---

### Task 14: DEPLOY Database Migration

- **IMPLEMENT**: Push migration to Supabase
- **COMMAND**:
```bash
npx supabase db push
```
- **GOTCHA**: Requires Supabase CLI linked to project. If not linked, run `npx supabase link --project-ref YOUR_PROJECT_REF` first
- **ALTERNATIVE**: If CLI not set up, manually run SQL in Supabase Dashboard > SQL Editor
- **VALIDATE**: Tables visible in Supabase Dashboard > Table Editor

---

### Task 15: CREATE `src/types/index.ts`

- **IMPLEMENT**: Core TypeScript type definitions
- **CONTENT**:
```typescript
export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Document {
  id: string;
  workspace_id: string;
  filename: string;
  content_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  embedding: number[] | null;
  chunk_index: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}
```
- **VALIDATE**: No TypeScript errors

---

### Task 16: UPDATE `src/app/globals.css`

- **IMPLEMENT**: Ensure Tailwind directives and base styles
- **CONTENT**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```
- **VALIDATE**: Styles apply correctly

---

### Task 17: UPDATE `src/app/layout.tsx`

- **IMPLEMENT**: Root layout with metadata
- **CONTENT**:
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Askvault - Your Knowledge Vault',
  description: 'Upload documents, ask questions, get intelligent answers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```
- **VALIDATE**: `npm run dev` shows correct title

---

### Task 18: CREATE `src/app/page.tsx` (Landing Page)

- **IMPLEMENT**: Minimal, elegant landing page (Steve Jobs style)
- **CONTENT**:
```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage(): React.ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-6xl font-bold tracking-tight">
          Askvault
        </h1>
        <p className="text-xl text-muted-foreground">
          Your documents. Your answers.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="text-lg px-8">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
```
- **VALIDATE**: `npm run dev` shows landing page at localhost:3000

---

### Task 19: CREATE `src/app/(auth)/layout.tsx`

- **IMPLEMENT**: Centered layout for auth pages
- **CONTENT**:
```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </main>
  );
}
```
- **VALIDATE**: Directory and file exist

---

### Task 20: CREATE `src/components/auth/LoginForm.tsx`

- **IMPLEMENT**: Login form with email/password
- **CONTENT**:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm(): React.ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
        <CardDescription>
          Enter your email and password to access your vault
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
```
- **VALIDATE**: No TypeScript errors

---

### Task 21: CREATE `src/components/auth/RegisterForm.tsx`

- **IMPLEMENT**: Registration form with auto-workspace creation
- **CONTENT**:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function RegisterForm(): React.ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Create default workspace "My Vault"
    if (authData.user) {
      const { error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: 'My Vault',
          owner_id: authData.user.id,
        });

      if (workspaceError) {
        console.error('Failed to create default workspace:', workspaceError);
        // Don't block registration, workspace can be created later
      }
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your email and password to get started
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
```
- **GOTCHA**: Workspace creation uses client-side Supabase with RLS - requires auth.uid() to match owner_id
- **VALIDATE**: No TypeScript errors

---

### Task 22: CREATE `src/app/(auth)/login/page.tsx`

- **IMPLEMENT**: Login page using LoginForm
- **CONTENT**:
```typescript
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage(): React.ReactElement {
  return <LoginForm />;
}
```
- **VALIDATE**: Page renders at `/login`

---

### Task 23: CREATE `src/app/(auth)/register/page.tsx`

- **IMPLEMENT**: Registration page using RegisterForm
- **CONTENT**:
```typescript
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage(): React.ReactElement {
  return <RegisterForm />;
}
```
- **VALIDATE**: Page renders at `/register`

---

### Task 24: CREATE `src/app/dashboard/layout.tsx`

- **IMPLEMENT**: Dashboard layout with header
- **CONTENT**:
```typescript
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold">
            Askvault
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```
- **VALIDATE**: No TypeScript errors

---

### Task 25: CREATE `src/components/auth/LogoutButton.tsx`

- **IMPLEMENT**: Logout button component
- **CONTENT**:
```typescript
'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export function LogoutButton(): React.ReactElement {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      Sign out
    </Button>
  );
}
```
- **VALIDATE**: No TypeScript errors

---

### Task 26: CREATE `src/app/dashboard/page.tsx`

- **IMPLEMENT**: Dashboard page showing workspaces
- **CONTENT**:
```typescript
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Workspace } from '@/types';

export default async function DashboardPage(): Promise<React.ReactElement> {
  const supabase = await createClient();

  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch workspaces:', error);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome to Askvault</h1>
        <p className="text-muted-foreground mt-2">
          Your intelligent document knowledge base
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(workspaces as Workspace[] | null)?.map((workspace) => (
          <Card key={workspace.id} className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle>{workspace.name}</CardTitle>
              <CardDescription>
                Created {new Date(workspace.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click to open workspace
              </p>
            </CardContent>
          </Card>
        ))}

        {(!workspaces || workspaces.length === 0) && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-muted-foreground">No workspaces yet</CardTitle>
              <CardDescription>
                Create your first workspace to get started
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
```
- **VALIDATE**: Page renders at `/dashboard`

---

### Task 27: ADD Type Check Script to `package.json`

- **IMPLEMENT**: Add type-check script
- **UPDATE** `package.json` scripts:
```json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```
- **VALIDATE**: `npm run type-check` runs without errors

---

### Task 28: FINAL VALIDATION

- **VALIDATE ALL**:
```bash
npm run lint
npm run type-check
npm run build
```
- **MANUAL TEST**:
  1. Start dev server: `npm run dev`
  2. Visit `http://localhost:3000` - see landing page
  3. Click "Get Started" - navigate to `/register`
  4. Register new account
  5. Should redirect to `/dashboard`
  6. Should see "My Vault" workspace
  7. Click "Sign out" - redirect to landing page
  8. Visit `/login` - sign in
  9. Should redirect to `/dashboard`

---

## TESTING STRATEGY

### Unit Tests

For Phase 1, manual testing is sufficient. Unit tests will be added in Phase 4.

### Integration Tests

Manual E2E testing as described in Task 28.

### Edge Cases

- [ ] Registration with existing email shows error
- [ ] Login with wrong password shows error
- [ ] Accessing `/dashboard` without auth redirects to `/login`
- [ ] Accessing `/login` with auth redirects to `/dashboard`

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

1. `npm run dev`
2. Test full auth flow (register, login, logout)
3. Verify workspace creation
4. Check Supabase Dashboard for data

---

## ACCEPTANCE CRITERIA

- [x] Next.js 14+ project with TypeScript strict mode
- [x] Tailwind CSS + shadcn/ui configured
- [x] Supabase integration (client + server)
- [x] Database schema with RLS policies
- [x] Landing page (minimal, elegant)
- [x] Login page with email/password
- [x] Register page with auto-workspace creation
- [x] Protected dashboard route
- [x] Logout functionality
- [x] Workspace display on dashboard
- [x] All validation commands pass

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] User created `.env.local` with credentials
- [ ] Database migration deployed
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] Manual auth flow works
- [ ] "My Vault" workspace created on registration

---

## NOTES

### Design Decisions

1. **Steve Jobs Landing Page**: Minimal design with one headline, one tagline, two CTAs. No feature list, no distractions.

2. **Auto-Workspace Creation**: Creates "My Vault" immediately on registration for zero-friction onboarding.

3. **No Email Verification**: For recruiting challenge, immediate access is more important than email verification.

4. **Server Components for Dashboard**: Data fetching on server for better performance and SEO.

5. **Client Components for Forms**: Required for interactivity (useState, event handlers).

### Known Limitations

- No password reset flow (skipped for MVP)
- No workspace creation UI (only auto-created on registration)
- No loading states during auth operations (can be enhanced)

### Security Considerations

- API keys only in environment variables
- RLS policies enforce data isolation
- Service role key only used server-side
- No sensitive data in client bundle

### Next Phase Dependencies

Phase 2 (Document Pipeline) will need:
- OpenAI API key for embeddings
- PDF parsing library
- Chunking implementation
- Document upload UI

# Askvault

RAG-powered knowledge vault - upload documents, ask questions, get answers.

## Tech Stack

- **Framework:** Next.js 14+ (App Router, Server Components)
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** Tailwind CSS 3.x + shadcn/ui
- **Database:** Supabase (PostgreSQL + pgvector 0.6+)
- **Auth:** Supabase Auth mit Row Level Security (RLS)
- **LLM:** Anthropic Claude Haiku 3.5 via API
- **Embeddings:** OpenAI text-embedding-3-small (1536 dimensions)
- **Deployment:** Vercel + Supabase Cloud

## Project Structure

```
src/
├── app/           # Next.js App Router (pages + API routes)
├── components/    # React Components (ui/, chat/, documents/)
├── lib/           # Business Logic (supabase/, rag/, llm/)
├── types/         # TypeScript Definitions
└── hooks/         # Custom React Hooks
```

> **Details:** See `.agents/PRD.md` Section 6 for full directory structure.

## Commands

```bash
# Development
npm run dev                 # Start dev server (localhost:3000)
npm run build               # Production build
npm run lint                # ESLint check
npm run type-check          # TypeScript check

# Database
npx supabase start          # Start local Supabase
npx supabase db push        # Push migrations to remote
npx supabase gen types typescript --local > src/types/database.ts

# Testing
npm run test                # Run tests
npm run test:watch          # Watch mode
```

## Code Conventions

### TypeScript

- Strict mode enabled, no `any` types
- Explicit return types for functions
- Use `unknown` instead of `any` when type is unclear
- Prefer interfaces over type aliases for objects

### React / Next.js

- Server Components by default
- Add `'use client'` only when necessary (hooks, browser APIs, interactivity)
- URL params in pages are Promises - must be awaited
- Use Route Handlers (`app/api/`) for backend logic, not API routes

### Imports

```typescript
// Order: React → Next → External → Internal → Types
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import type { Document } from '@/types';
```

### Naming

- Components: `PascalCase` (e.g., `ChatMessage.tsx`)
- Functions/Variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Files: `kebab-case` for utilities, `PascalCase` for components
- Database tables: `snake_case`

## RAG Architecture

### Document Processing Pipeline

```
Upload → Parse → Chunk → Embed → Store
         │        │        │        │
         PDF/MD   512 tok  OpenAI   pgvector
         TXT      +50 overlap
```

### Chunking Strategy

- **Chunk Size:** 512 tokens
- **Overlap:** 50 tokens (~10%)
- **Markdown:** Split by headers (##, ###) as natural boundaries
- **PDF:** Split by paragraphs after text extraction
- **Plain Text:** RecursiveCharacterTextSplitter

### Query Pipeline

```
User Query → Embed Query → Vector Search → Top-K Chunks → LLM + Context → Response
                              │
                          Cosine Similarity
                          HNSW Index
```

### Vector Search

```sql
-- Example similarity search
SELECT content, 1 - (embedding <=> query_embedding) as similarity
FROM document_chunks
WHERE workspace_id = $1
ORDER BY embedding <=> query_embedding
LIMIT 5;
```

## Database Schema

**Tables:** `workspaces`, `documents`, `document_chunks` (with vector embeddings)

**Multi-Tenancy:** RLS enabled on all tables, `workspace_id` as isolation key.

> **Full Schema:** See `.agents/PRD.md` Appendix for complete SQL with RLS policies.

## Security Rules

### API Keys - CRITICAL

```typescript
// CORRECT: Environment Variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// WRONG: Never hardcode
const apiKey = "sk-ant-..."; // SECURITY VULNERABILITY
```

### Environment Variables

| Variable | Usage | Exposed to Client |
|----------|-------|-------------------|
| `ANTHROPIC_API_KEY` | LLM API calls | NO |
| `OPENAI_API_KEY` | Embeddings | NO |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations | NO |
| `NEXT_PUBLIC_SUPABASE_URL` | Client connection | YES |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client auth | YES |

### File Structure for Secrets

```
.env.local              # Local secrets (NEVER commit)
.env.example            # Template with placeholders (commit this)
.gitignore              # Must include .env*
```

### Supabase Client Usage

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

## Patterns

### Streaming Responses

Use Vercel AI SDK for streaming LLM responses:

```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const result = await streamText({
    model: anthropic('claude-3-5-haiku-latest'),
    system: `Use this context to answer: ${context}`,
    messages,
  });

  return result.toDataStreamResponse();
}
```

### Error Handling

```typescript
// API Routes: Return proper HTTP status codes
if (!workspaceId) {
  return NextResponse.json(
    { error: 'Workspace ID required' },
    { status: 400 }
  );
}

// Client: Use try-catch with user-friendly messages
try {
  await uploadDocument(file);
} catch (error) {
  toast.error('Failed to upload document. Please try again.');
  console.error('Upload error:', error);
}
```

### File Upload

```typescript
// Validate file types
const ALLOWED_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Unsupported file type');
}
```

## Gotchas

1. **Next.js App Router:** URL params are Promises in Next.js 15+
   ```typescript
   // Correct
   export default async function Page({ params }: { params: Promise<{ id: string }> }) {
     const { id } = await params;
   }
   ```

2. **pgvector Operator:** Use `<=>` for cosine distance, not `<->`
   ```sql
   ORDER BY embedding <=> query_embedding  -- Cosine (correct)
   ORDER BY embedding <-> query_embedding  -- L2 distance
   ```

3. **Supabase RLS:** Service Role Key bypasses RLS - only use server-side

4. **Embedding Dimensions:** text-embedding-3-small outputs 1536 dimensions
   ```sql
   embedding vector(1536)  -- Must match!
   ```

5. **Streaming:** Use `toDataStreamResponse()` not `toTextStreamResponse()`

6. **TypeScript:** Generate types after schema changes
   ```bash
   npx supabase gen types typescript --local > src/types/database.ts
   ```

## AI Workflow Tools

Methoden für die Entwicklung dieses Projekts (keine MCP-Server erforderlich):

| Aufgabe | Methode | Beispiel |
|---------|---------|----------|
| **Dateien erstellen/bearbeiten** | Read/Write/Edit Tools | Direkte Dateioperationen |
| **Supabase CLI** | Bash + `npx supabase` | `npx supabase db push` |
| **Git Operationen** | Bash + `gh` CLI | `gh pr create`, `git commit` |
| **Package Management** | Bash + `npm` | `npm install`, `npm run dev` |
| **Codebase durchsuchen** | Glob/Grep Tools | Pattern-basierte Suche |
| **Dokumentation nachschlagen** | WebSearch/WebFetch | Bei Bedarf |

**Supabase:** Verwende `npx supabase` CLI statt MCP-Server
```bash
npx supabase start          # Lokale Instanz starten
npx supabase db push        # Migrationen deployen
npx supabase gen types      # TypeScript Types generieren
```

**GitHub:** Verwende `gh` CLI statt MCP-Server
```bash
gh pr create                # Pull Request erstellen
gh issue list               # Issues auflisten
```

## References

- **Project Decisions:** `.agents/decisions/001-project-decisions.md`
- **CLAUDE.md Research:** `.agents/research/claude-md-research.md`
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Vercel AI SDK:** https://sdk.vercel.ai/docs

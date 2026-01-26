# Askvault

RAG-powered knowledge vault - upload documents, ask questions, get answers.

## Problem Statement

**Challenge:** Information is scattered across multiple documents. Finding specific answers requires manually searching through files, reading context, and synthesizing information.

**Solution:** Askvault lets users upload documents (PDF, TXT, Markdown) and query them using natural language. The system uses Retrieval-Augmented Generation (RAG) to find relevant passages and generate accurate, contextual answers.

## Demo

> **Live:** [askvault-demo.vercel.app](https://askvault-demo.vercel.app)

**Features:**
- Multi-tenant workspaces with isolated knowledge bases
- Document upload with chunking and vector embeddings
- Natural language Q&A with streaming responses
- Dark mode support

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                    │
│   Login/Register → Dashboard → Workspace → Chat Interface   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Layer (Route Handlers)                 │
│      /api/chat      /api/documents      /api/workspaces     │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Supabase Auth  │  │  PostgreSQL +   │  │   Claude API    │
│      (RLS)      │  │    pgvector     │  │  (Streaming)    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### RAG Pipeline

```
Upload:   File → Parse → Chunk (2000 chars) → Embed (OpenAI) → Store (pgvector)

Query:    Question → Embed → Vector Search (cosine) → Top-5 Chunks → Claude → Stream
```

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Framework | Next.js 16 (App Router) | Server Components, Streaming, API Routes |
| Language | TypeScript (strict) | Type safety, better DX |
| Database | Supabase + pgvector | Auth, RLS, Vector Search in one platform |
| LLM | Claude Haiku | Fast, cost-effective, good for RAG |
| Embeddings | OpenAI text-embedding-3-small | 1536 dimensions, good quality/cost ratio |
| Styling | Tailwind CSS v4 + shadcn/ui | Rapid UI development, consistent design |

## Quick Start

### Prerequisites

- Node.js 20.x
- Supabase account (free tier works)
- Anthropic API key
- OpenAI API key

### Setup

```bash
# Clone & install
git clone https://github.com/michailmoroz/askvault-demo.git
cd askvault-demo
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Setup database (run migration)
npx supabase db push

# Start dev server
npm run dev
```

### Environment Variables

```bash
# Supabase (from project settings)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

## Design Decisions

### 1. Why Supabase + pgvector?

**Alternative:** Separate vector DB (Pinecone, Weaviate)

**Decision:** Integrated solution - auth, database, and vector search in one platform. Simpler architecture, fewer services to manage, RLS for multi-tenancy built-in.

### 2. Why 2000 char chunks with 200 overlap?

**Tradeoff:** Larger chunks = more context but less precision. Smaller = better precision but fragmented context.

**Decision:** 2000 chars balances context preservation with retrieval accuracy. 10% overlap prevents cutting sentences mid-thought.

### 3. Why Claude Haiku over GPT-4?

**Tradeoff:** GPT-4 is more capable but slower and more expensive.

**Decision:** For RAG, the model mainly synthesizes retrieved context. Haiku is fast (good for streaming UX), cheap, and accurate enough when context is provided.

### 4. Why streaming responses?

**Alternative:** Wait for complete response, then display.

**Decision:** Streaming provides immediate feedback. Users see the answer forming, which feels faster even if total time is similar.

### 5. Why Row Level Security (RLS)?

**Alternative:** Application-level authorization checks.

**Decision:** RLS enforces isolation at the database level. Even if application code has bugs, users can't access other users' data. Defense in depth.

## Project Structure

```
src/
├── app/
│   ├── api/chat/           # RAG query endpoint (streaming)
│   ├── api/documents/      # Upload, list, delete
│   ├── api/workspaces/     # CRUD operations
│   └── dashboard/          # Main UI
├── components/
│   ├── chat/               # ChatInterface, ChatMessage, TypingIndicator
│   ├── documents/          # Upload, List, DeleteDialog
│   └── workspace/          # Create/Delete dialogs
├── lib/
│   ├── rag/                # chunker, embeddings, retriever
│   └── supabase/           # client, server helpers
└── types/                  # TypeScript definitions
```

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

## Security

- API keys in environment variables only (never client-side)
- RLS policies on all tables (workspace isolation)
- Service Role Key server-side only
- Input validation on all endpoints

## License

MIT

---

Built as a recruiting challenge demonstration.

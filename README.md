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

### 1. Supabase + pgvector (vs. Pinecone/Weaviate)

**Decision:** Integrated solution - auth, database, and vector search in one platform.

**Why:** Simpler architecture, fewer services to manage. RLS for multi-tenancy built-in. HNSW index provides fast cosine similarity search without external dependencies.

### 2. OpenAI text-embedding-3-small (vs. ada-002)

**Decision:** Newer embedding model with 1536 dimensions.

**Why:** 5x cheaper than ada-002 ($0.02 vs $0.10 per 1M tokens) while delivering better retrieval quality (62.3% vs 61.0% MTEB score). Anthropic doesn't offer embeddings, so OpenAI + Claude is a common production pattern.

### 3. RecursiveCharacterTextSplitter (2000 chars, 200 overlap)

**Decision:** LangChain's text splitter with paragraph → sentence → word fallback.

**Why:** 85-90% recall without additional API costs (unlike semantic chunking which requires embeddings per sentence). 10% overlap prevents cutting context mid-thought. Industry standard for RAG applications.

### 4. Claude Haiku (vs. GPT-4 / Claude Sonnet)

**Decision:** Anthropic's fastest, cheapest model.

**Why:** For RAG, the LLM synthesizes retrieved context - it doesn't need to "know" the answer. Haiku is fast (good streaming UX), cheap ($0.25/1M input tokens), and accurate when context is provided.

### 5. Streaming with Vercel AI SDK

**Decision:** Server-Sent Events via `streamText()` + `useChat()` hook.

**Why:** Users see answers forming in real-time, which feels faster even if total time is similar. The AI SDK handles SSE, backpressure, and React state automatically.

### 6. Row Level Security (vs. Application-level checks)

**Decision:** Database-enforced tenant isolation via Supabase RLS policies.

**Why:** Defense in depth. Even if application code has bugs, users can't access other users' data. Policies are defined once in SQL and enforced on every query.

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

# Product Requirements Document: Askvault

**Version:** 1.2
**Date:** 2026-01-26
**Status:** Deployed - Final Verification Pending
**Author:** AI-Assisted Development

---

## Progress Summary

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1A: Project Setup | ✅ Complete | 100% |
| Phase 1B: Supabase Integration | ✅ Complete | 100% |
| Phase 1C: UI, Auth & Dashboard | ✅ Complete | 100% |
| Phase 2: Document Pipeline | ✅ Complete | 100% |
| Phase 3: RAG Query Engine | ✅ Complete | 100% |
| Phase 4: Polish & Deploy | ✅ Complete | 95% |

**Overall Progress: ~98%** (Deployed to Vercel, final verification pending)

### What's Working
- ✅ User registration & login with auto-workspace creation
- ✅ Document upload (PDF, TXT, MD) with progress indicator
- ✅ Document processing (chunking, embedding, vector storage)
- ✅ Chat interface with streaming responses
- ✅ RAG retrieval with cross-language support & query expansion
- ✅ Multi-tenant data isolation (RLS)
- ✅ Manual workspace creation & deletion UI
- ✅ Vercel deployment: https://askvault-demo.vercel.app
- ✅ GitHub repo: https://github.com/michailmoroz/askvault-demo (private)
- ✅ E2E smoke tests with Playwright (6 tests)

### What's Remaining
- ✅ E2E tests against production URL — *6/6 passed (14.1s)*
- ⚠️ Final git commit with documentation updates

### Recent Updates (2026-01-26)
- **Vercel Deployment:** Live at https://askvault-demo.vercel.app
- **E2E Tests:** Playwright smoke tests (6 tests) for auth flows
- **E2E Production Tests:** All 6 tests pass against production (14.1s)
- **Workspace UI:** Create and Delete dialogs implemented
- **Documentation:** README and PRD updated with deployment status

### Previous Bugfixes (2026-01-24)
- **Threshold 0.4 → 0.25:** Improved cross-language retrieval (German questions → English documents)
- **Query Expansion:** Follow-up questions now include conversation context for better pronoun resolution

---

## 1. Executive Summary

### Product Overview

Askvault is a Retrieval-Augmented Generation (RAG) application that enables users to upload documents and query them using natural language. Built as a recruiting challenge demonstration, it showcases end-to-end RAG capabilities with a modern tech stack: Next.js for the full-stack framework, Supabase with pgvector for vector storage, and Anthropic Claude for intelligent responses.

The application allows users to create isolated workspaces, upload documents (PDF, TXT, Markdown), and engage in conversational Q&A sessions where answers are grounded in the uploaded knowledge base. This approach ensures responses are accurate, contextual, and traceable to source documents.

### Core Value Proposition

- **Intelligent Document Q&A:** Ask questions in natural language and receive answers derived from your uploaded documents
- **Multi-Tenant Architecture:** Isolated workspaces ensure data separation and organization
- **Production-Ready Design:** Demonstrates professional patterns including streaming responses, proper error handling, and security best practices

### MVP Goal Statement

Deliver a functional, deployable RAG application within 4-5 hours that demonstrates competency in modern full-stack development, AI integration, and database design—exceeding typical recruiting challenge expectations through professional architecture and attention to detail.

---

## 2. Mission

### Mission Statement

To create an exemplary RAG application that showcases professional software engineering practices while demonstrating deep understanding of AI-powered document retrieval systems.

### Core Principles

1. **Simplicity Over Complexity:** Build only what's needed, but build it well
2. **Security First:** API keys and sensitive data handled correctly from day one
3. **User Experience:** Streaming responses and intuitive UI for a modern feel
4. **Production Patterns:** Code that could ship to production, not just a demo hack
5. **Documentation:** Clear explanations of design decisions and architecture

---

## 3. Target Users

### Primary Persona: Technical Recruiter / Hiring Manager

- **Role:** Evaluating the candidate's technical abilities
- **Technical Comfort:** High - comfortable reading code, understanding architecture
- **Goals:**
  - Quickly assess candidate's full-stack capabilities
  - Verify understanding of RAG concepts and implementation
  - Evaluate code quality and architectural decisions
- **Pain Points:**
  - Limited time to deeply review every submission
  - Difficulty distinguishing exceptional candidates from average ones

### Secondary Persona: End User (Demo Context)

- **Role:** Knowledge worker needing to query documents
- **Technical Comfort:** Medium - comfortable with web applications
- **Goals:**
  - Upload documents without technical barriers
  - Get accurate answers from uploaded content
  - Organize documents in separate workspaces
- **Pain Points:**
  - Information scattered across multiple documents
  - Time wasted searching through files manually

---

## 4. MVP Scope

### In Scope

**Core Functionality**
- ✅ User authentication (Supabase Auth) — *Completed Phase 1C*
- ✅ Workspace creation and management — *Completed Phase 4 (CreateWorkspaceDialog, DeleteWorkspaceDialog)*
- ✅ Document upload (PDF, TXT, MD) — *Completed Phase 2*
- ✅ Document processing pipeline (parsing, chunking, embedding) — *Completed Phase 2*
- ✅ Chat interface for Q&A — *Completed Phase 3*
- ✅ RAG query with context retrieval — *Completed Phase 3 + Bugfix (Query Expansion)*
- ✅ Streaming LLM responses — *Completed Phase 3*

**Technical**
- ✅ Next.js 14+ with App Router — *Actually Next.js 16.1.4*
- ✅ TypeScript with strict mode — *Completed Phase 1A*
- ✅ Supabase PostgreSQL with pgvector — *Completed Phase 1B*
- ✅ Row Level Security (RLS) for multi-tenancy — *Completed Phase 1B*
- ✅ HNSW index for vector search — *Completed Phase 1B*
- ✅ Tailwind CSS + shadcn/ui styling — *Completed Phase 1A (Tailwind v4)*

**Integration**
- ✅ Anthropic Claude API (Haiku 3.5) — *Completed Phase 3 (claude-3-haiku-20240307)*
- ✅ OpenAI Embeddings API (text-embedding-3-small) — *Completed Phase 2*
- ✅ Supabase Auth integration — *Completed Phase 1C*

**Deployment**
- ✅ Vercel deployment — *Completed Phase 4: https://askvault-demo.vercel.app*
- ✅ Supabase Cloud project — *Completed Phase 1B*
- ✅ Environment variable configuration — *Completed Phase 4 (5 variables in Vercel)*
- ✅ Live demo URL — *Completed Phase 4: https://askvault-demo.vercel.app*

### Out of Scope

**Deferred Features**
- ❌ DOCX file support (nice-to-have for future)
- ❌ Conversation history persistence
- ✅ Document deletion — *Implemented: DeleteDocumentDialog.tsx*
- ❌ Document editing
- ❌ Advanced chunking strategies (semantic, agentic)
- ❌ Multiple embedding models
- ❌ Citation highlighting in responses
- ❌ User profile management
- ❌ Team/organization sharing
- ❌ Usage analytics dashboard
- ❌ Rate limiting UI feedback
- ❌ Mobile-optimized responsive design
- ✅ Dark mode toggle — *Implemented: ThemeToggle.tsx with next-themes*
- ❌ Export/download functionality
- ❌ Webhook integrations

---

## 5. User Stories

### Primary User Stories

**US-1: User Registration & Login** ✅ *Completed Phase 1C*
> As a new user, I want to create an account and log in, so that I can access my personal workspace.

*Example:* User visits the app, clicks "Sign Up," enters email and password, receives confirmation, and is redirected to their dashboard.

*Implementation:* `src/components/auth/LoginForm.tsx`, `RegisterForm.tsx`, auto-creates "My Vault" workspace on signup.

**US-2: Workspace Management** ⚠️ *Partial*
> As a user, I want to create separate workspaces, so that I can organize different knowledge bases.

*Example:* User creates "Product Documentation" workspace for company docs and "Research Papers" workspace for academic materials.

*Status:* View/Select workspaces works. **Missing:** Create Workspace UI and `/api/workspaces` POST endpoint.

**US-3: Document Upload** ✅ *Completed Phase 2*
> As a user, I want to upload PDF, TXT, or Markdown files, so that I can build my knowledge base.

*Example:* User drags a PDF into the upload area, sees a progress indicator, and receives confirmation when processing completes.

*Implementation:* `src/components/documents/DocumentUpload.tsx`, `src/app/api/documents/route.ts`

**US-4: Document Q&A** ✅ *Completed Phase 3*
> As a user, I want to ask questions about my documents, so that I can quickly find information without manual searching.

*Example:* User uploads a product manual and asks "What are the installation requirements?" and receives an accurate answer with context.

*Implementation:* `src/app/api/chat/route.ts`, `src/lib/rag/retriever.ts` with Query Expansion for follow-up questions.

**US-5: Streaming Responses** ✅ *Completed Phase 3*
> As a user, I want to see responses appear word-by-word, so that I feel the system is responsive and engaging.

*Example:* After asking a question, the answer streams in real-time like ChatGPT, rather than appearing all at once after a long wait.

*Implementation:* Vercel AI SDK `useChat` + `streamText()` + `toDataStreamResponse()`.

### Technical User Stories

**US-6: Secure API Key Management** ✅ *Completed Phase 1A*
> As a developer reviewing this code, I want to see proper secret management, so that I can trust the candidate understands security.

*Example:* All API keys are loaded from environment variables, `.env.example` documents required variables, and no secrets appear in git history.

*Implementation:* `.env.example` with 5 variables, `.gitignore` excludes `.env*`, no hardcoded keys in codebase.

**US-7: Multi-Tenant Data Isolation** ✅ *Completed Phase 1B*
> As a system, I need to enforce workspace isolation, so that users cannot access each other's documents.

*Example:* User A's query only searches User A's documents, even if User B has similar content—enforced by RLS policies.

*Implementation:* RLS policies on `workspaces`, `documents`, `document_chunks` tables + `match_documents` RPC with `auth.uid()` check.

---

## 6. Core Architecture & Patterns

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Auth UI   │  │  Dashboard  │  │    Chat Interface   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (Route Handlers)                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  /api/auth  │  │/api/documents│ │     /api/chat       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Supabase Auth  │  │  Supabase DB    │  │  External APIs  │
│                 │  │  (pgvector)     │  │  Claude/OpenAI  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Directory Structure

```
askvault/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── api/
│   │   │   ├── chat/route.ts
│   │   │   ├── documents/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── workspaces/route.ts
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── [workspaceId]/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── documents/
│   │   │   ├── DocumentUpload.tsx
│   │   │   └── DocumentList.tsx
│   │   └── workspace/
│   │       ├── WorkspaceSelector.tsx
│   │       └── WorkspaceCreate.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── rag/
│   │   │   ├── chunker.ts
│   │   │   ├── embeddings.ts
│   │   │   └── retriever.ts
│   │   └── llm/
│   │       └── anthropic.ts
│   ├── hooks/
│   │   ├── useWorkspace.ts
│   │   └── useDocuments.ts
│   └── types/
│       ├── index.ts
│       └── database.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
├── .env.example
├── .env.local
├── CLAUDE.md
├── README.md
└── package.json
```

### Key Design Patterns

1. **Server Components First:** Default to server components, use client components only when necessary
2. **Route Handlers for API:** All backend logic in `app/api/` route handlers
3. **Separation of Concerns:** RAG logic (`lib/rag/`), LLM logic (`lib/llm/`), DB logic (`lib/supabase/`)
4. **Type Safety:** Generated Supabase types, strict TypeScript
5. **Streaming Pattern:** Vercel AI SDK for streaming responses

---

## 7. Tools/Features

### Feature 1: Authentication

**Purpose:** Secure user access and workspace isolation

**Components:**
- Login page with email/password
- Registration page
- Supabase Auth integration
- Protected routes via middleware

**Key Behaviors:**
- Redirect unauthenticated users to login
- Create default workspace on registration
- Session persistence across browser refresh

### Feature 2: Workspace Management

**Purpose:** Organize documents into isolated knowledge bases

**Operations:**
- Create new workspace
- Switch between workspaces
- View workspace document count

**Key Behaviors:**
- Default workspace created on signup
- RLS ensures complete data isolation
- Workspace selector in dashboard header

### Feature 3: Document Upload & Processing

**Purpose:** Ingest documents into the RAG pipeline

**Supported Formats:**
| Format | Parser | Max Size |
|--------|--------|----------|
| PDF | pdf-parse | 10MB |
| TXT | Native | 10MB |
| MD | Native | 10MB |

**Processing Pipeline:**
1. **Upload:** File received via multipart form
2. **Parse:** Extract text content from file
3. **Chunk:** Split into 512-token chunks with 50-token overlap
4. **Embed:** Generate embeddings via OpenAI API
5. **Store:** Insert chunks with embeddings into pgvector

### Feature 4: Chat Interface

**Purpose:** Natural language Q&A over documents

**Components:**
- Message list with user/assistant distinction
- Input field with send button
- Streaming response display
- Loading/error states

**Key Behaviors:**
- Messages stream in real-time
- Clear visual distinction between user and AI
- Error messages for failed queries
- Empty state prompts for new conversations

### Feature 5: RAG Query Engine

**Purpose:** Retrieve relevant context and generate answers

**Pipeline:**
```
Query → Embed → Vector Search → Rerank (optional) → LLM Prompt → Stream Response
```

**Configuration:**
- Top-K retrieval: 5 chunks (standard range: 3-5)
- Similarity threshold: 0.7 (cosine similarity, balance between precision/recall)
- Context window: ~4000 tokens max
- Temperature: 0.1 (low for factual RAG responses, reduces hallucination)

---

## 8. Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | Full-stack framework |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | latest | Component library |
| Vercel AI SDK | 3.x | Streaming responses |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js Route Handlers | 14.x | API endpoints |
| Supabase | latest | Database, Auth, Storage |
| PostgreSQL | 15+ | Relational database |
| pgvector | 0.6+ | Vector storage |

### External Services

| Service | Purpose | Pricing Model |
|---------|---------|---------------|
| Anthropic Claude | LLM responses | Pay-per-token |
| OpenAI | Embeddings | Pay-per-token |
| Supabase Cloud | Database hosting | Free tier |
| Vercel | Frontend hosting | Free tier |

### Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/ssr": "^0.1.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "@ai-sdk/anthropic": "^0.0.30",
    "ai": "^3.0.0",
    "openai": "^4.0.0",
    "pdf-parse": "^1.1.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.300.0",
    "zod": "^3.22.0"
  }
}
```

---

## 9. Security & Configuration

### Authentication & Authorization

**Approach:** Supabase Auth with email/password

**Authorization Flow:**
1. User authenticates via Supabase Auth
2. JWT token stored in secure cookie
3. Middleware validates token on protected routes
4. RLS policies enforce data access at database level

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase admin key (server only) |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `OPENAI_API_KEY` | Yes | OpenAI API key |

### Security Scope

**In Scope:**
- ✅ API keys in environment variables only
- ✅ Row Level Security on all tables
- ✅ Input validation with Zod
- ✅ HTTPS enforcement (via Vercel)
- ✅ Secure session management

**Out of Scope:**
- ❌ Rate limiting implementation
- ❌ CSRF protection (handled by Supabase)
- ❌ WAF/DDoS protection
- ❌ Penetration testing
- ❌ SOC2 compliance

### Deployment Configuration

**Vercel:**
- Environment variables set in dashboard
- Automatic HTTPS
- Edge network distribution

**Supabase:**
- Connection pooling enabled
- RLS enabled on all tables
- pgvector extension installed

---

## 10. API Specification

### POST /api/chat

**Purpose:** Process a RAG query and return streaming response

**Request:**
```typescript
{
  workspaceId: string;
  message: string;
}
```

**Response:** Server-Sent Events (SSE) stream

**Example:**
```bash
curl -X POST /api/chat \
  -H "Content-Type: application/json" \
  -d '{"workspaceId": "abc-123", "message": "What is the return policy?"}'
```

### POST /api/documents

**Purpose:** Upload and process a document

**Request:** `multipart/form-data`
- `file`: File (PDF, TXT, or MD)
- `workspaceId`: string

**Response:**
```typescript
{
  id: string;
  filename: string;
  chunkCount: number;
  status: "processed";
}
```

### GET /api/documents

**Purpose:** List documents in a workspace

**Query Parameters:**
- `workspaceId`: string (required)

**Response:**
```typescript
{
  documents: Array<{
    id: string;
    filename: string;
    contentType: string;
    createdAt: string;
    chunkCount: number;
  }>;
}
```

### POST /api/workspaces

**Purpose:** Create a new workspace

**Request:**
```typescript
{
  name: string;
}
```

**Response:**
```typescript
{
  id: string;
  name: string;
  createdAt: string;
}
```

### GET /api/workspaces

**Purpose:** List user's workspaces

**Response:**
```typescript
{
  workspaces: Array<{
    id: string;
    name: string;
    documentCount: number;
    createdAt: string;
  }>;
}
```

---

## 11. Success Criteria

### MVP Success Definition

The MVP is successful when:
1. ✅ A user can sign up, upload a document, and ask questions about it — *Working*
2. ✅ The application is deployed and accessible via public URL — *https://askvault-demo.vercel.app*
3. ✅ The recruiter can test the full flow without setup — *Live demo available*

### Functional Requirements

- ✅ User can register and log in — *Completed Phase 1C*
- ✅ User can create workspaces — *Completed Phase 4 (CreateWorkspaceDialog)*
- ✅ User can upload PDF, TXT, MD files — *Completed Phase 2*
- ✅ Documents are processed and chunked correctly — *Completed Phase 2 (2000 char chunks, 200 overlap)*
- ✅ User can ask questions and receive relevant answers — *Completed Phase 3 + Bugfix*
- ✅ Responses stream in real-time — *Completed Phase 3*
- ✅ Data is isolated between users (RLS working) — *Completed Phase 1B*

### Quality Indicators

- **Response Time:** First token < 2 seconds ✅ *Achieved (~1-2s)*
- **Upload Processing:** < 30 seconds for 10MB file ✅ *Achieved*
- **Relevance:** Answers cite correct document sections ✅ *Working with Query Expansion*
- **Error Handling:** Graceful failures with user feedback ✅ *Implemented*

### User Experience Goals

- ✅ Clean, professional UI — *Implemented with shadcn/ui*
- ✅ Intuitive document upload flow — *Drag-drop with progress*
- ✅ Responsive chat interface — *Auto-scroll, streaming display*
- ✅ Clear loading and error states — *Implemented*

---

## 12. Implementation Phases

### Phase 1: Foundation ✅ COMPLETED

**Goal:** Set up project structure and authentication

**Deliverables:**
- ✅ Next.js project with TypeScript — *Phase 1A (Next.js 16.1.4, React 19)*
- ✅ Tailwind CSS + shadcn/ui configured — *Phase 1A (Tailwind v4)*
- ✅ Supabase project created — *Phase 1B*
- ✅ Database schema deployed (workspaces, documents, chunks) — *Phase 1B*
- ✅ Authentication flow working — *Phase 1C*
- ✅ Protected dashboard route — *Phase 1C*

**Validation:** ✅ All passed
- User can sign up, log in, and see dashboard
- Database tables exist with RLS policies

**Execution Reports:**
- `.agents/execution-reports/phase-1a-project-setup.md`
- `.agents/execution-reports/phase-1b-supabase-integration.md`
- `.agents/execution-reports/phase-1c-ui-auth-dashboard.md`

### Phase 2: Document Pipeline ✅ COMPLETED

**Goal:** Implement document upload and processing

**Deliverables:**
- ✅ File upload component — *DocumentUpload.tsx with drag-drop*
- ✅ PDF/TXT/MD parsing — *pdf-parse v2.4.5*
- ✅ Chunking implementation — *LangChain RecursiveCharacterTextSplitter (2000/200)*
- ✅ Embedding generation — *OpenAI text-embedding-3-small*
- ✅ Vector storage in pgvector — *1536 dimensions, HNSW index*
- ✅ Document list display — *DocumentList.tsx with chunk counts*

**Validation:** ✅ All passed
- Upload a PDF and verify chunks in database
- Embeddings have correct dimensions (1536)

**Execution Report:** `.agents/execution-reports/phase-2-document-pipeline.md`

### Phase 3: RAG Query Engine ✅ COMPLETED

**Goal:** Implement the chat and retrieval system

**Deliverables:**
- ✅ Chat UI component — *ChatInterface.tsx with useChat hook*
- ✅ Vector similarity search — *match_documents RPC, threshold 0.25*
- ✅ Context assembly — *assembleContext() with source attribution*
- ✅ LLM prompt construction — *buildSystemPrompt() with RAG rules*
- ✅ Streaming response integration — *Vercel AI SDK streamText()*

**Validation:** ✅ All passed
- Ask a question, receive relevant answer
- Response streams word-by-word

**Bugfixes Applied:**
- Threshold reduced 0.4 → 0.25 for cross-language retrieval (DE→EN)
- Query Expansion added for follow-up questions with pronouns

**Execution Report:** `.agents/execution-reports/phase-3-rag-query-engine.md`

### Phase 4: Polish & Deploy ✅ COMPLETED

**Goal:** Production-ready deployment

**Deliverables:**
- ✅ Error handling throughout — *Already implemented*
- ✅ Loading states — *Already implemented*
- ✅ Vercel deployment — *https://askvault-demo.vercel.app*
- ✅ Environment variables configured — *5 variables in Vercel Dashboard*
- ✅ README documentation — *Updated with live URL and setup instructions*
- ✅ E2E smoke tests — *Playwright, 6 tests passing*
- ✅ Workspace Create/Delete UI — *CreateWorkspaceDialog, DeleteWorkspaceDialog*

**Validation:** ✅ All passed
- Live URL works end-to-end
- README provides clear setup instructions
- E2E smoke tests pass against localhost (6/6)
- E2E smoke tests pass against production (6/6, 14.1s)

**Execution Report:** `.agents/execution-reports/phase-4d-vercel-deployment.md`

**Remaining:**
- ⚠️ Final git commit with documentation updates

---

## 13. Future Considerations

### Post-MVP Enhancements

1. **Conversation Memory:** Persist chat history for context continuity
2. **Citation Highlighting:** Show which chunks informed each answer
3. **Advanced Chunking:** Semantic chunking based on content structure
4. **DOCX Support:** Word document processing
5. **Bulk Upload:** Multiple files at once
6. **Perplexity-Style Phasen-UI:** Visuelle Statusanzeige während RAG-Pipeline (Searching → Found → Generating → Complete)
7. **Custom useChat Hook:** Abstrahierter Hook mit Phase-State, Source-Tracking und automatischem Status-Management
8. **AI SDK v4/v5 Upgrade:** Migration auf neuere AI SDK Version für Claude 3.5 Haiku Support (aktuell: ai@3.x + claude-3-haiku wegen Versions-Inkompatibilität)

### Integration Opportunities

1. **Slack/Discord Bot:** Query knowledge base from chat platforms
2. **Chrome Extension:** Highlight and save web content
3. **API Access:** Programmatic access for power users
4. **Zapier/Make:** Workflow automation integration

### Advanced Features

1. **Re-ranking:** Cohere reranker for improved relevance
2. **Hybrid Search:** Combine vector + keyword search
3. **Fine-tuned Embeddings:** Domain-specific embedding models
4. **Analytics:** Query patterns and usage insights
5. **Teams:** Shared workspaces with permissions

---

## 14. Risks & Mitigations

### Risk 1: API Cost Overrun

**Risk:** Embedding/LLM costs exceed budget during demo/testing

**Mitigation:**
- Use Claude Haiku (cheapest model)
- Use text-embedding-3-small (cheapest embeddings)
- Set hard budget limit in Anthropic console
- Add rate limiting if needed

### Risk 2: Slow Document Processing

**Risk:** Large files take too long to process

**Mitigation:**
- Set 10MB file size limit
- Show progress indicator during processing
- Process embeddings in batches
- Consider background processing for v2

### Risk 3: Poor Retrieval Quality

**Risk:** Answers are irrelevant or hallucinated

**Mitigation:**
- Tune chunk size and overlap
- Adjust similarity threshold
- Include source attribution in prompts
- Test with diverse document types

### Risk 4: Supabase Free Tier Limits

**Risk:** Database limits hit during demo

**Mitigation:**
- Monitor usage in Supabase dashboard
- Clean up test data regularly
- Upgrade tier if needed (minimal cost)

### Risk 5: Deployment Failures

**Risk:** Vercel deployment fails or environment issues

**Mitigation:**
- Test locally with production env vars
- Verify all env vars set in Vercel
- Keep deployment simple (no complex builds)
- Document rollback procedure

---

## 15. Appendix

### Related Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Project Decisions | `.agents/decisions/001-project-decisions.md` | Architecture decisions |
| CLAUDE.md Research | `.agents/research/claude-md-research.md` | Research documentation |
| CLAUDE.md | `./CLAUDE.md` | AI coding assistant configuration |
| README | `./README.md` | User-facing documentation |

### Key Dependencies

| Dependency | Documentation |
|------------|---------------|
| Next.js | https://nextjs.org/docs |
| Supabase | https://supabase.com/docs |
| pgvector | https://github.com/pgvector/pgvector |
| Anthropic SDK | https://docs.anthropic.com |
| Vercel AI SDK | https://sdk.vercel.ai/docs |
| shadcn/ui | https://ui.shadcn.com |

### Database Schema

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document chunks with embeddings
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  chunk_index INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create HNSW index for fast similarity search
CREATE INDEX ON document_chunks
USING hnsw (embedding vector_cosine_ops);

-- Row Level Security Policies
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workspaces"
ON workspaces FOR ALL
USING (owner_id = auth.uid());

CREATE POLICY "Users can manage documents in own workspaces"
ON documents FOR ALL
USING (workspace_id IN (
  SELECT id FROM workspaces WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can manage chunks in own documents"
ON document_chunks FOR ALL
USING (document_id IN (
  SELECT d.id FROM documents d
  JOIN workspaces w ON d.workspace_id = w.id
  WHERE w.owner_id = auth.uid()
));
```

---

**Document End**

*This PRD was generated based on the recruiting challenge requirements and conversation context. It provides a comprehensive blueprint for implementing the Askvault RAG application.*

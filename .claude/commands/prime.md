---
description: Prime agent with codebase understanding
---

# Prime: Load Project Context (Askvault)

## Objective

Build comprehensive understanding of Askvault - a RAG-powered knowledge vault that lets users upload documents and query them using natural language, built with Next.js, Supabase, and Claude.

## Process

### 1. Analyze Project Structure

Use the Glob tool to show the project's directory structure. Focus on:
- Top-level directories (src/, public/, .agents/, supabase/)
- Important config files (package.json, tsconfig.json, CLAUDE.md)
- Avoid node_modules, .next, dist, build directories

### 2. Read Core Documentation (Priority Order)

**MUST READ:**
- `.agents/PRD.md` - Product requirements, architecture, API spec
- `CLAUDE.md` - Development guidelines, coding standards, patterns
- `README.md` - Project overview, tech stack, setup instructions

**OPTIONAL (for deeper context):**
- `.agents/decisions/001-project-decisions.md` - Architecture decisions

### 3. Identify Key Files & Configuration

**Core Configuration (READ):**
- `package.json` - Dependencies and npm scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - TailwindCSS configuration

**Supabase (READ if exists):**
- `supabase/migrations/` - Database schema
- `src/lib/supabase/` - Supabase client configuration

**Key Business Logic (SCAN):**
- `src/lib/rag/` - RAG pipeline (chunking, embeddings, retrieval)
- `src/lib/llm/` - Anthropic Claude integration
- `src/app/api/` - API route handlers

**UI Components (SCAN):**
- `src/components/chat/` - Chat interface
- `src/components/documents/` - Document upload/management
- `src/components/workspace/` - Workspace management

### 4. Check Current Implementation Status

Based on PRD.md, identify:
- Which features are already implemented
- Which features need to be implemented
- Any known issues or bugs

### 5. Understand Current Development State

Check git status if available, note deployment status.
Use glob or other available tools.

## Output Report

Provide a concise, actionable summary:

### 1. Project Identity
- **Name:** Askvault
- **Version:** Extract from package.json
- **Purpose:** RAG-powered document Q&A with multi-tenant workspaces
- **Current Status:** [Assess from codebase]

### 2. Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** Supabase (PostgreSQL + pgvector)
- **Auth:** Supabase Auth with RLS
- **LLM:** Anthropic Claude Haiku 3.5
- **Embeddings:** OpenAI text-embedding-3-small
- **UI:** Tailwind CSS + shadcn/ui

### 3. Architecture Overview
- **Frontend:** React components in `src/components/`
- **Business Logic:** Service classes in `src/lib/`
- **API Routes:** Server-side in `src/app/api/`
- **Database:** Supabase with pgvector for embeddings

### 4. Core Features Status
| Feature | Status |
|---------|--------|
| Authentication | [Status] |
| Workspace Management | [Status] |
| Document Upload | [Status] |
| Document Processing (Chunking) | [Status] |
| Embedding Generation | [Status] |
| Chat Interface | [Status] |
| RAG Query Engine | [Status] |
| Streaming Responses | [Status] |

### 5. Implementation Phases (from PRD)
| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation (Auth, DB) | [Status] |
| 2 | Document Pipeline | [Status] |
| 3 | RAG Query Engine | [Status] |
| 4 | Polish & Deploy | [Status] |

### 6. Immediate Next Steps
Based on current state, prioritize:
1. [Next action]
2. [Next action]
3. [Next action]

### 7. Key Files to Know
- `src/app/api/chat/route.ts` - RAG query endpoint
- `src/app/api/documents/route.ts` - Document upload
- `src/lib/rag/chunker.ts` - Chunking logic
- `src/lib/rag/embeddings.ts` - Embedding generation
- `src/lib/rag/retriever.ts` - Vector search

**Keep it scannable - bullet points, tables, clear sections.**
**Focus on what needs to be BUILT, not what's already working.**

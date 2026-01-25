# Feature: Phase 2 - Document Pipeline

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

## Feature Description

Implement the complete document upload and processing pipeline for the Askvault RAG application. Users can upload PDF, TXT, and Markdown files which are then parsed, chunked into semantic segments, embedded using OpenAI's text-embedding-3-small model, and stored in Supabase pgvector for later retrieval.

**Key Differentiators (to stand out from other candidates):**
- Source citations showing which document informed the answer
- Professional error handling with user-friendly messages
- Loading states with progress indication
- Clean separation of concerns (parsing, chunking, embedding as separate modules)

## User Story

As a **user with documents**, I want to **upload PDF, TXT, or Markdown files to my workspace**, so that **I can later ask questions and get answers based on my document content**.

## Problem Statement

Users have documents containing information they need to query. Currently, there's no way to ingest documents into the system. Without document upload and processing, the RAG system cannot function.

## Solution Statement

Implement a document processing pipeline consisting of:
1. **Upload API** - Receive files via multipart form data
2. **Parser Module** - Extract text from PDF/TXT/MD files
3. **Chunker Module** - Split text into 512-token chunks with 50-token overlap
4. **Embeddings Module** - Generate 1536-dimensional vectors via OpenAI API
5. **Storage** - Insert documents and chunks into Supabase with embeddings
6. **UI Components** - Upload interface and document list display

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium-High
**Primary Systems Affected**: API Routes, RAG Pipeline, Database, UI
**Dependencies**: OpenAI API (embeddings), pdf-parse library, @langchain/textsplitters

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING!)

| File | Lines | Why |
|------|-------|-----|
| `CLAUDE.md` | 83-120 | RAG Architecture, Chunking Strategy, Query Pipeline |
| `CLAUDE.md` | 180-233 | Streaming pattern, Error handling, File upload validation |
| `CLAUDE.md` | 64-73 | Import order convention |
| `src/types/index.ts` | Full | Existing Document, DocumentChunk interfaces |
| `src/lib/supabase/server.ts` | Full | Server-side Supabase client pattern |
| `src/lib/supabase/client.ts` | Full | Browser-side Supabase client pattern |
| `src/app/dashboard/[workspaceId]/page.tsx` | Full | Current workspace page (needs update) |
| `src/components/ui/button.tsx` | Full | Button component API |
| `src/components/ui/card.tsx` | Full | Card component API |
| `src/components/auth/RegisterForm.tsx` | Full | Form pattern with loading/error states |
| `supabase/migrations/001_initial_schema.sql` | Full | Database schema, RLS policies |
| `.agents/PRD.md` | 299-316 | Document Upload & Processing spec |
| `.agents/PRD.md` | 481-517 | API specification for documents endpoint |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/lib/rag/parser.ts` | Text extraction from PDF/TXT/MD |
| `src/lib/rag/chunker.ts` | Text splitting with RecursiveCharacterTextSplitter |
| `src/lib/rag/embeddings.ts` | OpenAI embedding generation |
| `src/app/api/documents/route.ts` | POST (upload) and GET (list) endpoints |
| `src/components/documents/DocumentUpload.tsx` | File upload UI with drag-drop |
| `src/components/documents/DocumentList.tsx` | Display uploaded documents |
| `src/components/ui/progress.tsx` | shadcn Progress component |

### Files to Modify

| File | Changes |
|------|---------|
| `src/app/dashboard/[workspaceId]/page.tsx` | Replace placeholder with DocumentUpload + DocumentList |
| `src/types/index.ts` | Add DocumentWithChunkCount interface |
| `package.json` | Add new dependencies |

### Relevant Documentation

| Source | Section | Why |
|--------|---------|-----|
| [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings) | Usage | Embedding generation |
| [pdf-parse npm](https://www.npmjs.com/package/pdf-parse) | API | PDF text extraction |
| [@langchain/textsplitters](https://www.npmjs.com/package/@langchain/textsplitters) | RecursiveCharacterTextSplitter | Chunking |
| [Vercel AI SDK](https://sdk.vercel.ai/docs) | Streaming | Future chat integration |
| [shadcn Progress](https://ui.shadcn.com/docs/components/progress) | Usage | Upload progress UI |
| [Supabase Insert](https://supabase.com/docs/reference/javascript/insert) | Bulk insert | Storing chunks |

### Patterns to Follow

**Import Order (from CLAUDE.md):**
```typescript
// Order: React → Next → External → Internal → Types
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import type { Document } from '@/types';
```

**Error Handling (from CLAUDE.md lines 203-221):**
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

**File Validation (from CLAUDE.md lines 225-233):**
```typescript
const ALLOWED_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Unsupported file type');
}
```

**Form Component Pattern (from RegisterForm.tsx):**
```typescript
'use client';

const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Show error in UI
{error && (
  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
    {error}
  </div>
)}

// Disable button while loading
<Button disabled={loading}>
  {loading ? "Processing..." : "Upload"}
</Button>
```

**Supabase Server Client (from server.ts):**
```typescript
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  // ... use supabase
}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Dependencies & Types

Install required packages and extend type definitions.

### Phase 2: RAG Pipeline Modules

Create the core processing modules: parser, chunker, embeddings.

### Phase 3: API Route

Implement the document upload and list endpoints.

### Phase 4: UI Components

Build the upload interface and document list display.

### Phase 5: Integration & Testing

Connect everything and validate the full flow.

---

## STEP-BY-STEP TASKS

### Task 1: INSTALL Dependencies

- **IMPLEMENT**: Add required npm packages for document processing
- **COMMAND**:
  ```bash
  npm install openai pdf-parse @langchain/textsplitters @langchain/core
  npm install -D @types/pdf-parse
  ```
- **PACKAGES**:
  - `openai` - OpenAI API client for embeddings
  - `pdf-parse` - PDF text extraction
  - `@langchain/textsplitters` - RecursiveCharacterTextSplitter
  - `@langchain/core` - Required peer dependency
- **VALIDATE**: `npm ls openai pdf-parse @langchain/textsplitters` shows installed versions

---

### Task 2: UPDATE `src/types/index.ts` - Add Types

- **IMPLEMENT**: Add DocumentWithChunkCount and upload-related types
- **PATTERN**: Follow existing interface style in file
- **CHANGES**: Add after existing interfaces:
  ```typescript
  export interface DocumentWithChunkCount extends Document {
    chunk_count: number;
  }

  export interface UploadProgress {
    stage: 'uploading' | 'parsing' | 'chunking' | 'embedding' | 'storing' | 'complete';
    progress: number; // 0-100
    message: string;
  }

  export interface DocumentUploadResponse {
    id: string;
    filename: string;
    chunkCount: number;
    status: 'processed';
  }
  ```
- **VALIDATE**: `npm run type-check` passes

---

### Task 3: CREATE `src/lib/rag/parser.ts` - Text Extraction

- **IMPLEMENT**: Module to extract text from PDF, TXT, and Markdown files
- **STRUCTURE**:
  ```typescript
  // Imports: pdf-parse

  // parseFile(file: File): Promise<string>
  //   - Check file.type
  //   - PDF: use pdf-parse on ArrayBuffer
  //   - TXT/MD: use file.text()
  //   - Throw error for unsupported types

  // ALLOWED_TYPES constant
  // MAX_FILE_SIZE constant (10MB)

  // validateFile(file: File): void
  //   - Check type against ALLOWED_TYPES
  //   - Check size against MAX_FILE_SIZE
  //   - Throw descriptive errors
  ```
- **GOTCHA**: pdf-parse needs ArrayBuffer, not File directly
- **GOTCHA**: Handle empty PDF content gracefully
- **VALIDATE**: File exists, no TypeScript errors

---

### Task 4: CREATE `src/lib/rag/chunker.ts` - Text Chunking

- **IMPLEMENT**: Split text into overlapping chunks using RecursiveCharacterTextSplitter
- **VERIFIED IMPORT**:
  ```typescript
  import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
  ```
- **STRUCTURE**:
  ```typescript
  const CHUNK_SIZE = 2000;    // ~512 tokens in characters
  const CHUNK_OVERLAP = 200;  // ~50 tokens in characters

  export async function chunkText(text: string): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
      separators: ["\n\n", "\n", " ", ""],
    });
    return splitter.splitText(text);
  }
  ```
- **PATTERN**: RecursiveCharacterTextSplitter uses character count, not tokens
  - 512 tokens ≈ 2000 characters (rough estimate)
  - 50 tokens ≈ 200 characters overlap
- **GOTCHA**: LangChain uses character count, convert from tokens
- **VALIDATE**: File exists, no TypeScript errors

---

### Task 5: CREATE `src/lib/rag/embeddings.ts` - Embedding Generation

- **IMPLEMENT**: Generate embeddings via OpenAI API
- **VERIFIED PATTERN**:
  ```typescript
  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  export async function generateEmbedding(text: string): Promise<number[]> {
    const result = await openai.embeddings.create({
      input: text,
      model: 'text-embedding-3-small',
    });
    return result.data[0].embedding; // Returns number[] with 1536 dimensions
  }

  export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    const result = await openai.embeddings.create({
      input: texts,
      model: 'text-embedding-3-small',
    });
    return result.data.map(d => d.embedding);
  }
  ```
- **SUPABASE INSERT PATTERN** (verified):
  ```typescript
  // Embedding is just a plain JavaScript array - no special formatting!
  const { error } = await supabase.from('document_chunks').insert({
    document_id: docId,
    content: chunkText,
    embedding: embedding,  // number[] directly
    chunk_index: i,
  });
  ```
- **GOTCHA**: OpenAI API key must be in environment variables (server-side only)
- **GOTCHA**: Batch API has input limit (~8000 tokens total) - may need to batch in groups
- **VALIDATE**: File exists, no TypeScript errors

---

### Task 6: CREATE `src/app/api/documents/route.ts` - API Endpoints

- **IMPLEMENT**: POST for upload, GET for listing documents
- **CRITICAL**: Add `export const runtime = 'nodejs';` at top (pdf-parse needs Node.js APIs)
- **STRUCTURE**:
  ```typescript
  // Imports: NextResponse, createClient, parser, chunker, embeddings, zod

  // POST handler:
  // 1. Parse multipart form data (file + workspaceId)
  // 2. Validate file (type, size)
  // 3. Verify workspace ownership via RLS
  // 4. Parse text from file
  // 5. Chunk text
  // 6. Generate embeddings for all chunks
  // 7. Insert document record
  // 8. Insert chunks with embeddings
  // 9. Return DocumentUploadResponse

  // GET handler:
  // 1. Get workspaceId from query params
  // 2. Fetch documents with chunk count
  // 3. Return array of DocumentWithChunkCount

  // Error handling:
  // - 400 for validation errors
  // - 401 for auth errors
  // - 500 for server errors
  // - Always return JSON with error message
  ```
- **PATTERN**: Follow error handling from CLAUDE.md
- **GOTCHA**: formData() is async in Next.js App Router
- **GOTCHA**: Use server-side Supabase client for DB operations
- **VALIDATE**: File exists, no TypeScript errors

---

### Task 7: ADD shadcn Progress Component

- **IMPLEMENT**: Add Progress component for upload feedback
- **COMMAND**:
  ```bash
  npx shadcn@latest add progress
  ```
- **CREATES**: `src/components/ui/progress.tsx`
- **VALIDATE**: File exists at `src/components/ui/progress.tsx`

---

### Task 8: CREATE `src/components/documents/DocumentUpload.tsx`

- **IMPLEMENT**: File upload component with drag-drop and progress
- **STRUCTURE**:
  ```typescript
  'use client';

  // Props: workspaceId: string, onUploadComplete: () => void

  // State:
  // - file: File | null
  // - uploading: boolean
  // - progress: UploadProgress | null
  // - error: string | null
  // - dragActive: boolean

  // Features:
  // 1. Drag-drop zone with visual feedback
  // 2. Click to select file
  // 3. File type validation (PDF, TXT, MD)
  // 4. Size validation (10MB max)
  // 5. Upload progress display
  // 6. Error display
  // 7. Success feedback

  // UI:
  // - Card with dashed border (drag zone)
  // - Upload icon (lucide-react)
  // - "Drag and drop or click to upload"
  // - Supported formats hint
  // - Progress bar during upload
  // - Selected file name display
  ```
- **PATTERN**: Follow RegisterForm.tsx for loading/error state pattern
- **IMPORTS**: useState, Card components, Button, Progress, Upload icon from lucide-react
- **VALIDATE**: File exists, no TypeScript errors

---

### Task 9: CREATE `src/components/documents/DocumentList.tsx`

- **IMPLEMENT**: Display list of uploaded documents with metadata
- **STRUCTURE**:
  ```typescript
  // Props: documents: DocumentWithChunkCount[]

  // Features:
  // 1. List of document cards
  // 2. Show filename, upload date, chunk count
  // 3. File type icon (PDF/TXT/MD)
  // 4. Empty state when no documents

  // UI per document:
  // - Card with hover effect
  // - FileText icon (lucide-react)
  // - Filename (truncated if long)
  // - "X chunks" badge
  // - Upload date formatted

  // Empty state:
  // - Dashed border card
  // - "No documents yet" message
  // - Hint to upload first document
  ```
- **PATTERN**: Follow workspace card pattern from dashboard/page.tsx
- **VALIDATE**: File exists, no TypeScript errors

---

### Task 10: UPDATE `src/app/dashboard/[workspaceId]/page.tsx`

- **IMPLEMENT**: Replace placeholders with actual document functionality
- **CHANGES**:
  ```typescript
  // Add imports: DocumentUpload, DocumentList

  // Fetch documents for workspace:
  // const { data: documents } = await supabase
  //   .from('documents')
  //   .select('*, document_chunks(count)')
  //   .eq('workspace_id', workspaceId)
  //   .order('created_at', { ascending: false });

  // Transform to DocumentWithChunkCount[]

  // Replace placeholder Cards with:
  // - DocumentUpload component (client component wrapper needed)
  // - DocumentList component (can be server component)

  // Layout:
  // - Left side: Document list (wider)
  // - Right side: Upload zone
  // OR
  // - Top: Upload zone
  // - Bottom: Document list
  ```
- **GOTCHA**: Server Component can't use client components directly for interactivity
- **GOTCHA**: Need to handle refresh after upload (revalidatePath or client refresh)
- **VALIDATE**: Page renders without errors

---

### Task 11: CREATE Client Wrapper for Upload

- **IMPLEMENT**: Client wrapper component for the workspace page upload functionality
- **FILE**: `src/app/dashboard/[workspaceId]/WorkspaceClient.tsx`
- **STRUCTURE**:
  ```typescript
  'use client';

  // Props: workspaceId: string, initialDocuments: DocumentWithChunkCount[]

  // State: documents (for optimistic updates after upload)

  // handleUploadComplete:
  //   - Refresh document list via API call
  //   - OR use router.refresh()

  // Render:
  //   - DocumentUpload with onUploadComplete
  //   - DocumentList with documents
  ```
- **PATTERN**: Separation of server data fetching and client interactivity
- **VALIDATE**: File exists, no TypeScript errors

---

## TESTING STRATEGY

### Unit Tests

Not required for MVP, but structure code for testability:
- Parser module should be pure functions
- Chunker should be deterministic
- Embeddings module should be mockable

### Integration Tests

Manual testing via browser:
1. Upload PDF file → verify chunks in Supabase
2. Upload TXT file → verify chunks in Supabase
3. Upload MD file → verify chunks in Supabase
4. Verify embeddings have 1536 dimensions

### Edge Cases

- [ ] Empty file upload → show error
- [ ] File too large (>10MB) → show error
- [ ] Unsupported file type → show error
- [ ] PDF with no extractable text → handle gracefully
- [ ] Network error during upload → show retry option
- [ ] Duplicate filename → allow (different IDs)

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
npm run lint
npm run type-check
```

### Level 2: Build

```bash
npm run build
```

### Level 3: Development Server

```bash
npm run dev
# Visit http://localhost:3000/dashboard/{workspaceId}
```

### Level 4: Manual Validation

1. **File Upload Test:**
   - Go to workspace page
   - Upload a small PDF file
   - Verify success message
   - Check Supabase: `documents` table has new row
   - Check Supabase: `document_chunks` table has chunks with embeddings

2. **Document List Test:**
   - After upload, document appears in list
   - Shows correct filename and chunk count
   - Shows upload date

3. **Error Handling Test:**
   - Try uploading .exe file → error message
   - Try uploading 50MB file → error message
   - Disconnect network during upload → error handling

4. **Database Verification:**
   ```sql
   -- Check documents
   SELECT id, filename, content_type, created_at
   FROM documents
   WHERE workspace_id = 'your-workspace-id';

   -- Check chunks with embedding dimensions
   SELECT id, document_id, chunk_index,
          length(content) as content_length,
          array_length(embedding, 1) as embedding_dims
   FROM document_chunks
   WHERE document_id = 'your-document-id';
   ```

---

## ACCEPTANCE CRITERIA

- [ ] User can upload PDF files (parsed correctly)
- [ ] User can upload TXT files
- [ ] User can upload Markdown files
- [ ] Files are validated for type and size (10MB max)
- [ ] Text is chunked into ~512 token segments with overlap
- [ ] Each chunk has a 1536-dimension embedding
- [ ] Documents and chunks are stored in Supabase
- [ ] Document list shows all uploads with chunk count
- [ ] Upload progress is visible to user
- [ ] Errors are displayed with user-friendly messages
- [ ] RLS ensures users only see their own documents
- [ ] All validation commands pass (lint, type-check, build)

---

## COMPLETION CHECKLIST

- [ ] Task 1: Dependencies installed (openai, pdf-parse, @langchain/textsplitters)
- [ ] Task 2: Types extended (DocumentWithChunkCount, UploadProgress)
- [ ] Task 3: Parser module created (PDF/TXT/MD extraction)
- [ ] Task 4: Chunker module created (RecursiveCharacterTextSplitter)
- [ ] Task 5: Embeddings module created (OpenAI API)
- [ ] Task 6: API route created (POST upload, GET list)
- [ ] Task 7: Progress component added (shadcn)
- [ ] Task 8: DocumentUpload component created
- [ ] Task 9: DocumentList component created
- [ ] Task 10: Workspace page updated
- [ ] Task 11: Client wrapper created
- [ ] All validation commands pass
- [ ] Manual testing complete
- [ ] Documents visible in Supabase

---

## NOTES

### Design Decisions

1. **RecursiveCharacterTextSplitter over Semantic Chunking:**
   - 85-90% recall vs 95% for semantic, but no extra API costs
   - Good enough for recruiting challenge scope
   - Can mention semantic chunking as future improvement

2. **text-embedding-3-small over large:**
   - 5x cheaper, adequate quality for demo
   - 1536 dimensions match existing schema
   - Can mention upgrading as optimization path

3. **No File Storage (Supabase Storage):**
   - Only store extracted text/chunks
   - Original files not needed after processing
   - Simpler architecture, less storage cost

4. **Source Citations (Differentiator):**
   - Document name stored with chunks via document_id FK
   - Phase 3 can show "Source: filename.pdf" in answers
   - Low effort, high impact for recruiter impression

### Security Considerations

1. **File Validation:**
   - MIME type check (can be spoofed but good first line)
   - File size limit (10MB prevents DoS)
   - No file execution (only text extraction)

2. **API Key Protection:**
   - OpenAI key only used server-side
   - Never exposed to client
   - Loaded from environment variables

3. **RLS Enforcement:**
   - Documents filtered by workspace ownership
   - Chunks filtered by document → workspace → user chain
   - Service role key only used for operations requiring bypass

### Potential Improvements (mention in README)

1. Background processing for large files (queue system)
2. Semantic chunking for higher accuracy
3. Multiple embedding models option
4. Bulk upload support
5. Document deletion functionality

### Dependencies on Phase 3

Phase 3 (RAG Query Engine) will need:
- `document_chunks` table populated with embeddings ✓
- `workspace_id` available for scoping searches
- Source document info for citations (via document_id FK)

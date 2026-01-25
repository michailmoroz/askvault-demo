# Decision Record: Phase 2 - Document Pipeline

**Date:** 2026-01-24
**Status:** Approved
**Context:** Recruiting Challenge RAG Application

---

## 1. Chunking Strategy

### Decision: RecursiveCharacterTextSplitter (512 tokens, 50 overlap)

### Alternatives Considered

| Strategy | Recall | Compute Cost | Complexity |
|----------|--------|--------------|------------|
| Fixed-Size | ~70% | Low | Low |
| **Recursive (chosen)** | **85-90%** | **Medium** | **Low** |
| Semantic | ~95% | High (API calls per sentence) | High |
| Agentic | ~95%+ | Very High | Very High |

### Rationale

1. **Best Balance für MVP:** 85-90% Recall ist ausreichend für Demo-Zwecke
2. **Keine zusätzlichen API-Kosten:** Semantic Chunking würde 200-300 Embeddings pro 10.000-Wort-Dokument nur für Chunking benötigen
3. **Industry Standard:** LangChain's Default-Empfehlung für RAG
4. **Einfach zu erklären:** Recruiter kann die Logik nachvollziehen

### Parameters

```
Chunk Size: 512 tokens ≈ 2000 characters
Overlap: 50 tokens ≈ 200 characters (~10%)
Separators: ["\n\n", "\n", " ", ""] (Paragraph → Sentence → Word)
```

### Sources

- [Weaviate: Chunking Strategies for RAG](https://weaviate.io/blog/chunking-strategies-for-rag)
- [Firecrawl: Best Chunking Strategies RAG 2025](https://www.firecrawl.dev/blog/best-chunking-strategies-rag-2025)
- [Stack Overflow: Breaking up is hard to do - Chunking in RAG](https://stackoverflow.blog/2024/12/27/breaking-up-is-hard-to-do-chunking-in-rag-applications/)
- [LangChain OpenTutorial: RecursiveCharacterTextSplitter](https://langchain-opentutorial.gitbook.io/langchain-opentutorial/07-textsplitter/02-recursivecharactertextsplitter)

---

## 2. Embedding Model

### Decision: OpenAI text-embedding-3-small (1536 Dimensionen)

### Alternatives Considered

| Model | Dimensions | Price/1M Tokens | MTEB Score |
|-------|------------|-----------------|------------|
| **text-embedding-3-small (chosen)** | **1536** | **$0.02** | **62.3%** |
| text-embedding-3-large | 3072 | $0.13 | 64.6% |
| text-embedding-ada-002 (legacy) | 1536 | $0.10 | 61.0% |
| Cohere Embed v3 | 1024 | $0.10 | ~63% |

### Rationale

1. **5x günstiger als ada-002:** $0.02 vs $0.10 pro Million Tokens
2. **13% besser als ada-002:** Trotz niedrigerem Preis höhere Qualität
3. **Schema-Kompatibilität:** DB ist bereits auf 1536 Dimensionen konfiguriert
4. **Ausreichend für RAG:** Für Recruiting Challenge ist Marginalverbesserung von large nicht relevant

### Sources

- [OpenAI: New embedding models and API updates](https://openai.com/index/new-embedding-models-and-api-updates/)
- [PromptLayer: text-embedding-3-small High-Quality Embeddings at Scale](https://blog.promptlayer.com/text-embedding-3-small-high-quality-embeddings-at-scale/)
- [Medium: Embedding Models in 2025](https://medium.com/@alex-azimbaev/embedding-models-in-2025-technology-pricing-practical-advice-2ed273fead7f)

---

## 3. PDF Parsing Library

### Decision: pdf-parse

### Alternatives Considered

| Library | TypeScript Support | Serverless | Maintenance |
|---------|-------------------|------------|-------------|
| **pdf-parse (chosen)** | ✅ Good | ✅ Yes | Active |
| unpdf | ✅✅ Excellent | ✅✅ Designed for it | Newer |
| pdfjs-dist | ⚠️ Complex | ⚠️ Heavy | Mozilla-backed |
| pdf2json | ✅ Good | ✅ Yes | Less active |

### Rationale

1. **Einfachste API:** `pdfParse(buffer)` → Text
2. **Proven in Production:** Weit verbreitet, gut dokumentiert
3. **Lightweight:** Keine schweren Abhängigkeiten
4. **Ausreichend für MVP:** Komplexere Parsing-Anforderungen sind Out of Scope

### Critical Finding: Edge Runtime Incompatibility

**pdf-parse ist NICHT kompatibel mit Edge Runtime!**

Lösung:
```typescript
// src/app/api/documents/route.ts
export const runtime = 'nodejs'; // Required for pdf-parse
```

### Sources

- [Strapi: 7 PDF Parsing Libraries for Node.js 2025](https://strapi.io/blog/7-best-javascript-pdf-parsing-libraries-nodejs-2025)
- [unpdf GitHub](https://github.com/unjs/unpdf)
- [Next.js: Edge Runtime Docs](https://nextjs.org/docs/app/api-reference/edge)

---

## 4. File Upload Architecture

### Decision: Direct API Route Upload (kein Supabase Storage)

### Alternatives Considered

| Approach | Max Size | Complexity | Use Case |
|----------|----------|------------|----------|
| **Direct API Route (chosen)** | ~4MB (Vercel) | Low | MVP |
| Chunked Upload | Unlimited | High | Large files |
| Signed URL → Supabase Storage | 50MB+ | Medium | Production |

### Rationale

1. **Einfachheit:** Keine zusätzliche Storage-Konfiguration nötig
2. **Ausreichend für Demo:** 10MB Limit ist OK für Text-Dokumente
3. **Kein File Storage nötig:** Nach Text-Extraktion wird Originaldatei nicht mehr benötigt
4. **Chunks reichen:** `document_chunks.content` enthält den vollständigen Text

### Data Flow

```
Upload PDF → Extract Text → Chunk → Embed → Store Chunks → Discard Original File
                                              ↓
                                    documents: {filename, content_type}
                                    document_chunks: {content, embedding}
```

### Sources

- [Next.js File Uploads Server-Side Solutions](https://www.pronextjs.dev/next-js-file-uploads-server-side-solutions)
- [Vercel Discussions: Large File Uploads](https://github.com/vercel/next.js/discussions/70078)

---

## 5. File Storage Decision

### Decision: Keine Datei-Speicherung, nur Chunks

### Rationale

1. **Originaldatei nicht benötigt:** Nach Parsing/Chunking wird die Datei nicht mehr gebraucht
2. **Source Attribution funktioniert trotzdem:** `document_chunks.document_id` → `documents.filename`
3. **Weniger Komplexität:** Kein Supabase Storage Setup nötig
4. **Kosteneffizienter:** Keine Storage-Kosten für Originaldateien

### Schema Relationship

```
documents (metadata only)         document_chunks (actual content)
┌─────────────────────────┐      ┌─────────────────────────────┐
│ id (PK)                 │◄─────│ document_id (FK)            │
│ filename                │      │ content (extracted text)    │
│ content_type            │      │ embedding (vector)          │
│ workspace_id            │      │ chunk_index                 │
└─────────────────────────┘      └─────────────────────────────┘
```

---

## 6. LangChain vs Custom Chunking

### Decision: @langchain/textsplitters (nur für Chunking)

### Rationale

1. **Battle-tested:** RecursiveCharacterTextSplitter ist production-ready
2. **Minimale Abhängigkeit:** Nur `@langchain/textsplitters`, nicht das volle LangChain
3. **Korrekte Separators:** Built-in Unterstützung für Paragraph/Sentence/Word-Trennung
4. **Dokumentiert:** Einfach zu erklären und zu debuggen

### Verified Import

```typescript
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2000,      // characters (~512 tokens)
  chunkOverlap: 200,    // characters (~50 tokens)
  separators: ["\n\n", "\n", " ", ""],
});
```

### Sources

- [LangChain Text Splitters Docs](https://docs.langchain.com/oss/javascript/integrations/splitters)
- [npm: @langchain/textsplitters](https://www.npmjs.com/package/@langchain/textsplitters)

---

## 7. Supabase Vector Insert Pattern

### Decision: Plain JavaScript Array (keine spezielle Formatierung)

### Verified Pattern

```typescript
// Embedding ist einfach ein number[] Array
const embedding: number[] = [0.1, 0.2, 0.3, ...]; // 1536 values

const { error } = await supabase
  .from('document_chunks')
  .insert({
    document_id: docId,
    content: chunkText,
    embedding: embedding,  // Direkt übergeben!
    chunk_index: i,
  });
```

### Important Notes

1. **PostgREST Limitation:** Similarity Search (`<=>`) muss über RPC/Function erfolgen
2. **Dimension Match:** Array muss exakt 1536 Elemente haben (text-embedding-3-small)
3. **Kein JSON.stringify:** Array direkt übergeben, Supabase handled die Konvertierung

### Sources

- [Supabase: pgvector Embeddings and Vector Similarity](https://supabase.com/docs/guides/database/extensions/pgvector)
- [Supabase: Vector Columns](https://supabase.com/docs/guides/ai/vector-columns)
- [OpenAI Cookbook: Semantic Search with Supabase](https://cookbook.openai.com/examples/vector_databases/supabase/semantic-search)

---

## 8. Source Citations

### Decision: Dokumentname anzeigen (Chunk-Preview optional)

### Rationale

1. **Low Effort, High Impact:** Dokumentname ist bereits über FK verfügbar
2. **Recruiter-Eindruck:** Zeigt Verständnis der RAG-Pipeline
3. **User Value:** User sieht woher die Antwort stammt

### Implementation Path

```typescript
// In Phase 3 (Chat):
// 1. Vector Search returns chunk IDs
// 2. Join with documents table to get filename
// 3. Display in response: "Source: installation-guide.pdf"
```

### UI Example

```
Antwort: Die Installation erfordert Node.js 18+...

📄 Quellen:
- installation-guide.pdf
- requirements.md
```

---

## 9. Security Considerations

### Decision: Basic Security für MVP, Dokumentation für Production

### Implemented

| Measure | Status | Implementation |
|---------|--------|----------------|
| File Type Validation | ✅ | MIME type + extension check |
| File Size Limit | ✅ | 10MB max |
| API Key Protection | ✅ | Server-side only, env vars |
| RLS Enforcement | ✅ | Via Supabase policies |

### Documented (for README/Future)

| Risk | Mitigation | Priority |
|------|------------|----------|
| Prompt Injection via Documents | System prompt guardrails | Medium |
| Malicious PDF Content | pdf-parse doesn't execute code | Low |
| DoS via Large Files | 10MB limit | Low |

### Sources

- [OWASP: LLM Prompt Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)
- [RAG Security: Risks and Mitigation Strategies](https://www.lasso.security/blog/rag-security)
- [Supabase: Best Security Practices](https://www.supadex.app/blog/best-security-practices-in-supabase-a-comprehensive-guide)

---

## 10. Streaming & AI SDK

### Decision: Vercel AI SDK mit streamText()

### Rationale (für Phase 3)

1. **Industry Standard:** Weit verbreitet, gut dokumentiert
2. **Built-in SSE:** Server-Sent Events automatisch
3. **React Hooks:** `useChat()` für Client-Side
4. **Anthropic Integration:** `@ai-sdk/anthropic` verfügbar

### Pattern (für Phase 3)

```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

const result = await streamText({
  model: anthropic('claude-3-5-haiku-latest'),
  system: `Context: ${relevantChunks}`,
  messages,
});

return result.toDataStreamResponse();
```

### Sources

- [Vercel AI SDK Docs](https://ai-sdk.dev/docs/introduction)
- [LogRocket: Real-time AI in Next.js with Vercel AI SDK](https://blog.logrocket.com/nextjs-vercel-ai-sdk-streaming/)
- [DEV: Vercel AI SDK Complete Guide](https://dev.to/pockit_tools/vercel-ai-sdk-complete-guide-building-production-ready-ai-chat-apps-with-nextjs-4cp6)

---

## Summary Table

| Decision | Choice | Key Reason |
|----------|--------|------------|
| Chunking | RecursiveCharacterTextSplitter | 85-90% recall, no extra API costs |
| Embeddings | text-embedding-3-small | 5x cheaper, good enough quality |
| PDF Parser | pdf-parse | Simple API, proven |
| Upload | Direct API Route | Simple, sufficient for MVP |
| File Storage | None (chunks only) | Not needed after processing |
| Text Splitting | @langchain/textsplitters | Battle-tested, minimal dependency |
| Vector Insert | Plain JS array | Supabase handles conversion |
| Citations | Document name | Low effort, high impact |
| Security | Basic + documentation | Appropriate for challenge scope |
| Streaming | Vercel AI SDK | Industry standard |

---

## Appendix: Key Code Patterns

### A. Runtime Configuration (Critical!)

```typescript
// src/app/api/documents/route.ts
export const runtime = 'nodejs'; // pdf-parse needs Node.js APIs
```

### B. Verified Imports

```typescript
// Chunking
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// Embeddings
import OpenAI from 'openai';

// PDF Parsing
import pdfParse from 'pdf-parse';
```

### C. OpenAI Embedding Call

```typescript
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const result = await openai.embeddings.create({
  input: text,
  model: 'text-embedding-3-small',
});

const embedding = result.data[0].embedding; // number[1536]
```

### D. Supabase Vector Insert

```typescript
await supabase.from('document_chunks').insert({
  document_id: docId,
  content: chunkText,
  embedding: embeddingArray, // number[] directly
  chunk_index: i,
});
```

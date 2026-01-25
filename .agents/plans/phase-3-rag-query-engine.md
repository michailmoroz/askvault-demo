# Feature: Phase 3 - RAG Query Engine

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

## Feature Description

Implementiere den RAG Query Engine für Askvault: Benutzer können Fragen zu ihren hochgeladenen Dokumenten stellen und erhalten gestreamte, kontextbasierte Antworten von Claude Haiku 3.5.

## User Story

As a **user with uploaded documents** I want to **ask questions in natural language and receive streaming answers grounded in my documents** so that **I can quickly find information without manually searching through files**.

## Problem Statement

Benutzer haben Dokumente hochgeladen, können diese aber nicht abfragen. Die Workspace-Seite zeigt nur einen Placeholder "Chat interface coming in Phase 3...". Der RAG-Pipeline (Embed → Retrieve → Generate) fehlt.

## Solution Statement

1. Supabase RPC Function für Vector-Similarity-Search mit Workspace-Isolation
2. AI SDK v4 `useChat` Hook für automatisches Stream-Handling
3. Claude Haiku 3.5 via `@ai-sdk/anthropic` mit RAG-optimiertem System-Prompt
4. In-Session Conversation Memory (Message-Array)
5. Einfache Chat UI mit Loading-State

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: API Routes, React Components, Supabase Database
**Dependencies**: `ai`, `@ai-sdk/anthropic` (neu zu installieren)

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING!)

| File | Lines | Why |
|------|-------|-----|
| `src/app/api/documents/route.ts` | 15-30 | API Route Pattern: Auth-Check, Error-Handling |
| `src/app/api/documents/route.ts` | 53-64 | Workspace-Ownership-Verification Pattern |
| `src/lib/supabase/server.ts` | Full | Server-side Supabase Client Creation |
| `src/lib/rag/embeddings.ts` | 20-31 | `generateEmbedding()` für Query-Embedding |
| `src/components/documents/DocumentUpload.tsx` | 25-35 | Client Component State Pattern |
| `src/components/documents/DocumentUpload.tsx` | 192-204 | Error/Success Display Pattern |
| `src/app/dashboard/[workspaceId]/page.tsx` | 88-99 | Chat Placeholder zu ersetzen |
| `src/app/dashboard/[workspaceId]/WorkspaceClient.tsx` | Full | Client-Wrapper Pattern |
| `src/types/index.ts` | Full | Type Export Pattern |
| `supabase/migrations/001_initial_schema.sql` | 23-35 | document_chunks Schema für RPC |

### New Files to Create

| File | Purpose |
|------|---------|
| `supabase/migrations/002_match_documents_function.sql` | RPC Function für Vector Search |
| `src/lib/rag/retriever.ts` | Retrieval-Logik mit RPC-Aufruf |
| `src/lib/llm/claude.ts` | Claude Config + System Prompt Builder |
| `src/app/api/chat/route.ts` | Streaming Chat API Endpoint |
| `src/types/chat.ts` | Chat-spezifische TypeScript Types (vereinfacht) |
| `src/components/chat/ChatInterface.tsx` | Haupt-Chat-Container mit useChat Hook |
| `src/components/chat/ChatMessage.tsx` | Einzelne Nachricht (User/Assistant) |
| `src/components/chat/ChatInput.tsx` | Eingabefeld mit Send-Button |
| `src/components/chat/index.ts` | Barrel Export |

### Files to Modify

| File | Changes |
|------|---------|
| `src/app/dashboard/[workspaceId]/page.tsx` | Chat Placeholder → ChatInterface |
| `src/types/index.ts` | Re-export chat types |

### Relevant Documentation

| Source | Section | Why |
|--------|---------|-----|
| [AI SDK useChat](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) | Full | Hook API, callbacks, body parameter |
| [AI SDK streamText](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text) | Full | Server-side streaming |
| [AI SDK Anthropic Provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) | Full | Claude Model Setup |
| [Supabase RPC Functions](https://supabase.com/docs/guides/database/functions) | Creating functions | RPC Pattern |
| [Supabase Vector Search](https://supabase.com/docs/guides/ai/examples/nextjs-vector-search) | Full | RPC Call mit Embedding |
| [Supabase CLI db push](https://supabase.com/docs/guides/cli/managing-environments) | Deployment | Migration Deployment |

### Patterns to Follow

**API Route Auth Pattern** (`src/app/api/documents/route.ts:17-30`):
```
1. createClient() aufrufen
2. supabase.auth.getUser() prüfen
3. Bei Fehler: 401 Response
4. Workspace-Ownership via .select().eq().single() verifizieren
```

**Client Component State Pattern** (`src/components/documents/DocumentUpload.tsx:29-35`):
```
1. useState für loading, error, success States
2. useCallback für Event Handlers
3. Conditional Rendering für States
```

**Error Display Pattern** (`src/components/documents/DocumentUpload.tsx:192-196`):
```
Destructive Background + Text Color für Fehler
Green Background für Erfolg
```

**Type Export Pattern** (`src/types/index.ts`):
```
export interface TypeName { ... }
export type TypeAlias = ...;
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation

**Ziel:** Dependencies installieren, Types definieren, DB Function erstellen

**Tasks:**
- AI SDK Dependencies installieren
- Chat-spezifische Types erstellen
- Supabase RPC Function für Vector Search erstellen
- Migration deployen

### Phase 2: Backend

**Ziel:** Server-side RAG Pipeline implementieren

**Tasks:**
- Retriever-Modul mit RPC-Aufruf erstellen
- Claude-Konfiguration mit System Prompt erstellen
- Streaming Chat API Route erstellen

### Phase 3: Frontend

**Ziel:** Chat UI mit Streaming

**Tasks:**
- Chat Components erstellen (Interface, Message, Input)
- AI SDK v4 useChat direkt in ChatInterface nutzen
- In Workspace-Page integrieren

### Phase 4: Testing & Validation

**Ziel:** Qualitätssicherung

**Tasks:**
- Linting & Type-Check
- Build-Test
- Manuelle E2E Tests

---

## STEP-BY-STEP TASKS

### Task 1: INSTALL Dependencies

- **IMPLEMENT**: AI SDK v4 und Anthropic Provider installieren
- **COMMAND**: `npm install ai@^3 @ai-sdk/anthropic`
- **GOTCHA**: `ai@^3` für v4 (stabil), NICHT `ai@latest` (v5 hat Breaking Changes)
- **VALIDATE**: `npm list ai @ai-sdk/anthropic` - sollte ai@3.x.x zeigen

---

### Task 2: CREATE `src/types/chat.ts`

- **IMPLEMENT**: Types für Chat-Funktionalität (vereinfacht)
  - `RetrievalResult`: id, documentId, content, similarity, filename
  - `ChatRequestBody`: workspaceId (für API Route Validation)
- **PATTERN**: `src/types/index.ts` - Export Pattern
- **NOTE**: AI SDK v4 `useChat` bringt eigene Message-Types mit
- **VALIDATE**: `npm run type-check`

---

### Task 3: CREATE `supabase/migrations/002_match_documents_function.sql`

- **IMPLEMENT**: PostgreSQL RPC Function für Vector Similarity Search
  - Input: query_embedding (vector), match_threshold (float), match_count (int), p_workspace_id (uuid)
  - Output: TABLE (id, document_id, content, similarity, filename)
  - JOIN: document_chunks → documents → workspaces
  - WHERE: workspace_id match + owner_id = auth.uid() + similarity > threshold
  - ORDER BY: embedding <=> query_embedding (cosine distance)
  - SECURITY: DEFINER mit auth.uid() Check
- **PATTERN**: `supabase/migrations/001_initial_schema.sql` - RLS Policy Pattern
- **GOTCHA**: Cosine Similarity = `1 - (embedding <=> query_embedding)`, nicht `<->`
- **GOTCHA**: SECURITY DEFINER benötigt für RLS-Bypass innerhalb der Function
- **VALIDATE**: `npx supabase db push` (nach Link)

---

### Task 4: DEPLOY Migration

- **IMPLEMENT**: Migration auf Remote-Supabase deployen
- **COMMAND**:
  ```
  npx supabase link --project-ref <PROJECT_ID>
  npx supabase db push
  ```
- **GOTCHA**: PROJECT_ID aus Supabase Dashboard URL: `supabase.com/dashboard/project/<project-id>`
- **VALIDATE**: `npx supabase migration list` - zeigt synced status

---

### Task 5: CREATE `src/lib/rag/retriever.ts`

- **IMPLEMENT**: Vector Search Modul
  - `retrieveRelevantChunks(query, workspaceId, options?)` → RetrievalResult[]
  - `assembleContext(chunks)` → formatierter Context-String
  - Konfiguration: DEFAULT_THRESHOLD=0.6, DEFAULT_LIMIT=8
- **PATTERN**: `src/lib/rag/embeddings.ts` - Modul-Struktur
- **IMPORTS**: createClient, generateEmbedding, RetrievalResult type
- **GOTCHA**: supabase.rpc() mit embedding als direktes Array (nicht stringified)
- **VALIDATE**: `npm run type-check`

---

### Task 6: CREATE `src/lib/llm/claude.ts`

- **IMPLEMENT**: Claude Konfiguration
  - CLAUDE_MODEL = 'claude-3-5-haiku-latest'
  - TEMPERATURE = 0.1 (niedrig für faktische RAG)
  - `getClaudeModel()` → anthropic(CLAUDE_MODEL)
  - `buildSystemPrompt(context, hasContext)` → System Prompt String
- **PATTERN**: `src/lib/rag/embeddings.ts:81-89` - Config Export Pattern
- **IMPORTS**: `anthropic` from `@ai-sdk/anthropic`
- **SYSTEM PROMPT REGELN**:
  - NUR auf Kontext basieren
  - Bei fehlendem Kontext: ehrlich sagen
  - Quellen mit [1], [2] zitieren
  - Sprache der Frage verwenden
- **VALIDATE**: `npm run type-check`

---

### Task 7: CREATE `src/app/api/chat/route.ts`

- **IMPLEMENT**: Streaming Chat Endpoint
  - POST Handler mit Auth-Check
  - Request Validation (workspaceId, messages Array von useChat)
  - Workspace-Ownership Verification
  - Retrieval via retrieveRelevantChunks()
  - streamText() mit Claude + System Prompt
  - Sources via X-Chat-Sources Header
  - Return toDataStreamResponse()
- **PATTERN**: `src/app/api/documents/route.ts:15-50` - Auth + Validation Pattern
- **IMPORTS**: streamText from 'ai', createClient, retriever, claude
- **GOTCHA**: `export const runtime = 'nodejs'` für Server-Komponenten
- **GOTCHA**: useChat sendet `{ messages: [...], ...body }` Format
- **VALIDATE**: `npm run type-check && npm run build`

---

### Task 8: CREATE `src/components/chat/ChatMessage.tsx`

- **IMPLEMENT**: Einzelne Chat-Nachricht
  - Props: message (AI SDK Message type von 'ai/react')
  - User: rechts ausgerichtet, Primary Background
  - Assistant: links ausgerichtet, Secondary Background
  - Content als Text (einfach, kein Markdown für MVP)
- **PATTERN**: `src/components/documents/DocumentUpload.tsx:243-253` - Conditional Styling
- **IMPORTS**: Lucide Icons (User, Bot), cn utility, Message type from 'ai/react'
- **VALIDATE**: `npm run type-check`

---

### Task 9: CREATE `src/components/chat/ChatInput.tsx`

- **IMPLEMENT**: Eingabefeld mit Send-Button
  - Props: value, onChange, onSubmit, disabled
  - Enter-Key Handler (ohne Shift = Submit)
  - Textarea mit Auto-Resize (min-h, max-h)
  - Button disabled wenn leer oder disabled
- **PATTERN**: `src/components/documents/DocumentUpload.tsx:268-278` - Button Pattern
- **IMPORTS**: Button, Lucide Icons (Send, Loader2)
- **VALIDATE**: `npm run type-check`

---

### Task 10: CREATE `src/components/chat/ChatInterface.tsx`

- **IMPLEMENT**: Haupt-Chat-Container mit AI SDK v4 useChat
  - Props: workspaceId, documentCount
  - `useChat({ api: '/api/chat', body: { workspaceId } })` direkt aufrufen
  - Card Layout mit Header (Title + Clear Button)
  - Messages Area mit Scroll + Auto-Scroll
  - Empty States: keine Dokumente / keine Nachrichten
  - Loading State via `isLoading` von useChat
  - Error Display via `error` von useChat
  - ChatInput mit `input`, `handleInputChange`, `handleSubmit` von useChat
- **PATTERN**: `src/components/documents/DocumentUpload.tsx:182-289` - Card Layout Pattern
- **IMPORTS**: Card components, `useChat` from 'ai/react', ChatMessage, ChatInput
- **GOTCHA**: AI SDK v4 useChat gibt `input`, `handleInputChange`, `handleSubmit`, `messages`, `isLoading`, `error`
- **VALIDATE**: `npm run type-check`

---

### Task 11: CREATE `src/components/chat/index.ts`

- **IMPLEMENT**: Barrel Export für alle Chat Components
- **EXPORTS**: ChatInterface, ChatMessage, ChatInput
- **VALIDATE**: `npm run type-check`

---

### Task 12: UPDATE `src/app/dashboard/[workspaceId]/page.tsx`

- **IMPLEMENT**: Chat Placeholder ersetzen
  - Import ChatInterface from '@/components/chat'
  - Zeilen 88-99 (Placeholder Card) entfernen
  - ChatInterface mit workspaceId und documentCount Props einfügen
- **PATTERN**: Bestehende Component-Einbindung in der Datei
- **VALIDATE**: `npm run type-check && npm run build`

---

### Task 13: UPDATE `src/types/index.ts`

- **IMPLEMENT**: Re-export Chat Types
  - Add: `export * from './chat';`
- **VALIDATE**: `npm run type-check`

---

## TESTING STRATEGY

### Unit Tests

Für dieses MVP fokussieren wir auf manuelle Tests. Unit Tests würden abdecken:
- `retrieveRelevantChunks()` mit gemocktem Supabase
- `buildSystemPrompt()` Output-Validierung
- Request Validation im Chat Endpoint

### Integration Tests

- Full Flow: Message → Retrieval → Claude → Streaming Response
- Workspace Isolation (User A sieht nicht User B's Dokumente)
- Error Handling bei fehlenden Workspace, leerem Query, API Failures

### Edge Cases

1. **Empty Workspace** - Keine Dokumente vorhanden → hilfreiche Meldung
2. **No Matching Documents** - Query findet nichts → Fallback-Prompt
3. **Long Message** - >2000 Zeichen → Ablehnung
4. **Concurrent Messages** - Abort vorheriger Request
5. **Network Failure** - Während Streaming → Error State
6. **Session Expiry** - Während Chat → 401 Handling

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
npm run lint
npm run type-check
```

### Level 2: Build Check

```bash
npm run build
```

### Level 3: Database Migration

```bash
npx supabase link --project-ref <PROJECT_ID>
npx supabase db push
npx supabase migration list
```

### Level 4: Manual E2E Testing

**Test 1: Basic Chat Flow**
1. Login → Dashboard → Workspace mit Dokumenten öffnen
2. Frage zu Dokumentinhalt eingeben
3. **Erwartung:**
   - Loading-Indicator erscheint
   - Antwort streamt Wort für Wort
   - Antwort basiert auf Dokumentinhalt

**Test 2: Empty Workspace**
1. Workspace ohne Dokumente öffnen
2. **Erwartung:** Input disabled, Meldung "Keine Dokumente vorhanden"

**Test 3: No Matching Documents**
1. Workspace mit Dokumenten öffnen
2. Komplett unrelated Frage stellen (z.B. "Was ist Quantenphysik?")
3. **Erwartung:** Claude antwortet dass Info nicht in Dokumenten ist

**Test 4: Conversation Memory**
1. Frage: "Was ist RAG?"
2. Nach Antwort: "Erkläre mir das genauer"
3. **Erwartung:** Claude versteht "das" als Referenz auf RAG

**Test 5: Clear Conversation**
1. Einige Nachrichten senden
2. "Leeren" Button klicken
3. **Erwartung:** Alle Nachrichten gelöscht, Empty State

**Test 6: Error Handling**
1. Internet trennen, Nachricht senden
2. **Erwartung:** Fehlermeldung erscheint

**Test 7: Long Message**
1. Nachricht >2000 Zeichen senden
2. **Erwartung:** Fehler "Message too long"

---

## ACCEPTANCE CRITERIA

- [ ] Chat Interface ersetzt Placeholder in Workspace Page
- [ ] User kann Nachrichten senden und streaming Antworten erhalten
- [ ] Antworten basieren auf Dokumentinhalt
- [ ] In-Session Conversation Memory funktioniert
- [ ] Empty Workspace zeigt passende Meldung
- [ ] Loading State während Streaming sichtbar
- [ ] Fehler werden graceful mit User-Feedback behandelt
- [ ] `npm run lint` hat 0 Errors
- [ ] `npm run type-check` hat 0 Errors
- [ ] `npm run build` ist erfolgreich
- [ ] Alle 7 manuellen E2E Tests bestanden

---

## COMPLETION CHECKLIST

- [ ] Dependencies installiert (`ai@^3`, `@ai-sdk/anthropic`)
- [ ] Types erstellt (`src/types/chat.ts`)
- [ ] Migration erstellt und deployed
- [ ] Retriever Modul erstellt
- [ ] Claude Config erstellt
- [ ] Chat API Route erstellt
- [ ] Chat Components erstellt (ChatMessage, ChatInput, ChatInterface)
- [ ] Workspace Page aktualisiert
- [ ] Types re-exported
- [ ] Alle Validation Commands erfolgreich
- [ ] Alle manuellen Tests bestanden
- [ ] Alle Acceptance Criteria erfüllt

---

## NOTES

### Key Design Decisions

| Entscheidung | Begründung |
|--------------|------------|
| **AI SDK v4 `useChat` direkt** | SDK übernimmt Stream-Parsing automatisch; kein Wrapper nötig für MVP |
| **Einfache UI ohne Phasen** | Recruiting Challenge fordert nur "Frage stellen + Antwort sehen"; Phasen = Future Work |
| **Supabase RPC Function** | Sauberer als komplexe JS-Joins; SECURITY DEFINER für RLS; wiederverwendbar |
| **Threshold 0.6** | Niedriger als Standard (0.7) für mehr Kontext; Claude filtert Relevanz |
| **Top-K 8** | Nutzt Haiku's 200k Context Window; mehr als Standard 5 |
| **In-Session Memory** | AI SDK `useChat` verwaltet Message-Array; keine DB-Persistenz (Scope) |

### Research-Verified Patterns

| Pattern | Quelle | Verifiziert |
|---------|--------|-------------|
| Supabase RPC Embedding als Array | [Supabase Docs](https://supabase.com/docs/guides/ai/examples/nextjs-vector-search) | ✅ |
| AI SDK v4 useChat Auto-Parsing | [AI SDK Docs](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) | ✅ |
| AI SDK v4 streamText + toDataStreamResponse | [AI SDK Core](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text) | ✅ |
| Migration via CLI | [Supabase CLI](https://supabase.com/docs/guides/cli/managing-environments) | ✅ |

### Security Considerations

- RPC Function verwendet `SECURITY DEFINER` mit `auth.uid()` Check
- Input Validation mit Längen-Limits (2000 chars)
- Workspace Ownership vor Retrieval verifiziert
- Keine sensitiven Daten im Client-Code

### Future Enhancements (dokumentiert, nicht implementiert)

- Perplexity-Style Phasen-UI (Searching → Found → Generating → Complete)
- Custom useChat Hook mit Phase-State und Source-Tracking
- Conversation Persistence in Database
- Citation Highlighting in UI
- Re-ranking mit Cohere
- Hybrid Search (Vector + Keyword)

---

## SUMMARY REPORT

### Feature Summary

Implementierung des RAG Query Engine für Askvault - der finale Baustein, der Dokumenten-Upload mit intelligenter Abfrage verbindet. Benutzer können nach dem Upload ihrer Dokumente Fragen in natürlicher Sprache stellen und erhalten gestreamte, kontextbasierte Antworten von Claude Haiku 3.5.

**Approach:**
1. Supabase RPC Function für sichere Vector-Similarity-Search mit Workspace-Isolation
2. Vercel AI SDK v4 (`useChat`) für automatisches Stream-Handling im Client
3. Einfache Chat UI mit Loading-State (Perplexity-Phasen = Future Work)
4. Claude Haiku 3.5 mit RAG-optimiertem System Prompt (niedrige Temperatur)

### Plan File Location

`.agents/plans/phase-3-rag-query-engine.md`

### Complexity Assessment

**Medium** - 13 Tasks über 4 Phasen:
- 2 neue Dependencies (`ai@^3`, `@ai-sdk/anthropic`)
- 1 Database Migration (RPC Function)
- 9 neue Dateien
- 2 Datei-Modifikationen
- Multi-Layer-Integration (DB → API → Components)

### Key Implementation Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| AI SDK v4 vs v5 | Low | Explizit `ai@^3` installieren für v4 Stabilität |
| RPC Function Syntax | Medium | Supabase Docs für SECURITY DEFINER Pattern prüfen |
| Type-Mismatches | Low | Strenge TypeScript-Typen, `npm run type-check` nach jedem Task |

### Confidence Score

**9/10**

**Begründung:**
- (+) Vereinfachter Plan ohne Over-Engineering
- (+) AI SDK v4 ist stabil und gut dokumentiert
- (+) Alle Patterns aus bestehendem Code extrahiert
- (+) GOTCHAs dokumentiert
- (+) Jeder Task hat Validation Command
- (-) Externe API-Abhängigkeiten (Claude, OpenAI) - Netzwerk-Risiko

# Feature: Document Preview & Sources Box

## Feature Description

Zwei zusammenhängende Features für Askvault:
1. **Document Preview**: Original-Dateien in Supabase Storage speichern und in einem Modal anzeigen (PDF/TXT/MD)
2. **Sources Box**: Unter Chat-Antworten klickbare Quellen-Cards anzeigen (Perplexity-Style)

## User Story

Als Benutzer möchte ich die Quellen einer Antwort sehen und anklicken können, damit ich die Original-Dokumente direkt einsehen kann.

## Feature Metadata

| Eigenschaft | Wert |
|-------------|------|
| **Feature Type** | New Capability |
| **Complexity** | Medium |
| **Primary Systems** | Documents API, Chat API, UI Components |
| **New Dependencies** | react-pdf, react-markdown |

---

## CONTEXT REFERENCES

### Kritische Dateien (VOR IMPLEMENTIERUNG LESEN!)

| Datei | Zeilen | Warum |
|-------|--------|-------|
| `src/app/api/documents/route.ts` | 76-145 | Upload-Pipeline - hier Storage hinzufügen |
| `src/app/api/chat/route.ts` | 106-118 | Chunks werden abgerufen - Quellen extrahieren |
| `src/lib/rag/retriever.ts` | 46-58 | RetrievalResult Struktur |
| `src/components/chat/ChatMessage.tsx` | Full | Hier SourcesBox einbinden |
| `src/components/documents/DocumentList.tsx` | 99-133 | Klickbar machen |
| `src/components/ui/dialog.tsx` | Full | Dialog-Pattern für Preview |
| `supabase/migrations/001_initial_schema.sql` | 12-20 | documents Table Schema |

### Neue Dateien

| Datei | Zweck |
|-------|-------|
| `supabase/migrations/003_document_storage.sql` | storage_path Column + Storage Policies |
| `src/lib/supabase/admin.ts` | Admin Client für Storage Ops |
| `src/app/api/documents/[id]/content/route.ts` | Document Content Endpoint |
| `src/components/documents/DocumentPreviewDialog.tsx` | Preview Modal |
| `src/components/documents/PDFViewer.tsx` | PDF Rendering |
| `src/components/chat/SourcesBox.tsx` | Quellen-Cards Component |

### Patterns aus Codebase

**Dialog Pattern** (aus DeleteWorkspaceDialog.tsx):
```typescript
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // ...entity data
}
// Controlled state from parent, loading/error internal
```

**API Route Pattern** (aus documents/[id]/route.ts):
```typescript
const { id } = await params;
const supabase = await createClient();
// Auth check, then operation, then .select().single() for verification
```

---

## IMPLEMENTATION PLAN

### Phase 1: Database & Storage Setup

1. Supabase Storage Bucket `documents` erstellen (Dashboard)
2. Migration für `storage_path` Column
3. Storage RLS Policies

### Phase 2: Document Storage

1. Admin Client erstellen (`src/lib/supabase/admin.ts`)
2. Upload-Route erweitern (Original in Storage speichern)
3. Content Endpoint erstellen
4. Delete-Route erweitern (Storage Cleanup)

### Phase 3: Document Preview UI

1. Dependencies installieren (react-pdf, react-markdown)
2. PDFViewer Component
3. DocumentPreviewDialog Component
4. DocumentList klickbar machen

### Phase 4: Sources Box

1. SourceReference Type definieren
2. Chat API erweitern (Quellen-Metadaten zurückgeben)
3. SourcesBox Component
4. ChatMessage erweitern

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `supabase/migrations/003_document_storage.sql`

```sql
-- Add storage_path column (nullable for old documents)
ALTER TABLE documents
ADD COLUMN storage_path TEXT;

COMMENT ON COLUMN documents.storage_path IS
  'Path to original file in Supabase Storage. NULL for legacy documents.';
```

**VALIDATE**: `npx supabase db push`

---

### Task 2: Supabase Storage Bucket erstellen

**MANUAL**: Supabase Dashboard → Storage → New Bucket
- Name: `documents`
- Public: OFF (private)

**ODER via SQL** (in Migration hinzufügen):
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies für Storage
CREATE POLICY "Users can upload to workspace folders"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM workspaces WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can read workspace files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM workspaces WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete workspace files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM workspaces WHERE owner_id = auth.uid()
  )
);
```

**VALIDATE**: Supabase Dashboard → Storage → Bucket existiert

---

### Task 3: UPDATE `src/types/index.ts`

**ADD** `storage_path` zu Document interface:

```typescript
export interface Document {
  id: string;
  workspace_id: string;
  filename: string;
  content_type: string;
  storage_path: string | null;  // NEW
  metadata: Record<string, unknown>;
  created_at: string;
}
```

**VALIDATE**: `npm run type-check`

---

### Task 4: CREATE `src/lib/supabase/admin.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

/**
 * Admin client that bypasses RLS - SERVER ONLY
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
```

**VALIDATE**: `npm run type-check`

---

### Task 5: UPDATE `src/app/api/documents/route.ts`

**IMPORT** (top of file):
```typescript
import { createAdminClient } from '@/lib/supabase/admin';
```

**ADD** nach `validateFile()` (ca. Zeile 74):
```typescript
// Store original in Supabase Storage
const storagePath = `${workspaceId}/${crypto.randomUUID()}-${file.name}`;
const adminClient = createAdminClient();

const arrayBuffer = await file.arrayBuffer();
const { error: storageError } = await adminClient.storage
  .from('documents')
  .upload(storagePath, arrayBuffer, {
    contentType: file.type,
    upsert: false,
  });

if (storageError) {
  console.error('Storage upload failed:', storageError);
  // Continue without storage - preview won't work for this doc
}
```

**MODIFY** document insert (ca. Zeile 116):
```typescript
.insert({
  workspace_id: workspaceId,
  filename: file.name,
  content_type: contentType,
  storage_path: storageError ? null : storagePath,  // NEW
  metadata: { ... },
})
```

**VALIDATE**: `npm run type-check && npm run build`

---

### Task 6: CREATE `src/app/api/documents/[id]/content/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Fetch document (RLS enforces ownership)
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id, filename, content_type, storage_path')
      .eq('id', id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    if (!doc.storage_path) {
      return NextResponse.json(
        { error: 'Preview not available for this document.' },
        { status: 404 }
      );
    }

    // Download from storage
    const adminClient = createAdminClient();
    const { data: fileData, error: downloadError } = await adminClient.storage
      .from('documents')
      .download(doc.storage_path);

    if (downloadError || !fileData) {
      return NextResponse.json({ error: 'Failed to retrieve file.' }, { status: 500 });
    }

    return new Response(fileData, {
      headers: {
        'Content-Type': doc.content_type,
        'Content-Disposition': `inline; filename="${doc.filename}"`,
      },
    });
  } catch (error) {
    console.error('Document content error:', error);
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 });
  }
}
```

**VALIDATE**: `npm run type-check`

---

### Task 7: UPDATE `src/app/api/documents/[id]/route.ts`

**ADD** Storage Cleanup vor dem Delete (nach Auth-Check):

```typescript
import { createAdminClient } from '@/lib/supabase/admin';

// In DELETE function, before the delete operation:

// Fetch document to get storage_path
const { data: docToDelete } = await supabase
  .from('documents')
  .select('storage_path')
  .eq('id', id)
  .single();

// Cleanup storage if exists
if (docToDelete?.storage_path) {
  const adminClient = createAdminClient();
  await adminClient.storage
    .from('documents')
    .remove([docToDelete.storage_path]);
}
```

**VALIDATE**: `npm run type-check`

---

### Task 8: INSTALL Dependencies

```bash
npm install react-pdf react-markdown
npm install -D @types/react-pdf
```

**VALIDATE**: `npm ls react-pdf react-markdown`

---

### Task 9: CREATE `src/components/documents/PDFViewer.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  return (
    <div className="flex flex-col items-center">
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        className="border rounded-lg overflow-hidden"
      >
        <Page pageNumber={pageNumber} width={650} />
      </Document>

      {numPages > 1 && (
        <div className="flex items-center gap-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {pageNumber} / {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
```

**VALIDATE**: `npm run type-check`

---

### Task 10: CREATE `src/components/documents/DocumentPreviewDialog.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Loader2, FileText, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PDFViewer } from './PDFViewer';
import ReactMarkdown from 'react-markdown';
import type { DocumentWithChunkCount } from '@/types';

interface DocumentPreviewDialogProps {
  document: DocumentWithChunkCount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentPreviewDialog({
  document,
  open,
  onOpenChange,
}: DocumentPreviewDialogProps) {
  const [content, setContent] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !document) {
      setContent(null);
      setBlobUrl(null);
      setError(null);
      return;
    }

    async function fetchContent() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/documents/${document!.id}/content`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load document');
        }

        if (document!.content_type === 'application/pdf') {
          const blob = await res.blob();
          setBlobUrl(URL.createObjectURL(blob));
        } else {
          setContent(await res.text());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchContent();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [open, document]);

  if (!document) return null;

  const isPdf = document.content_type === 'application/pdf';
  const isMd = document.content_type.includes('markdown');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {document.filename}
          </DialogTitle>
          <DialogDescription>{document.chunk_count} chunks</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto min-h-0">
          {loading && (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive font-medium">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Dieses Dokument wurde vor der Preview-Funktion hochgeladen.
              </p>
            </div>
          )}

          {!loading && !error && isPdf && blobUrl && (
            <PDFViewer url={blobUrl} />
          )}

          {!loading && !error && !isPdf && content && (
            <div className="prose dark:prose-invert max-w-none p-4">
              {isMd ? (
                <ReactMarkdown>{content}</ReactMarkdown>
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
                  {content}
                </pre>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**VALIDATE**: `npm run type-check`

---

### Task 11: UPDATE `src/components/documents/DocumentList.tsx`

**IMPORTS** hinzufügen:
```typescript
import { DocumentPreviewDialog } from './DocumentPreviewDialog';
```

**STATE** hinzufügen (nach Zeile 59):
```typescript
const [previewOpen, setPreviewOpen] = useState(false);
const [previewDoc, setPreviewDoc] = useState<DocumentWithChunkCount | null>(null);
```

**HANDLER** hinzufügen:
```typescript
function handlePreviewClick(doc: DocumentWithChunkCount) {
  setPreviewDoc(doc);
  setPreviewOpen(true);
}
```

**DIV onClick** hinzufügen (ca. Zeile 100-102):
```typescript
<div
  key={doc.id}
  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group cursor-pointer"
  onClick={() => handlePreviewClick(doc)}
>
```

**DIALOG** vor `</>` hinzufügen:
```typescript
<DocumentPreviewDialog
  document={previewDoc}
  open={previewOpen}
  onOpenChange={setPreviewOpen}
/>
```

**VALIDATE**: `npm run type-check`

---

### Task 12: ADD `src/types/chat.ts` - SourceReference

```typescript
// Nach RetrievalResult interface hinzufügen:

export interface SourceReference {
  index: number;
  documentId: string;
  filename: string;
  content: string;  // Truncated preview
  similarity: number;
}
```

**VALIDATE**: `npm run type-check`

---

### Task 13: CREATE `src/components/chat/SourcesBox.tsx`

```typescript
'use client';

import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SourceReference } from '@/types/chat';

interface SourcesBoxProps {
  sources: SourceReference[];
  onSourceClick: (documentId: string) => void;
}

export function SourcesBox({ sources, onSourceClick }: SourcesBoxProps) {
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0) return null;

  // Group by document
  const byDoc = sources.reduce((acc, s) => {
    if (!acc[s.documentId]) {
      acc[s.documentId] = { ...s, count: 0 };
    }
    acc[s.documentId].count++;
    return acc;
  }, {} as Record<string, SourceReference & { count: number }>);

  const docs = Object.values(byDoc);

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground text-xs p-0 h-auto"
        onClick={() => setExpanded(!expanded)}
      >
        <FileText className="h-3 w-3 mr-1" />
        {sources.length} Quelle{sources.length !== 1 ? 'n' : ''} aus {docs.length} Dokument{docs.length !== 1 ? 'en' : ''}
        {expanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
      </Button>

      {expanded && (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {docs.map((doc) => (
            <Card
              key={doc.documentId}
              className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onSourceClick(doc.documentId)}
            >
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{doc.filename}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {doc.content}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

**VALIDATE**: `npm run type-check`

---

### Task 14: UPDATE `src/app/api/chat/route.ts`

**IMPORT**:
```typescript
import type { SourceReference } from '@/types/chat';
```

**ADD** nach chunks retrieval (ca. Zeile 118):
```typescript
// Build sources metadata
const sources: SourceReference[] = chunks.map((chunk, i) => ({
  index: i + 1,
  documentId: chunk.documentId,
  filename: chunk.filename,
  content: chunk.content.slice(0, 150) + (chunk.content.length > 150 ? '...' : ''),
  similarity: chunk.similarity,
}));
```

**MODIFY** return (ca. Zeile 144) - Sources als Header mitgeben:
```typescript
const response = result.toDataStreamResponse();
response.headers.set('X-Sources', JSON.stringify(sources));
return response;
```

**VALIDATE**: `npm run type-check`

---

### Task 15: UPDATE `src/components/chat/ChatInterface.tsx`

Quellen aus Response-Header lesen und an Messages binden.

**STATE** hinzufügen:
```typescript
const [messageSources, setMessageSources] = useState<Record<string, SourceReference[]>>({});
```

**useChat** erweitern:
```typescript
const { ... } = useChat({
  api: '/api/chat',
  body: { workspaceId },
  onResponse: async (response) => {
    const sourcesHeader = response.headers.get('X-Sources');
    if (sourcesHeader) {
      try {
        const sources = JSON.parse(sourcesHeader);
        // Store sources for the upcoming assistant message
        // (will be associated after message arrives)
      } catch (e) {
        console.error('Failed to parse sources:', e);
      }
    }
  },
});
```

**ChatMessage** erweitern:
```typescript
<ChatMessage
  key={message.id}
  message={message}
  sources={message.role === 'assistant' ? messageSources[message.id] : undefined}
/>
```

**VALIDATE**: `npm run type-check`

---

### Task 16: UPDATE `src/components/chat/ChatMessage.tsx`

**IMPORTS**:
```typescript
import { useState } from 'react';
import { SourcesBox } from './SourcesBox';
import { DocumentPreviewDialog } from '../documents/DocumentPreviewDialog';
import type { SourceReference } from '@/types/chat';
```

**PROPS** erweitern:
```typescript
interface ChatMessageProps {
  message: Message;
  sources?: SourceReference[];
}
```

**STATE** hinzufügen:
```typescript
const [previewDocId, setPreviewDocId] = useState<string | null>(null);
```

**JSX** erweitern (nach message.content div):
```typescript
{!isUser && sources && sources.length > 0 && (
  <SourcesBox
    sources={sources}
    onSourceClick={(docId) => setPreviewDocId(docId)}
  />
)}
```

**VALIDATE**: `npm run type-check && npm run build`

---

## VALIDATION COMMANDS

```bash
# 1. Database
npx supabase db push

# 2. Types
npm run type-check

# 3. Lint
npm run lint

# 4. Build
npm run build

# 5. Dev Server
npm run dev
```

## MANUAL TESTING

1. **Upload neues Dokument** → Prüfen: `storage_path` in DB gefüllt
2. **Klick auf Dokument in Liste** → Preview Dialog öffnet
3. **PDF hochladen** → PDF wird gerendert mit Pagination
4. **TXT/MD hochladen** → Text/Markdown wird angezeigt
5. **Frage stellen** → Antwort zeigt Quellenbox
6. **Klick auf Quelle** → Preview öffnet
7. **Altes Dokument klicken** → Zeigt "Preview nicht verfügbar"

---

## ACCEPTANCE CRITERIA

- [ ] Neue Dokumente werden in Storage gespeichert
- [ ] Document Preview Dialog funktioniert für PDF/TXT/MD
- [ ] SourcesBox zeigt Quellen unter Antworten
- [ ] Klick auf Quelle öffnet Preview
- [ ] Alte Dokumente zeigen graceful Error
- [ ] Alle type-checks und builds erfolgreich
- [ ] RLS Security bleibt intakt

---

## NOTES

- **Nur neue Uploads** bekommen Preview - alte Dokumente haben kein `storage_path`
- **PDF Worker** wird von CDN geladen (unpkg.com)
- **Sources Header**: Einfachster Ansatz für MVP, später auf AI SDK Data Stream upgraden
- **Estimated Confidence**: 8/10 für One-Pass Success

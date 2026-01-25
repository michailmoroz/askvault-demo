# Feature: Phase 4B - CRUD Vollständigkeit

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

## Feature Description

Vollständige CRUD-Operationen für Workspaces und Documents implementieren. Aktuell fehlen:
- Workspace Create (Button + Modal + API)
- Workspace Delete (Button + Confirm + API)
- Document Delete (Button + Confirm + API)

Dies vervollständigt die Demo-Fähigkeit der Anwendung für die Recruiting Challenge.

## User Story

As a **user** I want to **create new workspaces and delete workspaces/documents** so that **I can organize my knowledge bases and remove unwanted content**.

## Problem Statement

Aktuell können Workspaces nur automatisch bei der Registrierung erstellt werden. Dokumente können nicht gelöscht werden. Das limitiert die Demo-Fähigkeit.

## Solution Statement

1. shadcn/ui Dialog und AlertDialog Komponenten installieren
2. Workspace Create: Button im Dashboard + Modal mit Form + POST API
3. Workspace Delete: Button auf Workspace Card + Confirm Dialog + DELETE API
4. Document Delete: Button auf Document Row + Confirm Dialog + DELETE API

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: Dashboard UI, API Routes, Components
**Dependencies**: @radix-ui/react-dialog, @radix-ui/react-alert-dialog (via shadcn/ui)

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING!)

| File | Lines | Why |
|------|-------|-----|
| `src/app/api/documents/route.ts` | Full | API Pattern für POST/GET, Auth-Check, Error-Handling |
| `src/app/dashboard/page.tsx` | Full | Dashboard Layout, Workspace-Cards Pattern |
| `src/app/dashboard/[workspaceId]/WorkspaceClient.tsx` | Full | Client-Component Pattern, router.refresh() |
| `src/components/documents/DocumentList.tsx` | Full | Document-Row Pattern, wo Delete-Button hin muss |
| `src/components/auth/LoginForm.tsx` | Full | Form Pattern mit useState, Error-Handling |
| `src/components/ui/button.tsx` | Full | Button Variants (destructive für Delete) |
| `src/types/index.ts` | Full | TypeScript Types für Workspace, Document |
| `supabase/migrations/001_initial_schema.sql` | 42-57, 79-82 | RLS Policies für DELETE bereits vorhanden |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/components/ui/dialog.tsx` | shadcn/ui Dialog (via CLI) |
| `src/components/ui/alert-dialog.tsx` | shadcn/ui AlertDialog (via CLI) |
| `src/app/api/workspaces/route.ts` | POST /api/workspaces |
| `src/app/api/workspaces/[id]/route.ts` | DELETE /api/workspaces/[id] |
| `src/app/api/documents/[id]/route.ts` | DELETE /api/documents/[id] |
| `src/components/workspace/CreateWorkspaceDialog.tsx` | Modal für Workspace-Erstellung |
| `src/components/workspace/DeleteWorkspaceDialog.tsx` | Confirm Dialog für Workspace-Löschung |
| `src/components/documents/DeleteDocumentDialog.tsx` | Confirm Dialog für Document-Löschung |

### Relevant Documentation

| Source | Section | Why |
|--------|---------|-----|
| [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog) | Full | Installation und Usage |
| [shadcn/ui AlertDialog](https://ui.shadcn.com/docs/components/alert-dialog) | Full | Confirm Dialog Pattern |

### Patterns to Follow

**API Route Pattern** (aus `src/app/api/documents/route.ts`):
```typescript
export async function DELETE(request: Request): Promise<Response> {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RLS handles ownership check automatically
    const { error } = await supabase.from('table').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
```

**Form Pattern** (aus `LoginForm.tsx`):
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError(null);
  setLoading(true);
  // ... API call
  setLoading(false);
}
```

**Error Display Pattern**:
```tsx
{error && (
  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
    {error}
  </div>
)}
```

**Client Refresh Pattern** (aus `WorkspaceClient.tsx`):
```typescript
router.refresh(); // Triggers server-side revalidation
```

**Naming Conventions:**
- Components: PascalCase (`DeleteDocumentDialog.tsx`)
- API Routes: kebab-case directories (`/api/workspaces/[id]/route.ts`)
- Functions: camelCase (`handleDelete`)

---

## IMPLEMENTATION PLAN

### Phase 1: UI Components Installation

Installiere shadcn/ui Dialog und AlertDialog Komponenten via CLI.

**Tasks:**
- shadcn/ui dialog installieren
- shadcn/ui alert-dialog installieren

### Phase 2: API Endpoints

Erstelle die fehlenden API Routes für CRUD Operationen.

**Tasks:**
- POST /api/workspaces (Workspace erstellen)
- DELETE /api/workspaces/[id] (Workspace löschen)
- DELETE /api/documents/[id] (Document löschen)

### Phase 3: UI Components

Erstelle die Dialog-Komponenten für Create und Delete.

**Tasks:**
- CreateWorkspaceDialog Component
- DeleteWorkspaceDialog Component (AlertDialog)
- DeleteDocumentDialog Component (AlertDialog)

### Phase 4: Integration

Integriere die Dialogs in die bestehenden Seiten.

**Tasks:**
- Dashboard Page: Create Workspace Button + Dialog
- Dashboard Page: Delete Button auf Workspace Cards
- DocumentList: Delete Button auf Document Rows

---

## STEP-BY-STEP TASKS

### Task 1: INSTALL shadcn/ui Dialog ✅ DONE

- **STATUS**: Bereits installiert während Validierung
- **FILE**: `src/components/ui/dialog.tsx`
- **GOTCHA**: Benötigt `npm config set legacy-peer-deps true` wegen zod Version Konflikt

### Task 2: INSTALL shadcn/ui AlertDialog ✅ DONE

- **STATUS**: Bereits installiert während Validierung
- **FILE**: `src/components/ui/alert-dialog.tsx`
- **GOTCHA**: Bei Prompt "overwrite button.tsx?" mit "n" antworten

### Task 3: CREATE `src/app/api/workspaces/route.ts`

- **IMPLEMENT**: POST handler für Workspace-Erstellung
- **PATTERN**: `src/app/api/documents/route.ts` (Auth-Check, Error-Handling)
- **IMPORTS**: `NextResponse`, `createClient` from server
- **GOTCHA**: `owner_id` muss `user.id` sein (für RLS)
- **VALIDATE**: `npm run type-check`

```typescript
// Request body: { name: string }
// Response: { id, name, created_at }
```

### Task 4: CREATE `src/app/api/workspaces/[id]/route.ts`

- **IMPLEMENT**: DELETE handler für Workspace-Löschung
- **PATTERN**: Wie documents/route.ts DELETE wäre
- **IMPORTS**: `NextResponse`, `createClient`
- **GOTCHA**: CASCADE in DB löscht automatisch documents + chunks
- **GOTCHA**: Hole `id` aus URL params: `const { id } = await params;`
- **VALIDATE**: `npm run type-check`

```typescript
// DELETE /api/workspaces/[id]
// Response: { success: true }
```

### Task 5: CREATE `src/app/api/documents/[id]/route.ts`

- **IMPLEMENT**: DELETE handler für Document-Löschung
- **PATTERN**: Identisch zu workspaces/[id]
- **GOTCHA**: CASCADE in DB löscht automatisch chunks
- **GOTCHA**: Next.js 15+ params sind Promise: `const { id } = await params;`
- **VALIDATE**: `npm run type-check`

### Task 6: CREATE `src/components/workspace/CreateWorkspaceDialog.tsx`

- **IMPLEMENT**: Dialog mit Form (name Input), Submit Button
- **PATTERN**: `LoginForm.tsx` für Form-State, `Dialog` für Modal
- **IMPORTS**: Dialog components, Button, Input, Label
- **GOTCHA**: Nach Success: `router.refresh()` + Dialog schließen
- **VALIDATE**: `npm run type-check`

```typescript
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

### Task 7: CREATE `src/components/workspace/DeleteWorkspaceDialog.tsx`

- **IMPLEMENT**: AlertDialog mit Workspace-Name, Cancel/Delete Buttons
- **PATTERN**: AlertDialog für Confirm
- **IMPORTS**: AlertDialog components, Button (variant="destructive")
- **GOTCHA**: Warnung dass alle Dokumente gelöscht werden
- **VALIDATE**: `npm run type-check`

```typescript
interface Props {
  workspace: { id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}
```

### Task 8: CREATE `src/components/workspace/index.ts`

- **IMPLEMENT**: Barrel export für workspace components
- **VALIDATE**: `npm run type-check`

### Task 9: CREATE `src/components/documents/DeleteDocumentDialog.tsx`

- **IMPLEMENT**: AlertDialog mit Document-Filename, Cancel/Delete Buttons
- **PATTERN**: Identisch zu DeleteWorkspaceDialog
- **VALIDATE**: `npm run type-check`

```typescript
interface Props {
  document: { id: string; filename: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}
```

### Task 10: UPDATE `src/app/dashboard/page.tsx`

- **IMPLEMENT**:
  1. Convert to Client Component (`'use client'`)
  2. Add "Create Workspace" Button neben Header
  3. Add Delete Button auf jede Workspace Card
  4. Integrate CreateWorkspaceDialog + DeleteWorkspaceDialog
- **PATTERN**: Card hover pattern bereits vorhanden
- **GOTCHA**: Muss Client Component werden für Dialog State
- **GOTCHA**: Braucht separaten Client-Wrapper für Server Data Fetching
- **VALIDATE**: `npm run build`

### Task 11: CREATE `src/app/dashboard/DashboardClient.tsx`

- **IMPLEMENT**: Client Component das Workspaces rendert + Dialogs managed
- **PATTERN**: `WorkspaceClient.tsx`
- **IMPORTS**: CreateWorkspaceDialog, DeleteWorkspaceDialog, Card components
- **VALIDATE**: `npm run type-check`

### Task 12: UPDATE `src/app/dashboard/page.tsx` (Final)

- **IMPLEMENT**: Server Component das DashboardClient mit initialWorkspaces aufruft
- **PATTERN**: `[workspaceId]/page.tsx` Pattern
- **VALIDATE**: `npm run build`

### Task 13: UPDATE `src/components/documents/DocumentList.tsx`

- **IMPLEMENT**:
  1. Convert to Client Component
  2. Add Delete Button (Trash2 Icon) auf jede Document Row
  3. Integrate DeleteDocumentDialog
  4. Add `onDocumentDeleted` Callback Prop
- **PATTERN**: Button mit `variant="ghost"` + `size="icon-sm"`
- **IMPORTS**: Trash2 from lucide-react, DeleteDocumentDialog
- **VALIDATE**: `npm run type-check`

### Task 14: UPDATE `src/app/dashboard/[workspaceId]/WorkspaceClient.tsx`

- **IMPLEMENT**: Pass `onDocumentDeleted` handler to DocumentList
- **PATTERN**: Bereits `handleUploadComplete` Pattern vorhanden
- **VALIDATE**: `npm run build`

### Task 15: FINAL VALIDATION

- **VALIDATE**: `npm run lint`
- **VALIDATE**: `npm run type-check`
- **VALIDATE**: `npm run build`

---

## TESTING STRATEGY

### Manual Testing

Da keine Test-Suite existiert, manuelle Tests:

1. **Workspace Create:**
   - Klick "Create Workspace" Button
   - Dialog öffnet sich
   - Name eingeben + Submit
   - Neuer Workspace erscheint in Liste

2. **Workspace Delete:**
   - Klick Delete Button auf Workspace Card
   - Confirm Dialog erscheint mit Warnung
   - Klick "Delete" -> Workspace verschwindet
   - Alle Dokumente auch gelöscht (DB Cascade)

3. **Document Delete:**
   - Öffne Workspace mit Dokumenten
   - Klick Delete Button auf Document Row
   - Confirm Dialog erscheint
   - Klick "Delete" -> Document verschwindet

### Edge Cases

- Empty workspace name -> Validation Error
- Delete last workspace -> Should work
- Delete workspace with documents -> Cascade delete
- Network error during delete -> Error message shown

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
npm run lint
```

### Level 2: Type Check

```bash
npm run type-check
```

### Level 3: Build

```bash
npm run build
```

### Level 4: Manual Validation

1. Start dev server: `npm run dev`
2. Login to dashboard
3. Test Create Workspace flow
4. Test Delete Workspace flow
5. Test Delete Document flow
6. Verify in Supabase Dashboard that data is actually deleted

---

## ACCEPTANCE CRITERIA

- [x] shadcn/ui dialog and alert-dialog components installed
- [ ] POST /api/workspaces creates new workspace
- [ ] DELETE /api/workspaces/[id] deletes workspace + cascades
- [ ] DELETE /api/documents/[id] deletes document + cascades
- [ ] CreateWorkspaceDialog opens, validates, submits successfully
- [ ] DeleteWorkspaceDialog shows warning, deletes on confirm
- [ ] DeleteDocumentDialog shows warning, deletes on confirm
- [ ] Dashboard shows "Create Workspace" button
- [ ] Workspace cards show delete button on hover
- [ ] Document rows show delete button
- [ ] All validation commands pass with zero errors
- [ ] No regressions in existing functionality

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Manual testing confirms feature works
- [ ] Acceptance criteria all met

---

## NOTES

### Pre-Implementation Validation (2026-01-25)

**Confidence: 10/10** (upgraded from 8/10)

| Validierung | Status | Finding |
|-------------|--------|---------|
| shadcn CLI | ✅ | Funktioniert mit `legacy-peer-deps` |
| Dialog Component | ✅ | `src/components/ui/dialog.tsx` installiert |
| AlertDialog Component | ✅ | `src/components/ui/alert-dialog.tsx` installiert |
| DELETE RLS Policies | ✅ | Alle vorhanden (workspaces, documents, chunks) |
| CASCADE DELETE | ✅ | Schema korrekt (`ON DELETE CASCADE`) |
| DashboardClient Pattern | ✅ | Validiert via WorkspaceClient Pattern |
| TypeScript Check | ✅ | Kompiliert ohne Fehler |

**Bekannte Gotchas (gelöst):**
- zod v4 vs @ai-sdk/anthropic Konflikt → `npm config set legacy-peer-deps true`
- shadcn fragt nach button.tsx overwrite → mit "n" ablehnen

### Design Decisions

1. **AlertDialog für Deletes**: Nicht Dialog, weil Confirm erforderlich ist
2. **Cascade Delete**: DB-Level Constraint bereits vorhanden, kein manuelles Cleanup nötig
3. **Client Components**: Dashboard page muss Client Component werden für Dialog State
4. **Hover Delete Buttons**: Workspace Cards zeigen Delete nur on hover (weniger visual clutter)
5. **Document Delete inline**: Trash Icon auf jeder Row, nicht in separatem Menu

### Risiken

- **Versehentliches Löschen**: Mitigiert durch Confirm Dialog mit Warnung
- **Performance bei vielen Workspaces**: Nicht relevant für Demo-Scope

### Dependencies

- @radix-ui/react-dialog (via shadcn/ui dialog)
- @radix-ui/react-alert-dialog (via shadcn/ui alert-dialog)

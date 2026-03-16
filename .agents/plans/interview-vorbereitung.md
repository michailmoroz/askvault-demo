# Feature: Interview-Vorbereitung für Everlast AI

## Feature Description

Umfassende Vorbereitung auf das technische Interview bei Everlast AI, bestehend aus:
1. **Demo-Checkliste** - Flexibler Ablauf für die Live-Präsentation
2. **Demo-Dokumente** - Fiktive Firmen-FAQ in MD, TXT, PDF für Live-Demo
3. **RAG-Erklärung** - Welche Code-Stellen und Supabase-Elemente zeigen
4. **Claude Commands Erklärung** - PIV-Loop und systematische Arbeitsweise
5. **Interview-Fragen mit Antworten** - Fokus auf Design Decisions

## User Story

Als Bewerber möchte ich mich optimal auf das Interview bei Everlast AI vorbereiten, sodass ich meine technischen Fähigkeiten, meine systematische Arbeitsweise mit Claude Code und mein RAG-Verständnis überzeugend präsentieren kann.

## Problem Statement

Das Interview bei Everlast AI erfordert:
- Eine Live-Demo der Askvault-App (15-20 Min)
- Erklärung der RAG-Pipeline und Architektur
- Darstellung der Arbeitsweise mit Claude Code (PIV-Loop)
- Beantwortung technischer Fragen zu Implementierungsdetails

Ohne strukturierte Vorbereitung besteht das Risiko, wichtige Punkte zu vergessen oder unstrukturiert zu präsentieren.

## Solution Statement

Erstellung eines kompletten Vorbereitungspakets:
- Checkliste für strukturierte Demo
- Demo-Dokumente für Live-Demonstration
- Zusammenfassung der wichtigsten Code-Stellen
- Vorbereitete Antworten auf wahrscheinliche Fragen

## Feature Metadata

**Feature Type**: New Capability (Dokumentation/Vorbereitung)
**Estimated Complexity**: Medium
**Primary Systems Affected**: `.agents/` Dokumentation
**Dependencies**: Keine externen Dependencies

---

## CONTEXT REFERENCES

### Relevante Projekt-Dateien (für Demo/Erklärung)

| Datei | Zweck für Interview |
|-------|---------------------|
| `src/lib/rag/retriever.ts` | Vector Search erklären (match_documents, Threshold 0.25) |
| `src/lib/rag/chunker.ts` | Chunking-Strategie erklären (2000 chars, 200 overlap) |
| `src/lib/rag/embeddings.ts` | Embedding-Generierung (OpenAI text-embedding-3-small) |
| `src/app/api/chat/route.ts` | RAG-Pipeline End-to-End, Query Expansion |
| `src/lib/llm/claude.ts` | LLM-Integration, System Prompt |
| `supabase/migrations/001_initial_schema.sql` | Tabellenstruktur, RLS Policies |
| `supabase/migrations/002_match_documents_function.sql` | Vector Search RPC |

### Claude Commands (für Arbeitsweise-Erklärung)

| Datei | Zweck |
|-------|-------|
| `.claude/commands/prime.md` | Kontext laden in neuer Konversation |
| `.claude/commands/create-prd.md` | PRD aus Konversation generieren |
| `.claude/commands/plan-feature.md` | Strukturierten Plan erstellen |
| `.claude/commands/execute.md` | Plan implementieren + Execution Report |

### Neue Dateien zu erstellen

| Datei | Zweck |
|-------|-------|
| `.agents/interview/demo-checkliste.md` | Strukturierter Demo-Ablauf |
| `.agents/interview/demo-dokumente/technova-faq.md` | Demo-Dokument (Markdown) |
| `.agents/interview/demo-dokumente/technova-produkte.txt` | Demo-Dokument (Text) |
| `.agents/interview/demo-dokumente/technova-policies.pdf` | Demo-Dokument (PDF) - manuell erstellen |
| `.agents/interview/rag-erklaerung.md` | Code-Stellen für RAG-Erklärung |
| `.agents/interview/claude-commands-erklaerung.md` | PIV-Loop und Commands |
| `.agents/interview/interview-fragen.md` | Fragen mit Antworten |

---

## IMPLEMENTATION PLAN

### Phase 1: Demo-Dokumente erstellen

Fiktive Firma "TechNova GmbH" mit verschiedenen Dokumenttypen:
- FAQ (Markdown) - Allgemeine Unternehmensfragen
- Produkte (TXT) - Produktinformationen
- Policies (PDF) - HR-Richtlinien (manuell als PDF speichern)

Diese ermöglichen die Demo: "Frage ohne Dokument → keine Antwort → Dokument hochladen → Antwort"

### Phase 2: Demo-Checkliste erstellen

Flexibler Ablauf ohne feste Zeiten:
1. End-User Flow (App zeigen)
2. RAG-Architektur (Supabase + Code)
3. Arbeitsweise (Claude Commands + PIV-Loop)
4. "Über Anforderungen hinaus" (kurz)

### Phase 3: RAG-Erklärung erstellen

Zusammenfassung der wichtigsten Code-Stellen mit Zeilennummern:
- Chunking-Strategie
- Embedding-Generierung
- Vector Search
- LLM-Integration
- Supabase-Struktur

### Phase 4: Claude Commands Erklärung

PIV-Loop dokumentieren:
- Prime → Plan → Implement → Validate
- Jeder Command kurz erklärt
- Wie sie zusammenwirken

### Phase 5: Interview-Fragen vorbereiten

Kategorien:
- RAG-Konzepte (Mittel)
- Design Decisions (Fokus)
- Implementierungsdetails (Mittel)
- Arbeitsweise (Mittel)
- Everlast AI Kontext (Bonus)

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `.agents/interview/` Verzeichnisstruktur

- **IMPLEMENT**: Verzeichnisse erstellen
- **VALIDATE**: `ls .agents/interview/`

### Task 2: CREATE `.agents/interview/demo-dokumente/technova-faq.md`

- **IMPLEMENT**: Fiktives FAQ-Dokument für TechNova GmbH
- **INHALT**:
  - Unternehmensgründung, Mission, Standort
  - Produkte/Dienstleistungen
  - Kontaktinformationen
  - ca. 500-800 Wörter für sinnvolles Chunking
- **VALIDATE**: Datei existiert und hat Inhalt

### Task 3: CREATE `.agents/interview/demo-dokumente/technova-produkte.txt`

- **IMPLEMENT**: Produktinformationen als Plain Text
- **INHALT**:
  - 3-4 fiktive Produkte mit Beschreibungen
  - Preise, Features
  - ca. 400-600 Wörter
- **VALIDATE**: Datei existiert und hat Inhalt

### Task 4: CREATE `.agents/interview/demo-dokumente/technova-policies.md`

- **IMPLEMENT**: HR-Policies als Markdown (später manuell zu PDF konvertieren)
- **INHALT**:
  - Urlaubsregelungen
  - Home-Office Policy
  - Weiterbildung
  - ca. 400-600 Wörter
- **HINWEIS**: User muss manuell zu PDF konvertieren (z.B. via Browser Print-to-PDF)
- **VALIDATE**: Datei existiert

### Task 5: CREATE `.agents/interview/demo-checkliste.md`

- **IMPLEMENT**: Strukturierte Checkliste für Demo
- **INHALT**:
  ```
  □ Teil 1: End-User Flow
    □ Landing Page zeigen
    □ Registrierung/Login
    □ Dashboard mit Workspaces
    □ Workspace öffnen
    □ Dokument hochladen (TXT)
    □ Frage stellen → Antwort
    □ Weiteres Dokument hochladen (MD)
    □ Frage zu neuem Dokument

  □ Teil 2: RAG-Architektur
    □ Supabase Dashboard öffnen
    □ Tabellen zeigen (workspaces, documents, document_chunks)
    □ Embedding-Daten zeigen (1536 Dimensionen)
    □ RLS Policies erklären
    □ match_documents Function zeigen
    □ Code: retriever.ts kurz zeigen

  □ Teil 3: Arbeitsweise mit Claude Code
    □ CLAUDE.md zeigen (Global Rules)
    □ PRD.md erwähnen
    □ PIV-Loop erklären (Plan → Implement → Validate)
    □ Commands kurz zeigen (Inhalt)

  □ Teil 4: "Über Anforderungen hinaus" (kurz)
    □ Multi-Tenancy war "nice-to-have"
    □ E2E Tests mit Playwright (21 Tests)
    □ Live Deployment auf Vercel
  ```
- **VALIDATE**: Datei existiert

### Task 6: CREATE `.agents/interview/rag-erklaerung.md`

- **IMPLEMENT**: Zusammenfassung der RAG-Pipeline mit Code-Referenzen
- **INHALT**:
  - Pipeline-Übersicht (Upload → Parse → Chunk → Embed → Store → Query → Retrieve → Generate)
  - Chunking: `src/lib/rag/chunker.ts` (RecursiveCharacterTextSplitter, 2000/200)
  - Embeddings: `src/lib/rag/embeddings.ts` (OpenAI text-embedding-3-small)
  - Retrieval: `src/lib/rag/retriever.ts` (match_documents RPC, Threshold 0.25)
  - LLM: `src/lib/llm/claude.ts` (Claude Haiku, System Prompt)
  - Supabase: Tabellen, RLS, HNSW Index
- **VALIDATE**: Datei existiert

### Task 7: CREATE `.agents/interview/claude-commands-erklaerung.md`

- **IMPLEMENT**: Erklärung der Commands und PIV-Loop
- **INHALT**:
  - PIV-Loop Diagramm (ASCII)
  - `/prime` - Kontext laden
  - `/create-prd` - PRD generieren
  - `/plan-feature` - Plan erstellen (mit Confidence Score)
  - `/execute` - Plan implementieren (mit Execution Report)
  - Wie sie zusammenwirken
  - Beispiel-Workflow
- **VALIDATE**: Datei existiert

### Task 8: CREATE `.agents/interview/interview-fragen.md`

- **IMPLEMENT**: Fragen mit vorbereiteten Antworten
- **KATEGORIEN**:

  **A. RAG-Konzepte**
  - "Erkläre die RAG-Pipeline"
  - "Wie funktioniert Vector Search?"
  - "Was ist der Unterschied zwischen Chunking-Strategien?"

  **B. Design Decisions (FOKUS)**
  - "Warum 2000 char Chunks mit 200 Overlap?"
  - "Warum text-embedding-3-small statt ada-002?"
  - "Warum Claude Haiku statt GPT-4?"
  - "Warum HNSW Index?"
  - "Warum Threshold 0.25?"
  - "Warum RecursiveCharacterTextSplitter?"
  - "Warum RLS statt Application-Level Checks?"
  - "Warum Streaming?"
  - "Warum keine Datei-Speicherung nach Chunking?"

  **C. Implementierungsdetails**
  - "Wie hast du Multi-Tenancy umgesetzt?"
  - "Wie funktioniert Query Expansion?"
  - "Wie stellst du DSGVO-Konformität sicher?"

  **D. Arbeitsweise**
  - "Wie hast du Claude Code genutzt?"
  - "Was ist der PIV-Loop?"
  - "Wie stellst du Code-Qualität sicher?"

  **E. Everlast AI Kontext**
  - "Wie könnte man RAG für KI-Telefonagenten nutzen?"
  - "Wie würdest du das System skalieren?"

- **VALIDATE**: Datei existiert

---

## VALIDATION COMMANDS

### Level 1: Dateien existieren

```bash
ls -la .agents/interview/
ls -la .agents/interview/demo-dokumente/
```

### Level 2: Inhalt prüfen

```bash
wc -l .agents/interview/*.md
wc -l .agents/interview/demo-dokumente/*
```

### Level 3: Manual Review

- [ ] Demo-Checkliste ist vollständig und logisch
- [ ] Demo-Dokumente haben genug Inhalt für sinnvolles Chunking
- [ ] Interview-Fragen decken alle Kategorien ab
- [ ] Antworten sind prägnant aber vollständig

---

## ACCEPTANCE CRITERIA

- [ ] Alle 8 Dateien erstellt
- [ ] Demo-Dokumente haben 400-800 Wörter (für sinnvolles Chunking)
- [ ] Demo-Checkliste ist als flexible Checkliste ohne Zeiten formatiert
- [ ] RAG-Erklärung enthält konkrete Code-Referenzen mit Zeilennummern
- [ ] Claude Commands Erklärung enthält PIV-Loop Diagramm
- [ ] Interview-Fragen haben vorbereitete Antworten
- [ ] Design Decisions Fragen haben klare Begründungen
- [ ] Everlast AI Kontext ist in Fragen integriert

---

## COMPLETION CHECKLIST

- [ ] Task 1: Verzeichnisstruktur erstellt
- [ ] Task 2: technova-faq.md erstellt
- [ ] Task 3: technova-produkte.txt erstellt
- [ ] Task 4: technova-policies.md erstellt (User konvertiert zu PDF)
- [ ] Task 5: demo-checkliste.md erstellt
- [ ] Task 6: rag-erklaerung.md erstellt
- [ ] Task 7: claude-commands-erklaerung.md erstellt
- [ ] Task 8: interview-fragen.md erstellt
- [ ] Alle Dateien reviewed und vollständig

---

## NOTES

### Wichtige Punkte für das Interview

1. **Next.js und Supabase waren VORGEGEBEN** - Keine Fragen wie "Warum Supabase?"
2. **Fokus auf Implementierungsdetails** - Chunking, Embeddings, LLM-Wahl, etc.
3. **PIV-Loop hervorheben** - Plan → Implement → Validate
4. **Über Anforderungen hinaus** - Multi-Tenancy, E2E Tests, Deployment (kurz erwähnen)

### Everlast AI Kontext

- Marktführer für KI-Telefonagenten (Voice Agents)
- TÜV-zertifiziert, DSGVO-konform
- 30 Mitarbeiter, 1.500+ Kunden
- Gründer: Leonard Schmedding
- Fokus: Praktische KI-Implementierung

### Demo-Strategie

1. **Erst zeigen, dann erklären** - App demonstrieren, dann Architektur
2. **"Ohne Dokument → Mit Dokument"** - Zeigt RAG-Prinzip anschaulich
3. **Code nur punktuell** - Nicht zu viel, nur wichtigste Stellen
4. **Supabase als Beweis** - Daten zeigen, dass es funktioniert

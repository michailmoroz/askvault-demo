# CLAUDE.md Research Summary

**Date:** 2026-01-23
**Purpose:** Guidelines für die Erstellung einer professionellen CLAUDE.md für das KnowledgeHub RAG-Projekt

---

## 1. Was ist CLAUDE.md?

> "CLAUDE.md is a special file that Claude automatically pulls into context when starting a conversation."
> — [Builder.io Guide](https://www.builder.io/blog/claude-md-guide)

> "The root CLAUDE.md is the single most important file in your codebase for using Claude Code effectively. This file is the agent's 'constitution,' its primary source of truth."
> — [eesel.ai Best Practices](https://www.eesel.ai/blog/claude-code-best-practices)

**Wichtig:** Der Dateiname ist case-sensitive – muss genau `CLAUDE.md` sein (Großbuchstaben).

---

## 2. Kritische Längenbeschränkungen

| Metrik | Empfehlung | Quelle |
|--------|------------|--------|
| Zeilenlänge | < 300 Zeilen, ideal < 60 Zeilen | [HumanLayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md) |
| Instruktionen | ~150-200 Maximum | HumanLayer |
| Claude Code System Prompt | ~50 Instruktionen bereits belegt | HumanLayer |
| Verfügbar für CLAUDE.md | ~100-150 Instruktionen | Berechnet |

> "Smaller models degrade exponentially with instruction overload; larger models decline linearly."
> — HumanLayer Blog

---

## 3. Grundstruktur: WHAT, WHY, HOW

Ein gutes CLAUDE.md sollte drei Dimensionen abdecken:

1. **WHAT** — Technologie-Stack, Projektstruktur, Codebase-Map
2. **WHY** — Zweck des Projekts, was jede Komponente tut
3. **HOW** — Praktische Workflows, Build-Commands, Testing

---

## 4. Empfohlene Sektionen

### Von Anthropic Official ([Claude Blog](https://claude.com/blog/using-claude-md-files))

1. **Project Overview** — Was das Projekt tut, Key Technologies
2. **Directory Structure** — Map der wichtigen Verzeichnisse
3. **Standards & Conventions** — Type Hints, Code Style
4. **Common Commands** — Dev Server, Tests, Build
5. **Project-Specific Notes** — API Patterns, Gotchas

### Von Claude-Flow Templates ([GitHub Wiki](https://github.com/ruvnet/claude-flow/wiki/CLAUDE-MD-Templates))

1. **Critical Rules** — Template-spezifische Patterns, Constraints
2. **Project Context** — Projekttyp, Goals, Tech Stack, Architektur
3. **Development Patterns** — Coding Standards, File Organization
4. **Deployment & CI/CD** — Build Prozesse, Testing Pipelines
5. **Security & Compliance** — Security Practices, Access Controls

### Von Dometrain Guide ([Dometrain Blog](https://dometrain.com/blog/creating-the-perfect-claudemd-for-claude-code/))

1. **Project Overview** — Purpose, Tech Stack
2. **Common Commands** — Mit Directory Context!
3. **Workflows** — Vordefinierte Prozesse
4. **Code Style Guidelines** — Pro Sprache spezifiziert
5. **Architecture & File Structure** — Layer Descriptions
6. **Domain-Specific Terminology** — Business Jargon
7. **MCP Instructions** — Tool-spezifische Guidance

---

## 5. Best Practices

### DO:

- **Start simple, expand deliberately** — Basierend auf echten Friction Points
- **Prefer pointers to copies** — Referenziere andere Docs statt zu kopieren
- **Keep universally applicable** — Nur Instruktionen, die für alle Tasks relevant sind
- **Document specific commands** — Mit exakten Flags und Parametern
- **Include directory context** — Wo Commands ausgeführt werden sollen
- **Treat as living document** — Kontinuierlich iterieren
- **Version control** — In Git committen für Team-Sharing

### DON'T:

- **No sensitive data** — Keine API Keys, Credentials, Connection Strings
- **No exhaustive command lists** — Nur die wichtigsten
- **No code style in CLAUDE.md** — Nutze Linters stattdessen (kontrovers, aber valide)
- **No task-specific info** — Nur universell anwendbare Instruktionen
- **No auto-generated bloat** — Manuell kuratieren

---

## 6. Dateiplatzierung

| Ort | Verwendung |
|-----|------------|
| `./CLAUDE.md` | Projekt-Root (empfohlen, in Git) |
| `./.claude/CLAUDE.md` | Alternative Subdirectory |
| `~/.claude/CLAUDE.md` | Global für alle Projekte |
| `./CLAUDE.local.md` | Persönlich (.gitignore) |

**Monorepos:** CLAUDE.md in Root UND Subdirectories. Claude lädt Child-Directories on-demand.

---

## 7. Projekt-spezifische Guidelines für KnowledgeHub

### RAG-spezifisch

```markdown
## RAG Pipeline

- Embeddings: OpenAI text-embedding-3-small (1536 dimensions)
- Vector Store: Supabase pgvector mit HNSW Index
- Chunking: 512 Tokens, 50 Token Overlap
- Similarity: Cosine Distance
```

### Supabase-spezifisch

```markdown
## Supabase Patterns

- Row Level Security (RLS) für Multi-Tenancy
- Service Role Key NUR für Server-Side Operations
- Anon Key für Client-Side (mit RLS geschützt)
- Edge Functions für sensitive API-Calls
```

### Next.js App Router spezifisch

```markdown
## Next.js Conventions

- App Router (nicht Pages Router)
- Server Components by default
- 'use client' nur wenn nötig
- Route Handlers in app/api/
- URL params sind Promises (await erforderlich)
```

---

## 8. Beispiel-Struktur für unser Projekt

```markdown
# KnowledgeHub

## Project Overview
[1-2 Sätze: Was ist das Projekt?]

## Tech Stack
[Bullet-Liste der Haupttechnologien]

## Directory Structure
[Wichtigste Verzeichnisse mit Beschreibung]

## Common Commands
[Die 5-10 wichtigsten Commands]

## Code Style
[Kurzgefasste Konventionen]

## Architecture Patterns
[RAG Pipeline, Multi-Tenancy, etc.]

## Security
[API Key Handling, RLS, etc.]

## Gotchas
[Projekt-spezifische Warnungen]
```

---

## 9. Quellen

### Offizielle Anthropic

- [Claude Blog: Using CLAUDE.md Files](https://claude.com/blog/using-claude-md-files)
- [Anthropic Engineering: Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

### Community Guides

- [Builder.io: Complete Guide to CLAUDE.md](https://www.builder.io/blog/claude-md-guide)
- [HumanLayer: Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [Dometrain: Creating the Perfect CLAUDE.md](https://dometrain.com/blog/creating-the-perfect-claudemd-for-claude-code/)
- [Maxitect: Maximising Claude Code](https://www.maxitect.blog/posts/maximising-claude-code-building-an-effective-claudemd)

### Beispiele

- [Next.js + TypeScript + Tailwind CLAUDE.md](https://gist.github.com/gregsantos/2fc7d7551631b809efa18a0bc4debd2a)
- [Next.js Codebase Instructions](https://gist.github.com/gengue/2b281b9d2f672b08b512e2227eb3f4ab)
- [Supabase-js Official CLAUDE.md](https://github.com/supabase/supabase-js/blob/master/CLAUDE.md)
- [Claude-Flow Templates](https://github.com/ruvnet/claude-flow/wiki/CLAUDE-MD-Templates)

### RAG-spezifisch

- [RAG Pipelines with Claude and pgvector](https://claude-ai.chat/guides/building-rag-pipelines-with-claude-and-vector-databases/)
- [Supabase Vector Search Docs](https://supabase.com/docs/guides/ai/examples/nextjs-vector-search)

---

## 10. Prinzipien für unsere CLAUDE.md

1. **Kürze über Vollständigkeit** — Max 60-80 Zeilen, fokussiert
2. **Projekt-spezifisch** — Keine generischen Best Practices, die Claude schon kennt
3. **Actionable** — Konkrete Commands, nicht abstrakte Guidelines
4. **Security-First** — API Key Handling explizit dokumentiert
5. **RAG-fokussiert** — Chunking, Embeddings, Vector Search Patterns
6. **Supabase-Patterns** — RLS, Service vs. Anon Key, pgvector
7. **Next.js App Router** — Server Components, Route Handlers
8. **Referenzen statt Kopien** — Auf Entscheidungsdokument verweisen

---

## Changelog

| Datum | Änderung |
|-------|----------|
| 2026-01-23 | Initial research completed |

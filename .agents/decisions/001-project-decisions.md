# Project Decisions: Askvault RAG Application

**Date:** 2026-01-23
**Context:** Recruiting Challenge für RAG mit Next.js & Supabase
**Goal:** Von anderen Bewerbern herausstechen durch professionelle Umsetzung

---

## 1. Projektname & Konzept

**Entscheidung:** "Askvault" – Secure knowledge vault for document Q&A

**Begründung:**
- Einprägsamer, einzigartiger Name (Web-Research bestätigt: nicht vergeben)
- "Ask" = Fragen stellen, "Vault" = sichere Aufbewahrung
- Vermittelt Sicherheit und Intelligenz
- Professioneller als generische Namen
- Domain-freundlich: askvault.vercel.app

---

## 2. Wissensbasis & Dateiformate

**Entscheidung:** Dynamische, upload-fähige Knowledge Base

**Unterstützte Formate (MVP):**
- PDF (via pdf-parse)
- TXT (plain text)
- Markdown (.md)

**Nice-to-have:**
- DOCX (via mammoth)

**Begründung:**
- Zeigt echtes End-to-End RAG-Verständnis
- Chunking-Pipeline selbst gebaut
- Praktisch anwendbar für jeden Use-Case
- Hebt sich von statischen FAQ-Lösungen ab

**Quellen:**
- [Weaviate Chunking Strategies](https://weaviate.io/blog/chunking-strategies-for-rag)
- [Firecrawl Best Chunking 2025](https://www.firecrawl.dev/blog/best-chunking-strategies-rag-2025)

---

## 3. Chunking-Strategie

**Entscheidung:** Hybrid-Ansatz mit dokumenttyp-spezifischer Verarbeitung

**Parameter:**
- Chunk-Größe: 512 Tokens
- Overlap: 50 Tokens (~10%)
- Markdown: Header-basiertes Splitting
- PDF: Nach Absätzen/Sections

**Begründung:**
- Optimal für Retrieval-Qualität laut Forschung
- Verschiedene Dokumenttypen benötigen verschiedene Strategien
- Balance zwischen Kontext und Präzision

**Quellen:**
- [Databricks Chunking Guide](https://community.databricks.com/t5/technical-blog/the-ultimate-guide-to-chunking-strategies-for-rag-applications/ba-p/113089)
- [Stack Overflow Chunking](https://stackoverflow.blog/2024/12/27/breaking-up-is-hard-to-do-chunking-in-rag-applications/)

---

## 4. LLM-Provider

**Entscheidung:** Anthropic API mit Claude Haiku 3.5 (Production-Ready)

**Authentifizierung:** `ANTHROPIC_API_KEY` via Environment Variable

**Warum API Key statt OAuth:**

| Aspekt | OAuth Token | API Key (gewählt) |
|--------|-------------|-------------------|
| Funktioniert 24/7 | Nein (Login erforderlich) | Ja |
| Recruiter kann jederzeit testen | Nein | Ja |
| Production-Standard | Nein | Ja |
| Austauschbar | Kompliziert | Einfach |
| Von Anthropic supported | Grauzone | Offiziell |

**Recherche-Ergebnis zu OAuth:**
- Claude Agent SDK kann lokale Claude Code Auth nutzen
- ABER: Für deployed Web-Apps nicht geeignet (Login-Abhängigkeit)
- Anthropic hat am 9. Januar 2026 Third-Party OAuth-Nutzung eingeschränkt
- Für Production ist API Key die einzig saubere Lösung

**Kosten:**
- $5 Free Credits für neue Accounts
- Claude Haiku 3.5: $0.80/MTok Input, $4.00/MTok Output
- Pro Query (~2500 Tokens): ~$0.004 (0.4 Cent)
- Budget: $10 → ~2,500 Queries (mehr als ausreichend)

**Begründung:**
- Zeigt Anthropic-Affinität (relevant für AI-fokussierte Arbeitgeber)
- Production-ready Architektur
- Unabhängig von Login-Status
- Recruiter kann App jederzeit testen
- Professioneller Standard

**Quellen:**
- [Claude Agent SDK Docs](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Claude Pricing](https://www.anthropic.com/pricing)
- [weidwonder/claude_agent_sdk_oauth_demo](https://github.com/weidwonder/claude_agent_sdk_oauth_demo)

---

## 5. Embedding-Provider

**Entscheidung:** OpenAI text-embedding-3-small

**Begründung:**
- Industrie-Standard für RAG-Anwendungen
- Günstig: $0.02/MTok
- Anthropic bietet kein eigenes Embedding-Modell
- Kombination Anthropic LLM + OpenAI Embeddings ist üblich

**Quellen:**
- [Supabase Vector Search Docs](https://supabase.com/docs/guides/ai/examples/nextjs-vector-search)
- [Medium RAG Tutorial](https://medium.com/@olliedoesdev/create-a-rag-application-using-next-js-supabase-and-openais-text-embedding-3-small-model-7f290c028766)

---

## 6. Styling

**Entscheidung:** Tailwind CSS + shadcn/ui

**Begründung:**
- Schnell zu implementieren
- Sieht sofort professionell aus
- Industrie-Standard 2025
- Fertige Komponenten für Chat-Interface, Dropzone, etc.

---

## 7. Multi-Tenancy

**Entscheidung:** Ja, mit Workspaces und Row-Level Security (RLS)

**Datenmodell:**
```sql
workspaces
├── id (UUID, PK)
├── name
├── created_at
└── owner_id (FK -> auth.users)

documents
├── id (UUID, PK)
├── workspace_id (FK -> workspaces)
├── filename
├── content_type
├── created_at
└── metadata (JSONB)

document_chunks
├── id (UUID, PK)
├── document_id (FK -> documents)
├── content (TEXT)
├── embedding (vector(1536))
├── chunk_index
└── metadata (JSONB)
```

**Begründung:**
- Nice-to-have laut Challenge, aber hebt stark ab
- Zeigt Enterprise-Verständnis
- RLS ist Supabase Best-Practice
- Die meisten Bewerber werden das skippen

**Quellen:**
- [Descope RAG with Supabase](https://www.descope.com/blog/post/rag-descope-supabase-pgvector-1)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)

---

## 8. Vector Index

**Entscheidung:** HNSW (Hierarchical Navigable Small World)

**Begründung:**
- Bis zu 30x schnellere Index-Builds in pgvector v0.6.0
- Signifikant schnellere Searches
- Best-Practice für Supabase + pgvector

**Quellen:**
- [Supabase AI Docs](https://supabase.com/docs/guides/ai/examples/nextjs-vector-search)

---

## 9. Deployment

**Entscheidung:** Vercel + Supabase Cloud (beide Free Tier)

**Begründung:**
- Kein Docker-Overkill für diese Challenge
- Einfach für Recruiter zu testen
- Kostenlos
- Reproduzierbar

**Reproduzierbarkeit:**
- `.env.example` mit allen nötigen Variablen
- README mit 3-Schritt-Setup
- Optional: Seed-Script für Demo-Daten
- Live-Link für sofortiges Testen

---

## 10. Tech-Stack Summary

| Komponente | Technologie | Version |
|------------|-------------|---------|
| Framework | Next.js (App Router) | 14+ |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| UI Components | shadcn/ui | latest |
| Database | Supabase (PostgreSQL) | - |
| Vector Store | pgvector | 0.6+ |
| Vector Index | HNSW | - |
| Auth | Supabase Auth | - |
| LLM | Anthropic Claude Haiku 3.5 | - |
| Embeddings | OpenAI text-embedding-3-small | - |
| File Processing | pdf-parse, mammoth | - |
| Deployment | Vercel + Supabase Cloud | - |

---

## 11. Differenzierungsmerkmale

Was dieses Projekt von anderen Bewerbungen abheben wird:

1. **Dokument-Upload mit Live-Processing** – echtes RAG-Verständnis
2. **Multi-Tenancy mit RLS** – Enterprise-Pattern
3. **HNSW-Index** – zeigt pgvector-Wissen
4. **Streaming Responses** – moderne UX wie ChatGPT
5. **Professionelle Projektstruktur** – CLAUDE.md, PRD, Commands
6. **Live Deployment** – funktionierender Demo-Link
7. **Saubere Dokumentation** – zeigt professionelle Arbeitsweise

---

## 12. API-Key-Sicherheit (KRITISCH)

**Grundregel:** API Keys dürfen NIEMALS im Code oder im Git-Repository erscheinen.

### Verboten (NIEMALS tun)

```typescript
// NIEMALS SO:
const apiKey = "sk-ant-api03-xxxxx"; // HARDCODED = SICHERHEITSLÜCKE
const client = new Anthropic({ apiKey: "sk-ant-..." }); // NEIN!
```

### Korrekte Implementierung

```typescript
// RICHTIG: Aus Environment Variable lesen
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Mit Validierung:
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}
```

### Datei-Struktur für Secrets

```
project/
├── .env.local          # Lokale Secrets (NIEMALS committen)
├── .env.example        # Template ohne echte Werte (committen)
├── .gitignore          # Muss .env* enthalten
└── ...
```

### .env.example (wird committed)

```bash
# API Keys - Ersetze mit deinen eigenen Werten
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
OPENAI_API_KEY=sk-your-key-here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### .gitignore (PFLICHT)

```gitignore
# Environment Variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local

# Niemals API Keys committen
*.pem
*.key
```

### Vercel Deployment

API Keys werden in Vercel als **Environment Variables** gesetzt:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Keys dort eintragen (nicht im Code)
3. Vercel injiziert sie zur Runtime

### Sicherheits-Checkliste

- [ ] `.gitignore` enthält alle `.env*` Dateien
- [ ] `.env.example` enthält nur Platzhalter, keine echten Keys
- [ ] Kein API Key ist hardcoded im Source Code
- [ ] `git log` zeigt keine API Keys in der History
- [ ] Vercel Environment Variables sind gesetzt
- [ ] README erklärt, wie man eigene Keys einsetzt

### Falls ein Key versehentlich committed wurde

1. **Sofort** den Key bei Anthropic/OpenAI rotieren (neuen generieren)
2. Alten Key deaktivieren
3. Git History bereinigen (BFG Repo-Cleaner oder `git filter-branch`)
4. Force Push (nur wenn noch nicht öffentlich)

---

## 13. Offene Punkte

- [ ] API Keys beschaffen (Anthropic, OpenAI)
- [ ] Supabase Projekt erstellen
- [ ] Vercel Projekt erstellen
- [ ] Domain/Subdomain für Demo (optional)
- [ ] .gitignore korrekt konfigurieren
- [ ] .env.example erstellen

---

## Changelog

| Datum | Änderung |
|-------|----------|
| 2026-01-23 | Initial decisions documented |
| 2026-01-23 | LLM-Provider finalisiert: Anthropic API Key (nicht OAuth) |
| 2026-01-23 | API-Key-Sicherheit Abschnitt hinzugefügt |
| 2026-01-23 | Projekt umbenannt: KnowledgeHub → Askvault |

# Askvault Demo Guide

**Zweck:** Vorbereitung und Durchführung der Recruiting Challenge Präsentation
**Stand:** 2026-01-24

---

## 1. Feature-Highlights für die Präsentation

### Kern-Features (Pflicht laut Challenge)
| Feature | Beschreibung | Demo-Punkt |
|---------|--------------|------------|
| End-to-End UI | Web-Interface für Fragen & Antworten | Signup → Upload → Chat in 60s |
| RAG-Pipeline | Embeddings → Retrieval → LLM | Frage stellen, Quellenangabe zeigen |
| Supabase Persistenz | Dokumente, Chunks, Embeddings | SQL-Query in Dashboard zeigen |

### Bonus-Features (über Anforderungen hinaus)
| Feature | Technische Details | Warum beeindruckend |
|---------|-------------------|---------------------|
| **Multi-Tenant mit RLS** | Row Level Security auf DB-Ebene | Nicht gefordert, aber produktionsreif |
| **Streaming Responses** | Vercel AI SDK `useChat` + `streamText()` | Modernes UX wie ChatGPT |
| **Query Expansion** | Letzte 2-3 User-Nachrichten kombiniert | Löst Pronomen-Problem bei Folgefragen |
| **Cross-Language Support** | Threshold 0.25 statt 0.7 | DE-Fragen → EN-Dokumente funktioniert |
| **HNSW Index** | `vector_cosine_ops` Index | 30x schneller als Standard pgvector |

### Architektur-Stärken
- **Saubere Code-Struktur:** `lib/rag/`, `lib/llm/`, `lib/supabase/`
- **TypeScript Strict Mode:** Keine `any` Types, explizite Return-Types
- **Security by Design:** Alle API-Keys in ENV, keine hardcoded Secrets
- **Moderner Stack:** Next.js 16, React 19, Tailwind v4

---

## 2. Demo-Ablauf (Empfohlene Reihenfolge)

### Phase 1: Überblick (2 Min)
1. Landing Page zeigen - minimalistisches Design
2. Kurz Architektur erklären (Diagramm im README)

### Phase 2: End-to-End Flow (3 Min)
1. **Registrierung:** Account erstellen → Auto-Workspace "My Vault"
2. **Upload:** PDF + TXT Dokument hochladen → Progress-Indikator
3. **Chat:** Frage stellen → Streaming-Antwort mit Quellenangabe

### Phase 3: RAG Deep-Dive (3 Min)
1. **Folgefrage stellen:** "Was sind seine Skills?" → Query Expansion zeigen
2. **Cross-Language:** Deutsche Frage zu englischem Dokument
3. **Supabase Dashboard:** Chunks mit Embeddings zeigen (1536 Dimensionen)

### Phase 4: Code-Highlights (2 Min)
1. `src/lib/rag/retriever.ts` - Query Expansion Logic
2. `supabase/migrations/` - RLS Policies
3. `src/app/api/chat/route.ts` - Streaming Integration

---

## 3. Test-Szenarien (vor der Demo durchführen)

### Test 1: Verschiedene Dateitypen
| Dateityp | Test-Dokument | Erwartetes Ergebnis |
|----------|---------------|---------------------|
| PDF | [Demo-PDF vorbereiten] | Chunks extrahiert, Fragen beantwortbar |
| TXT | [Demo-TXT vorbereiten] | Schnelle Verarbeitung |
| MD | [Demo-MD vorbereiten] | Markdown-aware Chunking |

### Test 2: RAG-Qualität
| Frage | Erwartung |
|-------|-----------|
| Direkte Frage zum Inhalt | Korrekte Antwort mit [1] Quellenangabe |
| Folgefrage mit "er/sie/es" | Query Expansion greift, Antwort korrekt |
| Frage in anderer Sprache | Cross-Language Retrieval funktioniert |
| Frage ohne Kontext im Dokument | "Keine Information gefunden" Meldung |

### Test 3: Edge Cases
| Szenario | Erwartung |
|----------|-----------|
| Leerer Workspace | Chat zeigt "Keine Dokumente" Hinweis |
| Sehr lange Frage (>2000 Zeichen) | Fehlermeldung |
| Datei >10MB | Upload wird abgelehnt |
| Falscher Dateityp (.exe) | "Nicht unterstützt" Meldung |

---

## 4. Potenzielle Fragen & Antworten

### Technische Fragen
| Frage | Antwort |
|-------|---------|
| "Warum Claude Haiku?" | Schnell (~1s), günstig, optimiert für RAG mit niedriger Temperatur (0.1) |
| "Warum 2000 char Chunks?" | Balance: Genug Kontext für Verständnis, klein genug für präzises Retrieval |
| "Wie funktioniert die Vector-Suche?" | Cosine Similarity mit HNSW Index, Threshold 0.25 für Cross-Language |
| "Was ist RLS?" | Row Level Security - Datenbank-Level Isolation, User sieht nur eigene Daten |
| "Warum Threshold 0.25?" | Standard 0.7 filtert Cross-Language Matches aus, 0.25 erlaubt DE→EN |
| "Was ist Query Expansion?" | Bei Folgefragen werden letzte 2-3 User-Nachrichten kombiniert für besseren Kontext |

### Architektur-Fragen
| Frage | Antwort |
|-------|---------|
| "Warum Supabase statt eigener DB?" | Integriert Auth, RLS, pgvector - alles in einer Plattform |
| "Wie skaliert das System?" | HNSW Index O(log n), Supabase Connection Pooling, Vercel Edge |
| "Was würdest du anders machen?" | Conversation Persistence, Re-Ranking mit Cohere, Semantic Chunking |

---

## 5. Demo-Checkliste (vor der Präsentation)

### Umgebung
- [ ] `.env.local` mit allen 5 Keys korrekt konfiguriert
- [ ] `npm run build` erfolgreich (keine Errors)
- [ ] `npm run dev` läuft auf localhost:3000

### Supabase
- [ ] Projekt nicht pausiert (Free Tier pausiert nach 1 Woche Inaktivität)
- [ ] pgvector Extension aktiviert
- [ ] Tabellen vorhanden (workspaces, documents, document_chunks)

### Demo-Daten
- [ ] Test-Account erstellt
- [ ] Mindestens 2-3 Demo-Dokumente hochgeladen
- [ ] Fragen vorbereitet und getestet

### Browser
- [ ] Cache geleert
- [ ] DevTools geschlossen (oder bereit zum Zeigen)
- [ ] Inkognito-Fenster für frischen Login

### Backup
- [ ] Screenshots der funktionierenden App
- [ ] Lokale Kopie der Demo-Dokumente
- [ ] README mit Setup-Anleitung falls Live-Demo fehlschlägt

---

## 6. Risiko-Mitigation

| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|-------------------|------------|
| API Rate Limit | Mittel | Budget prüfen, Fallback-Antworten vorbereiten |
| Supabase Cold Start | Mittel (Free Tier) | 5 Min vor Demo eine Anfrage machen |
| PDF Parsing fehlschlägt | Niedrig | Backup TXT-Version bereithalten |
| Internet-Ausfall | Niedrig | Lokale Supabase + Screenshots |
| Nervosität | Hoch | Demo mehrfach üben, Ablauf auswendig |

---

## 7. Nach der Demo: Mögliche Verbesserungen erwähnen

Falls gefragt "Was würdest du noch hinzufügen?":
1. **Conversation Persistence** - Chat-Verlauf in DB speichern
2. **Citation Highlighting** - Quellen-Chunks in UI markieren
3. **Hybrid Search** - Vector + Keyword-Suche kombinieren
4. **Re-Ranking** - Cohere Reranker für bessere Relevanz
5. **Semantic Chunking** - Chunks nach Bedeutung, nicht Länge

---

*Dieses Dokument wird vor der Demo aktualisiert mit konkreten Test-Dokumenten und Fragen.*

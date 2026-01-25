# Phase 4: Polish & Deploy - Übersichtsplan

**Status:** Planung
**Erstellt:** 2026-01-24
**Kontext:** Recruiting Challenge Präsentation vorbereiten

---

## Ausgangssituation

Phase 1-3 sind abgeschlossen. Alle Kern-Features funktionieren:
- ✅ Auth + Multi-Tenant (RLS)
- ✅ Document Upload + Processing
- ✅ RAG Chat mit Streaming

**Offene Punkte für Recruiting Challenge:**
- README nach Vorgaben
- UI Polish (Dark Mode, Animationen)
- CRUD-Vollständigkeit (Delete fehlt)
- Deployment

---

## Phase 4 Struktur

### Phase 4A: UI Polish
**Ziel:** Professionelles, Apple-inspiriertes Design

| Task | Priorität | Beschreibung |
|------|-----------|--------------|
| Dark Mode | Hoch | System-Preference, alle Komponenten |
| Subtile Animationen | Mittel | Fade-in, Transitions, Hover-Effects |
| Chat Layout | Hoch | Hero-Element, mehr Whitespace |
| Typografie | Mittel | Font-Größen, Hierarchie prüfen |

**Bereits erledigt:**
- ✅ Chat-Labels "Du"/"Assistent" entfernt

---

### Phase 4B: CRUD Vollständigkeit
**Ziel:** Alle Entitäten können erstellt und gelöscht werden

| Entity | Create | Delete | API |
|--------|--------|--------|-----|
| Workspace | Button + Modal | Button + Confirm | POST + DELETE `/api/workspaces` |
| Document | ✅ Existiert | Button + Confirm | DELETE `/api/documents/[id]` |

**Entscheidungen:**
- Workspace-Delete löscht kaskadierend alle Dokumente (DB-Constraint existiert)
- Confirm-Dialog vor Delete (Sicherheit)
- Kein Edit/Update für MVP (nicht Demo-relevant)

---

### Phase 4C: README & Dokumentation
**Ziel:** README nach Challenge-Vorgaben

Gefordert laut PDF:
1. Kurzbeschreibung des Problems
2. Grobe Architektur (Diagramm)
3. Setup/Run-Anleitung
4. Design-Entscheidungen

**Format:** Kompakt, scannable, mit Code-Beispielen

---

### Phase 4D: Deployment & Demo
**Ziel:** Live-URL + getestete Demo

| Task | Beschreibung |
|------|--------------|
| Vercel Deploy | GitHub verbinden, ENV vars setzen |
| Demo-Dokumente | PDF, TXT, MD vorbereiten |
| End-to-End Test | Checkliste aus DEMO.md durchgehen |

---

## Reihenfolge & Abhängigkeiten

```
Phase 4A (UI Polish)
    ↓
Phase 4B (CRUD)
    ↓
Phase 4C (README) ← Kann parallel zu 4B
    ↓
Phase 4D (Deploy + Demo)
```

**Begründung:**
- UI zuerst: Screenshots für README
- CRUD vor Deploy: Vollständige Features demonstrieren
- README braucht finale UI-Screenshots

---

## Zeitschätzung

| Phase | Geschätzt |
|-------|-----------|
| 4A: UI Polish | 2h |
| 4B: CRUD | 1h |
| 4C: README | 30min |
| 4D: Deploy + Demo | 1h |
| **Gesamt** | **~4.5h** |

---

## Detaillierte Pläne

Für jede Sub-Phase wird ein detaillierter Plan mit `/plan-feature` erstellt:

1. `.agents/plans/phase-4a-ui-polish.md`
2. `.agents/plans/phase-4b-crud-completeness.md`
3. README wird manuell geschrieben (kein Plan nötig)
4. Deployment wird manuell durchgeführt (kein Plan nötig)

---

## Entscheidungen

| Entscheidung | Begründung |
|--------------|------------|
| Dark Mode mit Tailwind `dark:` | Kein externes Package, Native CSS |
| Animationen ohne Framer Motion | Tailwind CSS reicht für subtile Effects |
| Kein Document-Edit | Nicht Demo-relevant, Delete reicht |
| Kein Chat-Persistence | Out of Scope laut PRD |
| Workspace-Delete mit Cascade | Einfacher als manuelle Cleanup |

---

## Risiken

| Risiko | Mitigation |
|--------|------------|
| Dark Mode bricht Layout | Komponente für Komponente testen |
| Delete löscht versehentlich | Confirm-Dialog implementieren |
| Vercel Build fehlschlägt | Lokal `npm run build` vor Deploy |

---

## Nächster Schritt

→ `/plan-feature` für Phase 4A: UI Polish ausführen

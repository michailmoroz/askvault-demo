# Feature: Phase 4A - UI Polish (Dark Mode, Animationen, Layout)

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

## Feature Description

Implementiere ein professionelles, Apple-inspiriertes UI-Polish für Askvault:
1. **Dark Mode** mit System-Preference Detection und Toggle
2. **Subtile Animationen** nach Apple HIG (Human Interface Guidelines)
3. **Chat als Hero-Element** mit verbessertem Layout
4. **Typografie-Optimierungen** nach Apple-Standards

## User Story

As a **user** I want to **use the app in dark mode and experience smooth, professional animations** so that **the app feels modern, polished, and comfortable to use at any time of day**.

## Problem Statement

Die App hat aktuell:
- Keinen Dark Mode (obwohl CSS-Variablen existieren)
- Keine Animationen für neue Chat-Nachrichten
- Chat unter den Dokumenten statt als Hero-Element
- Text teilweise zu klein nach Apple-Standards

## Solution Statement

1. `next-themes` für Dark Mode mit System-Preference
2. Tailwind CSS Animationen (fade-in, transitions)
3. Layout-Umstrukturierung: Chat zuerst
4. Font-Size-Anpassungen: `text-sm` → `text-base` wo nötig

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: Layout, Components, Styling
**Dependencies**: `next-themes` (neu zu installieren)

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING!)

| File | Lines | Why |
|------|-------|-----|
| `src/app/layout.tsx` | Full | Root Layout für ThemeProvider |
| `src/app/globals.css` | 49-116 | CSS-Variablen für Light/Dark existieren bereits |
| `src/app/globals.css` | 4 | `@custom-variant dark` bereits definiert |
| `src/components/chat/ChatMessage.tsx` | Full | Animationen für Nachrichten hinzufügen |
| `src/components/chat/ChatInterface.tsx` | Full | Layout-Anpassungen |
| `src/components/documents/DocumentList.tsx` | 18-26 | Hardcoded Farben zu fixen |
| `src/app/dashboard/[workspaceId]/page.tsx` | 61-89 | Reihenfolge Chat/Documents ändern |
| `src/app/dashboard/layout.tsx` | 20-36 | Header für Theme-Toggle |
| `src/app/page.tsx` | Full | Landing Page Typografie |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/components/theme/ThemeProvider.tsx` | next-themes Provider Wrapper |
| `src/components/theme/ThemeToggle.tsx` | Dark/Light Mode Toggle Button |
| `src/components/theme/index.ts` | Barrel Export |

### Files to Modify

| File | Changes |
|------|---------|
| `src/app/layout.tsx` | ThemeProvider wrappen |
| `src/app/globals.css` | Animationen hinzufügen |
| `src/components/chat/ChatMessage.tsx` | Fade-in Animation |
| `src/components/chat/ChatInterface.tsx` | Mehr Whitespace, größere Schrift |
| `src/components/documents/DocumentList.tsx` | Dark Mode Farben |
| `src/app/dashboard/[workspaceId]/page.tsx` | Chat vor Documents |
| `src/app/dashboard/layout.tsx` | ThemeToggle im Header |
| `src/app/page.tsx` | Typografie-Anpassung |

### Relevant Documentation

| Source | Section | Why |
|--------|---------|-----|
| [next-themes](https://github.com/pacocoursey/next-themes) | README | Installation, ThemeProvider Setup |
| [Apple Typography HIG](https://developer.apple.com/design/human-interface-guidelines/typography) | Font Sizes | 17pt minimum für Body |
| [Apple Motion HIG](https://developer.apple.com/design/human-interface-guidelines/motion) | Timing | 100-200ms für UI-Interaktionen |
| [Tailwind Animation](https://tailwindcss.com/docs/animation) | Custom Animations | Keyframes Definition |

### Patterns to Follow

**shadcn/ui Component Pattern** (`src/components/ui/button.tsx`):
```typescript
// Komponenten exportieren Varianten und sind 'use client' wenn nötig
import { cn } from '@/lib/utils';
// CSS-Variablen verwenden, nicht hardcoded Farben
className="bg-primary text-primary-foreground"
```

**Dark Mode Farben Pattern** (`src/app/globals.css:84-116`):
```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... alle Variablen haben Dark-Varianten */
}
```

**Lucide Icons mit Farben** (bestehend in DocumentList.tsx):
```typescript
// AKTUELL (zu ändern):
<FileType className="h-8 w-8 text-red-500" />
// NEU (dark mode safe):
<FileType className="h-8 w-8 text-red-500 dark:text-red-400" />
```

---

## IMPLEMENTATION PLAN

### Phase 1: Dark Mode Foundation

**Ziel:** next-themes installieren und ThemeProvider einrichten

**Tasks:**
- next-themes Package installieren
- ThemeProvider Komponente erstellen
- Root Layout mit Provider wrappen
- Basis-Funktionalität testen

### Phase 2: Theme Toggle UI

**Ziel:** Toggle-Button im Header

**Tasks:**
- ThemeToggle Komponente erstellen
- In Dashboard Header integrieren
- Icon-Wechsel (Sun/Moon) implementieren

### Phase 3: Dark Mode Fixes

**Ziel:** Alle hardcoded Farben fixen

**Tasks:**
- DocumentList.tsx Icon-Farben
- Sonstige hardcoded Farben prüfen

### Phase 4: Animationen

**Ziel:** Subtile, Apple-konforme Animationen

**Tasks:**
- CSS Keyframes in globals.css definieren
- Chat Messages fade-in Animation
- Bestehende Transitions optimieren

### Phase 5: Layout & Typografie

**Ziel:** Chat als Hero, bessere Lesbarkeit

**Tasks:**
- Chat-Section vor Documents-Section
- Font-Sizes anpassen
- Whitespace verbessern

---

## STEP-BY-STEP TASKS

### Task 1: INSTALL next-themes

- **IMPLEMENT**: Dark Mode Package installieren
- **COMMAND**: `npm install next-themes --legacy-peer-deps`
- **GOTCHA**: React 19 Peer Dependency Warning - `--legacy-peer-deps` ist erforderlich (bekanntes Issue, funktioniert trotzdem)
- **VALIDATE**: `npm list next-themes` - Version 0.4.x sollte angezeigt werden

---

### Task 2: CREATE `src/components/theme/ThemeProvider.tsx`

- **IMPLEMENT**: Client-side ThemeProvider Wrapper
  ```typescript
  'use client';

  import { ThemeProvider as NextThemesProvider } from 'next-themes';
  import type { ThemeProviderProps } from 'next-themes';

  export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
  }
  ```
- **PATTERN**: `src/components/auth/LoginForm.tsx` - 'use client' Komponente
- **GOTCHA**: Muss 'use client' sein wegen React Context
- **VALIDATE**: `npm run type-check`

---

### Task 3: CREATE `src/components/theme/ThemeToggle.tsx`

- **IMPLEMENT**: Toggle Button mit Sun/Moon Icons
  ```typescript
  'use client';

  import { useTheme } from 'next-themes';
  import { Sun, Moon } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  import { useEffect, useState } from 'react';

  export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return <Button variant="ghost" size="icon" disabled className="w-9 h-9" />;
    }

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="w-9 h-9"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }
  ```
- **PATTERN**: `src/components/auth/LogoutButton.tsx` - Button Pattern
- **IMPORTS**: `useTheme` from 'next-themes', `Sun`, `Moon` from 'lucide-react'
- **GOTCHA**: `mounted` State verhindert Hydration Mismatch
- **VALIDATE**: `npm run type-check`

---

### Task 4: CREATE `src/components/theme/index.ts`

- **IMPLEMENT**: Barrel Export
  ```typescript
  export { ThemeProvider } from './ThemeProvider';
  export { ThemeToggle } from './ThemeToggle';
  ```
- **PATTERN**: `src/components/chat/index.ts`
- **VALIDATE**: `npm run type-check`

---

### Task 5: UPDATE `src/app/layout.tsx`

- **IMPLEMENT**: ThemeProvider wrappen
  ```typescript
  import { ThemeProvider } from '@/components/theme';

  // In return:
  <html lang="en" suppressHydrationWarning>
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </body>
  </html>
  ```
- **IMPORTS**: `ThemeProvider` from '@/components/theme'
- **GOTCHA**: `suppressHydrationWarning` auf html BEHALTEN, `attribute="class"` wichtig für Tailwind
- **VALIDATE**: `npm run build` - keine Errors

---

### Task 6: UPDATE `src/app/dashboard/layout.tsx`

- **IMPLEMENT**: ThemeToggle im Header hinzufügen
  ```typescript
  import { ThemeToggle } from '@/components/theme';

  // Im Header, vor LogoutButton:
  <div className="flex items-center gap-4">
    <span className="text-sm text-muted-foreground">{user.email}</span>
    <ThemeToggle />
    <LogoutButton />
  </div>
  ```
- **PATTERN**: Bestehende Header-Struktur beibehalten
- **VALIDATE**: `npm run dev` - Toggle sollte funktionieren

---

### Task 7: UPDATE `src/components/documents/DocumentList.tsx`

- **IMPLEMENT**: Dark Mode safe Farben für File Icons
  ```typescript
  function getFileIcon(contentType: string) {
    if (contentType === 'application/pdf') {
      return <FileType className="h-8 w-8 text-red-500 dark:text-red-400" />;
    }
    if (contentType === 'text/markdown' || contentType === 'text/x-markdown') {
      return <FileText className="h-8 w-8 text-blue-500 dark:text-blue-400" />;
    }
    return <File className="h-8 w-8 text-muted-foreground" />;
  }
  ```
- **CHANGES**:
  - `text-red-500` → `text-red-500 dark:text-red-400`
  - `text-blue-500` → `text-blue-500 dark:text-blue-400`
  - `text-gray-500` → `text-muted-foreground`
- **VALIDATE**: `npm run type-check`

---

### Task 8: UPDATE `src/app/globals.css`

- **IMPLEMENT**: Animation Keyframes hinzufügen
  ```css
  /* Nach den bestehenden @layer base Regeln hinzufügen: */

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.3s ease-out;
  }
  ```
- **PATTERN**: Apple HIG empfiehlt 100-200ms für subtile Animationen
- **VALIDATE**: Browser DevTools - Animations sollten sichtbar sein

---

### Task 9: UPDATE `src/components/chat/ChatMessage.tsx`

- **IMPLEMENT**: Fade-in Animation und bessere Typografie
  ```typescript
  return (
    <div
      className={cn(
        'flex gap-3 p-5 rounded-lg animate-fade-in',
        isUser ? 'bg-primary/10 ml-12' : 'bg-muted mr-12'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
        )}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="text-base text-foreground whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
  ```
- **CHANGES**:
  - Klasse `animate-fade-in` hinzufügen
  - `p-4` → `p-5` (mehr Whitespace)
  - `ml-8` → `ml-12`, `mr-8` → `mr-12` (mehr Asymmetrie)
  - `w-8 h-8` → `w-10 h-10` (größere Avatare)
  - `h-4 w-4` → `h-5 w-5` (größere Icons)
  - `text-sm` → `text-base` (bessere Lesbarkeit)
  - `leading-relaxed` hinzufügen
- **VALIDATE**: `npm run type-check`

---

### Task 10: UPDATE `src/components/chat/ChatInterface.tsx`

- **IMPLEMENT**: Mehr Whitespace, bessere Typografie
  ```typescript
  // Änderungen in der Hauptkomponente:

  // 1. Card-Höhe flexibler machen
  <Card className="flex flex-col min-h-[500px] max-h-[700px]">

  // 2. CardDescription größer
  <CardDescription className="text-base">
    Frage deine {documentCount} Dokument{documentCount !== 1 ? 'e' : ''}
  </CardDescription>

  // 3. Messages-Area mehr Padding
  <div className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2">

  // 4. Empty State Text größer
  <p className="text-base">Keine Nachrichten</p>
  <p className="text-sm mt-2">
  ```
- **CHANGES**:
  - `h-[600px]` → `min-h-[500px] max-h-[700px]`
  - `space-y-4` → `space-y-6` für mehr Abstand zwischen Nachrichten
  - Empty State Texte anpassen
- **VALIDATE**: `npm run type-check`

---

### Task 11: UPDATE `src/app/dashboard/[workspaceId]/page.tsx`

- **IMPLEMENT**: Chat vor Documents anzeigen
  - Zeile 82-87 (ChatSection) NACH oben verschieben
  - Zeile 76-80 (WorkspaceClient/Documents) NACH unten
  ```typescript
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* ... unverändert ... */}
      </div>

      {/* Chat Section - JETZT ZUERST */}
      <ChatSection
        workspaceId={workspaceId}
        documentCount={documentsWithCount.length}
      />

      {/* Documents Section - JETZT DANACH */}
      <WorkspaceClient
        workspaceId={workspaceId}
        initialDocuments={documentsWithCount}
      />
    </div>
  );
  ```
- **GOTCHA**: Nur die Reihenfolge ändern, keine anderen Änderungen
- **VALIDATE**: `npm run dev` - Chat sollte oben sein

---

### Task 12: UPDATE `src/app/page.tsx`

- **IMPLEMENT**: Typografie nach Apple-Standards
  ```typescript
  <main className="flex min-h-screen items-center justify-center">
    <div className="text-center space-y-6 max-w-2xl px-4">
      <h1 className="text-5xl font-bold tracking-tight">Askvault</h1>
      <p className="text-lg text-muted-foreground">
        Your documents. Your answers.
      </p>
      <div className="flex items-center justify-center gap-4 pt-4">
        <Button asChild size="lg">
          <Link href="/register">Get Started</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </div>
  </main>
  ```
- **CHANGES**:
  - `text-6xl` → `text-5xl` (Apple: max 34pt für Titles)
  - `text-xl` → `text-lg` (subtiler)
  - `space-y-8` → `space-y-6` (kompakter)
  - `pt-4` für Button-Gruppe
- **VALIDATE**: `npm run type-check`

---

## TESTING STRATEGY

### Manual Testing

**Dark Mode Tests:**
1. App starten, System auf Dark Mode stellen → App sollte dark sein
2. Toggle klicken → Mode wechselt sofort
3. Page refresh → Theme bleibt erhalten (localStorage)
4. Alle Seiten durchgehen → Keine unlesbaren Texte/Farben

**Animation Tests:**
1. Chat öffnen, Nachricht senden → Fade-in Animation sichtbar
2. Hover über Cards → Smooth Transition

**Layout Tests:**
1. Workspace öffnen → Chat ist ÜBER Documents
2. Chat-Nachrichten haben mehr Whitespace
3. Text ist gut lesbar (nicht zu klein)

### Edge Cases

1. **Hydration Mismatch**: ThemeToggle zeigt korrektes Icon nach Mount
2. **System Theme Change**: App reagiert auf OS Theme-Wechsel
3. **Long Messages**: Animation nicht störend bei langen Texten

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

### Level 3: Manual E2E Testing

**Test 1: Dark Mode Toggle**
1. `npm run dev`
2. Dashboard öffnen
3. Theme Toggle klicken
4. **Erwartung:** Sofortiger Wechsel, alle Komponenten korrekt

**Test 2: System Preference**
1. Browser/OS auf Dark Mode stellen
2. App neu laden
3. **Erwartung:** App startet in Dark Mode

**Test 3: Persistence**
1. Theme auf Dark setzen
2. Tab schließen, neu öffnen
3. **Erwartung:** Dark Mode bleibt

**Test 4: Chat Animations**
1. Workspace mit Dokumenten öffnen
2. Frage stellen
3. **Erwartung:** Antwort faded sanft ein

**Test 5: Layout Order**
1. Workspace öffnen
2. **Erwartung:** Chat-Section erscheint VOR Documents-Section

---

## ACCEPTANCE CRITERIA

- [ ] Dark Mode Toggle funktioniert
- [ ] System-Preference wird respektiert
- [ ] Theme-Wahl wird in localStorage gespeichert
- [ ] Alle Komponenten haben korrekte Dark Mode Farben
- [ ] Chat Messages haben fade-in Animation
- [ ] Chat-Section erscheint vor Documents
- [ ] Typografie entspricht Apple-Standards (min 16px für Body)
- [ ] `npm run lint` hat 0 Errors
- [ ] `npm run type-check` hat 0 Errors
- [ ] `npm run build` ist erfolgreich

---

## COMPLETION CHECKLIST

- [ ] next-themes installiert
- [ ] ThemeProvider erstellt und eingebunden
- [ ] ThemeToggle erstellt und im Header
- [ ] Hardcoded Farben gefixt (DocumentList)
- [ ] Animationen definiert (globals.css)
- [ ] ChatMessage Animation hinzugefügt
- [ ] ChatInterface Whitespace verbessert
- [ ] Layout-Reihenfolge geändert (Chat first)
- [ ] Landing Page Typografie angepasst
- [ ] Alle Validation Commands erfolgreich
- [ ] Alle manuellen Tests bestanden

---

## NOTES

### Key Design Decisions

| Entscheidung | Begründung |
|--------------|------------|
| `next-themes` | Industrie-Standard, SSR-safe, 3KB |
| `attribute="class"` | Tailwind nutzt `.dark` Klasse |
| `defaultTheme="system"` | Respektiert User-Preference |
| Animation 200ms | Apple HIG: 100-200ms für UI |
| `text-base` statt `text-sm` | Apple: 17pt minimum für Body |
| Chat vor Documents | Chat ist die Hauptfunktion |

### Apple HIG Compliance

| Guideline | Implementation |
|-----------|---------------|
| Min Body Font 17pt | `text-base` (16px) - nah genug für Web |
| Animation 100-200ms | `fade-in 0.2s` |
| Keine Light Fonts | Nur Regular, Medium, Semibold |
| Subtle Motion | Nur fade-in, keine Bounce/Elastic |

### Potential Issues

| Issue | Mitigation |
|-------|------------|
| Flash of Wrong Theme | `suppressHydrationWarning` + `disableTransitionOnChange` |
| Hydration Mismatch | `mounted` State in ThemeToggle |
| Animation Performance | CSS-only, keine JS-Animation |

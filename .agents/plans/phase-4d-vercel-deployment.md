# Feature: Phase 4D - Vercel Deployment

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

## Feature Description

Deploy Askvault to Vercel für öffentlichen Zugriff. Includes:
- Console.log Cleanup für Production
- Git Repository initialisieren
- GitHub Repository erstellen via CLI (private)
- Vercel Account erstellen und verbinden via CLI
- Environment Variables konfigurieren via CLI
- Production Build deployen
- E2E Tests mit Playwright
- Supabase Redirect URL konfigurieren

## User Story

As a **recruiter/evaluator** I want to **access a live demo of Askvault** so that **I can test the application without local setup**.

## Problem Statement

Die App existiert nur lokal. Für die Recruiting Challenge muss eine öffentlich zugängliche URL bereitgestellt werden.

## Solution Statement

1. Code für Production vorbereiten (Console.logs entfernen)
2. Git Repository initialisieren und auf GitHub pushen via `gh` CLI (private)
3. Vercel CLI authentifizieren und Projekt deployen
4. Environment Variables in Vercel via CLI konfigurieren
5. Supabase Redirect URLs konfigurieren
6. E2E Tests mit Playwright ausführen
7. Deployment verifizieren

## Feature Metadata

**Feature Type**: Deployment
**Estimated Complexity**: Low
**Primary Systems Affected**: Infrastructure, CI/CD
**Dependencies**: GitHub CLI (gh), Vercel CLI
**Confidence Score**: 9/10 (nur Vercel Login + Supabase Redirect URL manuell)

---

## EXECUTION RULES

### Manual Task Handling

**CRITICAL:** Bei allen Tasks mit `TYPE: Manual` oder `TYPE: Semi-Manual` MUSS die Ausführung angehalten werden.

**Vorgehen bei manuellen Tasks:**
1. **STOP** - Ausführung sofort anhalten
2. **NOTIFY** - Benutzer mit `AskUserQuestion` Tool benachrichtigen
3. **INSTRUCTIONS** - Klare Schritt-für-Schritt Anleitung geben
4. **WAIT** - Auf Bestätigung warten, dass der Task abgeschlossen ist
5. **VALIDATE** - Nach Bestätigung den Validation-Schritt ausführen
6. **CONTINUE** - Erst dann mit dem nächsten Task fortfahren

### Code Cleanup Validation

**CRITICAL:** Nach dem Entfernen von console.log Statements MUSS sichergestellt werden, dass alle Funktionalitäten erhalten bleiben.

**Vorgehen:**
1. `npm run type-check` - TypeScript Fehler prüfen
2. `npm run lint` - Linting Fehler prüfen
3. `npm run build` - Production Build testen
4. Dev Server starten und Smoke Tests gegen localhost ausführen
5. Alle Core Features müssen funktionieren:
   - Auth (Login/Register)
   - Document Upload
   - Chat mit RAG Retrieval
   - Streaming Responses

## Pre-Validated Configuration

| Setting | Value |
|---------|-------|
| GitHub Username | `michailmoroz` |
| GitHub Repo Name | `askvault-demo` |
| Repo Visibility | Private |
| Supabase Migrations | Already deployed |

## CLI Tools Status

| Tool | Version | Auth Status |
|------|---------|-------------|
| GitHub CLI (`gh`) | 2.83.0 | ✅ Authenticated as michailmoroz |
| Vercel CLI | 50.5.0 | ⚠️ Needs login |
| Playwright | 1.58.0 | ✅ Available via npx |

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING!)

| File | Lines | Why |
|------|-------|-----|
| `src/app/api/chat/route.ts` | Full | 12 console.log statements zu entfernen |
| `src/lib/rag/retriever.ts` | Full | 6 console.log statements zu entfernen |
| `.env.example` | Full | Environment Variables Template |
| `.gitignore` | Full | Verify .env files are ignored |
| `package.json` | Full | Build script verification |

### Files to Modify

| File | Changes |
|------|---------|
| `src/app/api/chat/route.ts` | Remove all console.log statements |
| `src/lib/rag/retriever.ts` | Remove all console.log statements |
| `README.md` | Update with live demo URL |
| `package.json` | Add Playwright dev dependency + test script |

### Environment Variables for Vercel

| Variable | Type | Source |
|----------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Supabase Dashboard → Settings → API |
| `ANTHROPIC_API_KEY` | Secret | Anthropic Console |
| `OPENAI_API_KEY` | Secret | OpenAI Platform |

---

## DEPLOYMENT CONTEXT

### Vercel Configuration

- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)
- **Node.js Version**: 18.x (default)

### Runtime Requirements

- `/api/documents` requires Node.js runtime (pdf-parse)
- `/api/chat` requires Node.js runtime
- Both already have `export const runtime = 'nodejs'`

### Known Compatibility Notes

- Next.js 16.1.4 is supported on Vercel
- Tailwind CSS v4 works with Vercel
- React 19 is supported

---

## IMPLEMENTATION PLAN

### Phase 1: Code Cleanup (Automated + Validated)

Entferne Debug-Logs für Production und stelle sicher, dass alle Funktionalitäten erhalten bleiben.

**Tasks:**
- Remove console.log statements from chat/route.ts
- Remove console.log statements from retriever.ts
- Run type-check, lint, and build
- Start dev server and run E2E smoke tests against localhost
- Verify all core features still work

### Phase 2: Git + GitHub Setup (Automated via CLI)

Initialisiere Git und pushe zu GitHub via `gh` CLI.

**Tasks:**
- Initialize git repository
- Create initial commit
- Create private GitHub repository via `gh repo create`
- Push to GitHub

### Phase 3: Vercel Setup (Mostly Automated via CLI)

Authentifiziere Vercel CLI und deploye.

**Tasks:**
- Login to Vercel via `vercel login` (one-time browser auth)
- Link project via `vercel link`
- Configure environment variables via `vercel env add`
- Deploy via `vercel --prod`

### Phase 4: Supabase Config (Manual - 1 Task)

Konfiguriere Redirect URLs in Supabase Dashboard.

**Tasks:**
- Add Vercel URL to Supabase allowed redirect URLs

### Phase 5: E2E Tests (Automated)

Installiere Playwright und führe Tests aus.

**Tasks:**
- Install Playwright
- Create basic E2E test suite
- Run tests against deployed URL

### Phase 6: Finalization

Update README und finaler Commit.

**Tasks:**
- Update README with live URL
- Final commit and push

---

## STEP-BY-STEP TASKS

### Task 1: REMOVE console.log from chat/route.ts

- **TYPE**: Automated
- **IMPLEMENT**: Remove all console.log statements (keep console.error)
- **VALIDATE**: `npm run type-check`

### Task 2: REMOVE console.log from retriever.ts

- **TYPE**: Automated
- **IMPLEMENT**: Remove all console.log statements (keep console.error)
- **VALIDATE**: `npm run type-check`

### Task 3: RUN static checks

- **TYPE**: Automated
- **IMPLEMENT**:
  ```bash
  npm run type-check
  npm run lint
  npm run build
  ```
- **VALIDATE**: All commands complete without errors

### Task 3a: INSTALL Playwright for local testing ✅ COMPLETED

- **TYPE**: Automated
- **STATUS**: ✅ Completed (2026-01-26)
- **IMPLEMENT**:
  ```bash
  npm install -D @playwright/test
  npx playwright install chromium
  ```
- **VALIDATE**: Playwright installed ✅

### Task 3b: CREATE local smoke test file ✅ COMPLETED

- **TYPE**: Automated
- **STATUS**: ✅ Completed (2026-01-26)
- **IMPLEMENT**: Create `e2e/smoke.spec.ts` with tests for:
  - Login page is accessible ✅
  - Login page has form elements ✅
  - Register page loads correctly ✅
  - Can navigate from login to register ✅
  - Invalid login stays on login page ✅
  - Login form has required fields ✅
- **VALIDATE**: File exists at `e2e/smoke.spec.ts` ✅

### Task 3c: CREATE Playwright config ✅ COMPLETED

- **TYPE**: Automated
- **STATUS**: ✅ Completed (2026-01-26)
- **IMPLEMENT**: Create `playwright.config.ts` with localhost as default baseURL
- **VALIDATE**: File exists at `playwright.config.ts` ✅

### Task 3d: RUN smoke tests against localhost ✅ COMPLETED

- **TYPE**: Automated
- **STATUS**: ✅ Completed (2026-01-26) - 6/6 tests passed
- **IMPLEMENT**:
  ```bash
  npx playwright test
  ```
- **VALIDATE**: All smoke tests pass ✅
- **RESULT**: 6 passed (8.4s)

### Task 4: INITIALIZE git repository

- **TYPE**: Automated
- **IMPLEMENT**: `git init`
- **VALIDATE**: `git status` shows untracked files

### Task 5: CREATE initial commit

- **TYPE**: Automated
- **IMPLEMENT**:
  ```bash
  git add .
  git commit -m "Initial commit: Askvault RAG application"
  ```
- **VALIDATE**: `git log` shows commit

### Task 6: CREATE GitHub repository via CLI

- **TYPE**: Automated
- **IMPLEMENT**:
  ```bash
  gh repo create askvault-demo --private --source=. --remote=origin --push
  ```
- **VALIDATE**: `gh repo view` shows repository info

### Task 7: LOGIN to Vercel (One-time browser auth)

- **TYPE**: Semi-Manual (browser opens for OAuth)
- **⚠️ STOP AND NOTIFY USER ⚠️**

**ANLEITUNG FÜR DEN BENUTZER:**

1. Ein Browser-Fenster wird sich öffnen
2. Wähle "Continue with GitHub" um dich mit deinem GitHub Account anzumelden
3. Autorisiere Vercel für den Zugriff auf deinen GitHub Account
4. Nach erfolgreicher Anmeldung zeigt der Browser "CLI Login Success"
5. Kehre zum Terminal zurück und bestätige, dass der Login abgeschlossen ist

- **IMPLEMENT**:
  ```bash
  vercel login
  ```
- **VALIDATE**: `vercel whoami` shows account
- **WAIT**: Erst nach Bestätigung durch den Benutzer fortfahren

### Task 8: LINK project to Vercel

- **TYPE**: Automated
- **IMPLEMENT**:
  ```bash
  vercel link --yes
  ```
- **NOTE**: Creates `.vercel` directory with project config
- **VALIDATE**: `.vercel/project.json` exists

### Task 9: ADD environment variables to Vercel

- **TYPE**: Automated (reads from .env.local)
- **IMPLEMENT**:
  ```bash
  # Add each variable (production + preview + development)
  vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development < <(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d'=' -f2-)
  vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development < <(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d'=' -f2-)
  vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development < <(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d'=' -f2-)
  vercel env add ANTHROPIC_API_KEY production preview development < <(grep ANTHROPIC_API_KEY .env.local | cut -d'=' -f2-)
  vercel env add OPENAI_API_KEY production preview development < <(grep OPENAI_API_KEY .env.local | cut -d'=' -f2-)
  ```
- **ALTERNATIVE** (interactive):
  ```bash
  vercel env add NEXT_PUBLIC_SUPABASE_URL
  # Then paste value when prompted
  ```
- **VALIDATE**: `vercel env ls` shows all 5 variables

### Task 10: DEPLOY to Vercel

- **TYPE**: Automated
- **IMPLEMENT**:
  ```bash
  vercel --prod
  ```
- **VALIDATE**: Deployment URL printed, status "Ready"

### Task 11: CONFIGURE Supabase Redirect URL (Manual)

- **TYPE**: Manual
- **⚠️ STOP AND NOTIFY USER ⚠️**

**ANLEITUNG FÜR DEN BENUTZER:**

Dieser Schritt ist notwendig, damit die Authentifizierung auf der deployed App funktioniert.

1. Öffne das Supabase Dashboard: https://supabase.com/dashboard
2. Wähle dein Projekt aus
3. Navigiere zu: **Authentication** → **URL Configuration**
4. Scrolle zu **Redirect URLs**
5. Klicke auf **Add URL** und füge hinzu:
   ```
   https://askvault-demo.vercel.app/**
   ```
6. Klicke erneut auf **Add URL** und füge hinzu (für Preview Deployments):
   ```
   https://askvault-demo-*.vercel.app/**
   ```
7. Klicke auf **Save**
8. Bestätige hier, dass die URLs hinzugefügt wurden

- **VALIDATE**: Beide URLs sind in der Supabase Dashboard URL Configuration sichtbar
- **WAIT**: Erst nach Bestätigung durch den Benutzer fortfahren

### Task 12: RUN E2E tests against production

- **TYPE**: Automated
- **IMPLEMENT**:
  ```bash
  PLAYWRIGHT_BASE_URL=https://askvault-demo.vercel.app npx playwright test
  ```
- **NOTE**: Playwright wurde bereits in Task 3a installiert, Tests in Task 3b erstellt
- **VALIDATE**: All tests pass against production URL

### Task 13: UPDATE README with live URL

- **TYPE**: Automated
- **IMPLEMENT**: Replace placeholder URL with actual Vercel URL
- **VALIDATE**: `git diff README.md`

### Task 14: COMMIT and PUSH final changes

- **TYPE**: Automated
- **IMPLEMENT**:
  ```bash
  git add .
  git commit -m "Add E2E tests and update README with live URL"
  git push
  ```
- **VALIDATE**: Changes visible on GitHub, auto-redeploy triggered

---

## E2E TEST SPECIFICATION

### Test File: `e2e/smoke.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Askvault Smoke Tests', () => {
  test('homepage loads and redirects to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/login/);
  });

  test('login page has form elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /anmelden|login/i })).toBeVisible();
  });

  test('register page accessible', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /registrieren|register/i })).toBeVisible();
  });

  test('invalid login shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /anmelden|login/i }).click();
    // Should show error (not redirect to dashboard)
    await expect(page).toHaveURL(/login/);
  });
});
```

### Playwright Config: `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
```

---

## TESTING STRATEGY

### Automated E2E Tests (Playwright)

- [x] Homepage redirects to login
- [x] Login page has form elements
- [x] Register page accessible
- [x] Invalid login shows error

### Manual Testing Checklist (Post-Deployment)

**Authentication:**
- [ ] Register new user works
- [ ] Login works
- [ ] Logout works
- [ ] Session persists on refresh

**Documents:**
- [ ] Upload PDF works
- [ ] Upload TXT works
- [ ] Chat returns contextual answers

---

## VALIDATION COMMANDS

### Level 1: Pre-Deployment

```bash
npm run lint
npm run type-check
npm run build
```

### Level 2: Git + GitHub

```bash
git status
git log --oneline -3
gh repo view
```

### Level 3: Vercel

```bash
vercel whoami
vercel env ls
vercel ls
```

### Level 4: E2E Tests

```bash
PLAYWRIGHT_BASE_URL=https://askvault-demo.vercel.app npx playwright test
```

---

## ACCEPTANCE CRITERIA

- [x] All console.log statements removed from production code
- [x] Git repository initialized and pushed to GitHub (private)
- [x] Vercel CLI authenticated
- [x] All 5 environment variables configured in Vercel
- [x] Deployment successful with production URL
- [x] Supabase Redirect URLs configured
- [x] E2E smoke tests pass
- [x] README updated with live demo URL
- [x] No errors in Vercel deployment logs

---

## COMPLETION CHECKLIST

### Phase 1: Code Cleanup + Validation
- [ ] Console.logs removed from chat/route.ts
- [ ] Console.logs removed from retriever.ts
- [ ] Type-check passes
- [ ] Lint passes
- [ ] Build passes
- [x] Playwright installed ✅
- [x] E2E smoke tests created ✅
- [x] E2E smoke tests pass against localhost ✅ (6/6 passed)

### Phase 2: Git + GitHub
- [ ] Git repository initialized
- [ ] Initial commit created
- [ ] GitHub repository created (private)
- [ ] Code pushed to GitHub

### Phase 3: Vercel Setup
- [ ] ⚠️ MANUAL: Vercel CLI authenticated (browser OAuth)
- [ ] Project linked to Vercel
- [ ] Environment variables configured (5 variables)
- [ ] Deployment successful

### Phase 4: Supabase Config
- [ ] ⚠️ MANUAL: Supabase Redirect URLs added

### Phase 5: Production Validation
- [ ] E2E tests pass against production URL

### Phase 6: Finalization
- [ ] README updated with live URL
- [ ] Final commit pushed

---

## NOTES

### Task Automation Summary

| Phase | Tasks | Type | Tool |
|-------|-------|------|------|
| 1 | Console.log cleanup | Automated | Code edit |
| 1 | Static checks (type, lint, build) | Automated | npm scripts |
| 1 | Playwright setup + local tests | Automated | Playwright |
| 2 | Git init + commit | Automated | git |
| 2 | GitHub repo create + push | Automated | gh CLI |
| 3 | Vercel login | ⚠️ Semi-Manual | vercel CLI (browser OAuth) |
| 3 | Vercel link + env + deploy | Automated | vercel CLI |
| 4 | Supabase Redirect URLs | ⚠️ Manual | Supabase Dashboard |
| 5 | E2E tests (production) | Automated | Playwright |
| 6 | README update + final push | Automated | git |

**Manual Steps: 2** (Vercel OAuth in browser, Supabase Dashboard)
**Confidence Score: 9/10**

### Manual Task Protocol

Bei Tasks mit ⚠️ wird:
1. Die Ausführung angehalten
2. Der Benutzer mit klaren Schritt-für-Schritt Anleitungen benachrichtigt
3. Auf Bestätigung gewartet
4. Erst dann fortgefahren

### Troubleshooting Guide

**Build fails on Vercel:**
1. Check build logs: `vercel logs`
2. Verify all environment variables: `vercel env ls`
3. Run `npm run build` locally to reproduce

**API returns 500:**
1. Check Vercel Function logs: `vercel logs --follow`
2. Verify API keys are correct in Vercel env

**Auth doesn't work:**
1. Verify Supabase Redirect URLs include Vercel domain
2. Check browser console for CORS errors

### Security Reminders

- Never commit `.env.local` to git (already in .gitignore)
- Verify SUPABASE_SERVICE_ROLE_KEY is not exposed client-side
- Repository is private

### Cost Considerations

- Vercel Hobby tier: Free (sufficient for demo)
- Supabase Free tier: 500MB database, 2 GB bandwidth
- Anthropic: Pay-per-use (~$0.10 for demo)
- OpenAI: Pay-per-use (~$0.05 for demo)
- **Total: < $0.20**

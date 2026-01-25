# Feature: Phase 1A - Project Setup

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

## Feature Description

Initialize the Askvault Next.js project with TypeScript strict mode, Tailwind CSS, and shadcn/ui component library. This establishes the foundational tooling and configuration for all subsequent development.

## User Story

As a **developer**, I want to **have a properly configured Next.js project with all tooling set up**, so that **I can build the application with consistent patterns and type safety**.

## Problem Statement

No codebase exists yet. We need a properly configured Next.js 14+ project with TypeScript strict mode, Tailwind CSS, and shadcn/ui before any features can be implemented.

## Solution Statement

Use `create-next-app` to scaffold the project, configure TypeScript for strict mode, set up environment variable templates, and initialize shadcn/ui with core components (Button, Input, Card, Label).

## Feature Metadata

**Feature Type**: New Capability (Greenfield Project)
**Estimated Complexity**: Low
**Primary Systems Affected**: Build tooling, TypeScript configuration, CSS framework
**Dependencies**: Node.js 18+, npm

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING!)

| File | Lines | Why |
|------|-------|-----|
| `CLAUDE.md` | Full | Coding conventions, naming, import order |
| `.agents/PRD.md` | Section 6 (lines 197-256) | Target directory structure |
| `.agents/PRD.md` | Section 8 (lines 350-402) | Dependencies list |

### New Files to Create

| File | Purpose |
|------|---------|
| `package.json` | Project dependencies and scripts |
| `tsconfig.json` | TypeScript configuration (strict mode) |
| `next.config.js` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS for Tailwind |
| `.env.example` | Environment variable template |
| `.gitignore` | Git ignore patterns (update for env files) |
| `src/lib/utils.ts` | cn() helper for className merging |
| `src/components/ui/button.tsx` | shadcn Button (auto-generated) |
| `src/components/ui/input.tsx` | shadcn Input (auto-generated) |
| `src/components/ui/card.tsx` | shadcn Card (auto-generated) |
| `src/components/ui/label.tsx` | shadcn Label (auto-generated) |
| `components.json` | shadcn/ui configuration |

### Relevant Documentation

| Source | Section | Why |
|--------|---------|-----|
| [Next.js Installation](https://nextjs.org/docs/getting-started/installation) | create-next-app | Project scaffolding |
| [shadcn/ui Next.js](https://ui.shadcn.com/docs/installation/next) | Full guide | Component library setup |
| [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict) | Compiler options | Type safety configuration |

### Patterns to Follow

**Naming Conventions (from CLAUDE.md):**
- Components: `PascalCase` (e.g., `Button.tsx`)
- Utilities: `kebab-case` (e.g., `utils.ts`)
- Functions/Variables: `camelCase`

**Import Order (from CLAUDE.md):**
```
React → Next → External → Internal (@/) → Types
```

**TypeScript (from CLAUDE.md):**
- Strict mode enabled
- No `any` types
- Explicit return types for functions
- Prefer interfaces over type aliases for objects

---

## IMPLEMENTATION PLAN

### Phase 1: Project Scaffolding

Create Next.js project with all base configurations using create-next-app.

### Phase 2: Configuration

Configure TypeScript strict mode and add custom scripts.

### Phase 3: Environment Setup

Create .env.example template and update .gitignore for security.

### Phase 4: Dependencies

Install additional required packages for Supabase and utilities.

### Phase 5: shadcn/ui

Initialize shadcn/ui and add core components.

---

## STEP-BY-STEP TASKS

### Task 1: CREATE Next.js Project

- **IMPLEMENT**: Run create-next-app with all recommended options
- **COMMAND**:
  ```bash
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
  ```
- **GOTCHA**: Must run in empty directory or current directory with only documentation files
- **GOTCHA**: Use `--use-npm` to ensure npm (not yarn/pnpm) for consistency
- **VALIDATE**: `ls src/app` shows `layout.tsx`, `page.tsx`, `globals.css`

---

### Task 2: UPDATE `tsconfig.json` - Strict Mode

- **IMPLEMENT**: Ensure strict TypeScript options are enabled
- **CHANGES**: Verify/add these compiler options:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true
    }
  }
  ```
- **GOTCHA**: create-next-app may already set `strict: true`, verify and add missing options
- **VALIDATE**: `npx tsc --noEmit` runs without errors

---

### Task 3: UPDATE `package.json` - Add Scripts

- **IMPLEMENT**: Add type-check script for CI/pre-commit validation
- **CHANGES**: Add to "scripts" section:
  ```json
  {
    "scripts": {
      "type-check": "tsc --noEmit"
    }
  }
  ```
- **VALIDATE**: `npm run type-check` executes successfully

---

### Task 4: CREATE `.env.example`

- **IMPLEMENT**: Template file with all required environment variables (NO real values)
- **CONTENT**:
  ```bash
  # Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

  # AI Services (needed in Phase 2+)
  ANTHROPIC_API_KEY=sk-ant-your-key-here
  OPENAI_API_KEY=sk-your-key-here
  ```
- **GOTCHA**: Use descriptive placeholders, never real keys
- **VALIDATE**: File exists with 5 environment variables defined

---

### Task 5: UPDATE `.gitignore` - Environment Security

- **IMPLEMENT**: Ensure all environment files are ignored
- **CHANGES**: Add these lines if not present:
  ```gitignore
  # Environment Variables - NEVER COMMIT
  .env
  .env.local
  .env.development.local
  .env.test.local
  .env.production.local
  .env*.local

  # Supabase local
  supabase/.branches
  supabase/.temp
  ```
- **VALIDATE**: `git status` does not show any .env files

---

### Task 6: INSTALL Core Dependencies

- **IMPLEMENT**: Add Supabase, validation, and utility packages
- **COMMAND**:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr zod lucide-react class-variance-authority clsx tailwind-merge
  ```
- **PACKAGES**:
  - `@supabase/supabase-js`: Supabase client
  - `@supabase/ssr`: Server-side rendering support for Supabase
  - `zod`: Schema validation
  - `lucide-react`: Icon library
  - `class-variance-authority`: Component variant styling
  - `clsx`: Conditional classNames
  - `tailwind-merge`: Merge Tailwind classes intelligently
- **VALIDATE**: `npm ls @supabase/ssr` shows installed version

---

### Task 7: CREATE `src/lib/utils.ts`

- **IMPLEMENT**: Utility function for className merging (required by shadcn/ui)
- **STRUCTURE**:
  ```typescript
  // Import clsx for conditional classes
  // Import twMerge for Tailwind class merging
  // Export cn() function that combines both
  //
  // Function signature:
  // export function cn(...inputs: ClassValue[]): string
  //
  // Implementation: return twMerge(clsx(inputs))
  ```
- **IMPORTS**: `clsx` (type ClassValue), `tailwind-merge` (twMerge)
- **VALIDATE**: File exists, exports `cn` function

---

### Task 8: INIT shadcn/ui

- **IMPLEMENT**: Initialize shadcn/ui with default configuration
- **COMMAND**:
  ```bash
  npx shadcn@latest init -d
  ```
- **GOTCHA**: `-d` flag uses defaults. If prompted, select: Style=Default, Base color=Slate, CSS variables=Yes
- **VALIDATE**: `components.json` exists in project root

---

### Task 9: ADD shadcn/ui Components

- **IMPLEMENT**: Add required UI components for auth forms
- **COMMAND**:
  ```bash
  npx shadcn@latest add button input card label
  ```
- **CREATES**:
  - `src/components/ui/button.tsx`
  - `src/components/ui/input.tsx`
  - `src/components/ui/card.tsx`
  - `src/components/ui/label.tsx`
- **VALIDATE**: `ls src/components/ui/` shows all 4 component files

---

## TESTING STRATEGY

### Unit Tests

No unit tests for this phase - configuration and setup only.

### Integration Tests

Not applicable for this phase.

### Edge Cases

- TypeScript compilation with strict mode should have no errors
- All shadcn/ui components should import without errors

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
npm run lint
```

### Level 2: Type Checking

```bash
npm run type-check
```

### Level 3: Development Server

```bash
npm run dev
# Visit http://localhost:3000 - should show Next.js default page
```

### Level 4: Build Test

```bash
npm run build
```

### Level 5: Component Verification

```bash
ls src/components/ui/
# Should show: button.tsx, card.tsx, input.tsx, label.tsx
```

---

## ACCEPTANCE CRITERIA

- [ ] Next.js 14+ project initialized with App Router
- [ ] TypeScript strict mode enabled
- [ ] Tailwind CSS configured and working
- [ ] `.env.example` created with all required variables
- [ ] `.gitignore` includes all environment file patterns
- [ ] All dependencies installed (@supabase/ssr, zod, etc.)
- [ ] `src/lib/utils.ts` exports `cn()` function
- [ ] shadcn/ui initialized with `components.json`
- [ ] Button, Input, Card, Label components available
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully

---

## COMPLETION CHECKLIST

- [ ] Task 1: Next.js project created
- [ ] Task 2: TypeScript strict mode configured
- [ ] Task 3: type-check script added
- [ ] Task 4: .env.example created
- [ ] Task 5: .gitignore updated
- [ ] Task 6: Dependencies installed
- [ ] Task 7: utils.ts created
- [ ] Task 8: shadcn/ui initialized
- [ ] Task 9: UI components added
- [ ] All validation commands pass

---

## NOTES

### Design Decisions

1. **npm over yarn/pnpm**: Consistent with most Next.js tutorials and Vercel examples
2. **shadcn/ui over other libraries**: Provides unstyled, customizable components that don't add bundle weight
3. **Strict TypeScript**: Catches bugs early, improves IDE support, professional standard

### Next Plan Dependencies

Plan 1B (Supabase Integration) depends on:
- `@supabase/ssr` package (installed in Task 6)
- `src/lib/` directory structure (created in Task 7)

### Potential Issues

- If `create-next-app` fails, ensure Node.js 18+ is installed
- If shadcn init fails, ensure Tailwind is properly configured first

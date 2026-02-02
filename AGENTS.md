# JumpRope App - AI Agent Guide

跳繩教學管理平台 - 全端 Next.js 應用程式

## Project Overview

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 (CSS-based config)
- **Database**: Prisma ORM + PostgreSQL (Neon)
- **Auth**: NextAuth.js v5
- **Architecture**: Feature-First + Colocation

## Build and Test Commands

```bash
# Development
pnpm dev                    # Start dev server (port 3000)
pnpm build                  # Production build
pnpm start                  # Start production server

# Quality
pnpm lint                   # ESLint check
pnpm type-check             # TypeScript check (tsc -b)
pnpm test                   # Jest tests (single run)
pnpm test:watch             # Jest watch mode
pnpm test:coverage          # Coverage report

# Database
pnpm prisma:migrate <name>  # Create migration
pnpm prisma:deploy          # Deploy migrations + generate client
pnpm prisma:push            # Push schema (prototyping)
pnpm prisma:studio          # Open Prisma Studio
pnpm prisma:seed            # Seed database
pnpm prisma:wipe            # Reset database (⚠️ destructive)
```

## Directory Structure

```
jumprope-app/
├── prisma/              # Database schema & migrations
├── public/              # Static assets
└── src/
    ├── app/             # Next.js App Router
    │   ├── (public)/    # Public routes
    │   ├── (private)/   # Auth-required routes
    │   └── api/         # API Route Handlers
    ├── features/        # 🎯 Feature modules (core)
    │   └── [feature]/
    │       ├── components/
    │       ├── hooks/
    │       ├── actions.ts
    │       ├── queries.ts
    │       ├── schema.ts
    │       ├── types.ts
    │       └── index.ts  # Public API
    ├── components/      # Shared UI components
    ├── lib/             # Core utilities
    └── hooks/           # Global hooks
```

## Code Style Guidelines

- **Indent**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Yes
- **Path alias**: `@/` → `src/`
- **Naming**:
  - Components: `PascalCase.tsx`
  - Functions/variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`

## Critical Rules (AI Must Follow)

### ✅ DO

1. **Use Server Actions** for form submissions, not API Routes
2. **Import features via public API**: `import { X } from "@/features/auth"`
3. **Validate all inputs** with Zod schemas
4. **Use Server Components by default** — add `"use client"` only when needed
5. **Place `_components/`** in route folders for route-specific components

### ❌ DON'T

1. **Don't create API Routes** for CRUD — use Server Actions
2. **Don't import feature internals**: `@/features/auth/components/X` ← Wrong
3. **Don't cross-import features**: Feature A should not import Feature B
4. **Don't use `@/utils`** — use `@/lib/utils`
5. **Don't use `@/context`** — use `@/lib/providers`

## Path Migration Reference

| Old Path | New Path |
|:---------|:---------|
| `@/utils` | `@/lib/utils` |
| `@/layout` | `@/components/layout` |
| `@/context` | `@/lib/providers` |

## Security Considerations

- Server Actions must have `"use server"` directive
- All user inputs validated via Zod before database operations
- Use `auth()` from NextAuth to check permissions
- Never expose sensitive logic in Client Components

## Testing Instructions

- Tests in `__tests__/` folders or `*.test.ts(x)` files
- Use AAA pattern: Arrange → Act → Assert
- Naming: `given [context]: [expected behavior]`

```ts
describe("Component", () => {
  test("given valid input: renders correctly", () => {
    // Arrange → Act → Assert
  });
});
```

## Commit Convention

Use Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`

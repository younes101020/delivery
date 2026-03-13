# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Project Overview

Delivery is a self-hostable deployment platform (Netlify/Vercel alternative). It is a **pnpm monorepo** managed by **Turborepo** with two apps and shared packages, all written in **TypeScript**.

### Structure

```
apps/web/          Next.js 15 frontend (App Router, React 19, shadcn/ui)
apps/jobs/         Hono REST API + BullMQ background jobs
apps/docs/         GitBook documentation
packages/auth/     JWT utilities (jose)
packages/drizzle/  Database schema, migrations, seed (Drizzle ORM + PostgreSQL)
packages/utils/    Shared utility functions
packages/eslint-config/  Shared ESLint configuration
```

## Build / Lint / Test Commands

Package manager: **pnpm** (v10). Always use `pnpm`, never `npm` or `yarn`.

### From the repository root

```bash
pnpm install          # Install all dependencies
pnpm run build        # Build all packages (via Turborepo)
pnpm run lint         # Lint all packages
pnpm run lint:fix     # Lint and auto-fix all packages
pnpm run test         # Run all tests (via Turborepo)
pnpm run dev          # Start all dev servers
```

### Single app/package commands

```bash
# Tests (both apps use Vitest; web uses happy-dom, jobs runs in Node)
pnpm --filter @delivery/jobs test
pnpm --filter @delivery/web test

# Single test file
pnpm --filter @delivery/jobs exec vitest run src/routes/applications/__tests__/applications.integration.test.ts

# Single test by name pattern
pnpm --filter @delivery/jobs exec vitest run -t "test name pattern"

# Linting
pnpm --filter @delivery/jobs lint
pnpm --filter @delivery/web lint

# Type checking
pnpm run check-types                           # Root-level tsc --noEmit
pnpm --filter @delivery/jobs run typecheck     # Jobs-specific

# Database (packages/drizzle)
pnpm --filter @delivery/drizzle run migrate    # Run migrations
pnpm --filter @delivery/drizzle run db:push    # Push schema to test DB
pnpm --filter @delivery/drizzle run db:reset   # Reset test DB
pnpm --filter @delivery/drizzle run db:seed    # Seed test DB
```

## Code Style Guidelines

Formatting is enforced by **ESLint** (via `@antfu/eslint-config`). **Prettier is disabled.** Run `pnpm run lint:fix` to auto-format.

### Formatting Rules

- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Double quotes (`"`) everywhere
- **Semicolons**: Always required
- **Trailing commas**: Yes, in multi-line constructs
- **Brace style**: Single-statement `if`/`else` bodies omit braces; `else` on a new line after `}`

```typescript
if (!config)
  return null;

if (condition) {
  doSomething();
}
else {
  doOther();
}
```

### Imports

- Use `import type { ... }` for type-only imports (never inline `import { type Foo }`)
- Import ordering is enforced by `perfectionist/sort-imports`:
  1. External packages (`"react"`, `"hono"`, `"drizzle-orm"`)
  2. Monorepo packages (`"@delivery/drizzle"`, `"@delivery/auth"`)
  3. Local path-alias imports (`"@/lib/..."`, `"./foo"`)
- Separate groups with blank lines
- Path alias: `@/*` maps to `src/*` in both apps

### Naming Conventions

| Element            | Convention      | Example                              |
|--------------------|-----------------|--------------------------------------|
| Files/directories  | kebab-case      | `create-app.ts`, `remote-docker/`    |
| Variables/functions| camelCase       | `activeJobs`, `createApplication()`  |
| React components   | PascalCase      | `GithubAppForm`, `StepProvider`      |
| Classes            | PascalCase      | `DeploymentError`, `ApplicationError`|
| Types/interfaces   | PascalCase      | `AppBindings`, `AppRouteHandler`     |
| Constants          | UPPER_SNAKE_CASE| `MAX_TTL`, `APPLICATIONS_PATH`       |
| DB tables (SQL)    | snake_case      | `application_environment_variables`  |
| DB tables (JS)     | camelCase       | `applicationEnvironmentVariables`    |

File naming for route modules follows: `{resource}.routes.ts`, `{resource}.handlers.ts`, `{resource}.index.ts`.

### Types

- TypeScript strict mode is enabled in both apps
- Use `interface` for object shapes (props, bindings, context types)
- Use `type` for aliases, unions, intersections, `z.infer<>` extractions, and mapped types
- Zod is the primary validation library; Drizzle schemas derive from `drizzle-zod`
- Use `as const` for constant objects/arrays that need literal type inference
- Never use `any`; prefer `unknown` when type is truly unknown

### Error Handling

- **Jobs API**: Custom error classes extending `UnrecoverableError` (from BullMQ): `DeploymentError`, `DatabaseError`, `ApplicationError`
- **HTTP errors**: Throw `HTTPException` from Hono with status code and message
- **Partial failure**: Use `Promise.allSettled` when some operations can fail independently
- **Inline catch**: `.catch()` chaining for error transformation on promises
- **Environment validation**: Zod `safeParse` with `process.exit(1)` on failure (fail-fast)
- **Direct `process.env` access is banned** (`node/no-process-env: error`). Access environment only through the validated `env` object exported from each app's `env.ts`

### Exports & Functions

- Prefer **named exports** for functions, components, types, and handlers
- **Default exports** for: Next.js page components, router instances (`*.index.ts`), app singletons, env config objects
- Barrel files (`index.ts` with `export * from`) are used selectively, not universally
- **Function declarations** for standalone/exported functions and React components
- **Arrow functions assigned to `const`** for route handlers (typed), middleware, and HOF results
- Inline arrow functions for callbacks and `.map()`/`.filter()` chains
- `async/await` is the standard; `Promise.all` for concurrency; `Promise.allSettled` for partial failure tolerance
- `new Promise` only for wrapping callback-based library APIs (ssh2, streams)
- Comments are sparse -- explain "why", not "what"; use `// eslint-disable-next-line <rule>` with rule name

## Architecture Notes

### Backend (`apps/jobs`)

Each resource domain follows this structure:
```
routes/{resource}/
  {resource}.routes.ts      OpenAPI route definitions (Zod schemas, status codes)
  {resource}.handlers.ts    Request handler functions
  {resource}.index.ts       Router wiring: createRouter().openapi(route, handler)
  lib/
    dto.ts                  Zod DTOs
    queries.ts              Database queries (Drizzle)
    services.ts             Business logic / orchestration
    remote-docker/          Docker operations (uses withDocker HOF)
  tasks/                    BullMQ job queues per action
```

API is **OpenAPI-first** via `@hono/zod-openapi`.

### Frontend (`apps/web`)

Next.js App Router with underscore-prefixed private directories (`_components/`, `_hooks/`, `_lib/`, `_ctx/`), route groups (`(dashboard)/`, `(onboarding)/`, `(login)/`), and `api/` for BFF proxy routes. UI primitives live in `_components/ui/` (shadcn/ui).

### Copilot Instructions

When writing `.tsx` files with `<Suspense>`, always provide a fallback using a pending/skeleton component that wraps the shadcn `<Skeleton />` component, mimicking the visual shape of the component being loaded.

## Testing

- Framework: **Vitest** in both apps
- Test files live in `__tests__/` directories, named `*.integration.test.ts`
- Mocks use **MSW** (Mock Service Worker) in `__mocks__/` directories
- Test fixtures use Vitest's `it.extend<Fixtures>({...})` pattern
- Web tests use `happy-dom`; jobs tests run in Node
- Global setup and per-file setup scripts are in each app's `__tests__/` directory


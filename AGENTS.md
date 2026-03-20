# DevRoast — Project Guidelines

## Stack

- **Framework:** Next.js 16 (App Router, React Compiler, Turbopack)
- **API layer:** tRPC v11 + TanStack React Query v5 (see `src/trpc/AGENTS.md`)
- **Database:** Drizzle ORM + PostgreSQL 16 (Docker Compose)
- **Validation:** Zod
- **Styling:** Tailwind CSS v4 with `@theme` variables, `tailwind-variants` for component variants
- **Linting:** Biome 2.4 (formatter + linter, `tailwindDirectives: true`)
- **Package manager:** pnpm
- **Language:** TypeScript (strict)

## Conventions

- **Language:** Portuguese for communication, English for code
- **Exports:** Always named exports. Never `export default` (except Next.js pages).
- **Components:** Extend native HTML props via `ComponentProps<"element">`. Use `tv()` for variants. Use composition pattern (sub-components) for complex components with 2+ content areas.
- **Class merging:** Use `tv({ className })` for components with variants. Use `twMerge()` for components without variants. Never string interpolation.
- **Colors:** Defined in `@theme` block (`--color-*`), used as canonical Tailwind classes (`bg-accent-green`, not `bg-(--color-accent-green)`). Exception: SVG attributes use `var(--color-*)`.
- **Fonts:** `font-sans` (system) and `font-mono` (JetBrains Mono) only. No custom font classes.
- **Buttons:** `enabled:hover:` and `enabled:active:` prefixes to prevent hover styles when disabled.

## Project Structure

```
specs/                # Feature specs written before implementation (see specs/AGENTS.md)
src/
  app/                # Next.js App Router pages and layouts
    api/trpc/         # tRPC HTTP handler (catch-all route)
  components/         # Feature-level components (navbar, code-editor, etc.)
    ui/               # Reusable UI primitives (see ui/AGENTS.md for patterns)
  db/                 # Drizzle ORM schema, client, and seed
  trpc/               # tRPC infrastructure (see trpc/AGENTS.md for patterns)
    routers/          # tRPC routers (one file per domain)
  hooks/              # Custom React hooks
  lib/                # Shared utilities and constants
```

## Data Fetching

- **Server Components:** Use `prefetch()` + `<HydrateClient>` to prefetch tRPC queries on the server and hydrate to client components. Import from `@/trpc/server`.
- **Client Components:** Use `useQuery()` / `useSuspenseQuery()` with `trpc.router.procedure.queryOptions()`. Import `useTRPC` from `@/trpc/client`.
- **Server-only data:** Use `caller` from `@/trpc/server` for data consumed exclusively in RSC (e.g. dynamic metadata).
- **Animated numbers:** Use `@number-flow/react` (`<NumberFlow>`) for numeric values that transition from 0 to the loaded value. Prefer `useQuery` with `?? 0` fallback over Suspense/skeleton for these cases.
- **Loading states:** Prefer `useQuery` + `NumberFlow` (0 → value animation) for numeric stats. Use `Suspense` + skeleton components for content-heavy sections (lists, cards, etc.).

### Animated Numbers with NumberFlow

For numeric values that should animate from 0 to the loaded value, use NumberFlow with a `0` fallback. Do NOT wrap the component in `<Suspense>` — this allows the animation to play.

```typescript
// home-stats.tsx (Client Component)
"use client";

import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

function HomeStats() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.roast.getStats.queryOptions());

  return (
    <div>
      <NumberFlow
        value={data?.totalRoasts ?? 0}
        format={{ useGrouping: true }}
        className="font-mono tabular-nums"
      />
      <NumberFlow
        value={data?.avgScore ?? 0}
        format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        className="font-mono tabular-nums"
      />
    </div>
  );
}

export { HomeStats };
```

```typescript
// page.tsx (Server Component)
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { HomeStats } from "./home-stats";

export default async function HomePage() {
  prefetch(trpc.roast.getStats.queryOptions());

  return (
    <main>
      {/* NO Suspense here - allows NumberFlow animation */}
      <HydrateClient>
        <HomeStats />
      </HydrateClient>
    </main>
  );
}
```

**Key points:**
- Use `?? 0` fallback so the initial value is always 0
- Do NOT wrap in `<Suspense>` — the component renders immediately with 0
- NumberFlow automatically animates when the data loads from `0` → loaded value
- Use `<Suspense>` + skeleton only for content-heavy sections (lists, cards)

## Key Decisions

- `CodeBlock` is an async React Server Component using shiki with vesper theme
- `Toggle` uses `@base-ui/react` Switch primitive for accessibility
- `ScoreRing` has a single fixed size (180px)
- Biome config has `noUnknownAtRules` ignore list for Tailwind directives (`@theme`, `@apply`, `@utility`)
- tRPC context exposes `db` (Drizzle client) — no superjson needed (Drizzle returns plain serializable objects)
- Feature specs must be written in `specs/` before implementing new features

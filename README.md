# `frontend/` — Win11 web app

Mobile-first, PWA-ready React web frontend for the Win11 fantasy sports
platform. Phase 1 ships the **foundation only** — no business modules.

## Stack

| Layer       | Choice                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| Runtime     | React 18 · TypeScript 5 · Vite 5                                                                        |
| Styling     | Tailwind CSS · shadcn/ui primitives · class-variance-authority · tailwind-merge                         |
| State       | Redux Toolkit · RTK Query                                                                               |
| Forms       | React Hook Form · Zod                                                                                   |
| Routing     | React Router DOM v6 (data router)                                                                       |
| Motion      | Framer Motion                                                                                           |
| Realtime    | Socket.io-client                                                                                        |
| Icons       | lucide-react                                                                                            |
| Tooling     | ESLint · Prettier (with tailwind plugin) · vite preview · multi-stage Docker (nginx)                    |

## Quick start

```bash
cd frontend
cp .env.example .env.local      # adjust VITE_API_BASE_URL if needed
npm install
npm run dev                     # → http://localhost:5173
```

The dev server proxies nothing — point `VITE_API_BASE_URL` directly at the
backend (`http://localhost:4000` by default). Backend, theme defaults, and
socket URL all come from `.env.local` (validated by `src/config/env.ts`).

## Architecture at a glance

```
src/
├── app/                Composition root (App + AppProviders)
├── components/
│   ├── common/         Cross-cutting (ErrorBoundary, EmptyState, OfflineBanner…)
│   ├── layout/         AppShell, BottomTabBar, TopBar, ScreenContainer, SafeArea
│   └── ui/             shadcn-style primitives (Button, Card, Input, Modal, Form…)
├── config/             Validated env + appConfig (single seam)
├── constants/          Routes, regex, storage keys, shared enums re-export
├── features/           Feature folders (Phase 1 only ships placeholders/)
├── hooks/              useStore, useTheme, useMediaQuery, useSocket, useDebounce…
├── router/             createBrowserRouter + central routeTree
├── services/
│   ├── http/           Tiny fetch wrapper for non-RTK calls
│   ├── socket/         Singleton Socket.io client with auth hook
│   └── storage/        Typed localStorage wrapper
├── store/
│   ├── api/            RTK Query baseApi (everything injects here)
│   ├── slices/         theme.slice, app.slice
│   ├── store.ts        configureStore with serializableCheck + listeners
│   └── root.reducer.ts
├── theme/              Global Theme Engine (see below)
├── types/              env.d.ts + api/common types re-exports
└── utils/              cn, formatters, validators, logger, responsive, errors
```

## Global Theme Engine

- Tokens live in `src/theme/tokens/*` — colors, spacing, radius, shadows,
  gradients, typography, motion, breakpoints.
- Two themes ship out of the box: `dark-fantasy` (default) and `light`.
- A new theme is just a `Theme` object registered via
  `themeRegistry.register(theme)`.
- The runtime serialises themes to CSS variables (`--w11-*`) via
  `cssVars.ts` and applies them to `<html>`. **No component reads raw
  palette values** — they consume Tailwind utilities like `bg-surface`,
  `text-text`, `border-border`, which resolve through the variables.
- Persistence: theme preference is stored in `localStorage` under
  `w11.theme` and rehydrated on boot.
- Remote / white-label config: `VITE_THEME_REMOTE_CONFIG_ENABLED=true`
  reserves the integration point — admin push lands in Phase 10.

## Mobile-first responsive shell

- `AppShell` clamps to `max-w-app` (480px) on desktop and centers with
  elevation, giving a Dream11-style "phone preview" on large screens
  while staying full-bleed on mobile.
- `BottomTabBar` is sticky, safe-area-aware, and uses Framer Motion
  to animate the active indicator across tabs.
- Every screen uses `<TopBar />` + `<ScreenContainer />` so feature
  phases never reinvent layout primitives.

## Scripts

| Script              | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Vite dev server with HMR                 |
| `npm run build`     | Type-check + production bundle to `dist/`|
| `npm run preview`   | Serve the prod build locally             |
| `npm run lint`      | ESLint (errors fail the build)           |
| `npm run lint:fix`  | ESLint with autofix                      |
| `npm run format`    | Prettier write                           |
| `npm run typecheck` | `tsc --noEmit`                           |

## Docker

```bash
docker build -t win11-frontend .
docker run --rm -p 8080:80 win11-frontend
# → http://localhost:8080
```

The image is multi-stage: Node builds the bundle, Nginx serves it with
SPA fallback, gzip, long-cache for fingerprinted assets, and a
`/healthz` probe.

## Conventions

- **Never** import a raw palette value (`Palette.emerald500`) — use a
  Tailwind utility that resolves to a theme variable.
- **Never** invent a new error code — use the shared bank from
  `@shared/constants` (re-exported via `@constants/index`).
- **Never** instantiate a second `createApi` — `injectEndpoints` into
  `baseApi`.
- **Never** add new colours, radii, or shadows outside `src/theme/tokens`.

## Phase status

| Phase | Status     | Owner |
| ----- | ---------- | ----- |
| 1     | ✅ Done    | Foundation: theme · navigation · store · UI primitives · services |
| 2+    | ⏳ Planned | Feature modules per `docs/requirements/PHASE-0X-*.md` |

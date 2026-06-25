# `shared/` — Cross-runtime contracts

Types, enums and constants consumed by the **frontend** build via the `@shared/*`
path alias. The backend keeps the authoritative enum copy in
`backend/src/common/enums/` — keep both in sync when adding new domain values.

PHASE 1 ships pure TS types (no runtime deps). A future `@win11/shared` npm
package can replace this folder without changing import paths.

## Layout

```
shared/
├── types/         Pure TS contracts (ApiResponse, Paginated, ...)
├── constants/     Stable string keys (event names, headers, error codes)
└── enums/         Domain enums (UserRole, ContestStatus, ...)
```

## Rules

- **No React, no Node-only APIs.** Files here must be runnable in both
  environments.
- **No runtime dependencies.** Strings, enums, types only.
- **Never import from `backend/`.** Only the frontend imports from here.

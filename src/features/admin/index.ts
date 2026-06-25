export * from './admin.api';
export { ADMIN_NAV_ITEMS } from './admin.navigation';
export type { AdminNavItem } from './admin.navigation';

// Default exports are intentionally kept un-re-exported here. The router
// uses dynamic `import()` to code-split, so each screen + the layout are
// imported via `lazyNamed(... 'default')` when the user navigates to
// `/admin/...` for the first time.

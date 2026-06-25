import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * Thin wrapper around `React.lazy` that lets us import named exports
 * instead of forcing default exports for every code-split module.
 *
 * Usage:
 *   const AdminLayout = lazyNamed(
 *     () => import('@features/admin/AdminLayout'),
 *     'AdminLayout',
 *   );
 */
export const lazyNamed = <T extends ComponentType<unknown>>(
  importer: () => Promise<Record<string, T>>,
  exportName: string,
): LazyExoticComponent<T> =>
  lazy(async () => {
    const mod = await importer();
    return { default: mod[exportName] };
  });

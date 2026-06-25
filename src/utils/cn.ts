import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * `cn` — conditional classname merger. Combines `clsx` (truthy filtering)
 * with `tailwind-merge` (conflict resolution so `p-2 p-4` becomes `p-4`).
 *
 * MUST be used by every UI primitive that accepts a `className` prop.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

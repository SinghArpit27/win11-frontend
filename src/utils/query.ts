/**
 * Serialises RTK Query params — strips null/undefined so URLSearchParams
 * never emits the literal string "undefined".
 */
export const serialiseQuery = (
  args: Record<string, unknown>,
): Record<string, string | number | boolean> => {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(args)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value;
    }
  }
  return out;
};

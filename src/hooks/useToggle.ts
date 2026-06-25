import { useCallback, useState } from 'react';

/** Boolean toggle with stable setters — kinder than `setOpen(!open)`. */
export const useToggle = (
  initial = false,
): readonly [boolean, () => void, (v: boolean) => void] => {
  const [value, setValue] = useState<boolean>(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue] as const;
};

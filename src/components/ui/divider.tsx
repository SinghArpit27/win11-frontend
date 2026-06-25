import { cn } from '@utils/cn';

interface DividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  inset?: boolean;
}

export const Divider = ({
  className,
  orientation = 'horizontal',
  inset = false,
}: DividerProps): JSX.Element => (
  <div
    role="separator"
    aria-orientation={orientation}
    className={cn(
      'shrink-0 bg-border',
      orientation === 'horizontal'
        ? cn('h-px w-full', inset && 'mx-4 w-auto')
        : cn('w-px self-stretch', inset && 'my-2 h-auto'),
      className,
    )}
  />
);

import { memo } from 'react';

import { FantasyValidationSeverity } from '@shared/enums';

import { cn } from '@utils/cn';

import type { FantasyValidationResult } from '../fantasy.types';

interface ValidationFeedbackProps {
  result: FantasyValidationResult | null | undefined;
  maxIssues?: number;
  className?: string;
}

/** Compact Dream11-style validation strip above the footer. */
const ValidationFeedbackComponent = ({
  result,
  maxIssues = 1,
  className,
}: ValidationFeedbackProps): JSX.Element | null => {
  if (!result || result.isValid) return null;

  const sortedIssues = [...result.issues].sort((a, b) =>
    a.severity === FantasyValidationSeverity.ERROR && b.severity !== FantasyValidationSeverity.ERROR
      ? -1
      : a.severity !== FantasyValidationSeverity.ERROR && b.severity === FantasyValidationSeverity.ERROR
        ? 1
        : 0,
  );
  const visible = sortedIssues.slice(0, maxIssues);
  const hiddenCount = sortedIssues.length - visible.length;

  return (
    <div className={cn('px-3 py-2', className)} role="status" aria-live="polite">
      {visible.map((issue) => (
        <p
          key={`${issue.code}-${issue.message}`}
          className={cn(
            'flex items-start gap-1.5 text-[11px] leading-snug',
            issue.severity === FantasyValidationSeverity.ERROR
              ? 'font-semibold text-[#e53935]'
              : 'font-medium text-[#f57c00]',
          )}
        >
          <span aria-hidden className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-current" />
          {issue.message}
        </p>
      ))}
      {hiddenCount > 0 ? (
        <p className="mt-0.5 pl-2.5 text-[10px] text-[#9e9e9e]">+{hiddenCount} more issue(s)</p>
      ) : null}
    </div>
  );
};

export const ValidationFeedback = memo(ValidationFeedbackComponent);

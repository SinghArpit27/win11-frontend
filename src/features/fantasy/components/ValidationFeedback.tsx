import { memo } from 'react';

import { FantasyValidationSeverity } from '@shared/enums';

import { cn } from '@utils/cn';

import type { FantasyValidationResult } from '../fantasy.types';

/**
 * Renders inline validation chips below the sticky action bar. Shows
 * the top N issues sorted by severity so the user always sees the most
 * critical problem first.
 *
 * Designed to be cheap to render — recomputes only when the result
 * reference changes (memo). Issue-free state collapses to a positive
 * "Team is ready" pill.
 */
interface ValidationFeedbackProps {
  result: FantasyValidationResult | null | undefined;
  maxIssues?: number;
  className?: string;
}

const ValidationFeedbackComponent = ({
  result,
  maxIssues = 3,
  className,
}: ValidationFeedbackProps): JSX.Element | null => {
  if (!result) return null;

  if (result.isValid) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success',
          className,
        )}
        role="status"
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
        Team is ready to save
      </div>
    );
  }

  const sortedIssues = [...result.issues].sort((a, b) =>
    a.severity === FantasyValidationSeverity.ERROR && b.severity !== FantasyValidationSeverity.ERROR
      ? -1
      : a.severity !== FantasyValidationSeverity.ERROR && b.severity === FantasyValidationSeverity.ERROR
        ? 1
        : 0,
  );
  const visible = sortedIssues.slice(0, maxIssues);

  return (
    <ul
      role="list"
      aria-label="Team validation issues"
      className={cn('flex flex-col gap-1.5', className)}
    >
      {visible.map((issue) => (
        <li
          key={`${issue.code}-${issue.message}`}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-1.5 text-xs',
            issue.severity === FantasyValidationSeverity.ERROR
              ? 'bg-danger/10 text-danger'
              : 'bg-warning/10 text-warning',
          )}
        >
          <span
            aria-hidden
            className={cn(
              'inline-block h-1.5 w-1.5 rounded-full',
              issue.severity === FantasyValidationSeverity.ERROR ? 'bg-danger' : 'bg-warning',
            )}
          />
          {issue.message}
        </li>
      ))}
      {sortedIssues.length > visible.length ? (
        <li className="px-3 text-[11px] text-text-muted">
          +{sortedIssues.length - visible.length} more issue(s)
        </li>
      ) : null}
    </ul>
  );
};

export const ValidationFeedback = memo(ValidationFeedbackComponent);

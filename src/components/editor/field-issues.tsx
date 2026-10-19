import type { ValidationIssue } from '@/modules/validators';
import type { Dictionary } from '@/modules/i18n';

interface FieldIssuesProps {
  id: string;
  issues: ValidationIssue[];
  dict: Dictionary;
}

export function FieldIssues({ id, issues, dict }: FieldIssuesProps) {
  if (issues.length === 0) return null;

  return (
    <div id={id} role="alert" className="mt-2 space-y-1">
      {issues.map((issue, idx) => (
        <p key={`${issue.code}-${idx}`} className="text-sm text-error flex items-center gap-1.5">
          <svg
            className="w-4 h-4 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <span>{dict.validation[issue.code](issue.params)}</span>
        </p>
      ))}
    </div>
  );
}

import type { QuestionType } from '@/modules/spec';

interface QuestionTypeIconProps {
  type: QuestionType;
  className?: string;
}

export function QuestionTypeIcon({ type, className = 'w-5 h-5' }: QuestionTypeIconProps) {
  if (type === 'choice') {
    // Icône Liste (Catégorie)
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (type === 'score') {
    // Icône Curseur / Slider (Note)
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="4" y1="8" x2="20" y2="8" />
        <line x1="4" y1="16" x2="20" y2="16" />
        <circle cx="9" cy="8" r="2.5" fill="currentColor" />
        <circle cx="15" cy="16" r="2.5" fill="currentColor" />
      </svg>
    );
  }

  // Icône Interrupteur (Oui/Non)
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="6" width="20" height="12" rx="6" />
      <circle cx="16" cy="12" r="3.5" fill="currentColor" />
    </svg>
  );
}

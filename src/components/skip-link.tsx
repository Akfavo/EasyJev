interface SkipLinkProps {
  label: string;
  targetId?: string;
}

export function SkipLink({ label, targetId = 'main-content' }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-ink focus:text-white focus:rounded-control focus:font-medium text-sm transition-none"
    >
      {label}
    </a>
  );
}

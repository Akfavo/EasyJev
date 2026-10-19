'use client';

import { useState, useEffect, useRef, type KeyboardEvent } from 'react';

interface FieldPillProps {
  id: string;
  name: string;
  label: string;
  shouldFocus?: boolean;
  onFocused?: () => void;
  onRename: (newName: string) => void;
  describedBy?: string;
  hasError?: boolean;
}

export function FieldPill({
  id,
  name,
  label,
  shouldFocus,
  onFocused,
  onRename,
  describedBy,
  hasError,
}: FieldPillProps) {
  const [draftName, setDraftName] = useState(name);
  const isCancelledRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronisation si le nom externe change
  useEffect(() => {
    setDraftName(name);
  }, [name]);

  // Placement du focus lors de l'ajout d'un champ
  useEffect(() => {
    if (shouldFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      onFocused?.();
    }
  }, [shouldFocus, onFocused]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      isCancelledRef.current = true;
      setDraftName(name);
      inputRef.current?.blur();
    }
  };

  const handleBlur = () => {
    if (isCancelledRef.current) {
      isCancelledRef.current = false;
      return;
    }
    if (draftName !== name) {
      onRename(draftName);
    }
  };

  const inputId = `field-pill-${id}`;

  return (
    <span className="inline-flex items-center min-h-[44px]">
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        value={draftName}
        onChange={e => setDraftName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        aria-describedby={describedBy}
        aria-invalid={hasError ? 'true' : undefined}
        style={{ width: `${Math.max(draftName.length, 1) + 2}ch` }}
        className={`min-w-[4ch] max-w-full font-mono text-sm sm:text-base font-semibold text-ink bg-brand-100 border-b-2 px-2 py-1 rounded-t-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600 ${
          hasError
            ? 'border-error ring-1 ring-error/50'
            : 'border-brand-600'
        }`}
      />
    </span>
  );
}

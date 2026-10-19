'use client';

import type { SpecField } from '@/modules/spec';
import type { Dictionary } from '@/modules/i18n';
import { MIN_DESCRIPTION_CHARS, MAX_DESCRIPTION_CHARS } from '@/modules/claude-client';

interface GenerationDescriptionProps {
  description: string;
  onChange: (value: string) => void;
  fields: SpecField[];
  dict: Dictionary;
  disabled?: boolean;
  /** Masque la ligne « Jev lira » quand des champs détectés dans les données collées la remplacent. */
  hideFields?: boolean;
  className?: string;
}

export function GenerationDescription({
  description,
  onChange,
  fields,
  dict,
  disabled,
  hideFields,
  className,
}: GenerationDescriptionProps) {
  const tUi = dict.generation.ui;
  const charLength = description.length;

  const scrollToReads = () => {
    const readsElement = document.getElementById('editor-workspace');
    readsElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const firstField = document.getElementById(`field-pill-${fields[0]?.id}`);
    firstField?.focus();
  };

  return (
    <div className={`space-y-2.5 flex flex-col flex-1 ${className ?? ''}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label
          htmlFor="generation-description-input"
          className="text-sm font-bold text-ink"
        >
          {tUi.descriptionLabel}
        </label>
        <span
          id="generation-description-count"
          aria-live="polite"
          className={`text-xs ${
            charLength > 0 && charLength < MIN_DESCRIPTION_CHARS
              ? 'text-amber-700 font-medium'
              : 'text-muted'
          }`}
        >
          {tUi.charCount(charLength, MIN_DESCRIPTION_CHARS, MAX_DESCRIPTION_CHARS)}
        </span>
      </div>

      <textarea
        id="generation-description-input"
        value={description}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        maxLength={MAX_DESCRIPTION_CHARS}
        rows={4}
        placeholder={tUi.descriptionPlaceholder}
        aria-describedby="generation-description-count"
        className="w-full flex-1 min-h-[96px] max-h-[20rem] rounded-control border border-control-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors disabled:opacity-45 resize-none"
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">

        {/* Ligne des champs transmis */}
        {!hideFields && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-ink">{tUi.fieldsReadPrefix}</span>
            <div className="flex items-center gap-1 flex-wrap">
              {fields.map(field => (
                <code
                  key={field.id}
                  className="px-1.5 py-0.5 rounded-sm bg-surface-2 font-mono text-xs text-ink font-semibold border border-line"
                >
                  `{field.name}`
                </code>
              ))}
            </div>
                        <button
              type="button"
              onClick={scrollToReads}
              className="text-xs text-brand-600 hover:text-brand-700 underline font-medium cursor-pointer ml-1"
            >
              {tUi.fieldsLink}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

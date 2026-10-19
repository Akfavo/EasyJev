'use client';

import { useId } from 'react';
import type { Dictionary } from '@/modules/i18n';
import type { ImportedField, N8nInputParseResult } from '@/modules/editor';
import { MAX_DETECTED_FIELDS_SENT } from '@/modules/editor';

interface GenerationDataBoxProps {
  text: string;
  onTextChange: (value: string) => void;
  parsed: N8nInputParseResult | null;
  /** Champs détectés et utilisables (déjà limités à MAX_DETECTED_FIELDS_SENT). */
  detected: ImportedField[];
  selectedNames: Set<string>;
  onToggleField: (name: string) => void;
  onUseSelected: () => void;
  dict: Dictionary;
  disabled?: boolean;
}

export function GenerationDataBox({
  text,
  onTextChange,
  parsed,
  detected,
  selectedNames,
  onToggleField,
  onUseSelected,
  dict,
  disabled,
}: GenerationDataBoxProps) {
  const t = dict.generation.ui;
  const tImport = dict.editor.n8nImport;
  const inputId = 'generation-data-input';
  const hintId = useId();
  const errorId = useId();

  const parseError = parsed && !parsed.ok ? parsed.error : null;
  let errorMessage: string | null = null;
  if (parseError === 'too_large') errorMessage = tImport.errorTooLarge;
  else if (parseError === 'invalid_json') errorMessage = tImport.errorInvalidJson;
  else if (parseError === 'not_object') errorMessage = tImport.errorNotObject;
  else if (parseError === 'empty') errorMessage = tImport.errorEmpty;
  else if (parseError === 'table_view') errorMessage = tImport.errorTableView;

  const allFields = parsed && parsed.ok ? parsed.fields : [];
  const skippedCount = allFields.filter(f => !f.usable).length;
  const usableCount = allFields.filter(f => f.usable).length;
  const selectedCount = detected.filter(f => selectedNames.has(f.name)).length;

  return (
    <div className="space-y-2.5 flex flex-col flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label htmlFor={inputId} className="text-sm font-bold text-ink">
          {t.dataLabel}
        </label>
        <span className="text-xs text-muted">{t.dataOptional}</span>
      </div>

      <textarea
        id={inputId}
        value={text}
        onChange={e => onTextChange(e.target.value)}
        disabled={disabled}
        rows={4}
        spellCheck={false}
        placeholder={t.dataPlaceholder}
        aria-describedby={`${hintId}${errorMessage ? ` ${errorId}` : ''}`}
        className="w-full flex-1 min-h-[96px] max-h-[20rem] rounded-control border border-control-border bg-surface px-3.5 py-2.5 font-mono text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors disabled:opacity-45 resize-none"
      />

      <p id={hintId} className="text-xs text-muted leading-relaxed">
        {t.dataHint}
      </p>

      {errorMessage && (
        <div
          id={errorId}
          role="alert"
          className="p-2.5 rounded-control border border-error/30 bg-error/10 text-error text-xs font-medium"
        >
          {errorMessage}
        </div>
      )}

      {detected.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs font-bold text-ink">{t.dataDetected(usableCount)}</p>
            <button
              type="button"
              onClick={() => onTextChange('')}
              disabled={disabled}
              className="min-h-[44px] inline-flex items-center text-xs font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-4 cursor-pointer disabled:opacity-45"
            >
              {t.dataClear}
            </button>
          </div>

          <div
            role="group"
            aria-label={t.dataFieldsAria}
            className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1"
          >
            {detected.map(field => (
              <label key={field.name} className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedNames.has(field.name)}
                  onChange={() => onToggleField(field.name)}
                  disabled={disabled}
                  className="sr-only peer"
                />
                <span className="inline-flex items-center min-h-[40px] px-3 rounded-pill border border-control-border bg-surface text-ink font-mono text-xs font-semibold transition-colors hover:bg-surface-2 peer-checked:bg-brand-600 peer-checked:border-brand-600 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-brand-600 peer-focus-visible:outline-offset-2 peer-disabled:opacity-45">
                  {field.name}
                </span>
              </label>
            ))}
          </div>

          <p className="text-xs text-muted leading-relaxed">{t.dataPickHint}</p>
          {usableCount > MAX_DETECTED_FIELDS_SENT && (
            <p className="text-xs text-muted">{t.dataTruncated(MAX_DETECTED_FIELDS_SENT)}</p>
          )}
          {skippedCount > 0 && <p className="text-xs text-muted">{t.dataSkipped(skippedCount)}</p>}

          {selectedCount > 0 && (
            <button
              type="button"
              onClick={onUseSelected}
              disabled={disabled}
              className="min-h-[44px] px-4 rounded-pill border border-line bg-surface hover:bg-surface-2 text-ink text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
            >
              {t.dataUseSelected(selectedCount)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

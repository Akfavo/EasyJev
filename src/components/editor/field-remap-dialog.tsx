'use client';

import { useEffect, useRef, useState, useId } from 'react';
import type { Dictionary } from '@/modules/i18n';

export interface CitedRemovedField {
  name: string;
  questionCount: number;
}

export interface FieldRemapDialogProps {
  isOpen: boolean;
  citedFields: CitedRemovedField[];
  /** Noms des champs que l'utilisateur vient de cocher : seules cibles proposées. */
  candidateNames: string[];
  onApply: (remap: Record<string, string>) => void;
  onCancel: () => void;
  dict: Dictionary;
}

interface FieldRemapContentProps {
  citedFields: CitedRemovedField[];
  candidateNames: string[];
  onApply: (remap: Record<string, string>) => void;
  onCancel: () => void;
  dict: Dictionary;
  titleId: string;
  introId: string;
}

// Rendu seulement quand la fenêtre est ouverte : l'état repart de zéro à chaque ouverture.
function FieldRemapContent({
  citedFields,
  candidateNames,
  onApply,
  onCancel,
  dict,
  titleId,
  introId,
}: FieldRemapContentProps) {
  const t = dict.editor.n8nImport;

  // Présélection seulement quand il n'y a rien à deviner : un champ retiré, un champ coché
  const [choices, setChoices] = useState<Record<string, string>>(() => {
    const [onlyCited] = citedFields;
    const [onlyCandidate] = candidateNames;
    if (citedFields.length === 1 && candidateNames.length === 1 && onlyCited && onlyCandidate) {
      return { [onlyCited.name]: onlyCandidate };
    }
    return {};
  });

  const handleApply = () => {
    const remap: Record<string, string> = {};
    for (const [from, to] of Object.entries(choices)) {
      if (to) remap[from] = to;
    }
    onApply(remap);
  };

  return (
    <div className="p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <div className="space-y-1.5">
        <h3 id={titleId} className="text-lg font-bold text-ink">
          {t.remapTitle}
        </h3>
        <p id={introId} className="text-xs sm:text-sm text-muted leading-relaxed">
          {t.remapIntro}
        </p>
      </div>

      <ul className="space-y-3 list-none pl-0">
        {citedFields.map(cited => {
          const selectId = `field-remap-${cited.name}`;
          return (
            <li
              key={cited.name}
              className="p-3.5 rounded-control border border-line bg-surface-2 space-y-2"
            >
              <p className="text-sm text-ink">
                <code className="font-mono text-xs sm:text-sm font-semibold bg-brand-100 text-ink px-1.5 py-0.5 rounded">
                  {cited.name}
                </code>{' '}
                <span className="text-muted">{t.remapCitedIn(cited.questionCount)}</span>
              </p>
              <label htmlFor={selectId} className="block text-xs sm:text-sm font-semibold text-ink">
                {t.remapLabel}
              </label>
              <select
                id={selectId}
                value={choices[cited.name] ?? ''}
                onChange={e => {
                  const value = e.target.value;
                  setChoices(prev => ({ ...prev, [cited.name]: value }));
                }}
                className="w-full min-h-[44px] px-3 rounded-control border border-control-border bg-surface text-ink font-mono text-sm focus-visible:outline-2 focus-visible:outline-brand-600 cursor-pointer"
              >
                <option value="">{t.remapKeep}</option>
                {candidateNames.map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-muted leading-relaxed">{t.remapNote}</p>

      <div className="pt-2 flex items-center justify-end gap-3 flex-wrap">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] px-4 rounded-pill border border-line bg-surface hover:bg-surface-2 text-ink text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
        >
          {t.remapCancel}
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="min-h-[44px] px-5 rounded-pill bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold transition-colors cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
        >
          {t.remapApply}
        </button>
      </div>
    </div>
  );
}

export function FieldRemapDialog({
  isOpen,
  citedFields,
  candidateNames,
  onApply,
  onCancel,
  dict,
}: FieldRemapDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);
  const titleId = useId();
  const introId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={e => {
        e.preventDefault();
        onCancel();
      }}
      onMouseDown={e => {
        mouseDownTargetRef.current = e.target;
      }}
      onClick={e => {
        if (mouseDownTargetRef.current === e.currentTarget && e.target === e.currentTarget) {
          onCancel();
        }
      }}
      aria-labelledby={titleId}
      aria-describedby={introId}
      className="fixed inset-0 m-auto p-0 rounded-win border-2 border-line bg-white shadow-[0_24px_50px_rgba(0,0,0,0.35)] backdrop:bg-line/60 backdrop:backdrop-blur-sm max-w-lg w-[calc(100%-2rem)] max-h-[90vh]"
    >
      {isOpen && (
        <FieldRemapContent
          citedFields={citedFields}
          candidateNames={candidateNames}
          onApply={onApply}
          onCancel={onCancel}
          dict={dict}
          titleId={titleId}
          introId={introId}
        />
      )}
    </dialog>
  );
}

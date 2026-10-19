'use client';

import { useState } from 'react';
import type { EasyJevSpec } from '@/modules/spec';
import { validateSpec } from '@/modules/validators';
import type { Dictionary } from '@/modules/i18n';
import type { EditorAction } from '@/modules/editor';
import { FieldPill } from './field-pill';
import { FieldIssues } from './field-issues';

interface EditorReadsProps {
  spec: EasyJevSpec;
  dispatch: (action: EditorAction) => void;
  dict: Dictionary;
  /** Noms des champs détectés dans les données collées dans « Décris » (noms seulement). */
  detectedFields?: string[];
  /** Ouvre « Décris » sur la case des données n8n (pour importer des champs). */
  onPasteData?: () => void;
}

/** « Ce que Jev lit » : les champs du nœud précédent que Jev reçoit, sur une seule ligne. */
export function EditorReads({ spec, dispatch, dict, detectedFields = [], onPasteData }: EditorReadsProps) {
  const [focusFieldId, setFocusFieldId] = useState<string | null>(null);
  const t = dict.editor.reads;

  const validationResult = validateSpec(spec);
  const isOnlyField = spec.fields.length <= 1;

  const currentNames = new Set(spec.fields.map(f => f.name));
  const otherDetected = detectedFields.filter(name => !currentNames.has(name));

  const handleAddField = () => {
    const newId = crypto.randomUUID();
    dispatch({ type: 'field/add', id: newId });
    setFocusFieldId(newId);
  };

  const handleAddDetected = (name: string) => {
    dispatch({
      type: 'field/replaceAll',
      fields: [
        ...spec.fields.map(f => ({
          id: f.id,
          name: f.name,
          ...(f.exampleValue !== undefined ? { exampleValue: f.exampleValue } : {}),
        })),
        { id: crypto.randomUUID(), name },
      ],
    });
  };

  const linkClass =
    'min-h-[40px] inline-flex items-center text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-4 cursor-pointer';

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
        <h3 className="min-h-[44px] inline-flex items-center text-base sm:text-lg font-bold tracking-tight text-ink shrink-0">
          {t.title}
        </h3>

        {spec.fields.map(field => {
          const fieldIssues = validationResult.issues.filter(i => i.fieldId === field.id);
          const errorElementId = `field-error-${field.id}`;
          return (
            <div key={field.id} className="inline-flex flex-col">
              <div className="inline-flex items-center">
                <FieldPill
                  id={field.id}
                  name={field.name}
                  label={t.fieldNameLabel(field.name)}
                  shouldFocus={focusFieldId === field.id}
                  onFocused={() => setFocusFieldId(null)}
                  onRename={newName => dispatch({ type: 'field/rename', id: field.id, newName })}
                  describedBy={fieldIssues.length > 0 ? errorElementId : undefined}
                  hasError={fieldIssues.length > 0}
                />
                {!isOnlyField && (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'field/remove', id: field.id })}
                    aria-label={t.removeFieldAriaLabel(field.name)}
                    className="min-h-[44px] min-w-[36px] inline-flex items-center justify-center rounded-control text-muted hover:text-error hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <span className="text-lg font-bold leading-none select-none" aria-hidden="true">×</span>
                  </button>
                )}
              </div>
              {fieldIssues.length > 0 && <FieldIssues id={errorElementId} issues={fieldIssues} dict={dict} />}
            </div>
          );
        })}

        <div className="min-h-[44px] inline-flex items-center gap-3 flex-wrap">
          <button type="button" onClick={handleAddField} className={linkClass}>
            + {t.addField}
          </button>
          {onPasteData && (
            <button type="button" onClick={onPasteData} className={linkClass}>
              {t.importFromN8n}
            </button>
          )}
        </div>
      </div>

      {otherDetected.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted mr-1">{t.otherDetectedTitle}</span>
          {otherDetected.map(name => (
            <button
              key={name}
              type="button"
              onClick={() => handleAddDetected(name)}
              aria-label={t.addDetectedAria(name)}
              className="min-h-[36px] px-3 rounded-pill border border-control-border bg-surface hover:bg-surface-2 text-ink font-mono text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
            >
              + {name}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs sm:text-sm text-muted">
        {spec.fields.length > 1 ? t.multipleFieldsHelp : t.singleFieldHelp}
      </p>
    </div>
  );
}

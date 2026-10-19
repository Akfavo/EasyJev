'use client';

import { useEffect, useRef, useState } from 'react';
import type { EasyJevSpec } from '@/modules/spec';
import { generateN8nExpressions } from '@/modules/generators';
import type { Dictionary } from '@/modules/i18n';
import { copyToClipboard } from '@/lib';

interface ReadingExpressionsProps {
  spec: EasyJevSpec;
  isValid: boolean;
  dict: Dictionary;
}

/** Expressions n8n prêtes à copier pour lire la réponse de chaque question dans les nœuds suivants. */
export function ReadingExpressions({ spec, isValid, dict }: ReadingExpressionsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = dict.editor.help.steps.step14;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!isValid) {
    return <p className="text-xs text-muted italic">{dict.editor.help.steps.emptyReadingHelp}</p>;
  }

  const expressions = generateN8nExpressions(spec, {
    yes: t.answerYes,
    no: t.answerNo,
    maybe: t.answerMaybe,
  });

  const handleCopy = async (text: string, key: string) => {
    if (await copyToClipboard(text)) {
      setCopiedKey(key);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCopiedKey(null);
        timeoutRef.current = null;
      }, 1600);
    }
  };

  const renderLine = (label: string, expression: string, copyKey: string) => (
    <div key={copyKey} className="space-y-1">
      <span className="block text-xs font-semibold text-muted">{label}</span>
      <div className="flex items-stretch gap-2">
        <code className="flex-1 min-w-0 font-mono text-xs bg-surface px-2 py-1.5 rounded-sm border border-line text-ink break-all">
          {expression}
        </code>
        <button
          type="button"
          onClick={() => void handleCopy(expression, copyKey)}
          aria-label={`${t.copyExpr} : ${label}`}
          className="shrink-0 min-h-[36px] px-3 rounded-control border border-line bg-white hover:bg-surface-2 text-xs font-semibold text-ink hover:text-brand-700 transition-colors cursor-pointer"
        >
          {copiedKey === copyKey ? t.copied : t.copyExpr}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-2.5">
      <span className="sr-only" aria-live="polite">{copiedKey ? t.copied : ''}</span>
      {spec.questions.map(q => {
        const data = expressions.byQuestionKey[q.key];
        if (!data) return null;
        const yesNo = q.type === 'noul' ? data.secondaryPaths?.yesNo : undefined;
        return (
          <div key={q.id} className="p-3 rounded-control bg-brand-100 border border-line space-y-2">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <span className="text-sm font-bold text-ink">{q.label || q.key}</span>
              <span className="font-mono text-xs text-muted">{q.key}</span>
            </div>
            {yesNo ? (
              <>
                {renderLine(t.yesNoLabel, yesNo, `${q.id}-yesNo`)}
                {renderLine(t.typeExpl.noul, data.primaryPath, q.id)}
              </>
            ) : (
              renderLine(t.typeExpl[q.type], data.primaryPath, q.id)
            )}
          </div>
        );
      })}
      {spec.questions.some(q => q.type === 'noul') && (
        <p className="text-xs text-muted leading-relaxed">{t.thresholdNote}</p>
      )}
    </div>
  );
}

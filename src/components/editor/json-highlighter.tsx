import { useMemo } from 'react';
import { tokenizeJson, type JsonTokenType } from '@/modules/editor';

interface JsonHighlighterProps {
  jsonString: string;
}

const TOKEN_CLASSES: Record<JsonTokenType, string> = {
  key: 'text-brand-100 font-semibold',
  string: 'text-emerald-300',
  number: 'text-sky-300 font-bold',
  literal: 'text-fuchsia-300 font-bold',
  expression: 'text-amber-300 font-bold underline decoration-amber-400/40',
  punctuation: 'text-zinc-400',
};

export function JsonHighlighter({ jsonString }: JsonHighlighterProps) {
  const tokens = useMemo(() => tokenizeJson(jsonString), [jsonString]);

  return (
    <pre className="font-mono text-xs sm:text-sm text-surface leading-relaxed overflow-x-auto whitespace-pre-wrap p-4 bg-ink rounded-control max-h-[70vh] overflow-y-auto selection:bg-brand-600/50">
      <code>
        {tokens.map((token, idx) => (
          <span key={idx} className={TOKEN_CLASSES[token.type]}>
            {token.value}
          </span>
        ))}
      </code>
    </pre>
  );
}

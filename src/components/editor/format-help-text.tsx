import type { ReactNode } from 'react';

/** Met en forme un texte d'aide : **gras** et `code`. */
export function formatHelpText(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = part.slice(1, -1);
      // Les codes courts ne se coupent jamais en plein mot ; les longs (URL, commandes) peuvent passer à la ligne
      return (
        <code
          key={i}
          className={`font-mono text-xs bg-surface-2 px-1 py-0.5 rounded-sm border border-line text-ink ${
            code.length <= 24 ? 'whitespace-pre' : 'break-all'
          }`}
        >
          {code}
        </code>
      );
    }
    return part;
  });
}

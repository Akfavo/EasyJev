export type JsonTokenType =
  | 'key'
  | 'string'
  | 'number'
  | 'literal'
  | 'expression'
  | 'punctuation';

export interface JsonToken {
  type: JsonTokenType;
  value: string;
}

const NUMBER_REGEX = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/;

function isWordEnd(char: string | undefined): boolean {
  if (char === undefined) return true;
  return /[\s,}\]:]/.test(char);
}

/**
 * Découpe un texte JSON (pouvant contenir des expressions n8n {{ ... }}) en jetons typés
 * pour permettre un affichage coloré accessible et sûr sans jamais recourir à dangerouslySetInnerHTML.
 * La concaténation de toutes les valeurs des jetons reconstitue exactement le texte source.
 */
export function tokenizeJson(text: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let i = 0;

  while (i < text.length) {
    // 1. Expression n8n {{ ... }}
    if (text.startsWith('{{', i)) {
      const closeIndex = text.indexOf('}}', i + 2);
      if (closeIndex === -1) {
        tokens.push({ type: 'expression', value: text.slice(i) });
        break;
      } else {
        const value = text.slice(i, closeIndex + 2);
        tokens.push({ type: 'expression', value });
        i = closeIndex + 2;
        continue;
      }
    }

    // 2. Chaîne de caractères ou clé d'objet ("...")
    if (text[i] === '"') {
      let end = i + 1;
      let escaped = false;
      while (end < text.length) {
        const ch = text[end];
        if (escaped) {
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
        } else if (ch === '"') {
          end++;
          break;
        }
        end++;
      }

      const stringValue = text.slice(i, end);

      // Vérifie si la chaîne est suivie de ':' (en ignorant les espaces) -> clé d'objet
      let lookAhead = end;
      while (lookAhead < text.length && /\s/.test(text[lookAhead]!)) {
        lookAhead++;
      }
      const isKey = text[lookAhead] === ':';

      tokens.push({
        type: isKey ? 'key' : 'string',
        value: stringValue,
      });
      i = end;
      continue;
    }

    // 3. Littéraux JSON (true, false, null)
    if (text.startsWith('true', i) && isWordEnd(text[i + 4])) {
      tokens.push({ type: 'literal', value: 'true' });
      i += 4;
      continue;
    }
    if (text.startsWith('false', i) && isWordEnd(text[i + 5])) {
      tokens.push({ type: 'literal', value: 'false' });
      i += 5;
      continue;
    }
    if (text.startsWith('null', i) && isWordEnd(text[i + 4])) {
      tokens.push({ type: 'literal', value: 'null' });
      i += 4;
      continue;
    }

    // 4. Nombres
    const remaining = text.slice(i);
    const numMatch = remaining.match(NUMBER_REGEX);
    if (numMatch && numMatch[0].length > 0 && isWordEnd(text[i + numMatch[0].length])) {
      tokens.push({ type: 'number', value: numMatch[0] });
      i += numMatch[0].length;
      continue;
    }

    // 5. Ponctuation et espaces blancs
    tokens.push({ type: 'punctuation', value: text[i]! });
    i++;
  }

  return tokens;
}

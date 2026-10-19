import { isValidIdentifier } from '../spec';

export const MAX_N8N_INPUT_SIZE = 1024 * 1024; // 1 Mo
const MAX_PREVIEW_LENGTH = 40;
const MAX_EXAMPLE_LENGTH = 200;

export type N8nInputParseError =
  | 'invalid_json'
  | 'not_object'
  | 'empty'
  | 'too_large'
  | 'table_view';

export interface ImportedField {
  name: string;
  kind: 'text' | 'number' | 'other' | 'nested';
  preview: string;
  exampleValue?: string;
  usable: boolean;
  unusableReason?: 'nested' | 'invalid_name';
}

export type N8nInputParseResult =
  | { ok: true; fields: ImportedField[] }
  | { ok: false; error: N8nInputParseError };

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function formatPreview(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return '';
  let str: string;
  if (typeof value === 'string') {
    str = value;
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    str = String(value);
  } else {
    try {
      str = JSON.stringify(value);
    } catch {
      str = String(value);
    }
  }
  if (str.length > MAX_PREVIEW_LENGTH) {
    return str.slice(0, MAX_PREVIEW_LENGTH) + '…';
  }
  return str;
}

function formatExampleValue(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'object') return undefined;
  const str = typeof value === 'string' ? value : String(value);
  return str.length > MAX_EXAMPLE_LENGTH ? str.slice(0, MAX_EXAMPLE_LENGTH) : str;
}

/**
 * Analyse le texte brut copié depuis le panneau OUTPUT de n8n.
 * Fonction pure sans DOM ni React.
 *
 * Formats acceptés :
 * - Tableau d'objets (premier élément retenu)
 * - Objet seul
 * - Format presse-papiers n8n où l'élément est enveloppé dans `{ "json": { ... } }`
 */
export function parseN8nInput(text: string): N8nInputParseResult {
  if (text.length > MAX_N8N_INPUT_SIZE) {
    return { ok: false, error: 'too_large' };
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'empty' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    // Si ce n'est pas du JSON valide, distinguer la vue Table (copie TSV ou texte non balisé) du JSON malformé
    if (trimmed.includes('\t') || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
      return { ok: false, error: 'table_view' };
    }
    return { ok: false, error: 'invalid_json' };
  }

  if (parsed === null || typeof parsed !== 'object') {
    return { ok: false, error: 'not_object' };
  }

  let target: Record<string, unknown>;

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      return { ok: false, error: 'empty' };
    }
    const first = parsed[0];
    if (!isPlainObject(first)) {
      return { ok: false, error: 'not_object' };
    }
    if (isPlainObject(first.json)) {
      target = first.json;
    } else {
      target = first;
    }
  } else {
    // Objet seul
    if (isPlainObject((parsed as Record<string, unknown>).json)) {
      target = (parsed as Record<string, unknown>).json as Record<string, unknown>;
    } else {
      target = parsed as Record<string, unknown>;
    }
  }

  const keys = Object.keys(target);
  if (keys.length === 0) {
    return { ok: false, error: 'empty' };
  }

  const fields: ImportedField[] = keys.map((key) => {
    const val = target[key];
    const isNested = typeof val === 'object' && val !== null;

    let kind: ImportedField['kind'];
    if (isNested) {
      kind = 'nested';
    } else if (typeof val === 'number') {
      kind = 'number';
    } else if (typeof val === 'string') {
      kind = 'text';
    } else {
      kind = 'other';
    }

    const preview = formatPreview(val);
    const validId = isValidIdentifier(key);

    let usable = true;
    let unusableReason: ImportedField['unusableReason'];

    if (kind === 'nested') {
      usable = false;
      unusableReason = 'nested';
    } else if (!validId) {
      usable = false;
      unusableReason = 'invalid_name';
    }

    const exampleValue = usable ? formatExampleValue(val) : undefined;

    return {
      name: key,
      kind,
      preview,
      ...(exampleValue !== undefined ? { exampleValue } : {}),
      usable,
      ...(unusableReason ? { unusableReason } : {}),
    };
  });

  return { ok: true, fields };
}

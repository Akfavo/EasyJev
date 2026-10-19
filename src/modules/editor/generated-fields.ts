import { splitCitations } from './citations';

export const MAX_DETECTED_FIELDS_SENT = 60;

export interface ResolveGeneratedFieldsParams {
  /** Champs détectés dans les données collées (utilisables), dans l'ordre du JSON. */
  detectedNames: readonly string[];
  /** Champs cochés par l'utilisateur dans la case données (vide = laisser Claude choisir). */
  selectedNames: readonly string[];
  /** Champs jugés utiles par Claude (sous-ensemble des champs détectés). */
  fieldsUsed: readonly string[];
  /** Textes des questions générées : les champs cités entre accents graves doivent exister. */
  instructions: readonly string[];
}

/**
 * Détermine la liste finale des champs lus par Jev après une génération avec données collées.
 * - Si l'utilisateur a coché des champs : ce sont eux (Claude n'a reçu qu'eux).
 * - Sinon : les champs choisis par Claude, plus tout champ détecté cité dans une question.
 * - Repli : le premier champ détecté (Jev doit toujours lire au moins un champ).
 * L'ordre est celui des données collées. Fonction pure.
 */
export function resolveGeneratedFields(params: ResolveGeneratedFieldsParams): string[] {
  const { detectedNames, selectedNames, fieldsUsed, instructions } = params;
  const detected = new Set(detectedNames);

  const wanted = new Set<string>();
  if (selectedNames.length > 0) {
    for (const name of selectedNames) {
      if (detected.has(name)) wanted.add(name);
    }
  } else {
    for (const name of fieldsUsed) {
      if (detected.has(name)) wanted.add(name);
    }
  }

  for (const text of instructions) {
    for (const segment of splitCitations(text)) {
      if (segment.type === 'field' && detected.has(segment.value)) {
        wanted.add(segment.value);
      }
    }
  }

  const ordered = detectedNames.filter(name => wanted.has(name));
  if (ordered.length > 0) return ordered;

  const first = detectedNames[0];
  return first !== undefined ? [first] : [];
}

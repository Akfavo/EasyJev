const STOP_WORDS = new Set([
  // Français
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'ce', 'cet', 'cette', 'ces',
  'est', 'sont', 'ete', 'etre', 'avoir', 'ont', 'que', 'qui', 'quoi', 'dont', 'ou',
  'quel', 'quelle', 'quels', 'quelles', 'doit', 'doivent', 'en', 'dans', 'par',
  'pour', 'sur', 'avec', 'sans', 'sous', 'au', 'aux', 'et', 'ne', 'pas', 'plus',
  'se', 'sa', 'son', 'ses', 'leur', 'leurs', 'il', 'elle', 'ils', 'elles', 'on',
  'nous', 'vous', 'je', 'tu', 'mon', 'ton', 'ma', 'ta', 'mes', 'tes',
  // Anglais
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'do', 'does', 'did', 'this', 'that', 'these', 'those', 'of',
  'to', 'in', 'for', 'on', 'by', 'at', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from',
  'up', 'down', 'which', 'what', 'who', 'whom', 'whose', 'should', 'would',
  'could', 'will', 'can', 'shall', 'may', 'might', 'must', 'and', 'but',
  'if', 'or', 'because', 'as', 'until', 'while', 'not', 'no', 'nor', 'so',
  'than', 'too', 'very', 'just', 'it', 'its',
]);

const FORBIDDEN_KEYS = new Set(['constructor', 'prototype', '__proto__']);

/**
 * Dérive une clé technique valide et unique pour une question à partir de son texte source.
 * Règles :
 * 1. Normaliser en supprimant les accents, minuscules, non a-z0-9 remplacés par _, retrait _ début/fin.
 * 2. Garder les mots de plus d'une lettre qui ne sont pas des mots vides (FR/EN), chaque mot une seule fois, 3 premiers joints par _.
 * 3. Si vide ou identifiant interdit (ex. constructor, prototype) : question_N (N = rang non encore utilisé).
 * 4. Si commence par un chiffre : préfixe q_.
 * 5. Unicité garantie par suffixe _2, _3...
 */
export function deriveQuestionKey(
  source: string,
  usedKeys: readonly string[] | Set<string> = []
): string {
  const usedSet = usedKeys instanceof Set ? usedKeys : new Set(usedKeys);

  // 1. Suppression accents, minuscules, remplacement non-alphanumériques
  const normalized = source
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const sanitized = normalized.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

  // 2. Découpage et filtrage des mots (chaque mot une seule fois)
  const rawTokens = sanitized.split('_').filter(token => token.length > 0);
  const seenWords = new Set<string>();
  const meaningfulWords: string[] = [];

  for (const token of rawTokens) {
    if (token.length > 1 && !STOP_WORDS.has(token) && !seenWords.has(token)) {
      seenWords.add(token);
      meaningfulWords.push(token);
    }
  }

  const selectedWords = meaningfulWords.slice(0, 3);
  let baseKey = selectedWords.join('_');

  // 3. Si vide ou identifiant interdit : question_N (rang disponible)
  if (baseKey.length === 0 || FORBIDDEN_KEYS.has(baseKey)) {
    let rank = 1;
    while (usedSet.has(`question_${rank}`)) {
      rank++;
    }
    return `question_${rank}`;
  }

  // 4. Si commence par un chiffre : préfixe q_
  if (/^[0-9]/.test(baseKey)) {
    baseKey = `q_${baseKey}`;
  }

  // 5. Unicité garantie par suffixe _2, _3...
  let candidate = baseKey;
  let suffix = 2;
  while (usedSet.has(candidate)) {
    candidate = `${baseKey}_${suffix}`;
    suffix++;
  }

  return candidate;
}

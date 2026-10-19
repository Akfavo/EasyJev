const FORBIDDEN_IDENTIFIERS = new Set(['__proto__', 'constructor', 'prototype']);
const IDENTIFIER_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Vérifie si un nom respecte les règles d'identifiant valide :
 * - Commence par une lettre ASCII ou un tiret bas (_)
 * - Ne contient que des lettres ASCII, chiffres ou tirets bas
 * - N'est pas un nom interdit (__proto__, constructor, prototype)
 */
export function isValidIdentifier(name: string): boolean {
  if (FORBIDDEN_IDENTIFIERS.has(name)) {
    return false;
  }
  return IDENTIFIER_REGEX.test(name);
}

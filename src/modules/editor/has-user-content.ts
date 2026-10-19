import type { EasyJevSpec } from '@/modules/spec';

/**
 * Détermine si la spec contient du travail utilisateur nécessitant
 * une confirmation avant écrasement (par un modèle ou « Créer à la main »).
 *
 * Renvoie true si :
 * - Il y a au moins une question (questions.length > 0)
 * - Ou si les champs diffèrent de l'état initial par défaut :
 *   - Nombre de champs != 1
 *   - Ou nom de l'unique champ != 'message'
 *   - Ou valeur d'exemple de l'unique champ non vide (après trim)
 */
export function hasUserContent(spec: EasyJevSpec): boolean {
  if (spec.questions.length > 0) {
    return true;
  }

  if (spec.fields.length !== 1) {
    return true;
  }

  const singleField = spec.fields[0];
  if (!singleField) {
    return true;
  }

  if (singleField.name !== 'message') {
    return true;
  }

  if (typeof singleField.exampleValue === 'string' && singleField.exampleValue.trim() !== '') {
    return true;
  }

  return false;
}

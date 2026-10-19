import type { SpecField } from '../spec';

/**
 * Renvoie le prochain nom de champ disponible : field_2, field_3, etc.
 * en évitant toute collision avec les noms de champs existants.
 */
export function nextFieldName(fields: readonly Pick<SpecField, 'name'>[]): string {
  const existingNames = new Set(fields.map(field => field.name));
  let counter = 2;
  while (existingNames.has(`field_${counter}`)) {
    counter++;
  }
  return `field_${counter}`;
}

export interface InsertCitationResult {
  text: string;
  cursorPosition: number;
}

/**
 * Insère le nom d'un champ entre accents graves (`nom`) à l'emplacement du curseur
 * ou en remplacement de la sélection courante.
 * Ajoute une espace avant et/ou après si la citation se collerait à un mot ou à une autre citation.
 * Renvoie le nouveau texte et la position finale du curseur après la citation (et son espace éventuelle).
 */
export function insertCitation(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  fieldName: string
): InsertCitationResult {
  const start = Math.max(0, Math.min(selectionStart, text.length));
  const end = Math.max(start, Math.min(selectionEnd, text.length));
  const citation = `\`${fieldName}\``;

  const before = text.slice(0, start);
  const after = text.slice(end);

  // Espaces ajoutés seulement si la citation se collerait à un mot ou à une autre citation
  const lastChar = before.slice(-1);
  const firstChar = after.slice(0, 1);
  const needsSpaceBefore = lastChar !== '' && !/[\s([{«"'’]/.test(lastChar);
  const needsSpaceAfter = firstChar !== '' && !/[\s.,;:!?)\]}»"'’]/.test(firstChar);

  const prefix = needsSpaceBefore ? ' ' : '';
  const suffix = needsSpaceAfter ? ' ' : '';
  const newText = `${before}${prefix}${citation}${suffix}${after}`;
  const cursorPosition = start + prefix.length + citation.length + suffix.length;

  return {
    text: newText,
    cursorPosition,
  };
}

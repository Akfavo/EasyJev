export type CitationSegmentType = 'text' | 'field';

export interface CitationSegment {
  type: CitationSegmentType;
  value: string;
}

/**
 * Découpe un texte en segments de texte brut et de citations de champs.
 * Les citations de champs sont délimitées par des accents graves (`nom_du_champ`).
 * Un accent grave seul, non fermé, reste du texte brut.
 * Fonction pure sans HTML.
 */
export function splitCitations(text: string): CitationSegment[] {
  if (!text) {
    return [];
  }

  const segments: CitationSegment[] = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    const openIndex = text.indexOf('`', currentIndex);

    if (openIndex === -1) {
      const remainingText = text.slice(currentIndex);
      if (remainingText.length > 0) {
        segments.push({ type: 'text', value: remainingText });
      }
      break;
    }

    // Chercher l'accent grave fermant
    const closeIndex = text.indexOf('`', openIndex + 1);

    if (closeIndex === -1) {
      // Accent grave non fermé : tout le reste depuis currentIndex reste du texte
      const remainingText = text.slice(currentIndex);
      if (remainingText.length > 0) {
        segments.push({ type: 'text', value: remainingText });
      }
      break;
    }

    // Texte précédant l'accent grave ouvrant
    if (openIndex > currentIndex) {
      segments.push({
        type: 'text',
        value: text.slice(currentIndex, openIndex),
      });
    }

    // Segment de champ cité (sans les accents graves)
    segments.push({
      type: 'field',
      value: text.slice(openIndex + 1, closeIndex),
    });

    currentIndex = closeIndex + 1;
  }

  return segments;
}

/**
 * Remplace, dans un texte, les champs cités entre accents graves selon une table de correspondance
 * (ancien nom -> nouveau nom). Les citations absentes de la table, le texte hors citation et un accent
 * grave non fermé restent inchangés. Fonction pure.
 */
export function remapFieldCitations(text: string, mapping: Record<string, string>): string {
  return splitCitations(text)
    .map(segment => {
      if (segment.type === 'field') {
        const target = Object.prototype.hasOwnProperty.call(mapping, segment.value)
          ? mapping[segment.value]
          : undefined;
        return `\`${target !== undefined ? target : segment.value}\``;
      }
      return segment.value;
    })
    .join('');
}

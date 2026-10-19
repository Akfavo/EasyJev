import type { EasyJevSpec } from './types';

/**
 * Crée la spec par défaut d'EasyJev :
 * - Un seul champ nommé "message"
 * - Aucune question
 * - Cible TypeSafe direct (jev-latest)
 * - Mode d'évaluation expression n8n
 */
export function createDefaultSpec(): EasyJevSpec {
  return {
    fields: [
      {
        id: 'field-message',
        name: 'message',
      },
    ],
    questions: [],
    target: {
      provider: 'typesafe',
      model: 'jev-latest',
    },
    outputMode: 'n8n-expression',
  };
}

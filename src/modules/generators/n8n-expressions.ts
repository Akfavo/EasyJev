import type { EasyJevSpec } from '../spec';
import { validateSpec } from '../validators';
import { InvalidSpecError } from './errors';
import type { N8nReadingExpressions } from './types';

export interface N8nAnswerLabels {
  yes: string;
  no: string;
  maybe: string;
}

const DEFAULT_ANSWER_LABELS: N8nAnswerLabels = { yes: 'Yes', no: 'No', maybe: 'Maybe' };

/** Échappe une apostrophe pour insérer le libellé dans une chaîne n8n entre apostrophes. */
function quote(label: string): string {
  return `'${label.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/**
 * Génère les expressions n8n permettant de lire les réponses renvoyées par Jev pour chaque question.
 * Pour une question oui/non, Jev renvoie un nombre de 0 à 1 (sa certitude que la réponse est « oui ») :
 * deux expressions supplémentaires le transforment en texte (`yesNo` : seuil 0,5 ; `yesMaybeNo` : oui au-dessus de 0,7,
 * non en dessous de 0,3, sinon « peut-être »). Les libellés sont fournis par l'appelant (langue de l'interface).
 */
export function generateN8nExpressions(
  spec: EasyJevSpec,
  labels: N8nAnswerLabels = DEFAULT_ANSWER_LABELS
): N8nReadingExpressions {
  const validation = validateSpec(spec);
  if (!validation.isValid) {
    throw new InvalidSpecError(validation.issues);
  }

  const entries: [
    string,
    {
      primaryPath: string;
      secondaryPaths?: Record<string, string>;
    }
  ][] = [];

  for (const question of spec.questions) {
    if (question.type === 'noul') {
      entries.push([
        question.key,
        {
          primaryPath: `{{ $json.answers.${question.key}.noul }}`,
          secondaryPaths: {
            yesNo: `{{ $json.answers.${question.key}.noul > 0.5 ? ${quote(labels.yes)} : ${quote(labels.no)} }}`,
            yesMaybeNo: `{{ $json.answers.${question.key}.noul > 0.7 ? ${quote(labels.yes)} : ($json.answers.${question.key}.noul < 0.3 ? ${quote(labels.no)} : ${quote(labels.maybe)}) }}`,
          },
        },
      ]);
    } else if (question.type === 'choice') {
      entries.push([
        question.key,
        {
          primaryPath: `{{ $json.answers.${question.key}.choice }}`,
          secondaryPaths: {
            confidence: `{{ $json.answers.${question.key}.confidence }}`,
          },
        },
      ]);
    } else if (question.type === 'score') {
      entries.push([
        question.key,
        {
          primaryPath: `{{ $json.answers.${question.key}.score }}`,
          secondaryPaths: {
            confidence: `{{ $json.answers.${question.key}.confidence }}`,
          },
        },
      ]);
    }
  }

  return {
    byQuestionKey: Object.fromEntries(entries),
  };
}

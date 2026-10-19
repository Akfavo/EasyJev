import type { EasyJevSpec, QuestionSpec } from '../spec';
import { validateSpec } from '../validators';
import { InvalidSpecError } from './errors';
import type { GeneratedJevOutput, JevQuestionPayload, JevRequestBody } from './types';

// Le marqueur combine le préfixe réservé '@@EASYJEV_EXPR_' et un identifiant UUID v4 unique généré à chaque appel ('crypto.randomUUID()'), garantissant l'absence de collision avec toute saisie utilisateur.
function generateUniqueMarker(fieldName: string): string {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return `@@EASYJEV_EXPR_${randomPart}_${fieldName}@@`;
}

function buildQuestionPayload(question: QuestionSpec): JevQuestionPayload {
  const instructions = question.instructions.trim();

  if (question.type === 'noul') {
    const criteriaEntries: [string, string][] = [];
    if (question.criteria) {
      const trueCond = question.criteria.trueCondition?.trim();
      if (trueCond && trueCond.length > 0) {
        criteriaEntries.push(['true', trueCond]);
      }
      const falseCond = question.criteria.falseCondition?.trim();
      if (falseCond && falseCond.length > 0) {
        criteriaEntries.push(['false', falseCond]);
      }
    }

    const payload: JevQuestionPayload = {
      type: 'noul',
      instructions,
    };
    if (criteriaEntries.length > 0) {
      payload.criteria = Object.fromEntries(criteriaEntries);
    }
    return payload;
  }

  if (question.type === 'choice') {
    const criteria = Object.fromEntries(
      question.options.map(opt => [
        opt.key,
        opt.description && opt.description.trim().length > 0
          ? opt.description.trim()
          : null,
      ])
    );

    return {
      type: 'choice',
      instructions,
      criteria,
    };
  }

  // question.type === 'score'
  const criteria = question.levels.map(level => level.trim());
  return {
    type: 'score',
    instructions,
    criteria,
  };
}

/**
 * Génère le payload complet de la requête Jev (rawObject, jsonString, endpointUrl, authHeaderPrefix).
 * Lève InvalidSpecError si la spécification comporte des erreurs de validation bloquantes.
 */
export function generateJevOutput(spec: EasyJevSpec): GeneratedJevOutput {
  const validation = validateSpec(spec);
  if (!validation.isValid) {
    throw new InvalidSpecError(validation.issues);
  }

  const endpointUrl =
    spec.target.provider === 'typesafe'
      ? 'https://api.typesafe.ai/v1/systemone'
      : 'https://ai-gateway.vercel.sh/typesafe/v1/systemone';

  const authHeaderPrefix = 'Bearer ';

  const replacements = new Map<string, string>();
  let state: string | Record<string, string>;

  if (spec.outputMode === 'n8n-expression') {
    if (spec.fields.length === 1) {
      const field = spec.fields[0]!;
      const marker = generateUniqueMarker(field.name);
      const expr = `{{ JSON.stringify($json.${field.name}) }}`;
      replacements.set(JSON.stringify(marker), expr);
      state = marker;
    } else {
      const stateEntries: [string, string][] = spec.fields.map(field => {
        const marker = generateUniqueMarker(field.name);
        const expr = `{{ JSON.stringify($json.${field.name}) }}`;
        replacements.set(JSON.stringify(marker), expr);
        return [field.name, marker];
      });
      state = Object.fromEntries(stateEntries);
    }
  } else {
    // Mode example-text : JSON strictement valide
    if (spec.fields.length === 1) {
      state = spec.fields[0]?.exampleValue ?? '';
    } else {
      state = Object.fromEntries(
        spec.fields.map(field => [field.name, field.exampleValue ?? ''])
      );
    }
  }

  const questions = Object.fromEntries(
    spec.questions.map(question => [question.key, buildQuestionPayload(question)])
  );

  // Ordre strict des clés : state, model, questions
  const rawObject: JevRequestBody = {
    state,
    model: spec.target.model,
    questions,
  };

  let jsonString = JSON.stringify(rawObject, null, 2);
  for (const [quotedMarker, expression] of replacements.entries()) {
    jsonString = jsonString.replaceAll(quotedMarker, () => expression);
  }

  return {
    rawObject,
    jsonString,
    endpointUrl,
    authHeaderPrefix,
  };
}

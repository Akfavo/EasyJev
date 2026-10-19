import type {
  ChoiceOption,
  ChoiceQuestionSpec,
  EasyJevSpec,
  NoulQuestionSpec,
  QuestionSpec,
  ScoreQuestionSpec,
  SpecField,
} from '../spec';
import { deriveQuestionKey, isValidIdentifier } from '../spec';
import { validateSpec } from '../validators';
import { MAX_GENERATED_QUESTIONS } from './config';

export type ParseQuestionsResult =
  | { ok: true; questions: QuestionSpec[] }
  | { ok: false; issues: string[] };

export interface ParseQuestionsOptions {
  disallowUnknownFieldWarnings?: boolean;
}

/**
 * Nettoie une chaîne : retire les délimiteurs n8n {{ et }} et supprime les espaces aux extrémités.
 */
function cleanText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[{]{2}|[}]{2}/g, '').trim();
}

/**
 * Dérive un libellé UI synthétique à partir du début de l'instruction.
 */
function deriveLabelFromInstructions(instructions: string): string {
  const cleaned = instructions.replace(/[`{}]/g, '').trim();
  if (cleaned.length === 0) return 'Question';

  const sentenceMatch = cleaned.match(/^[^.?!]+[.?!]?/);
  const firstSentence = sentenceMatch ? sentenceMatch[0].trim() : cleaned;
  if (firstSentence.length <= 50) {
    return firstSentence;
  }
  return `${firstSentence.slice(0, 47).trim()}...`;
}

interface RawOption {
  key?: unknown;
  description?: unknown;
}

interface RawQuestion {
  key?: unknown;
  type?: unknown;
  instructions?: unknown;
  true_condition?: unknown;
  false_condition?: unknown;
  options?: unknown;
  levels?: unknown;
}

/**
 * Analyse et valide les questions générées par Claude sans aucune dépendance externe.
 * - Gardes de type strictes (aucun any).
 * - Nettoyage des délimiteurs n8n ({{ et }}).
 * - Dérivation et garantie d'unicité des clés.
 * - Bornes sur les questions (1 à MAX_GENERATED_QUESTIONS), choix (2 à 255) et niveaux de score (2 à 10).
 * - Validation finale par validateSpec (les avertissements passent, les erreurs bloquantes échouent).
 */
export function parseGeneratedQuestions(
  input: unknown,
  fields: SpecField[],
  makeId: () => string,
  options?: ParseQuestionsOptions
): ParseQuestionsResult {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, issues: ['INVALID_OUTPUT_FORMAT'] };
  }

  const rawObj = input as Record<string, unknown>;
  if (!('questions' in rawObj) || !Array.isArray(rawObj.questions)) {
    return { ok: false, issues: ['NO_QUESTIONS'] };
  }

  const rawQuestions = rawObj.questions;
  if (rawQuestions.length === 0) {
    return { ok: false, issues: ['NO_QUESTIONS'] };
  }

  if (rawQuestions.length > MAX_GENERATED_QUESTIONS) {
    return { ok: false, issues: ['TOO_MANY_QUESTIONS'] };
  }

  const usedKeys = new Set<string>();
  const questions: QuestionSpec[] = [];

  for (let i = 0; i < rawQuestions.length; i++) {
    const rawQ = rawQuestions[i];
    if (typeof rawQ !== 'object' || rawQ === null) {
      return { ok: false, issues: ['INVALID_QUESTION_FORMAT'] };
    }

    const q = rawQ as RawQuestion;
    const instructions = cleanText(q.instructions);
    if (instructions.length === 0) {
      return { ok: false, issues: ['QUESTION_INSTRUCTIONS_EMPTY'] };
    }

    const typeStr = typeof q.type === 'string' ? q.type.trim() : '';
    if (typeStr !== 'noul' && typeStr !== 'choice' && typeStr !== 'score') {
      return { ok: false, issues: ['UNKNOWN_QUESTION_TYPE'] };
    }

    let key = cleanText(q.key);
    if (!isValidIdentifier(key) || usedKeys.has(key)) {
      key = deriveQuestionKey(key || instructions, usedKeys);
    }
    usedKeys.add(key);

    const label = deriveLabelFromInstructions(instructions);
    const questionId = makeId();

    if (typeStr === 'noul') {
      const trueCondition = cleanText(q.true_condition);
      const falseCondition = cleanText(q.false_condition);
      const criteria =
        trueCondition || falseCondition
          ? {
              ...(trueCondition ? { trueCondition } : {}),
              ...(falseCondition ? { falseCondition } : {}),
            }
          : undefined;

      const noulQuestion: NoulQuestionSpec = {
        id: questionId,
        type: 'noul',
        key,
        label,
        instructions,
        isKeyCustomized: false,
        criteria,
      };
      questions.push(noulQuestion);
    } else if (typeStr === 'choice') {
      if (!Array.isArray(q.options)) {
        return { ok: false, issues: ['CHOICE_OPTIONS_TOO_FEW'] };
      }

      if (q.options.length < 2) {
        return { ok: false, issues: ['CHOICE_OPTIONS_TOO_FEW'] };
      }

      if (q.options.length > 255) {
        return { ok: false, issues: ['CHOICE_OPTIONS_TOO_MANY'] };
      }

      const usedOptionKeys = new Set<string>();
      const options: ChoiceOption[] = [];

      for (let j = 0; j < q.options.length; j++) {
        const rawOpt = q.options[j];
        if (typeof rawOpt !== 'object' || rawOpt === null) {
          return { ok: false, issues: ['CHOICE_OPTION_KEY_EMPTY'] };
        }
        const opt = rawOpt as RawOption;
        let optKey = cleanText(opt.key);
        if (!isValidIdentifier(optKey) || usedOptionKeys.has(optKey)) {
          optKey = deriveQuestionKey(optKey || `opt_${j + 1}`, usedOptionKeys);
        }
        usedOptionKeys.add(optKey);

        const desc = cleanText(opt.description);
        options.push({
          key: optKey,
          ...(desc ? { description: desc } : {}),
        });
      }

      const choiceQuestion: ChoiceQuestionSpec = {
        id: questionId,
        type: 'choice',
        key,
        label,
        instructions,
        isKeyCustomized: false,
        options,
      };
      questions.push(choiceQuestion);
    } else if (typeStr === 'score') {
      if (!Array.isArray(q.levels)) {
        return { ok: false, issues: ['SCORE_LEVELS_OUT_OF_RANGE'] };
      }

      if (q.levels.length < 2 || q.levels.length > 10) {
        return { ok: false, issues: ['SCORE_LEVELS_OUT_OF_RANGE'] };
      }

      const levels: string[] = [];
      for (let k = 0; k < q.levels.length; k++) {
        const lvl = cleanText(q.levels[k]);
        if (lvl.length === 0) {
          return { ok: false, issues: ['SCORE_LEVEL_EMPTY'] };
        }
        levels.push(lvl);
      }

      const scoreQuestion: ScoreQuestionSpec = {
        id: questionId,
        type: 'score',
        key,
        label,
        instructions,
        isKeyCustomized: false,
        levels,
      };
      questions.push(scoreQuestion);
    }
  }

  // Contrôle final avec validateSpec
  const spec: EasyJevSpec = {
    fields,
    questions,
    target: { provider: 'typesafe', model: 'jev-latest' },
    outputMode: 'n8n-expression',
  };

  const validation = validateSpec(spec);
  const blockingIssues = validation.issues.filter(issue => issue.severity === 'error');

  if (options?.disallowUnknownFieldWarnings) {
    const unknownFieldIssues = validation.issues.filter(
      issue => issue.code === 'QUESTION_CITES_UNKNOWN_FIELD'
    );
    if (unknownFieldIssues.length > 0) {
      blockingIssues.push(...unknownFieldIssues);
    }
  }

  if (blockingIssues.length > 0) {
    return {
      ok: false,
      issues: blockingIssues.map(issue => issue.code),
    };
  }

  return {
    ok: true,
    questions,
  };
}

/**
 * Extrait la liste `fields_used` renvoyée par Claude : uniquement des noms de champs fournis,
 * sans doublon, dans l'ordre des champs fournis. Toute valeur inattendue est ignorée.
 */
export function extractFieldsUsed(input: unknown, fields: SpecField[]): string[] {
  if (typeof input !== 'object' || input === null) return [];
  const raw = (input as Record<string, unknown>).fields_used;
  if (!Array.isArray(raw)) return [];
  const requested = new Set<string>();
  for (const item of raw) {
    if (typeof item === 'string') requested.add(item.trim());
  }
  return fields.map(f => f.name).filter(name => requested.has(name));
}

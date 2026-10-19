import { isValidIdentifier, type EasyJevSpec } from '../spec';
import type { ValidationIssue, ValidationResult } from './types';

function hasN8nDelimiters(text: string | undefined): boolean {
  if (!text) {
    return false;
  }
  return text.includes('{{') || text.includes('}}');
}

/**
 * Valide une spécification EasyJev complète.
 * Détecte les erreurs bloquantes (rendant isValid = false) et les avertissements.
 */
export function validateSpec(spec: EasyJevSpec): ValidationResult {
  const issues: ValidationIssue[] = [];

  // --- 1. Validation des champs ---
  if (spec.fields.length === 0) {
    issues.push({
      code: 'NO_FIELDS',
      severity: 'error',
    });
  }

  const seenFieldNames = new Set<string>();
  const validFieldNames = new Set<string>();

  for (const field of spec.fields) {
    if (!isValidIdentifier(field.name)) {
      issues.push({
        code: 'FIELD_NAME_INVALID',
        severity: 'error',
        fieldId: field.id,
        params: { name: field.name },
      });
    } else if (seenFieldNames.has(field.name)) {
      issues.push({
        code: 'FIELD_NAME_DUPLICATE',
        severity: 'error',
        fieldId: field.id,
        params: { name: field.name },
      });
    } else {
      validFieldNames.add(field.name);
    }
    seenFieldNames.add(field.name);
  }

  // --- 2. Validation des questions ---
  if (spec.questions.length === 0) {
    issues.push({
      code: 'NO_QUESTIONS',
      severity: 'error',
    });
  }

  const seenQuestionKeys = new Set<string>();

  for (const question of spec.questions) {
    // Clé de la question
    if (!isValidIdentifier(question.key)) {
      issues.push({
        code: 'QUESTION_KEY_INVALID',
        severity: 'error',
        questionId: question.id,
        params: { key: question.key },
      });
    } else if (seenQuestionKeys.has(question.key)) {
      issues.push({
        code: 'QUESTION_KEY_DUPLICATE',
        severity: 'error',
        questionId: question.id,
        params: { key: question.key },
      });
    }
    seenQuestionKeys.add(question.key);

    // Instructions non vides
    if (question.instructions.trim().length === 0) {
      issues.push({
        code: 'QUESTION_INSTRUCTIONS_EMPTY',
        severity: 'error',
        questionId: question.id,
      });
    }

    // Citations de champs dans les instructions
    const citedMatches = Array.from(
      question.instructions.matchAll(/`([^`]+)`/g),
      match => match[1]
    ).filter((item): item is string => typeof item === 'string' && item.length > 0);

    const citedExistingFields = citedMatches.filter(cited => validFieldNames.has(cited));

    // Avertissement si plusieurs champs existent et qu'aucun champ existant n'est cité
    if (spec.fields.length > 1 && citedExistingFields.length === 0) {
      issues.push({
        code: 'QUESTION_NO_FIELD_CITED',
        severity: 'warning',
        questionId: question.id,
      });
    }

    // Avertissement si un champ cité n'existe pas dans spec.fields
    const reportedUnknowns = new Set<string>();
    for (const cited of citedMatches) {
      if (!validFieldNames.has(cited) && !reportedUnknowns.has(cited)) {
        reportedUnknowns.add(cited);
        issues.push({
          code: 'QUESTION_CITES_UNKNOWN_FIELD',
          severity: 'warning',
          questionId: question.id,
          params: { fieldName: cited },
        });
      }
    }

    // Spécificités selon le type de question
    if (question.type === 'choice') {
      const namedOptions = question.options.filter(
        option => option.key.trim().length > 0
      );

      if (namedOptions.length < 2) {
        issues.push({
          code: 'CHOICE_OPTIONS_TOO_FEW',
          severity: 'error',
          questionId: question.id,
          params: { count: namedOptions.length },
        });
      } else if (question.options.length > 255) {
        issues.push({
          code: 'CHOICE_OPTIONS_TOO_MANY',
          severity: 'error',
          questionId: question.id,
          params: { count: question.options.length },
        });
      }

      const seenOptionKeys = new Set<string>();
      for (const option of question.options) {
        if (option.key.trim().length === 0) {
          issues.push({
            code: 'CHOICE_OPTION_KEY_EMPTY',
            severity: 'error',
            questionId: question.id,
          });
        } else if (seenOptionKeys.has(option.key)) {
          issues.push({
            code: 'CHOICE_OPTION_DUPLICATE',
            severity: 'error',
            questionId: question.id,
            params: { key: option.key },
          });
        }
        seenOptionKeys.add(option.key);
      }
    } else if (question.type === 'score') {
      let hasEmptyLevel = false;
      const nonEmptyLevels: string[] = [];

      for (const level of question.levels) {
        if (level.trim().length === 0) {
          hasEmptyLevel = true;
        } else {
          nonEmptyLevels.push(level);
        }
      }

      if (hasEmptyLevel) {
        issues.push({
          code: 'SCORE_LEVEL_EMPTY',
          severity: 'error',
          questionId: question.id,
        });
      }

      if (nonEmptyLevels.length < 2 || nonEmptyLevels.length > 10) {
        issues.push({
          code: 'SCORE_LEVELS_OUT_OF_RANGE',
          severity: 'error',
          questionId: question.id,
          params: { count: nonEmptyLevels.length },
        });
      }
    }

    // Avertissement sur les délimiteurs n8n ({{ ou }}) en mode n8n-expression
    if (spec.outputMode === 'n8n-expression') {
      let hasDelimiters = hasN8nDelimiters(question.instructions);

      if (!hasDelimiters && question.type === 'noul' && question.criteria) {
        hasDelimiters =
          hasN8nDelimiters(question.criteria.trueCondition) ||
          hasN8nDelimiters(question.criteria.falseCondition);
      } else if (!hasDelimiters && question.type === 'choice') {
        hasDelimiters = question.options.some(
          opt => hasN8nDelimiters(opt.key) || hasN8nDelimiters(opt.description)
        );
      } else if (!hasDelimiters && question.type === 'score') {
        hasDelimiters = question.levels.some(level => hasN8nDelimiters(level));
      }

      if (hasDelimiters) {
        issues.push({
          code: 'TEXT_CONTAINS_N8N_DELIMITERS',
          severity: 'warning',
          questionId: question.id,
        });
      }
    }
  }

  const hasErrors = issues.some(issue => issue.severity === 'error');

  return {
    isValid: !hasErrors,
    issues,
  };
}

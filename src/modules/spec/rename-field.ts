import type { EasyJevSpec, QuestionSpec } from './types';
import { isValidIdentifier } from './identifier';

// L'interface doit appeler renameField à la validation du nom (blur ou Entrée), pas à chaque frappe.

/**
 * Renomme un champ de façon pure en garantissant l'immutabilité de la spécification.
 * Si oldName et newName sont valides et que newName n'est pris par aucun autre champ,
 * propage le renommage dans les citations exactes (`oldName`) des instructions de questions.
 */
export function renameField(
  spec: EasyJevSpec,
  oldName: string,
  newName: string
): EasyJevSpec {
  if (oldName === newName) {
    return spec;
  }

  const fieldIndex = spec.fields.findIndex(field => field.name === oldName);
  if (fieldIndex === -1) {
    return spec;
  }

  const targetField = spec.fields[fieldIndex];
  if (!targetField) {
    return spec;
  }

  const newFields = spec.fields.map((field, idx) => {
    if (idx === fieldIndex) {
      return { ...field, name: newName };
    }
    return { ...field };
  });

  const isOldValid = isValidIdentifier(oldName);
  const isNewValid = isValidIdentifier(newName);
  const isNewNameTakenByOther = spec.fields.some(
    (field, idx) => idx !== fieldIndex && field.name === newName
  );

  const shouldPropagate = isOldValid && isNewValid && !isNewNameTakenByOther;

  const targetCitation = `\`${oldName}\``;
  const replacementCitation = `\`${newName}\``;

  const newQuestions: QuestionSpec[] = spec.questions.map(question => {
    const clonedQuestion = { ...question };
    if (shouldPropagate) {
      clonedQuestion.instructions = question.instructions.replaceAll(
        targetCitation,
        replacementCitation
      );
    }
    return clonedQuestion;
  });

  return {
    ...spec,
    fields: newFields,
    questions: newQuestions,
  };
}

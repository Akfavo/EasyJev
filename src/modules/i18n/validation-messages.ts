import type { ValidationCode } from '../validators';

export type ValidationMessageFn = (params?: Record<string, string | number>) => string;

export const validationMessagesFr: Record<ValidationCode, ValidationMessageFn> = {
  NO_FIELDS: () => 'Ajoute au moins un champ à analyser.',
  FIELD_NAME_INVALID: params =>
    `Le nom de champ « ${params?.name ?? ''} » est invalide. Utilise uniquement des lettres sans accent, chiffres ou tirets bas, sans commencer par un chiffre.`,
  FIELD_NAME_DUPLICATE: params =>
    `Le nom de champ « ${params?.name ?? ''} » est déjà utilisé. Les noms doivent être uniques.`,
  NO_QUESTIONS: () => 'Ajoute au moins une question à poser à Jev.',
  QUESTION_KEY_INVALID: params =>
    `La clé de question « ${params?.key ?? ''} » est invalide. Utilise uniquement des lettres sans accent, chiffres ou tirets bas, sans commencer par un chiffre.`,
  QUESTION_KEY_DUPLICATE: params =>
    `La clé de question « ${params?.key ?? ''} » est déjà utilisée. Chaque question doit avoir une clé unique.`,
  QUESTION_INSTRUCTIONS_EMPTY: () => "L'instruction de la question ne peut pas être vide.",
  QUESTION_NO_FIELD_CITED: () =>
    "Avec plusieurs champs, précise quel champ analyser en l'entourant d'accents graves (ex. : `message`).",
  QUESTION_CITES_UNKNOWN_FIELD: params =>
    `Le champ « ${params?.fieldName ?? ''} » cité dans la question n'existe pas dans la liste des champs.`,
  CHOICE_OPTIONS_TOO_FEW: params => {
    const count = Number(params?.count ?? 0);
    const countStr = count > 1 ? `${count} fournies` : `${count} fournie`;
    return `Une question à choix nécessite au moins 2 options valides (${countStr}).`;
  },
  CHOICE_OPTIONS_TOO_MANY: params =>
    `Une question à choix ne peut pas dépasser 255 options (${params?.count ?? 0} fournies).`,
  CHOICE_OPTION_KEY_EMPTY: () => "L'identifiant d'une option de choix ne peut pas être vide.",
  CHOICE_OPTION_DUPLICATE: params =>
    `L'option « ${params?.key ?? ''} » est en double dans cette question.`,
  SCORE_LEVEL_EMPTY: () => "Le libellé d'un niveau de score ne peut pas être vide.",
  SCORE_LEVELS_OUT_OF_RANGE: params => {
    const count = Number(params?.count ?? 0);
    const countStr = count > 1 ? `${count} fournis` : `${count} fourni`;
    return `Une échelle de score doit comporter entre 2 et 10 niveaux (${countStr}).`;
  },
  TEXT_CONTAINS_N8N_DELIMITERS: () =>
    "Le texte contient des délimiteurs n8n « {{ » ou « }} ». Retire-les ou reformule pour éviter de perturber l'évaluation n8n.",
};

export const validationMessagesEn: Record<ValidationCode, ValidationMessageFn> = {
  NO_FIELDS: () => 'Add at least one field to analyze.',
  FIELD_NAME_INVALID: params =>
    `Field name "${params?.name ?? ''}" is invalid. Use only letters without accents, digits, or underscores, without starting with a digit.`,
  FIELD_NAME_DUPLICATE: params =>
    `Field name "${params?.name ?? ''}" is already used. Names must be unique.`,
  NO_QUESTIONS: () => 'Add at least one question for Jev.',
  QUESTION_KEY_INVALID: params =>
    `Question key "${params?.key ?? ''}" is invalid. Use only letters without accents, digits, or underscores, without starting with a digit.`,
  QUESTION_KEY_DUPLICATE: params =>
    `Question key "${params?.key ?? ''}" is already used. Each question must have a unique key.`,
  QUESTION_INSTRUCTIONS_EMPTY: () => 'Question instructions cannot be empty.',
  QUESTION_NO_FIELD_CITED: () =>
    'With multiple fields, specify which field to analyze between backticks (e.g., `message`).',
  QUESTION_CITES_UNKNOWN_FIELD: params =>
    `Field "${params?.fieldName ?? ''}" cited in the question does not exist in the fields list.`,
  CHOICE_OPTIONS_TOO_FEW: params => {
    const count = Number(params?.count ?? 0);
    const countStr = count === 1 ? '1 provided' : `${count} provided`;
    return `A choice question requires at least 2 valid options (${countStr}).`;
  },
  CHOICE_OPTIONS_TOO_MANY: params =>
    `A choice question cannot exceed 255 options (${params?.count ?? 0} provided).`,
  CHOICE_OPTION_KEY_EMPTY: () => 'Choice option key cannot be empty.',
  CHOICE_OPTION_DUPLICATE: params =>
    `Option "${params?.key ?? ''}" is duplicated in this question.`,
  SCORE_LEVEL_EMPTY: () => 'Score level label cannot be empty.',
  SCORE_LEVELS_OUT_OF_RANGE: params => {
    const count = Number(params?.count ?? 0);
    const countStr = count === 1 ? '1 provided' : `${count} provided`;
    return `A score scale must have between 2 and 10 levels (${countStr}).`;
  },
  TEXT_CONTAINS_N8N_DELIMITERS: () =>
    'Text contains n8n delimiters "{{" or "}}". Remove them or rephrase to prevent interfering with n8n evaluation.',
};

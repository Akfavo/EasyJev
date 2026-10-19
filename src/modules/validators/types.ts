export type ValidationSeverity = 'error' | 'warning';

export type ValidationCode =
  | 'NO_FIELDS'
  | 'FIELD_NAME_INVALID'
  | 'FIELD_NAME_DUPLICATE'
  | 'NO_QUESTIONS'
  | 'QUESTION_KEY_INVALID'
  | 'QUESTION_KEY_DUPLICATE'
  | 'QUESTION_INSTRUCTIONS_EMPTY'
  | 'QUESTION_NO_FIELD_CITED'
  | 'QUESTION_CITES_UNKNOWN_FIELD'
  | 'CHOICE_OPTIONS_TOO_FEW'
  | 'CHOICE_OPTIONS_TOO_MANY'
  | 'CHOICE_OPTION_KEY_EMPTY'
  | 'CHOICE_OPTION_DUPLICATE'
  | 'SCORE_LEVEL_EMPTY'
  | 'SCORE_LEVELS_OUT_OF_RANGE'
  | 'TEXT_CONTAINS_N8N_DELIMITERS';

export interface ValidationIssue {
  code: ValidationCode;
  severity: ValidationSeverity;
  params?: Record<string, string | number>;
  fieldId?: string;
  questionId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

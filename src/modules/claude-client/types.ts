import type { QuestionSpec, SpecField } from '../spec';

/**
 * Langue de l'interface transmise à Claude comme repli quand la langue
 * de la description est ambiguë. Indépendant du module i18n.
 */
export type InterfaceLanguage = 'fr' | 'en';

export type ClaudeErrorType =
  | 'invalid_input'
  | 'invalid_key'
  | 'forbidden'
  | 'billing'
  | 'bad_request'
  | 'rate_limited'
  | 'overloaded'
  | 'network'
  | 'aborted'
  | 'bad_output'
  | 'model_unavailable'
  | 'timeout'
  | 'refused';

export interface ClaudeUsage {
  inputTokens: number;
  outputTokens: number;
}

export type ClaudeGenerationResult =
  | {
      ok: true;
      questions: QuestionSpec[];
      /** Noms des champs jugés utiles par le modèle (sous-ensemble des champs fournis, dans l'ordre fourni). */
      fieldsUsed: string[];
      usage: ClaudeUsage;
      model: string;
    }
  | {
      ok: false;
      error: ClaudeErrorType;
      status?: number;
      apiErrorType?: string;
    };

export interface ClaudeGenerationParams {
  apiKey: string;
  description: string;
  fields: SpecField[];
  model?: string;
  /** Langue de l'interface ; utilisée comme repli si la langue de la description est ambiguë. */
  language?: InterfaceLanguage;
}

export interface ClaudeGenerationDeps {
  fetch?: typeof fetch;
  makeId: () => string;
  signal?: AbortSignal;
}

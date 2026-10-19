import { MAX_OUTPUT_TOKENS, getRequestStrategy } from './config';
import { SUBMIT_QUESTIONS_TOOL, TOOL_CHOICE_AUTO, TOOL_CHOICE_FORCED } from './tool';

export interface BuildClaudeRequestBodyParams {
  model: string;
  systemPrompt: string;
  userMessage: string;
}

export interface ClaudeMessagePayload {
  role: 'user';
  content: string;
}

export interface ClaudeThinkingConfig {
  type: 'between_tools';
}

export type ClaudeRequestBody =
  | {
      model: string;
      max_tokens: number;
      system: string;
      messages: ClaudeMessagePayload[];
      tools: readonly [typeof SUBMIT_QUESTIONS_TOOL];
      tool_choice: typeof TOOL_CHOICE_FORCED;
    }
  | {
      model: string;
      max_tokens: number;
      system: string;
      messages: ClaudeMessagePayload[];
      tools: readonly [(typeof SUBMIT_QUESTIONS_TOOL & { readonly strict: true })];
      tool_choice: typeof TOOL_CHOICE_AUTO;
      thinking: ClaudeThinkingConfig;
    };

/**
 * Construit le corps de la requête pour l'API Anthropic Messages selon la stratégie du modèle :
 * - 'forced-tool' (Haiku 5.5) : tool_choice forcé submit_questions, pas de strict, pas de thinking (un appel d'outil forcé se fait sans réflexion préalable).
 * - 'auto-tool-strict' (Sonnet 5.5) : tool_choice auto, strict: true sur l'outil, thinking between_tools.
 * Modèle inconnu : repli sur 'forced-tool'.
 * Aucun paramètre d'échantillonnage (temperature, top_p, top_k) n'est transmis.
 */
export function buildClaudeRequestBody(
  params: BuildClaudeRequestBodyParams
): ClaudeRequestBody {
  const { model, systemPrompt, userMessage } = params;
  const strategy = getRequestStrategy(model);

  if (strategy === 'auto-tool-strict') {
    return {
      model,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
      tools: [
        {
          ...SUBMIT_QUESTIONS_TOOL,
          strict: true,
        },
      ],
      tool_choice: TOOL_CHOICE_AUTO,
      thinking: {
        type: 'between_tools',
      },
    };
  }

  return {
    model,
    max_tokens: MAX_OUTPUT_TOKENS,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
    tools: [SUBMIT_QUESTIONS_TOOL],
    tool_choice: TOOL_CHOICE_FORCED,
  };
}

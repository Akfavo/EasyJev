import {
  CLAUDE_API_URL,
  CLAUDE_API_VERSION,
  DEFAULT_CLAUDE_MODEL,
  MAX_DESCRIPTION_CHARS,
  MIN_DESCRIPTION_CHARS,
} from './config';
import { extractFieldsUsed, parseGeneratedQuestions } from './parse';
import { buildSystemPrompt, buildUserMessage } from './prompt';
import { buildClaudeRequestBody } from './request';
import type {
  ClaudeGenerationDeps,
  ClaudeGenerationParams,
  ClaudeGenerationResult,
} from './types';

interface AnthropicToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: unknown;
}

interface AnthropicResponseBody {
  content?: unknown[];
  stop_reason?: string | null;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

/**
 * Génère des questions structurées pour Jev à partir d'une description utilisateur via Claude.
 * - Validation stricte préalable des entrées (longueur, clé présente).
 * - En-têtes conformes au standard Anthropic en direct depuis le navigateur.
 * - Pas de transmission de température ni de tokens indésirables.
 * - Exactement une tentative de relance automatique en cas de sortie inexploitable (bad_output).
 * - Usage cumulé sur les relances pour mesurer fidèlement le coût réel.
 * - Zéro fuite de la clé API (jamais logguée, jamais insérée dans une URL ou un message d'erreur).
 */
export async function generateQuestionsFromDescription(
  params: ClaudeGenerationParams,
  deps: ClaudeGenerationDeps
): Promise<ClaudeGenerationResult> {
  const apiKey = params.apiKey ? params.apiKey.trim() : '';
  const description = params.description ? params.description.trim() : '';
  const fields = params.fields ?? [];

  // Validation préalable stricte des paramètres d'entrée
  if (
    apiKey.length === 0 ||
    description.length < MIN_DESCRIPTION_CHARS ||
    description.length > MAX_DESCRIPTION_CHARS ||
    fields.length === 0
  ) {
    return { ok: false, error: 'invalid_input' };
  }

  if (deps.signal?.aborted) {
    return { ok: false, error: 'aborted' };
  }

  const model = params.model ?? DEFAULT_CLAUDE_MODEL;
  const fetchFn = deps.fetch ?? globalThis.fetch;
  const systemPrompt = buildSystemPrompt(params.language);

  let previousIssues: string[] | undefined = undefined;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (let attempt = 1; attempt <= 2; attempt++) {
    if (deps.signal?.aborted) {
      return { ok: false, error: 'aborted' };
    }

    const userMessage = buildUserMessage({
      description,
      fields,
      retryIssues: previousIssues,
      language: params.language,
    });

    const requestPayload = buildClaudeRequestBody({
      model,
      systemPrompt,
      userMessage,
    });

    let response: Response;
    try {
      response = await fetchFn(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': CLAUDE_API_VERSION,
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify(requestPayload),
        signal: deps.signal,
      });
    } catch (err: unknown) {
      if (deps.signal?.aborted) {
        return { ok: false, error: 'aborted' };
      }
      if (err instanceof Error && err.name === 'AbortError') {
        return { ok: false, error: 'aborted' };
      }
      return { ok: false, error: 'network' };
    }

    if (deps.signal?.aborted) {
      return { ok: false, error: 'aborted' };
    }

    // Gestion des codes d'erreur HTTP avec extraction sécurisée de error.type
    if (!response.ok) {
      const status = response.status;
      let apiErrorType: string | undefined = undefined;
      let bodyText = '';

      try {
        bodyText = await response.text();
        const parsed = JSON.parse(bodyText) as Record<string, unknown>;
        if (
          parsed &&
          typeof parsed === 'object' &&
          'error' in parsed &&
          parsed.error &&
          typeof parsed.error === 'object' &&
          'type' in parsed.error &&
          typeof (parsed.error as Record<string, unknown>).type === 'string'
        ) {
          const rawType = (parsed.error as Record<string, unknown>).type as string;
          if (/^[a-z_]+$/.test(rawType)) {
            apiErrorType = rawType;
          }
        }
      } catch {
        // Ignorer l'échec d'analyse JSON du corps
      }

      if (status === 401) {
        return { ok: false, error: 'invalid_key', status, apiErrorType };
      }
      if (status === 403) {
        return { ok: false, error: 'forbidden', status, apiErrorType };
      }
      if (status === 404) {
        return { ok: false, error: 'model_unavailable', status, apiErrorType };
      }
      if (status === 429) {
        return { ok: false, error: 'rate_limited', status, apiErrorType };
      }
      if (status === 529 || status >= 500) {
        return { ok: false, error: 'overloaded', status, apiErrorType };
      }
      if (status === 400) {
        if (/credit|balance/i.test(bodyText)) {
          return { ok: false, error: 'billing', status, apiErrorType };
        }
        return { ok: false, error: 'bad_request', status, apiErrorType };
      }

      if (status >= 400 && status < 500) {
        return { ok: false, error: 'bad_request', status, apiErrorType };
      }
      return { ok: false, error: 'overloaded', status, apiErrorType };
    }

    // Statut 200 OK : analyse de la charge utile de réponse
    let data: AnthropicResponseBody;
    try {
      data = (await response.json()) as AnthropicResponseBody;
    } catch {
      if (attempt === 1) {
        previousIssues = ['RESPONSE_NOT_VALID_JSON'];
        continue;
      }
      return { ok: false, error: 'bad_output' };
    }

    // Cumul de l'usage pour mesurer le coût total incluant les relances
    if (typeof data.usage?.input_tokens === 'number') {
      totalInputTokens += data.usage.input_tokens;
    }
    if (typeof data.usage?.output_tokens === 'number') {
      totalOutputTokens += data.usage.output_tokens;
    }

    // Gestion de stop_reason : refus documenté du modèle (aucun réessai)
    if (data.stop_reason === 'refusal') {
      return { ok: false, error: 'refused' };
    }

    // Si tronqué sur max_tokens, relancer avec consigne
    if (data.stop_reason === 'max_tokens') {
      if (attempt === 1) {
        previousIssues = ['produce fewer, shorter questions'];
        continue;
      }
      return { ok: false, error: 'bad_output' };
    }

    let toolInput: unknown = null;
    if (Array.isArray(data.content)) {
      for (const block of data.content) {
        if (
          typeof block === 'object' &&
          block !== null &&
          'type' in block &&
          (block as Record<string, unknown>).type === 'tool_use' &&
          (block as Record<string, unknown>).name === 'submit_questions' &&
          'input' in block
        ) {
          toolInput = (block as AnthropicToolUseBlock).input;
          break;
        }
      }
    }

    if (toolInput === null) {
      if (attempt === 1) {
        previousIssues = ['NO_TOOL_CALL_SUBMIT_QUESTIONS'];
        continue;
      }
      return { ok: false, error: 'bad_output' };
    }

    // À la première tentative, rejeter les citations de champs inconnus pour forcer la relance
    const parseResult = parseGeneratedQuestions(toolInput, fields, deps.makeId, {
      disallowUnknownFieldWarnings: attempt === 1,
    });

    if (parseResult.ok) {
      return {
        ok: true,
        questions: parseResult.questions,
        fieldsUsed: extractFieldsUsed(toolInput, fields),
        usage: {
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
        },
        model,
      };
    }

    if (attempt === 1) {
      previousIssues = parseResult.issues;
      continue;
    }

    return { ok: false, error: 'bad_output' };
  }

  return { ok: false, error: 'bad_output' };
}

/**
 * Configuration du client Claude pour EasyJev.
 * SEUL fichier où figurent l'URL de l'API Anthropic et les identifiants de modèles.
 */

export const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
export const CLAUDE_API_VERSION = '2023-06-01';

export type ClaudeRequestStrategy = 'forced-tool' | 'auto-tool-strict';

export const CLAUDE_MODELS = [
  {
    id: 'claude-haiku-5-5',
    label: 'Claude Haiku 5.5',
    shortLabel: 'Haiku 5.5',
    pricing: {
      inputUsdPerMillion: 0.1,
      outputUsdPerMillion: 0.5,
    },
    requestStrategy: 'forced-tool',
  },
  {
    id: 'claude-sonnet-5-5',
    label: 'Claude Sonnet 5.5',
    shortLabel: 'Sonnet 5.5',
    pricing: {
      inputUsdPerMillion: 2,
      outputUsdPerMillion: 10,
    },
    requestStrategy: 'auto-tool-strict',
  },
] as const;

export type ClaudeModelId = (typeof CLAUDE_MODELS)[number]['id'];

/**
 * Retourne la stratégie de requête associée à un modèle Claude.
 * Pour un modèle inconnu, applique la stratégie par défaut ('forced-tool').
 */
export function getRequestStrategy(modelId: string): ClaudeRequestStrategy {
  const model = CLAUDE_MODELS.find(m => m.id === modelId);
  return model ? model.requestStrategy : 'forced-tool';
}

export const DEFAULT_CLAUDE_MODEL = 'claude-haiku-5-5';

/**
 * Retourne le libellé court d'un modèle (par exemple « Haiku 5.5 »).
 * Pour un identifiant inconnu, renvoie l'identifiant tel quel.
 */
export function getModelShortLabel(modelId: string): string {
  const model = CLAUDE_MODELS.find(m => m.id === modelId);
  return model ? model.shortLabel : modelId;
}

export const MAX_OUTPUT_TOKENS = 4096;
export const MIN_DESCRIPTION_CHARS = 10;
export const MAX_DESCRIPTION_CHARS = 4000;
export const MAX_GENERATED_QUESTIONS = 12;

/**
 * Calcule le coût estimé en USD d'un appel à partir de son usage et du modèle utilisé.
 * Renvoie null si le modèle n'est pas reconnu dans la configuration.
 */
export function estimateCostUsd(
  usage: { inputTokens: number; outputTokens: number },
  modelId: string
): number | null {
  const model = CLAUDE_MODELS.find(m => m.id === modelId);
  if (!model) {
    return null;
  }

  const inputCost = (usage.inputTokens * model.pricing.inputUsdPerMillion) / 1_000_000;
  const outputCost = (usage.outputTokens * model.pricing.outputUsdPerMillion) / 1_000_000;
  return inputCost + outputCost;
}

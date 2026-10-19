/**
 * Types du module ai-settings.
 * Porte l'état partagé : clé API Claude, mémorisation, modèle choisi, ouverture du pop-up.
 */

import type { ClaudeModelId } from '@/modules/claude-client';

export interface AiSettingsState {
  /** Clé API Claude saisie (jamais dans URL/log/console) */
  apiKey: string;
  /** Si true, la clé est mémorisée dans localStorage */
  rememberKey: boolean;
  /** Identifiant du modèle Claude sélectionné */
  selectedModel: string;
  /** Si true, le pop-up de réglages est ouvert */
  isDialogOpen: boolean;
}

export type AiSettingsAction =
  | { type: 'SET_API_KEY'; key: string }
  | { type: 'SET_REMEMBER_KEY'; remember: boolean }
  | { type: 'SET_MODEL'; modelId: string }
  | { type: 'FORGET_KEY' }
  | { type: 'OPEN_DIALOG' }
  | { type: 'CLOSE_DIALOG' };

/** Clé localStorage du modèle choisi */
export const MODEL_STORAGE_KEY = 'easyjev_claude_model';

/** Modèle par défaut utilisé si rien n'est mémorisé */
export const AI_SETTINGS_DEFAULT_MODEL: ClaudeModelId = 'claude-haiku-5-5';

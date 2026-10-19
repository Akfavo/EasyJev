import { createSessionStore } from '@/lib/session-store';
import { CLAUDE_MODELS } from '@/modules/claude-client';
import { AI_SETTINGS_DEFAULT_MODEL, type AiSettingsState } from './types';

/**
 * Réglages IA conservés en mémoire de session JavaScript.
 * Exclut formellement les états d'interface éphémères comme isDialogOpen.
 */
export interface AiSessionSettings {
  apiKey: string;
  rememberKey: boolean;
  selectedModel: string;
}

/**
 * Magasin de session singleton pour les réglages IA.
 * Survit à la navigation côté client entre /fr et /en.
 */
export const aiSettingsSessionStore = createSessionStore<AiSessionSettings>();

/**
 * Prépare l'objet de session à partir de l'état complet des réglages.
 * Fonction pure : aucune fuite de isDialogOpen.
 */
export function toSessionSettings(state: AiSettingsState): AiSessionSettings {
  return {
    apiKey: state.apiKey,
    rememberKey: state.rememberKey,
    selectedModel: state.selectedModel,
  };
}

/**
 * Restaure les réglages à partir de la session en mémoire.
 * Valide le modèle avec CLAUDE_MODELS : un identifiant inconnu retombe sur le modèle par défaut.
 */
export function fromSessionSettings(session?: Partial<AiSessionSettings> | null): AiSessionSettings {
  if (!session) {
    return {
      apiKey: '',
      rememberKey: false,
      selectedModel: AI_SETTINGS_DEFAULT_MODEL,
    };
  }

  const isValidModel = CLAUDE_MODELS.some(m => m.id === session.selectedModel);
  const selectedModel =
    isValidModel && session.selectedModel ? session.selectedModel : AI_SETTINGS_DEFAULT_MODEL;

  return {
    apiKey: typeof session.apiKey === 'string' ? session.apiKey : '',
    rememberKey: Boolean(session.rememberKey),
    selectedModel,
  };
}

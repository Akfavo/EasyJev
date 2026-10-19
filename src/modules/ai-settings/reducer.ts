/**
 * Réducteur pur du module ai-settings.
 * Aucun effet de bord : lecture/écriture localStorage dans le Provider uniquement.
 */

import type { AiSettingsState, AiSettingsAction } from './types';

export function aiSettingsReducer(
  state: AiSettingsState,
  action: AiSettingsAction
): AiSettingsState {
  switch (action.type) {
    case 'SET_API_KEY':
      return { ...state, apiKey: action.key };

    case 'SET_REMEMBER_KEY':
      return { ...state, rememberKey: action.remember };

    case 'SET_MODEL':
      return { ...state, selectedModel: action.modelId };

    case 'FORGET_KEY':
      return { ...state, apiKey: '', rememberKey: false };

    case 'OPEN_DIALOG':
      return { ...state, isDialogOpen: true };

    case 'CLOSE_DIALOG':
      return { ...state, isDialogOpen: false };

    default:
      return state;
  }
}

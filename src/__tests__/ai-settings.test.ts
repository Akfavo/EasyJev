import { describe, it, expect } from 'vitest';
import {
  aiSettingsReducer,
  type AiSettingsState,
  AI_SETTINGS_DEFAULT_MODEL,
  toSessionSettings,
} from '@/modules/ai-settings';

function makeInitialState(): AiSettingsState {
  return {
    apiKey: '',
    rememberKey: false,
    selectedModel: AI_SETTINGS_DEFAULT_MODEL,
    isDialogOpen: false,
  };
}

describe('Module ai-settings — réducteur pur', () => {
  it('SET_API_KEY met à jour la clé sans modifier les autres champs', () => {
    const state = makeInitialState();
    const next = aiSettingsReducer(state, { type: 'SET_API_KEY', key: 'sk-ant-test' });
    expect(next.apiKey).toBe('sk-ant-test');
    expect(next.rememberKey).toBe(false);
    expect(next.selectedModel).toBe(AI_SETTINGS_DEFAULT_MODEL);
    expect(next.isDialogOpen).toBe(false);
  });

  it('SET_REMEMBER_KEY bascule rememberKey', () => {
    const state = makeInitialState();
    const next = aiSettingsReducer(state, { type: 'SET_REMEMBER_KEY', remember: true });
    expect(next.rememberKey).toBe(true);
    const next2 = aiSettingsReducer(next, { type: 'SET_REMEMBER_KEY', remember: false });
    expect(next2.rememberKey).toBe(false);
  });

  it('SET_MODEL met à jour selectedModel', () => {
    const state = makeInitialState();
    const next = aiSettingsReducer(state, { type: 'SET_MODEL', modelId: 'claude-sonnet-5-5' });
    expect(next.selectedModel).toBe('claude-sonnet-5-5');
  });

  it('FORGET_KEY réinitialise apiKey et rememberKey et produit une session sans clé', () => {
    const state: AiSettingsState = {
      apiKey: 'sk-ant-xxx',
      rememberKey: true,
      selectedModel: AI_SETTINGS_DEFAULT_MODEL,
      isDialogOpen: false,
    };
    const next = aiSettingsReducer(state, { type: 'FORGET_KEY' });
    expect(next.apiKey).toBe('');
    expect(next.rememberKey).toBe(false);
    expect(next.selectedModel).toBe(AI_SETTINGS_DEFAULT_MODEL);
    expect(next.isDialogOpen).toBe(false);

    const session = toSessionSettings(next);
    expect(session.apiKey).toBe('');
    expect(session.rememberKey).toBe(false);
  });

  it('OPEN_DIALOG passe isDialogOpen à true', () => {
    const state = makeInitialState();
    const next = aiSettingsReducer(state, { type: 'OPEN_DIALOG' });
    expect(next.isDialogOpen).toBe(true);
  });

  it('CLOSE_DIALOG passe isDialogOpen à false', () => {
    const state: AiSettingsState = { ...makeInitialState(), isDialogOpen: true };
    const next = aiSettingsReducer(state, { type: 'CLOSE_DIALOG' });
    expect(next.isDialogOpen).toBe(false);
  });

  it("le réducteur est pur : ne mute pas l'état d'origine", () => {
    const state = makeInitialState();
    const original = JSON.stringify(state);
    aiSettingsReducer(state, { type: 'SET_API_KEY', key: 'sk-ant-mutated' });
    expect(JSON.stringify(state)).toBe(original);
  });

  it('AI_SETTINGS_DEFAULT_MODEL est le modèle Haiku', () => {
    expect(AI_SETTINGS_DEFAULT_MODEL).toBe('claude-haiku-5-5');
  });
});

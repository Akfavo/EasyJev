import { describe, it, expect, beforeEach } from 'vitest';
import { createSessionStore } from '@/lib/session-store';
import {
  toSessionSettings,
  fromSessionSettings,
  aiSettingsSessionStore,
  type AiSettingsState,
  AI_SETTINGS_DEFAULT_MODEL,
} from '@/modules/ai-settings';
import { editorSessionStore, createInitialState } from '@/modules/editor';
import { CLAUDE_MODELS } from '@/modules/claude-client';

describe('Magasin de session en mémoire vive (createSessionStore)', () => {
  it('est vide au départ (get renvoie null)', () => {
    const store = createSessionStore<string>();
    expect(store.get()).toBeNull();
  });

  it('set enregistre la valeur et get la restitue fidèlement', () => {
    const store = createSessionStore<{ name: string; count: number }>();
    const payload = { name: 'easyjev', count: 42 };
    store.set(payload);
    expect(store.get()).toEqual(payload);
  });

  it('set écrase la valeur précédente', () => {
    const store = createSessionStore<number>();
    store.set(1);
    expect(store.get()).toBe(1);
    store.set(2);
    expect(store.get()).toBe(2);
  });

  it('clear remet la valeur à null', () => {
    const store = createSessionStore<string>();
    store.set('donnee');
    expect(store.get()).toBe('donnee');
    store.clear();
    expect(store.get()).toBeNull();
  });

  it('deux instances de store sont strictement indépendantes', () => {
    const storeA = createSessionStore<string>();
    const storeB = createSessionStore<string>();

    storeA.set('valeur-a');
    expect(storeA.get()).toBe('valeur-a');
    expect(storeB.get()).toBeNull();

    storeB.set('valeur-b');
    expect(storeA.get()).toBe('valeur-a');
    expect(storeB.get()).toBe('valeur-b');

    storeA.clear();
    expect(storeA.get()).toBeNull();
    expect(storeB.get()).toBe('valeur-b');
  });
});

describe('Fonctions pures toSessionSettings et fromSessionSettings', () => {
  const sampleState: AiSettingsState = {
    apiKey: 'sk-ant-test',
    rememberKey: true,
    selectedModel: 'claude-sonnet-5-5',
    isDialogOpen: true,
  };

  it('toSessionSettings extrait uniquement apiKey, rememberKey et selectedModel', () => {
    const session = toSessionSettings(sampleState);
    expect(session).toEqual({
      apiKey: 'sk-ant-test',
      rememberKey: true,
      selectedModel: 'claude-sonnet-5-5',
    });
  });

  it('toSessionSettings ne fait aucune fuite de isDialogOpen', () => {
    const session = toSessionSettings(sampleState);
    expect('isDialogOpen' in session).toBe(false);
  });

  it('toSessionSettings est pur et ne mute pas son argument', () => {
    const original = JSON.stringify(sampleState);
    toSessionSettings(sampleState);
    expect(JSON.stringify(sampleState)).toBe(original);
  });

  it('fromSessionSettings retourne les valeurs par défaut si session est null ou undefined', () => {
    expect(fromSessionSettings(null)).toEqual({
      apiKey: '',
      rememberKey: false,
      selectedModel: AI_SETTINGS_DEFAULT_MODEL,
    });
    expect(fromSessionSettings(undefined)).toEqual({
      apiKey: '',
      rememberKey: false,
      selectedModel: AI_SETTINGS_DEFAULT_MODEL,
    });
  });

  it('fromSessionSettings conserve un modèle Claude valide présent dans CLAUDE_MODELS', () => {
    const sonnetModel = CLAUDE_MODELS.find(m => m.id === 'claude-sonnet-5-5');
    expect(sonnetModel).toBeDefined();

    const restored = fromSessionSettings({
      apiKey: 'sk-ant-valid',
      rememberKey: true,
      selectedModel: 'claude-sonnet-5-5',
    });

    expect(restored.selectedModel).toBe('claude-sonnet-5-5');
    expect(restored.apiKey).toBe('sk-ant-valid');
    expect(restored.rememberKey).toBe(true);
  });

  it('fromSessionSettings retombe sur le modèle par défaut si identifiant inconnu ou invalide', () => {
    const restoredUnknown = fromSessionSettings({
      apiKey: 'sk-ant-test',
      rememberKey: false,
      selectedModel: 'unknown-model-id',
    });
    expect(restoredUnknown.selectedModel).toBe(AI_SETTINGS_DEFAULT_MODEL);

    const restoredEmpty = fromSessionSettings({
      apiKey: '',
      rememberKey: false,
      selectedModel: '',
    });
    expect(restoredEmpty.selectedModel).toBe(AI_SETTINGS_DEFAULT_MODEL);
  });

  it('fromSessionSettings normalise les types manquants', () => {
    const partial = fromSessionSettings({
      selectedModel: 'claude-sonnet-5-5',
    });
    expect(partial.apiKey).toBe('');
    expect(partial.rememberKey).toBe(false);
    expect(partial.selectedModel).toBe('claude-sonnet-5-5');
  });
});

describe('Instances de session globales EasyJev', () => {
  beforeEach(() => {
    aiSettingsSessionStore.clear();
    editorSessionStore.clear();
  });

  it('aiSettingsSessionStore persiste et restaure les réglages IA', () => {
    expect(aiSettingsSessionStore.get()).toBeNull();
    aiSettingsSessionStore.set({
      apiKey: 'sk-ant-session',
      rememberKey: false,
      selectedModel: 'claude-sonnet-5-5',
    });
    expect(aiSettingsSessionStore.get()?.selectedModel).toBe('claude-sonnet-5-5');
    aiSettingsSessionStore.clear();
    expect(aiSettingsSessionStore.get()).toBeNull();
  });

  it("editorSessionStore persiste l'état complet de l'éditeur sans altération", () => {
    expect(editorSessionStore.get()).toBeNull();
    const initialState = createInitialState();
    editorSessionStore.set(initialState);

    const retrieved = editorSessionStore.get();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.spec.fields).toEqual(initialState.spec.fields);
    expect(retrieved?.spec.questions).toEqual(initialState.spec.questions);
    expect(retrieved?.spec.target).toEqual(initialState.spec.target);

    editorSessionStore.clear();
    expect(editorSessionStore.get()).toBeNull();
  });
});

'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  aiSettingsReducer,
  type AiSettingsState,
  type AiSettingsAction,
  MODEL_STORAGE_KEY,
  AI_SETTINGS_DEFAULT_MODEL,
  aiSettingsSessionStore,
  toSessionSettings,
  fromSessionSettings,
} from '@/modules/ai-settings';
import { getStoredApiKey, setStoredApiKey, removeStoredApiKey } from '@/lib/key-storage';
import { CLAUDE_MODELS } from '@/modules/claude-client';

interface AiSettingsContextValue {
  state: AiSettingsState;
  dispatch: (action: AiSettingsAction) => void;
}

const AiSettingsContext = createContext<AiSettingsContextValue | null>(null);

function buildInitialState(): AiSettingsState {
  const session = aiSettingsSessionStore.get();
  if (session) {
    const restored = fromSessionSettings(session);
    return {
      apiKey: restored.apiKey,
      rememberKey: restored.rememberKey,
      selectedModel: restored.selectedModel,
      isDialogOpen: false,
    };
  }
  return {
    apiKey: '',
    rememberKey: false,
    selectedModel: AI_SETTINGS_DEFAULT_MODEL,
    isDialogOpen: false,
  };
}

export function AiSettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(aiSettingsReducer, undefined, buildInitialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Lecture du localStorage au montage client uniquement
  useEffect(() => {
    // Si la session existait déjà (changement de langue côté client),
    // les réglages ont déjà été repris par buildInitialState.
    const session = aiSettingsSessionStore.get();
    if (!session) {
      try {
        const storedKey = getStoredApiKey();
        if (storedKey && storedKey.trim().length > 0) {
          dispatch({ type: 'SET_API_KEY', key: storedKey });
          dispatch({ type: 'SET_REMEMBER_KEY', remember: true });
        }
      } catch {
        // Navigation privée ou localStorage inaccessible : silencieux
      }
      try {
        const storedModel = localStorage.getItem(MODEL_STORAGE_KEY);
        if (storedModel && CLAUDE_MODELS.some(m => m.id === storedModel)) {
          dispatch({ type: 'SET_MODEL', modelId: storedModel });
        }
      } catch {
        // Silencieux
      }
    }
    setIsHydrated(true);
  }, []);

  // Synchronisation continue vers la mémoire de session (JavaScript pur)
  useEffect(() => {
    aiSettingsSessionStore.set(toSessionSettings(state));
  }, [state]);

  // Écriture de la clé dans localStorage quand elle change et que rememberKey est actif
  // Bloqué tant que l'hydratation initiale n'est pas terminée
  useEffect(() => {
    if (!isHydrated) return;
    if (state.rememberKey && state.apiKey.trim().length > 0) {
      setStoredApiKey(state.apiKey);
    }
  }, [isHydrated, state.apiKey, state.rememberKey]);

  // Mémorisation du modèle choisi dans localStorage
  // Bloqué tant que l'hydratation initiale n'est pas terminée
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, state.selectedModel);
    } catch {
      // Silencieux
    }
  }, [isHydrated, state.selectedModel]);

  return (
    <AiSettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </AiSettingsContext.Provider>
  );
}

export function useAiSettings(): AiSettingsContextValue {
  const ctx = useContext(AiSettingsContext);
  if (!ctx) {
    throw new Error('useAiSettings must be used inside AiSettingsProvider');
  }
  return ctx;
}

/** Helper : oublier la clé (supprime du localStorage, de la session et reset l'état) */
export function useForgetKey(): () => void {
  const { dispatch } = useAiSettings();
  return useCallback(() => {
    removeStoredApiKey();
    const currentSession = aiSettingsSessionStore.get();
    if (currentSession) {
      aiSettingsSessionStore.set({
        ...currentSession,
        apiKey: '',
        rememberKey: false,
      });
    }
    dispatch({ type: 'FORGET_KEY' });
  }, [dispatch]);
}

/**
 * Gestion du stockage local optionnel de la clé API Claude.
 * Isolé dans un module pur avec injection de Storage pour tester la navigation privée
 * et les environnements où localStorage lève une exception.
 */

export const CLAUDE_KEY_STORAGE_KEY = 'easyjev_claude_api_key';

function resolveDefaultStorage(): Storage | undefined {
  if (typeof window !== 'undefined') {
    try {
      return window.localStorage;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/**
 * Récupère la clé API stockée ou null si absente / inaccessible.
 */
export function getStoredApiKey(storage: Storage | undefined = resolveDefaultStorage()): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(CLAUDE_KEY_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Enregistre la clé API dans le stockage. Renvoie true si succès, false sinon.
 */
export function setStoredApiKey(
  key: string,
  storage: Storage | undefined = resolveDefaultStorage()
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(CLAUDE_KEY_STORAGE_KEY, key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Supprime la clé API du stockage. Renvoie true si succès, false sinon.
 */
export function removeStoredApiKey(
  storage: Storage | undefined = resolveDefaultStorage()
): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(CLAUDE_KEY_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

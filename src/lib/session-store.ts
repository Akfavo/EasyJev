/**
 * Magasin de session en mémoire vive (JavaScript pur).
 *
 * Utilise une simple variable de module :
 * - Survit à la navigation côté client entre /fr et /en (le module reste chargé en mémoire).
 * - Disparaît au rechargement complet de la page ou à la fermeture de l'onglet.
 * - Ne touche à AUCUNE API de stockage du navigateur (pas de sessionStorage, pas de localStorage).
 */

export interface SessionStore<T> {
  /** Récupère la valeur en mémoire ou null si vide / réinitialisée */
  get(): T | null;
  /** Enregistre une valeur en mémoire */
  set(value: T): void;
  /** Efface la valeur en mémoire */
  clear(): void;
}

/**
 * Crée un magasin de session typé et indépendant en mémoire vive.
 */
export function createSessionStore<T>(): SessionStore<T> {
  let store: T | null = null;

  return {
    get(): T | null {
      return store;
    },
    set(value: T): void {
      store = value;
    },
    clear(): void {
      store = null;
    },
  };
}

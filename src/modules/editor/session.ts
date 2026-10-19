import { createSessionStore } from '@/lib/session-store';
import type { EditorState } from './types';

/**
 * Magasin de session singleton pour l'état de l'éditeur (travail en cours).
 * Survit à la navigation côté client entre /fr et /en.
 * Disparaît au rechargement complet de la page ou à la fermeture de l'onglet.
 */
export const editorSessionStore = createSessionStore<EditorState>();

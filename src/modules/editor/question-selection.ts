/**
 * Fonctions pures de gestion de la sélection d'une question dans l'éditeur.
 */

export interface HasId {
  id: string;
}

/**
 * Détermine l'identifiant de la question active :
 * - Renvoie `selectedId` s'il existe toujours dans la liste des questions ;
 * - Sinon renvoie l'identifiant de la première question si la liste n'est pas vide ;
 * - Sinon renvoie `null`.
 */
export function resolveSelectedQuestionId<T extends HasId>(
  questions: readonly T[],
  selectedId: string | null
): string | null {
  if (questions.length === 0) {
    return null;
  }
  if (selectedId !== null && questions.some(q => q.id === selectedId)) {
    return selectedId;
  }
  const first = questions[0];
  return first ? first.id : null;
}

/**
 * Calcule l'identifiant de la question à sélectionner après la suppression d'une question :
 * - Voisin suivant dans la liste initiale ;
 * - Sinon voisin précédent si la question supprimée était la dernière ;
 * - Sinon `null` si la liste devient vide (ou si l'identifiant n'existait pas et que la liste est vide).
 */
export function getSelectionAfterDelete<T extends HasId>(
  questionsBefore: readonly T[],
  deletedId: string
): string | null {
  const index = questionsBefore.findIndex(q => q.id === deletedId);
  if (index === -1) {
    return resolveSelectedQuestionId(questionsBefore, null);
  }

  // S'il ne restait que cet élément, la liste devient vide
  if (questionsBefore.length <= 1) {
    return null;
  }

  // Voisin suivant s'il existe
  if (index + 1 < questionsBefore.length) {
    const next = questionsBefore[index + 1];
    return next ? next.id : null;
  }

  // Sinon voisin précédent
  const prev = questionsBefore[index - 1];
  return prev ? prev.id : null;
}

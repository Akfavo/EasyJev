/**
 * Mode d'affichage de la zone « Décris » (point de départ) :
 * - 'auto' : ouverte tant qu'il n'y a pas de travail, repliée dès qu'il y en a ;
 * - 'open' : ouverte à la demande de l'utilisateur ;
 * - 'closed' : repliée à la demande de l'utilisateur.
 */
export type StartingPointMode = 'auto' | 'open' | 'closed';

/**
 * Indique si la zone « point de départ » doit être affichée ouverte.
 * Fonction pure : aucun effet de bord, aucun état caché.
 */
export function isStartingPointOpen(mode: StartingPointMode, hasWork: boolean): boolean {
  if (mode === 'open') {
    return true;
  }
  if (mode === 'closed') {
    return false;
  }
  return !hasWork;
}

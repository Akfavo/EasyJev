/**
 * État synthétique de la barre d'action fixe.
 */
export type ActionBarStatus = 'ready' | 'errors';

export interface ActionBarLabels {
  barSummaryReady: (count: number) => string;
  barSummaryErrors: (count: number) => string;
}

/**
 * Détermine si la barre d'action du bas doit être affichée :
 * uniquement s'il y a au moins une question ET que le résultat est hors écran.
 * Fonction pure : aucune dépendance DOM ni React.
 */
export function shouldShowActionBar(
  questionsCount: number,
  isResultVisible: boolean
): boolean {
  return questionsCount > 0 && !isResultVisible;
}

/**
 * Calcule le statut de la barre d'action selon la validité de la spec.
 */
export function getActionBarStatus(isValid: boolean): ActionBarStatus {
  return isValid ? 'ready' : 'errors';
}

/**
 * Produit le texte de synthèse affiché dans la barre d'action.
 * Fonction pure : aucune dépendance DOM ni React.
 */
export function getActionBarSummary(
  questionCount: number,
  isValid: boolean,
  errorCount: number,
  labels: ActionBarLabels
): string {
  const status = getActionBarStatus(isValid);
  switch (status) {
    case 'ready':
      return labels.barSummaryReady(questionCount);
    case 'errors':
      return labels.barSummaryErrors(errorCount);
  }
}

import type { ValidationIssue } from '../validators';

/**
 * Erreur levée lors d'une tentative de génération à partir d'une spécification EasyJev invalide.
 * Conserve la liste complète des anomalies de validation constatées.
 */
export class InvalidSpecError extends Error {
  readonly issues: readonly ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    const errorCount = issues.filter(issue => issue.severity === 'error').length;
    super(`Cannot generate output for an invalid specification (${errorCount} error(s)).`);
    this.name = 'InvalidSpecError';
    this.issues = Object.freeze([...issues]);
    Object.setPrototypeOf(this, InvalidSpecError.prototype);
  }
}

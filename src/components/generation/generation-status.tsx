'use client';

import type { Dictionary, Locale } from '@/modules/i18n';
import type { ClaudeErrorType, ClaudeUsage } from '@/modules/claude-client';
import { estimateCostUsd } from '@/modules/claude-client';
import { ANTHROPIC_GET_API_KEY_URL } from '@/config/links';

export interface GenerationErrorInfo {
  error: ClaudeErrorType;
  status?: number;
  apiErrorType?: string;
}

export interface GenerationReportInfo {
  usage: ClaudeUsage;
  model: string;
}

interface GenerationStatusProps {
  isGenerating: boolean;
  onCancel: () => void;
  error: GenerationErrorInfo | null;
  onRetry: () => void;
  dict: Dictionary;
}

function formatCostUsd(costUsd: number, locale: Locale): string {
  if (costUsd < 0.01) {
    const cents = (costUsd * 100).toFixed(1);
    return locale === 'fr' ? `${cents.replace('.', ',')} ¢` : `~${cents}¢`;
  }
  const dollars = costUsd.toFixed(3);
  return locale === 'fr' ? `${dollars.replace('.', ',')} $` : `$${dollars}`;
}

/** Ligne du coût réel estimé d'une génération (réutilisée dans la zone « Ajuste » après le repli de « Décris »). */
export function GenerationReportLine({
  report,
  dict,
  locale,
}: {
  report: GenerationReportInfo;
  dict: Dictionary;
  locale: Locale;
}) {
  const estimatedCost = estimateCostUsd(report.usage, report.model);
  const formattedCost = estimatedCost !== null ? formatCostUsd(estimatedCost, locale) : '?';
  return (
    <span>
      {dict.generation.ui.costEstimate(
        formattedCost,
        report.usage.inputTokens,
        report.usage.outputTokens
      )}
    </span>
  );
}

export function GenerationStatus({
  isGenerating,
  onCancel,
  error,
  onRetry,
  dict,
}: GenerationStatusProps) {
  const tUi = dict.generation.ui;
  const tErrors = dict.generation.errors;

  const canRetry =
    error &&
    ['rate_limited', 'overloaded', 'network', 'timeout', 'bad_output'].includes(
      error.error
    );

  const canOpenConsole = error && ['invalid_key', 'billing'].includes(error.error);

  const hasTechnicalDetails =
    error &&
    error.error !== 'invalid_key' &&
    error.error !== 'invalid_input' &&
    (error.status !== undefined || error.apiErrorType !== undefined);

  return (
    <div className="space-y-3">
      {/* État de chargement avec bouton Annuler */}
      {isGenerating && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-control bg-brand-100/60 border border-brand-500/30 flex items-center justify-between gap-3 flex-wrap"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-ink">
              {tUi.loadingState}
            </span>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="min-h-[36px] px-3.5 py-1 text-xs font-bold text-ink hover:text-error rounded-pill border border-line bg-surface hover:bg-surface-2 transition-colors cursor-pointer"
          >
            {tUi.cancelButton}
          </button>
        </div>
      )}

      {/* Statut neutre d'annulation utilisateur */}
      {error && !isGenerating && error.error === 'aborted' && (
        <div
          role="status"
          className="p-3.5 rounded-control bg-surface-2 border border-line text-ink"
        >
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            {tErrors.aborted}
          </p>
        </div>
      )}

      {/* Bloc d'erreur accessible */}
      {error && !isGenerating && error.error !== 'aborted' && (
        <div
          role="alert"
          className="p-3.5 sm:p-4 rounded-control bg-error/10 border border-error/20 text-ink space-y-2.5"
        >
          <div className="flex items-start gap-2.5">
            <span className="p-1 rounded-full bg-error/15 text-error shrink-0 mt-0.5">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <p className="text-xs sm:text-sm text-ink leading-relaxed">
              {tErrors[error.error]}
            </p>
          </div>

          {/* Actions de récupération */}
          <div className="flex items-center gap-3 pl-7 flex-wrap">
            {canRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="min-h-[36px] px-3 py-1 rounded-pill bg-ink text-surface text-xs font-bold hover:bg-ink/90 transition-colors cursor-pointer"
              >
                {tUi.retryButton}
              </button>
            )}

            {canOpenConsole && (
              <a
                href={ANTHROPIC_GET_API_KEY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[36px] px-3 py-1 rounded-pill bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors inline-flex items-center gap-1.5"
              >
                <span>{tUi.openConsoleLink}</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>

          {/* Détails techniques sans fuite */}
          {hasTechnicalDetails && (
            <details className="text-xs text-muted pl-7 pt-1 group">
              <summary className="cursor-pointer font-medium hover:text-ink list-none flex items-center gap-1">
                <svg
                  className="w-3 h-3 text-muted transition-transform group-open:rotate-90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="underline decoration-dotted">
                  {tUi.technicalDetailsSummary}
                </span>
              </summary>
              <p className="mt-1 font-mono text-xs text-muted pl-4">
                {tUi.technicalDetails(error.status, error.apiErrorType)}
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

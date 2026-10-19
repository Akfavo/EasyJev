'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { EasyJevSpec } from '@/modules/spec';
import { validateSpec, type ValidationIssue } from '@/modules/validators';
import { generateJevOutput, generateN8nNode } from '@/modules/generators';
import type { Dictionary } from '@/modules/i18n';
import type { EditorAction } from '@/modules/editor';
import { copyToClipboard } from '@/lib';
import { getActionBarSummary, shouldShowActionBar } from '@/modules/editor';
import { OsWindow } from '@/components/os-window';
import { JsonHighlighter } from './json-highlighter';
import { N8nHelpDialog } from './n8n-help-dialog';
import { ReadingExpressions } from './reading-expressions';
import { formatHelpText } from './format-help-text';

interface EditorOutputProps {
  spec: EasyJevSpec;
  dispatch: (action: EditorAction) => void;
  dict: Dictionary;
  onErrorClick?: (issue: ValidationIssue) => void;
}

const COPY_ICON =
  'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z';

function CopyIcon({ done }: { done: boolean }) {
  return (
    <svg className="w-5 h-5 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={done ? 2.5 : 2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={done ? 'M5 13l4 4L19 7' : COPY_ICON} />
    </svg>
  );
}

/** Étape « Copie » : un geste principal (copier le nœud n8n), puis ce qu'il faut faire dans n8n. */
export function EditorOutput({ spec, dispatch, dict, onErrorClick }: EditorOutputProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isNodeCopied, setIsNodeCopied] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isResultVisible, setIsResultVisible] = useState(true);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyNodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const tOutput = dict.editor.output;
  const tHelp = dict.editor.help;
  const tSteps = dict.home.steps;

  useEffect(() => {
    const copyTimeouts = [copyTimeoutRef, copyNodeTimeoutRef];
    return () => {
      for (const ref of copyTimeouts) {
        if (ref.current) clearTimeout(ref.current);
      }
    };
  }, []);

  // La barre du bas n'apparaît que lorsque le résultat n'est pas visible à l'écran
  useEffect(() => {
    const element = sectionRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry) setIsResultVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const validationResult = useMemo(() => validateSpec(spec), [spec]);
  const blockingErrors = validationResult.issues.filter(i => i.severity === 'error');
  const warnings = validationResult.issues.filter(i => i.severity === 'warning');
  const isValid = validationResult.isValid;

  const generatedOutput = useMemo(() => {
    if (!isValid) return null;
    try {
      return generateJevOutput(spec);
    } catch {
      return null;
    }
  }, [spec, isValid]);

  const generatedNode = useMemo(() => {
    if (!isValid) return null;
    try {
      return generateN8nNode(spec);
    } catch {
      return null;
    }
  }, [spec, isValid]);

  const canCopy = generatedOutput !== null;
  const canCopyNode = generatedNode !== null;

  const flash = (
    setter: (value: boolean) => void,
    ref: { current: ReturnType<typeof setTimeout> | null }
  ) => {
    setter(true);
    if (ref.current) clearTimeout(ref.current);
    ref.current = setTimeout(() => {
      setter(false);
      ref.current = null;
    }, 1600);
  };

  const handleCopy = async () => {
    if (generatedOutput && (await copyToClipboard(generatedOutput.jsonString))) {
      flash(setIsCopied, copyTimeoutRef);
    }
  };

  const handleCopyNode = async () => {
    if (generatedNode && (await copyToClipboard(generatedNode.jsonString))) {
      flash(setIsNodeCopied, copyNodeTimeoutRef);
    }
  };

  const barSummary = getActionBarSummary(spec.questions.length, isValid, blockingErrors.length, tOutput);
  const isTypesafe = spec.target.provider === 'typesafe';

  const providerButton = (provider: 'typesafe' | 'vercel-gateway', label: string) => {
    const isActive = spec.target.provider === provider;
    return (
      <button
        type="button"
        onClick={() => dispatch({ type: 'target/setProvider', provider })}
        aria-pressed={isActive}
        className={`min-h-[40px] px-3.5 inline-flex items-center justify-center rounded-pill text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
          isActive ? 'bg-ink text-white shadow-xs' : 'text-muted hover:text-ink'
        }`}
      >
        {label}
      </button>
    );
  };

  const nextSteps = [
    tHelp.shortSteps.step1,
    {
      title: tHelp.shortSteps.step2.title,
      desc: isTypesafe ? tHelp.shortSteps.step2.descTypesafe : tHelp.shortSteps.step2.descVercel,
    },
    tHelp.shortSteps.step3,
  ];

  return (
    <>
      <section ref={sectionRef} id="result" aria-labelledby="step-copy-title" className="scroll-mt-6">
        <div className="mb-4">
          <h2 id="step-copy-title" className="text-2xl lg:text-3xl font-bold tracking-tight text-ink-page flex items-center gap-3">
            <span className="w-9 h-9 shrink-0 rounded-full inline-flex items-center justify-center text-base font-bold bg-line text-white" aria-hidden="true">
              3
            </span>
            <span>
              {tSteps.copy}
              <span className="text-brand-600">.</span>
            </span>
          </h2>
          <p className="text-sm text-ink-page font-medium mt-1">{tOutput.cardSubtitle}</p>
        </div>

        <OsWindow
          title={dict.windows.copy.title}
          badge={
            isValid ? (
              <span className="text-[#22C55E] font-semibold">{dict.windows.copy.badgeReady}</span>
            ) : (
              <span className="text-warning-bg font-semibold">{dict.windows.copy.badgeBlocked}</span>
            )
          }
          className="w-full"
        >
          <div className="space-y-6">
            {/* Erreurs bloquantes en premier : c'est ce qui empêche de copier */}
            {!isValid && (
              <div className="p-4 sm:p-5 rounded-control border border-error/30 bg-error/5 space-y-3">
                <div className="flex items-center gap-2 text-error font-bold text-sm">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span>{tOutput.blockingErrorsTitle}</span>
                </div>
                <ul className="space-y-2 text-sm list-none pl-0">
                  {blockingErrors.map((issue, idx) => (
                    <li key={`${issue.code}-${idx}`}>
                      <button
                        type="button"
                        onClick={() => onErrorClick?.(issue)}
                        className="text-left text-error hover:underline underline-offset-2 flex items-start gap-1.5 cursor-pointer"
                      >
                        <span className="mt-0.5" aria-hidden="true">•</span>
                        <span>{dict.validation[issue.code](issue.params)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 min-[1000px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-10 items-start">
              {/* Colonne 1 : le geste principal */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-muted">{tHelp.provider.legend}</span>
                  <div
                    role="group"
                    aria-label={tHelp.provider.legend}
                    className="flex flex-col min-[480px]:inline-flex min-[480px]:flex-row items-stretch rounded-[22px] bg-surface-2 border border-line p-1 gap-1"
                  >
                    {providerButton('typesafe', tHelp.provider.typesafe)}
                    {providerButton('vercel-gateway', tHelp.provider.vercel)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyNode}
                  disabled={!canCopyNode}
                  className="w-full min-h-[56px] px-8 inline-flex items-center justify-center gap-2.5 rounded-pill font-bold text-base sm:text-lg text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-700 disabled:opacity-45 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
                >
                  <CopyIcon done={isNodeCopied} />
                  <span>{isNodeCopied ? tOutput.nodeCopied : tOutput.copyNode}</span>
                </button>
                <p className="text-xs text-muted leading-relaxed">
                  {isValid ? tOutput.copyNodeHint : tOutput.copyNodeDisabledNotice}
                </p>

                <span className="sr-only" aria-live="polite">
                  {isCopied ? tOutput.copied : isNodeCopied ? tOutput.nodeCopied : ''}
                </span>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!canCopy}
                    className="min-h-[40px] inline-flex items-center font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-4 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isCopied ? tOutput.copied : tOutput.copyJsonOnly}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    aria-haspopup="dialog"
                    className="min-h-[40px] inline-flex items-center font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-4 cursor-pointer"
                  >
                    {tOutput.helpButtonText}
                  </button>
                </div>

                {generatedOutput && (
                  <details className="group rounded-control border border-line bg-surface">
                    <summary className="min-h-[44px] px-4 flex items-center justify-between gap-3 cursor-pointer list-none select-none text-sm font-bold text-ink hover:text-brand-700 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2">
                      <span>{tOutput.showJson}</span>
                      <svg className="w-5 h-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="p-3 pt-0">
                      <JsonHighlighter jsonString={generatedOutput.jsonString} />
                    </div>
                  </details>
                )}
              </div>

              {/* Colonne 2 : la suite dans n8n */}
              <div className="space-y-4 min-[1000px]:border-l min-[1000px]:border-line min-[1000px]:pl-10">
                <h3 className="text-lg font-bold text-ink">{tOutput.nextStepsTitle}</h3>
                <ol className="space-y-3 list-none pl-0">
                  {nextSteps.map(step => (
                    <li key={step.title} className="space-y-0.5">
                      <p className="text-sm font-bold text-ink">{step.title}</p>
                      <p className="text-sm text-muted leading-relaxed">{formatHelpText(step.desc)}</p>
                    </li>
                  ))}
                  <li className="space-y-2">
                    <p className="text-sm font-bold text-ink">{tHelp.shortSteps.step4.title}</p>
                    <p className="text-sm text-muted leading-relaxed">{tHelp.shortSteps.step4.desc}</p>
                    <ReadingExpressions spec={spec} isValid={isValid} dict={dict} />
                  </li>
                </ol>
              </div>
            </div>

            {warnings.length > 0 && (
              <div className="p-4 rounded-control border border-amber-300 bg-warning-bg text-ink text-sm space-y-1">
                <span className="font-bold block">{tOutput.warningsTitle}</span>
                {warnings.map((issue, idx) => (
                  <p key={`${issue.code}-${idx}`}>• {dict.validation[issue.code](issue.params)}</p>
                ))}
              </div>
            )}
          </div>
        </OsWindow>

        <N8nHelpDialog isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} spec={spec} dict={dict} />
      </section>

      {/* Barre fine : visible seulement quand il y a au moins une question et que la copie est hors de l'écran */}
      {shouldShowActionBar(spec.questions.length, isResultVisible) && (
        <div
          role="region"
          aria-label={tOutput.barAriaLabel}
          className="fixed inset-x-0 bottom-5 z-40 pointer-events-none flex justify-center px-4"
        >
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-3 sm:gap-4 rounded-pill border-2 border-white/30 bg-line/92 backdrop-blur-md px-2 sm:px-5 py-2 shadow-[0_16px_36px_rgba(0,0,0,0.35)] text-white max-w-[calc(100vw-2rem)]">
            <span className="hidden sm:inline text-sm font-mono font-medium">{barSummary}</span>
            <button
              type="button"
              onClick={() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="min-h-[44px] px-3.5 hidden sm:inline-flex items-center justify-center rounded-pill text-sm font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              {tOutput.barViewResult}
            </button>
            <button
              type="button"
              onClick={handleCopyNode}
              disabled={!canCopyNode}
              className="min-h-[44px] px-5 inline-flex items-center justify-center rounded-pill bg-brand-600 hover:bg-brand-700 text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap shadow-xs focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              {isNodeCopied ? tOutput.nodeCopied : tOutput.copyNode}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

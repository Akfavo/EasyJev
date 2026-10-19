'use client';

import { useState, useRef, useEffect } from 'react';
import type { EasyJevSpec } from '@/modules/spec';
import type { Dictionary } from '@/modules/i18n';
import { copyToClipboard } from '@/lib';
import { formatHelpText } from './format-help-text';

interface N8nHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  spec: EasyJevSpec;
  dict: Dictionary;
}

type HelpStepKey =
  | 'step1'
  | 'step2'
  | 'step3'
  | 'step4'
  | 'step5'
  | 'step6'
  | 'step7'
  | 'step8'
  | 'step9'
  | 'step10'
  | 'step11'
  | 'step12'
  | 'step13'
  | 'step14';

interface HelpBlockDef {
  groupKey: keyof Dictionary['editor']['help']['steps']['groups'];
  stepKeys: HelpStepKey[];
}

const HELP_BLOCKS: HelpBlockDef[] = [
  {
    groupKey: 'node',
    stepKeys: ['step1', 'step2', 'step3'],
  },
  {
    groupKey: 'auth',
    stepKeys: ['step4', 'step5', 'step6'],
  },
  {
    groupKey: 'headers',
    stepKeys: ['step7', 'step8', 'step9'],
  },
  {
    groupKey: 'body',
    stepKeys: ['step10', 'step11', 'step12', 'step13'],
  },
  {
    groupKey: 'reading',
    stepKeys: ['step14'],
  },
];

export function N8nHelpDialog({
  isOpen,
  onClose,
  spec,
  dict,
}: N8nHelpDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tHelp = dict.editor.help;

  // Nettoyage des timers au démontage
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Gestion de l'ouverture et fermeture via showModal() pour piège de focus et Échap natifs
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleCopy = async (text: string, key: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setCopiedKey(null);
        copyTimeoutRef.current = null;
      }, 1600);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onMouseDown={e => {
        mouseDownTargetRef.current = e.target;
      }}
      onClick={e => {
        if (mouseDownTargetRef.current === e.currentTarget && e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="backdrop:bg-line/60 backdrop:backdrop-blur-sm w-full h-full max-w-none max-h-none sm:w-[92vw] sm:max-w-2xl sm:h-auto sm:max-h-[85vh] sm:rounded-win border-2 border-line bg-white text-ink p-0 shadow-2xl overflow-hidden m-auto"
    >
      <div className="flex flex-col h-full sm:max-h-[85vh]">
        {/* En-tête de la modale façon OS */}
        <div className="bg-line text-white px-4 py-2 border-b-2 border-line flex items-center justify-between gap-4 shrink-0 select-none min-h-[44px]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label={dict.windows.closeAria}
              className="min-w-[32px] min-h-[32px] -ml-1 inline-flex items-center justify-center cursor-pointer group bg-transparent border-0 p-0 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-1"
            >
              <span
                className="w-3.5 h-3.5 border-[1.5px] border-white bg-black inline-block shadow-[inset_1px_1px_0_#FFFFFF] group-hover:bg-neutral-800 transition-colors"
                aria-hidden="true"
              />
            </button>
            <h2 className="font-pixel text-xs sm:text-sm tracking-wide lowercase text-white">
              {dict.windows.n8nHelp.title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#D5CED5]">{dict.windows.n8nHelp.badge}</span>
            <button
              type="button"
              onClick={onClose}
              aria-label={dict.windows.closeAria}
              className="font-pixel text-xs text-white hover:text-brand-100 uppercase tracking-wider cursor-pointer bg-transparent border-none py-1.5 px-2 min-h-[32px] inline-flex items-center focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-1"
            >
              [ {dict.windows.close} ]
            </button>
          </div>
        </div>

        {/* Corps avec défilement */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm sm:text-base leading-relaxed">
          {/* Section repliée : Configurer à la main (les 14 étapes en 5 blocs) */}
          <details open className="group rounded-control border border-line bg-surface p-4">
            <summary className="font-bold text-ink cursor-pointer list-none flex items-center justify-between min-h-[44px] select-none hover:text-brand-700 transition-colors focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2">
              <span className="text-base font-bold">{tHelp.manual.title}</span>
              <svg
                className="w-5 h-5 transition-transform duration-200 group-open:rotate-180 shrink-0 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>

            <div className="pt-4 space-y-4 border-t border-line mt-3">
              <ol className="space-y-4 list-none pl-0">
                {HELP_BLOCKS.map(block => {
                  const groupTitle = tHelp.steps.groups[block.groupKey];

                  return block.stepKeys.map(stepKey => {
                    const isFirstInBlock = stepKey === block.stepKeys[0];

                    if (stepKey === 'step14') {
                      return (
                        <li key={stepKey} className="space-y-3">
                          {isFirstInBlock && (
                            <h4 className="font-bold text-ink text-sm sm:text-base pt-2">
                              {groupTitle}
                            </h4>
                          )}
                          <div className="p-3.5 rounded-control border border-line bg-white space-y-3">
                            <p className="font-bold text-ink">
                              {formatHelpText(tHelp.steps.step14.title)}
                            </p>
                            <p className="text-muted text-sm leading-relaxed">
                              {formatHelpText(tHelp.steps.step14.desc)}
                            </p>
                          </div>
                        </li>
                      );
                    }

                    let stepTitle = '';
                    let stepDesc = '';

                    if (stepKey === 'step3') {
                      stepTitle = tHelp.steps.step3.title;
                      stepDesc =
                        spec.target.provider === 'typesafe'
                          ? tHelp.steps.step3.descTypesafe
                          : tHelp.steps.step3.descVercel;
                    } else if (stepKey === 'step6') {
                      stepTitle = tHelp.steps.step6.title;
                      stepDesc =
                        spec.target.provider === 'typesafe'
                          ? tHelp.steps.step6.descTypesafe
                          : tHelp.steps.step6.descVercel;
                    } else {
                      const step = tHelp.steps[stepKey];
                      stepTitle = step.title;
                      stepDesc = step.desc;
                    }

                    return (
                      <li key={stepKey} className="space-y-3">
                        {isFirstInBlock && (
                          <h4 className="font-bold text-ink text-sm sm:text-base pt-2">
                            {groupTitle}
                          </h4>
                        )}
                        <div className="p-3.5 rounded-control border border-line bg-white">
                          <p className="font-bold text-ink mb-1">
                            {formatHelpText(stepTitle)}
                          </p>
                          <p className="text-muted text-sm leading-relaxed">
                            {formatHelpText(stepDesc)}
                          </p>
                        </div>
                      </li>
                    );
                  });
                })}
              </ol>
            </div>
          </details>

          {/* Bloc Si ça ne marche pas */}
          <div className="p-4 rounded-control border border-error/30 bg-error/5 space-y-2.5">
            <h3 className="font-bold text-ink text-base">{tHelp.troubleshooting.title}</h3>
            <ul className="space-y-1.5 text-xs sm:text-sm text-ink list-disc pl-5">
              <li>{formatHelpText(tHelp.troubleshooting.errPaste)}</li>
              <li>{formatHelpText(tHelp.troubleshooting.errBody)}</li>
              <li>{formatHelpText(tHelp.troubleshooting.err401)}</li>
              <li>{formatHelpText(tHelp.troubleshooting.err422)}</li>
              <li>{formatHelpText(tHelp.troubleshooting.err429)}</li>
            </ul>

            {spec.target.provider === 'typesafe' && (
              <div className="pt-2">
                <span className="block text-xs font-semibold text-muted mb-1">
                  {tHelp.troubleshooting.testCmdTitle}
                </span>
                <div className="flex items-center justify-between gap-2 bg-ink text-surface font-mono text-xs p-2.5 rounded-control">
                  <code className="truncate">{tHelp.troubleshooting.testCmd}</code>
                  <button
                    type="button"
                    onClick={() => handleCopy(tHelp.troubleshooting.testCmd, 'curl')}
                    className="text-xs font-semibold text-brand-100 hover:text-white underline underline-offset-2 shrink-0 cursor-pointer min-h-[44px] px-2 inline-flex items-center"
                  >
                    {copiedKey === 'curl' ? tHelp.steps.step14.copied : tHelp.steps.step14.copyExpr}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}

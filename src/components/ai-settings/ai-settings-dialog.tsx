'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { Dictionary } from '@/modules/i18n';
import type { ClaudeModelId } from '@/modules/claude-client';
import { CLAUDE_MODELS } from '@/modules/claude-client';
import { ANTHROPIC_GET_API_KEY_URL } from '@/config/links';
import { useAiSettings, useForgetKey } from './ai-settings-context';
import { setStoredApiKey, removeStoredApiKey } from '@/lib/key-storage';

interface AiSettingsDialogProps {
  dict: Dictionary;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function AiSettingsDialog({ dict, triggerRef }: AiSettingsDialogProps) {
  const { state, dispatch } = useAiSettings();
  const forgetKey = useForgetKey();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);
  const doneButtonRef = useRef<HTMLButtonElement>(null);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);
  const [showKey, setShowKey] = useState(false);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tUi = dict.generation.ui;
  const tAi = dict.header.aiSettings;

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (state.isDialogOpen) {
      if (!el.open) {
        const hasKeyAtOpen = state.apiKey.trim().length > 0;
        el.showModal();
        // Focus utile à l'ouverture : le champ de clé s'il est vide, sinon le bouton « Terminé »
        // (évite l'anneau de focus sur la croix de fermeture).
        requestAnimationFrame(() => {
          if (hasKeyAtOpen) {
            doneButtonRef.current?.focus();
          } else {
            keyInputRef.current?.focus();
          }
        });
      }
    } else {
      if (el.open) {
        el.close();
        triggerRef.current?.focus();
      }
    }
  }, [state.isDialogOpen, state.apiKey, triggerRef]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => dispatch({ type: 'CLOSE_DIALOG' });
    el.addEventListener('cancel', handler);
    return () => el.removeEventListener('cancel', handler);
  }, [dispatch]);

  const handleClose = useCallback(() => {
    dispatch({ type: 'CLOSE_DIALOG' });
  }, [dispatch]);

  const handleApiKeyChange = (newKey: string) => {
    dispatch({ type: 'SET_API_KEY', key: newKey });
    if (state.rememberKey) {
      if (newKey.trim().length > 0) {
        setStoredApiKey(newKey);
      } else {
        removeStoredApiKey();
      }
    }
  };

  const handleToggleRememberKey = (checked: boolean) => {
    dispatch({ type: 'SET_REMEMBER_KEY', remember: checked });
    if (checked) {
      if (state.apiKey.trim().length > 0) setStoredApiKey(state.apiKey);
    } else {
      removeStoredApiKey();
    }
  };

  const trimmedKey = state.apiKey.trim();
  const showSoftWarning = trimmedKey.length > 0 && !trimmedKey.startsWith('sk-ant-');
  const selectedIndex = CLAUDE_MODELS.findIndex(m => m.id === state.selectedModel);
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let targetIndex: number | null = null;
    const total = CLAUDE_MODELS.length;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % total;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + total) % total;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = total - 1;
    }
    if (targetIndex !== null) {
      const nextModel = CLAUDE_MODELS[targetIndex];
      if (nextModel) {
        dispatch({ type: 'SET_MODEL', modelId: nextModel.id });
        buttonRefs.current[targetIndex]?.focus();
      }
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onMouseDown={e => {
        mouseDownTargetRef.current = e.target;
      }}
      onClick={e => {
        if (mouseDownTargetRef.current === e.currentTarget && e.target === e.currentTarget) {
          handleClose();
        }
      }}
      aria-labelledby="ai-settings-dialog-title"
      className="backdrop:bg-line/60 backdrop:backdrop-blur-sm bg-white rounded-win shadow-[0_24px_50px_rgba(0,0,0,0.35)] border-2 border-line w-[min(56rem,calc(100vw-3rem))] max-w-none m-auto p-0 overflow-hidden open:flex open:flex-col"
      style={{ maxHeight: '92vh' }}
    >
      <div className="bg-line text-white px-4 py-2 flex items-center justify-between select-none border-b-2 border-line shrink-0 min-h-[44px]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            aria-label={dict.windows.closeAria}
            className="min-w-[32px] min-h-[32px] -ml-1 inline-flex items-center justify-center cursor-pointer group bg-transparent border-0 p-0 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-1"
          >
            <span
              className="w-3.5 h-3.5 border-[1.5px] border-white bg-black inline-block shadow-[inset_1px_1px_0_#FFFFFF] group-hover:bg-neutral-800 transition-colors"
              aria-hidden="true"
            />
          </button>
          <h2 id="ai-settings-dialog-title" className="font-pixel text-xs sm:text-sm tracking-wide lowercase text-white">
            {dict.windows.settings.title}
          </h2>
        </div>
        <div className="font-mono text-xs text-[#D5CED5] flex items-center gap-3">
          <span>{dict.windows.settings.badge}</span>
          <button
            type="button"
            onClick={handleClose}
            aria-label={dict.windows.closeAria}
            className="font-pixel text-xs text-white hover:text-brand-100 uppercase tracking-wider cursor-pointer bg-transparent border-none py-1.5 px-2 min-h-[32px] inline-flex items-center focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-1"
          >
            [ {dict.windows.close} ]
          </button>
        </div>
      </div>

      <div className="px-6 py-5 min-h-0 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
        {trimmedKey.length === 0 && (
          <p className="md:col-span-2 text-sm text-ink font-medium bg-brand-100/60 border border-brand-600/20 rounded-control px-4 py-3">
            {tAi.keyPrompt}
          </p>
        )}

        <section className="space-y-3 min-w-0" aria-labelledby="ai-dialog-key-label">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label id="ai-dialog-key-label" htmlFor="ai-dialog-key-field" className="text-sm font-bold text-ink">
              {tUi.apiKeyLabel}
            </label>
            <a
              href={ANTHROPIC_GET_API_KEY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-600 hover:text-brand-700 underline font-medium inline-flex items-center gap-1"
            >
              <span>{tUi.createApiKeyLink}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <div className="relative flex items-center">
            <input
              ref={keyInputRef}
              id="ai-dialog-key-field"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-1p-ignore="true"
              data-lpignore="true"
              data-bwignore="true"
              data-form-type="other"
              value={state.apiKey}
              onChange={e => handleApiKeyChange(e.target.value)}
              placeholder={tUi.apiKeyPlaceholder}
              aria-describedby="ai-dialog-key-details"
              className={`w-full rounded-control border border-control-border bg-surface pl-3.5 pr-28 py-2.5 text-sm font-mono text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors ${showKey ? '' : '[-webkit-text-security:disc]'}`}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              aria-label={showKey ? tUi.hideApiKey : tUi.showApiKey}
              className="absolute right-2 px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink rounded-pill hover:bg-surface-2 transition-colors cursor-pointer min-h-[36px] flex items-center"
            >
              {showKey ? tUi.hideApiKey : tUi.showApiKey}
            </button>
          </div>

          {showSoftWarning && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5 leading-relaxed">
              {tUi.apiKeySoftWarning}
            </p>
          )}

          <details id="ai-dialog-key-details" className="text-xs text-muted group">
            <summary className="cursor-pointer font-medium hover:text-ink list-none flex items-center gap-1.5 select-none">
              <svg className="w-3.5 h-3.5 text-muted transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="underline decoration-dotted">{tUi.apiKeyWhereSummary}</span>
            </summary>
            <p className="mt-2 text-xs leading-relaxed pl-5 text-muted">{tUi.apiKeyWhereDetails}</p>
          </details>

          <div className="space-y-2 pt-3 border-t border-line/60">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label htmlFor="ai-dialog-remember-key" className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer select-none">
                <input
                  id="ai-dialog-remember-key"
                  type="checkbox"
                  checked={state.rememberKey}
                  onChange={e => handleToggleRememberKey(e.target.checked)}
                  className="w-4 h-4 rounded border-control-border text-brand-600 focus:ring-brand-600 cursor-pointer accent-brand-600"
                />
                <span>{tUi.rememberKeyLabel}</span>
              </label>
              {(state.apiKey.length > 0 || state.rememberKey) && (
                <button
                  type="button"
                  onClick={forgetKey}
                  className="text-xs text-muted hover:text-error underline transition-colors cursor-pointer"
                >
                  {tUi.forgetKeyButton}
                </button>
              )}
            </div>
            {state.rememberKey && (
              <p className="text-xs text-muted bg-surface-2/70 border border-line rounded-control p-2.5 leading-relaxed">
                {tUi.rememberKeyWarning}
              </p>
            )}
          </div>
        </section>

        <section className="space-y-2 min-w-0" aria-labelledby="ai-dialog-model-label">
          <span id="ai-dialog-model-label" className="text-sm font-bold text-ink block">
            {tUi.modelSelectLabel}
          </span>
          <div role="radiogroup" aria-labelledby="ai-dialog-model-label" className="grid grid-cols-1 gap-3">
            {CLAUDE_MODELS.map((model, index) => {
              const isSelected = model.id === state.selectedModel;
              const isFocusable = index === activeIndex;
              const cardClass = isSelected
                ? 'border-brand-600 bg-brand-100/50 ring-2 ring-brand-600'
                : 'border-line bg-surface hover:bg-surface-2';
              return (
                <button
                  key={model.id}
                  ref={el => {
                    buttonRefs.current[index] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={isFocusable ? 0 : -1}
                  onClick={() => dispatch({ type: 'SET_MODEL', modelId: model.id })}
                  onKeyDown={e => handleKeyDown(e, index)}
                  className={'p-3 rounded-control border text-left transition-all cursor-pointer flex flex-col gap-1.5 focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2 ' + cardClass}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span className="text-sm font-bold text-ink">{model.label}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" aria-hidden="true" />}
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {tUi.modelDescriptions[model.id as ClaudeModelId]}
                  </p>
                  <span className="text-xs font-mono text-muted">
                    {tUi.pricingIndicative(model.pricing.inputUsdPerMillion, model.pricing.outputUsdPerMillion)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="px-6 py-4 border-t border-line/40 shrink-0 flex justify-end bg-surface-2">
        <button
          ref={doneButtonRef}
          type="button"
          onClick={handleClose}
          className="min-h-[44px] px-6 rounded-pill bg-line hover:bg-neutral-800 text-white font-bold text-sm transition-all cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
        >
          {tAi.done}
        </button>
      </div>
    </dialog>
  );
}

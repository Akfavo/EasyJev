'use client';

import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import type { QuestionSpec, SpecField } from '@/modules/spec';
import type { ValidationIssue } from '@/modules/validators';
import type { Dictionary } from '@/modules/i18n';
import type { EditorAction } from '@/modules/editor';
import { insertCitation } from '@/modules/editor';
import { QuestionTypeIcon } from './question-type-icon';
import { AutoGrowTextarea } from './auto-grow-textarea';

interface QuestionEditorProps {
  question: QuestionSpec;
  questionIndex: number;
  totalQuestions: number;
  fields: SpecField[];
  issues: ValidationIssue[];
  dispatch: (action: EditorAction) => void;
  dict: Dictionary;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion: (id: string) => void;
  autoFocusInstructions?: boolean;
}

export function QuestionEditor({
  question,
  questionIndex,
  totalQuestions,
  fields,
  issues,
  dispatch,
  dict,
  onDeleteQuestion,
  onDuplicateQuestion,
  autoFocusInstructions,
}: QuestionEditorProps) {
  const [showKeyEdit, setShowKeyEdit] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const optionsInputsRef = useRef<Array<{ key: HTMLInputElement | null; desc: HTMLTextAreaElement | null }>>([]);
  const levelsInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const tItem = dict.editor.questions.item;
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  // Focus automatique dans le texte de la consigne si demandé
  useEffect(() => {
    if (autoFocusInstructions && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocusInstructions, question.id]);

  // Repli par défaut à chaque changement de question
  useEffect(() => {
    setShowKeyEdit(false);
  }, [question.id]);

  // Insertion de citation de champ dans la question
  const handleInsertCitation = (fieldName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? question.instructions.length;
    const end = textarea.selectionEnd ?? question.instructions.length;
    const result = insertCitation(question.instructions, start, end, fieldName);

    dispatch({
      type: 'question/setText',
      id: question.id,
      text: result.text,
    });

    // Rétablissement de la sélection après insertion
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(result.cursorPosition, result.cursorPosition);
      }
    });
  };

  // Clavier dans les critères Choice
  const handleOptionKeyKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      optionsInputsRef.current[index]?.desc?.focus();
    }
  };

  const handleOptionDescKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>,
    index: number,
    isLast: boolean
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isLast) {
        dispatch({ type: 'choice/addOption', questionId: question.id });
        requestAnimationFrame(() => {
          optionsInputsRef.current[index + 1]?.key?.focus();
        });
      } else {
        optionsInputsRef.current[index + 1]?.key?.focus();
      }
    }
  };

  // Clavier dans les critères Score
  const handleLevelKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    index: number,
    isLast: boolean,
    totalLevels: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isLast && totalLevels < 10) {
        dispatch({ type: 'score/addLevel', questionId: question.id });
        requestAnimationFrame(() => {
          levelsInputsRef.current[index + 1]?.focus();
        });
      } else if (!isLast) {
        levelsInputsRef.current[index + 1]?.focus();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête de détail : rappel du type + actions Dupliquer / Supprimer */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-line flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-control bg-brand-100 text-brand-600 shrink-0" aria-hidden="true">
            <QuestionTypeIcon type={question.type} className="w-4 h-4" />
          </span>
          <div>
            <h4 id="question-detail-heading" className="text-base font-bold text-ink">
              {dict.editor.questions.detailHeading(
                questionIndex + 1,
                totalQuestions,
                tItem.types[question.type]
              )}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDuplicateQuestion(question.id)}
            className="min-h-[44px] px-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-ink hover:text-brand-700 hover:bg-surface-2 rounded-control border border-line transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{tItem.actions.duplicate}</span>
          </button>

          <button
            type="button"
            onClick={() => onDeleteQuestion(question.id)}
            className="min-h-[44px] px-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-error hover:bg-error/10 rounded-control border border-error/30 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>{tItem.actions.delete}</span>
          </button>
        </div>
      </div>

      {/* Grille sur 2 colonnes dès 1280 px (1 colonne en-dessous) */}
      <div className="grid grid-cols-1 min-[1280px]:grid-cols-2 gap-6 min-[1280px]:gap-8 items-start">
        {/* Colonne gauche : texte, type, clé technique, validation */}
        <div className="space-y-6 min-w-0">
          {/* 1. Consigne pour Jev */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <label
                htmlFor={`question-instructions-${question.id}`}
                className="block text-sm font-bold text-ink"
              >
                {tItem.instructionLabel}
              </label>

              {/* Raccourci de citation de champ si plusieurs champs */}
              {fields.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-muted font-medium">{tItem.citation.label}</span>
                  {fields.map(field => (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => handleInsertCitation(field.name)}
                      className="px-2 py-0.5 min-h-[32px] inline-flex items-center rounded-control font-mono text-xs font-semibold bg-brand-100 text-ink hover:bg-brand-500/20 border border-brand-600/30 transition-colors cursor-pointer"
                    >
                      `{field.name}`
                    </button>
                  ))}
                </div>
              )}
            </div>

            <AutoGrowTextarea
              ref={textareaRef}
              id={`question-instructions-${question.id}`}
              minRows={2}
              value={question.instructions}
              onChange={e =>
                dispatch({
                  type: 'question/setText',
                  id: question.id,
                  text: e.target.value,
                })
              }
              placeholder={tItem.instructionPlaceholder}
              className="w-full p-3 rounded-control border border-control-border bg-surface text-ink text-sm sm:text-base placeholder:text-muted/60 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
          </div>

          {/* 2. Choix du type de question (contrôle segmenté) */}
          <div>
            <span
              id={`question-type-label-${question.id}`}
              className="block text-sm font-semibold text-muted mb-2"
            >
              {tItem.typeLabel}
            </span>

            <div
              role="group"
              aria-labelledby={`question-type-label-${question.id}`}
              className="inline-flex flex-wrap items-center rounded-pill bg-surface-2 border border-line p-1 gap-1"
            >
              {(['choice', 'score', 'noul'] as const).map(typeKey => {
                const isActive = question.type === typeKey;
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: 'question/setType',
                        id: question.id,
                        questionType: typeKey,
                      })
                    }
                    aria-pressed={isActive}
                    className={`min-h-[44px] px-3.5 sm:px-4 inline-flex items-center gap-2 rounded-pill text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-ink text-white shadow-xs'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    <QuestionTypeIcon type={typeKey} className="w-4 h-4" />
                    <span>{tItem.types[typeKey]}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-muted mt-2 italic">
              {tItem.typeHelp[question.type]}
            </p>
          </div>

          {/* 3. Section Clé technique dans n8n (repliable sous un lien discret) */}
          <div className="pt-2 border-t border-line/60">
            <button
              type="button"
              onClick={() => setShowKeyEdit(!showKeyEdit)}
              aria-expanded={showKeyEdit}
              aria-controls={`question-key-section-${question.id}`}
              className="text-xs text-brand-600 hover:text-brand-700 underline underline-offset-2 min-h-[36px] inline-flex items-center cursor-pointer"
            >
              {tItem.keySection.advanced}
            </button>

            {showKeyEdit && (
              <div id={`question-key-section-${question.id}`} className="mt-2 space-y-2">
                <span className="block font-mono text-xs sm:text-sm text-muted">
                  {tItem.keySection.toggle(question.key)}
                </span>
                <div className="p-3 rounded-control bg-brand-100 border border-line space-y-1.5">
                  <label
                    htmlFor={`question-key-${question.id}`}
                    className="block text-xs font-semibold text-ink"
                  >
                    {tItem.keySection.label}
                  </label>
                  <input
                    id={`question-key-${question.id}`}
                    type="text"
                    value={question.key}
                    onChange={e =>
                      dispatch({
                        type: 'question/setKey',
                        id: question.id,
                        key: e.target.value,
                      })
                    }
                    className="w-full min-h-[44px] px-3 py-2 rounded-control border border-control-border bg-surface text-ink font-mono text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                  />
                  <p className="text-xs text-muted">{tItem.keySection.help}</p>
                </div>
              </div>
            )}
          </div>

          {/* 4. Messages de validation (Erreurs & Avertissements) */}
          {(errors.length > 0 || warnings.length > 0) && (
            <div className="space-y-2 pt-2 border-t border-line/60">
              {errors.map((issue, idx) => (
                <div
                  key={`${issue.code}-${idx}`}
                  role="alert"
                  className="p-3 rounded-control border border-error/30 bg-error/10 text-error text-xs sm:text-sm flex items-start gap-2"
                >
                  <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span>{dict.validation[issue.code](issue.params)}</span>
                </div>
              ))}

              {warnings.map((issue, idx) => (
                <div
                  key={`${issue.code}-${idx}`}
                  className="p-3 rounded-control border border-amber-300 bg-warning-bg text-ink text-xs sm:text-sm flex items-start gap-2"
                >
                  <svg className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{dict.validation[issue.code](issue.params)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colonne droite : contenu propre au type (Options, Niveaux, Conditions) */}
        <div className="pt-6 min-[1280px]:pt-0 border-t min-[1280px]:border-t-0 border-line/60 min-[1280px]:border-l min-[1280px]:border-line min-[1280px]:pl-8 space-y-4 min-w-0">
          {/* Cas A : Choice */}
          {question.type === 'choice' && (
            <div className="space-y-3">
              <div className="grid grid-cols-[minmax(7rem,10rem)_minmax(0,1fr)_44px] gap-2 text-sm font-semibold text-muted">
                <span>{tItem.choice.optionKeyHeader}</span>
                <span>{tItem.choice.optionDescHeader}</span>
                <span aria-hidden="true" />
              </div>

              {question.options.map((option, idx) => {
                const isLast = idx === question.options.length - 1;
                return (
                  <div key={idx} className="grid grid-cols-[minmax(7rem,10rem)_minmax(0,1fr)_44px] gap-2 items-start">
                    <input
                      ref={el => {
                        if (!optionsInputsRef.current[idx]) {
                          optionsInputsRef.current[idx] = { key: null, desc: null };
                        }
                        optionsInputsRef.current[idx]!.key = el;
                      }}
                      type="text"
                      value={option.key}
                      onChange={e =>
                        dispatch({
                          type: 'choice/updateOption',
                          questionId: question.id,
                          index: idx,
                          key: e.target.value,
                        })
                      }
                      onKeyDown={e => handleOptionKeyKeyDown(e, idx)}
                      placeholder={tItem.choice.optionKeyPlaceholder}
                      className="min-h-[44px] px-3 py-2 rounded-control border border-control-border bg-surface text-ink font-mono text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                    />

                    <AutoGrowTextarea
                      ref={el => {
                        if (!optionsInputsRef.current[idx]) {
                          optionsInputsRef.current[idx] = { key: null, desc: null };
                        }
                        optionsInputsRef.current[idx]!.desc = el;
                      }}
                      minRows={1}
                      value={option.description ?? ''}
                      onChange={e =>
                        dispatch({
                          type: 'choice/updateOption',
                          questionId: question.id,
                          index: idx,
                          description: e.target.value,
                        })
                      }
                      onKeyDown={e => handleOptionDescKeyDown(e, idx, isLast)}
                      placeholder={tItem.choice.optionDescPlaceholder}
                      className="min-h-[44px] px-3 py-2.5 rounded-control border border-control-border bg-surface text-ink text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'choice/removeOption',
                          questionId: question.id,
                          index: idx,
                        })
                      }
                      disabled={question.options.length <= 2}
                      aria-label={tItem.choice.removeOptionAria(option.key)}
                      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-control text-muted hover:text-error hover:bg-surface-2 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => dispatch({ type: 'choice/addOption', questionId: question.id })}
                className="min-h-[44px] inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-4 cursor-pointer"
              >
                + {tItem.choice.addOption}
              </button>
            </div>
          )}

          {/* Cas B : Score */}
          {question.type === 'score' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted">
                {tItem.score.levelHeader}
              </p>

              {question.levels.map((level, idx) => {
                const isLast = idx === question.levels.length - 1;
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-8 font-mono text-xs font-bold text-muted text-right shrink-0">
                      {idx} :
                    </span>

                    <input
                      ref={el => {
                        levelsInputsRef.current[idx] = el;
                      }}
                      type="text"
                      value={level}
                      onChange={e =>
                        dispatch({
                          type: 'score/updateLevel',
                          questionId: question.id,
                          index: idx,
                          value: e.target.value,
                        })
                      }
                      onKeyDown={e =>
                        handleLevelKeyDown(e, idx, isLast, question.levels.length)
                      }
                      placeholder={tItem.score.levelPlaceholder(idx)}
                      className="flex-1 min-h-[44px] px-3 py-2 rounded-control border border-control-border bg-surface text-ink text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'score/removeLevel',
                          questionId: question.id,
                          index: idx,
                        })
                      }
                      disabled={question.levels.length <= 2}
                      aria-label={tItem.score.removeLevelAria(idx)}
                      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-control text-muted hover:text-error hover:bg-surface-2 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => dispatch({ type: 'score/addLevel', questionId: question.id })}
                disabled={question.levels.length >= 10}
                className="min-h-[44px] inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-4 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                + {tItem.score.addLevel}
              </button>
            </div>
          )}

          {/* Cas C : Noul */}
          {question.type === 'noul' && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor={`noul-true-${question.id}`}
                  className="block text-xs font-semibold text-muted mb-1"
                >
                  {tItem.noul.trueLabel}
                </label>
                <AutoGrowTextarea
                  id={`noul-true-${question.id}`}
                  minRows={1}
                  value={question.criteria?.trueCondition ?? ''}
                  onChange={e =>
                    dispatch({
                      type: 'noul/setConditions',
                      questionId: question.id,
                      trueCondition: e.target.value,
                    })
                  }
                  placeholder={tItem.noul.truePlaceholder}
                  className="w-full min-h-[44px] px-3 py-2.5 rounded-control border border-control-border bg-surface text-ink text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                />
              </div>

              <div>
                <label
                  htmlFor={`noul-false-${question.id}`}
                  className="block text-xs font-semibold text-muted mb-1"
                >
                  {tItem.noul.falseLabel}
                </label>
                <AutoGrowTextarea
                  id={`noul-false-${question.id}`}
                  minRows={1}
                  value={question.criteria?.falseCondition ?? ''}
                  onChange={e =>
                    dispatch({
                      type: 'noul/setConditions',
                      questionId: question.id,
                      falseCondition: e.target.value,
                    })
                  }
                  placeholder={tItem.noul.falsePlaceholder}
                  className="w-full min-h-[44px] px-3 py-2.5 rounded-control border border-control-border bg-surface text-ink text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

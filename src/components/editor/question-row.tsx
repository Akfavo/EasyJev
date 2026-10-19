'use client';

import type { KeyboardEvent } from 'react';
import type { QuestionSpec } from '@/modules/spec';
import type { ValidationIssue } from '@/modules/validators';
import type { Dictionary } from '@/modules/i18n';
import { splitCitations } from '@/modules/editor';
import { QuestionTypeIcon } from './question-type-icon';

interface QuestionRowProps {
  question: QuestionSpec;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
  issues: ValidationIssue[];
  dict: Dictionary;
}

export function QuestionRow({
  question,
  index,
  isSelected,
  onSelect,
  onKeyDown,
  buttonRef,
  issues,
  dict,
}: QuestionRowProps) {
  const tItem = dict.editor.questions.item;
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  const displayTitle =
    question.instructions.trim().length > 0
      ? question.instructions
      : tItem.newQuestionTitle;

  const summary =
    question.type === 'choice'
      ? tItem.typeSummary.choice(question.options.length)
      : question.type === 'score'
      ? tItem.typeSummary.score(question.levels.length)
      : tItem.typeSummary.noul();

  return (
    <button
      ref={buttonRef}
      type="button"
      id={`question-row-${question.id}`}
      aria-current={isSelected ? 'true' : undefined}
      tabIndex={isSelected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className={`w-full min-h-[52px] text-left p-3.5 rounded-control border transition-all cursor-pointer flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-brand-600 relative overflow-hidden ${
        isSelected
          ? 'border-line bg-white shadow-sm ring-1 ring-line/20 pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-brand-600'
          : 'border-line/70 bg-white/70 hover:bg-white hover:border-line'
      }`}
    >
      <span className="p-2 rounded-control bg-brand-100 text-brand-600 shrink-0 mt-0.5" aria-hidden="true">
        <QuestionTypeIcon type={question.type} className="w-4 h-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-mono font-bold text-muted shrink-0">
            #{index + 1}
          </span>
          <span
            className="block text-sm font-bold text-ink line-clamp-3 leading-snug"
            title={displayTitle}
          >
            {question.instructions.trim().length === 0 ? (
              displayTitle
            ) : (
              splitCitations(question.instructions).map((segment, segIdx) =>
                segment.type === 'field' && segment.value ? (
                  <span
                    key={segIdx}
                    className="inline-block px-1 py-0.5 mx-0.5 rounded font-mono text-xs font-semibold bg-brand-100 text-ink align-baseline"
                  >
                    {segment.value}
                  </span>
                ) : (
                  segment.value
                )
              )
            )}
          </span>
        </div>
        <span className="block text-xs text-muted mt-1">{summary}</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 mt-1">
        {errors.length > 0 && (
          <span
            className="inline-flex items-center text-error"
            title={tItem.errorsBadge(errors.length)}
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="sr-only">{tItem.errorsBadge(errors.length)}</span>
          </span>
        )}
        {errors.length === 0 && warnings.length > 0 && (
          <span
            className="inline-flex items-center text-amber-700"
            title={tItem.warningsBadge(warnings.length)}
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="sr-only">{tItem.warningsBadge(warnings.length)}</span>
          </span>
        )}
      </div>
    </button>
  );
}

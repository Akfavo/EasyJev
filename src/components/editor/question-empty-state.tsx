'use client';

import type { QuestionType } from '@/modules/spec';
import type { Dictionary } from '@/modules/i18n';
import { QuestionTypeIcon } from './question-type-icon';

interface QuestionEmptyStateProps {
  dict: Dictionary;
  onAddQuestion: (type: QuestionType) => void;
}

export function QuestionEmptyState({ dict, onAddQuestion }: QuestionEmptyStateProps) {
  const emptyDict = dict.editor.questions.emptyState;

  const cards: Array<{
    type: QuestionType;
    title: string;
    description: string;
    example: string;
    actionLabel: string;
  }> = [
    {
      type: 'choice',
      title: emptyDict.choice.title,
      description: emptyDict.choice.description,
      example: emptyDict.choice.example,
      actionLabel: emptyDict.choice.action,
    },
    {
      type: 'score',
      title: emptyDict.score.title,
      description: emptyDict.score.description,
      example: emptyDict.score.example,
      actionLabel: emptyDict.score.action,
    },
    {
      type: 'noul',
      title: emptyDict.noul.title,
      description: emptyDict.noul.description,
      example: emptyDict.noul.example,
      actionLabel: emptyDict.noul.action,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center sm:text-left">
        <h3 className="text-lg sm:text-xl font-bold text-ink">{emptyDict.title}</h3>
        <p className="text-sm text-muted mt-1">{emptyDict.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {cards.map(card => (
          <button
            key={card.type}
            type="button"
            onClick={() => onAddQuestion(card.type)}
            className="group p-4 rounded-control border border-line bg-surface hover:bg-surface-2/60 hover:border-brand-600/40 text-left transition-all flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="p-2 rounded-control bg-brand-100 text-brand-600 group-hover:scale-105 transition-transform">
                  <QuestionTypeIcon type={card.type} />
                </span>
                <span className="font-bold text-ink text-base group-hover:text-brand-700 transition-colors">
                  {card.title}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted leading-relaxed mb-3">
                {card.description}
              </p>
              <p className="text-xs text-ink font-mono bg-white p-2.5 rounded-sm border border-line">
                {card.example}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-600 group-hover:text-brand-700 underline underline-offset-2">
                {card.actionLabel}
              </span>
              <span className="text-brand-600 font-bold text-base group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

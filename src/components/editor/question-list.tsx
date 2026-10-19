'use client';

import { useState, useRef } from 'react';
import type { QuestionSpec, SpecField, QuestionType } from '@/modules/spec';
import type { ValidationIssue } from '@/modules/validators';
import type { Dictionary } from '@/modules/i18n';
import type { EditorAction } from '@/modules/editor';
import { resolveSelectedQuestionId, getSelectionAfterDelete } from '@/modules/editor';
import { QuestionEmptyState } from './question-empty-state';
import { QuestionTypeIcon } from './question-type-icon';
import { QuestionRow } from './question-row';
import { QuestionEditor } from './question-editor';

interface QuestionListProps {
  questions: QuestionSpec[];
  fields: SpecField[];
  issues: ValidationIssue[];
  dispatch: (action: EditorAction) => void;
  dict: Dictionary;
  selectedQuestionId: string | null;
  onSelectedQuestionChange: (id: string | null) => void;
}

export function QuestionList({
  questions,
  fields,
  issues,
  dispatch,
  dict,
  selectedQuestionId,
  onSelectedQuestionChange,
}: QuestionListProps) {
  const [autoFocusId, setAutoFocusId] = useState<string | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tQuestions = dict.editor.questions;

  const currentSelectedId = resolveSelectedQuestionId(questions, selectedQuestionId);
  const selectedIndex = questions.findIndex(q => q.id === currentSelectedId);
  const selectedQuestion = selectedIndex >= 0 ? questions[selectedIndex] : questions[0];

  const handleSelect = (id: string) => {
    setAutoFocusId(null);
    onSelectedQuestionChange(id);
    const idx = questions.findIndex(q => q.id === id);
    if (idx >= 0) {
      setLiveAnnouncement(tQuestions.selectedAnnouncement(idx + 1, questions.length));
    }
  };

  const handleAddQuestion = (type: QuestionType) => {
    setShowTypePicker(false);
    const newId = crypto.randomUUID();
    dispatch({ type: 'question/add', id: newId, questionType: type });
    onSelectedQuestionChange(newId);
    setAutoFocusId(newId);
    setLiveAnnouncement(tQuestions.selectedAnnouncement(questions.length + 1, questions.length + 1));
  };

  const handleDeleteQuestion = (id: string) => {
    const nextId = getSelectionAfterDelete(questions, id);
    dispatch({ type: 'question/remove', id });
    onSelectedQuestionChange(nextId);
    if (nextId) {
      const remaining = questions.filter(q => q.id !== id);
      const nextIndex = remaining.findIndex(q => q.id === nextId);
      if (nextIndex >= 0) {
        setLiveAnnouncement(tQuestions.selectedAnnouncement(nextIndex + 1, remaining.length));
      }
    }
  };

  const handleDuplicateQuestion = (id: string) => {
    const newId = crypto.randomUUID();
    dispatch({ type: 'question/duplicate', id, newId });
    onSelectedQuestionChange(newId);
    setAutoFocusId(newId);
    const origIndex = questions.findIndex(q => q.id === id);
    setLiveAnnouncement(tQuestions.selectedAnnouncement(origIndex + 2, questions.length + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let targetIndex: number | null = null;
    const total = questions.length;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % total;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
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
      const targetQuestion = questions[targetIndex];
      if (targetQuestion) {
        handleSelect(targetQuestion.id);
        rowRefs.current[targetIndex]?.focus();
      }
    }
  };

  return (
    <div className="space-y-6">
      <span className="sr-only" aria-live="polite">
        {liveAnnouncement}
      </span>

      {/* En-tête : Titre et boutons d'ajout sur une seule ligne */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-lg lg:text-xl font-bold tracking-tight text-ink">
          {tQuestions.sectionTitle}
        </h3>

        {questions.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {showTypePicker &&
              (['choice', 'score', 'noul'] as const).map(typeKey => (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => handleAddQuestion(typeKey)}
                  className="min-h-[44px] px-3.5 inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface hover:bg-surface-2 text-xs font-semibold text-ink transition-colors cursor-pointer"
                >
                  <QuestionTypeIcon type={typeKey} className="w-3.5 h-3.5 text-brand-600" />
                  <span>{tQuestions.addButtons[typeKey]}</span>
                </button>
              ))}
            <button
              type="button"
              onClick={() => setShowTypePicker(prev => !prev)}
              aria-expanded={showTypePicker}
              aria-label={tQuestions.addQuestionAria}
              className="min-h-[44px] px-4 inline-flex items-center rounded-pill border border-line bg-surface hover:bg-surface-2 text-xs font-semibold text-ink transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
            >
              {tQuestions.addQuestion}
            </button>
          </div>
        )}
      </div>

      {questions.length === 0 ? (
        <QuestionEmptyState dict={dict} onAddQuestion={handleAddQuestion} />
      ) : (
        /* Grille à deux volets dès 1100 px : liste à gauche, détail à droite */
        <div className="grid grid-cols-1 min-[1100px]:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] gap-8 items-start">
          {/* Volet gauche : Liste des questions */}
          <div
            role="region"
            aria-label={tQuestions.listAriaLabel}
            className="space-y-2.5 min-w-0 min-[1100px]:sticky min-[1100px]:top-6 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1"
          >
            {questions.map((q, idx) => (
              <QuestionRow
                key={q.id}
                question={q}
                index={idx}
                isSelected={q.id === currentSelectedId}
                onSelect={() => handleSelect(q.id)}
                onKeyDown={e => handleKeyDown(e, idx)}
                buttonRef={el => {
                  rowRefs.current[idx] = el;
                }}
                issues={issues.filter(i => i.questionId === q.id)}
                dict={dict}
              />
            ))}
          </div>

          {/* Volet droit : Détail de la question sélectionnée */}
          <div
            role="region"
            aria-labelledby="question-detail-heading"
            className="min-w-0 min-[1100px]:border-l min-[1100px]:border-line min-[1100px]:pl-8"
          >
            {selectedQuestion ? (
              <QuestionEditor
                key={selectedQuestion.id}
                question={selectedQuestion}
                questionIndex={selectedIndex >= 0 ? selectedIndex : 0}
                totalQuestions={questions.length}
                fields={fields}
                issues={issues.filter(i => i.questionId === selectedQuestion.id)}
                dispatch={dispatch}
                dict={dict}
                onDeleteQuestion={handleDeleteQuestion}
                onDuplicateQuestion={handleDuplicateQuestion}
                autoFocusInstructions={autoFocusId === selectedQuestion.id}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

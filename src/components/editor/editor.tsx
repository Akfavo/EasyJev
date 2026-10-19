'use client';

import { useReducer, useState, useEffect, type ReactNode } from 'react';
import {
  createInitialState,
  editorReducer,
  hasUserContent,
  isStartingPointOpen,
  resolveSelectedQuestionId,
  editorSessionStore,
  type EditorState,
  type StartingPointMode,
} from '@/modules/editor';
import { getDictionary, type Locale } from '@/modules/i18n';
import { getModelShortLabel } from '@/modules/claude-client';
import { createDefaultSpec } from '@/modules/spec';
import { ConfirmReplaceDialog } from '@/components/confirm-replace-dialog';
import type { ValidationIssue } from '@/modules/validators';
import { validateSpec } from '@/modules/validators';
import { OsWindow } from '@/components/os-window';
import { EditorReads } from './editor-reads';
import { QuestionList } from './question-list';
import { EditorOutput } from './editor-output';
import { TemplateGallery } from '../templates';
import { GenerationCard } from '../generation';
import {
  GenerationReportLine,
  type GenerationReportInfo,
} from '../generation/generation-status';

interface EditorProps {
  currentLocale: Locale;
}

interface StepHeadingProps {
  id: string;
  number: number;
  done?: boolean;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

/** Titre d'étape : numéro (coché une fois l'étape faite) et un mot du slogan « Décris. Ajuste. Copie. ». */
function StepHeading({ id, number, done = false, title, subtitle, action }: StepHeadingProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h2 id={id} className="text-2xl lg:text-3xl font-bold tracking-tight text-ink-page flex items-center gap-3">
          <span
            className={`w-9 h-9 shrink-0 rounded-full inline-flex items-center justify-center text-base font-bold text-white ${
              done ? 'bg-success' : 'bg-line'
            }`}
            aria-hidden="true"
          >
            {done ? '✓' : number}
          </span>
          <span>
            {title}
            <span className="text-brand-600">.</span>
          </span>
        </h2>
        {subtitle && <p className="text-sm font-medium text-ink-page mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function buildEditorInitialState(): EditorState {
  const session = editorSessionStore.get();
  if (session && session.spec) {
    return session;
  }
  return createInitialState();
}

export function Editor({ currentLocale }: EditorProps) {
  const [state, dispatch] = useReducer(editorReducer, undefined, buildEditorInitialState);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [startingPointMode, setStartingPointMode] = useState<StartingPointMode>('auto');
  // Dernier rapport de génération (coût réel) : affiché dans « Ajuste » car « Décris » se replie après la génération
  const [lastGeneration, setLastGeneration] = useState<{
    report: GenerationReportInfo;
    count: number;
  } | null>(null);
  // Réinitialisation complète : confirmation, et compteur qui remonte la carte de génération (efface la description saisie)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetCount, setResetCount] = useState(0);

  // Synchronise l'état courant de l'éditeur dans le store de session en mémoire JS
  useEffect(() => {
    editorSessionStore.set(state);
  }, [state]);

  const dict = getDictionary(currentLocale);
  const validationResult = validateSpec(state.spec);
  const hasWork = hasUserContent(state.spec);
  const startingPointOpen = isStartingPointOpen(startingPointMode, hasWork);
  const activeQuestionId = resolveSelectedQuestionId(state.spec.questions, selectedQuestionId);

  const tSteps = dict.home.steps;
  const tSp = dict.home.startingPoint;

  const handleToggleStartingPoint = () => {
    setStartingPointMode(startingPointOpen ? 'closed' : 'open');
  };

  const handleErrorClick = (issue: ValidationIssue) => {
    if (issue.questionId) {
      setSelectedQuestionId(issue.questionId);
      requestAnimationFrame(() => {
        const targetElement = document.getElementById('question-instructions-' + issue.questionId);
        targetElement?.focus();
        targetElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    } else if (issue.fieldId) {
      const fieldInput = document.getElementById('field-pill-' + issue.fieldId);
      fieldInput?.focus();
      fieldInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Un modèle vient d'être chargé ou des questions viennent d'être générées :
  // on sélectionne la première question. La zone « Décris » reste ouverte (l'utilisateur peut ajuster sa description
  // et relancer) : elle ne se replie que sur demande.
  // Un seul endroit gère le défilement : on attend deux images que la mise en page soit stable,
  // puis on amorce le défilement vers le début de « Ajuste », et le focus ne déplace pas la page.
  const handleContentLoaded = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setStartingPointMode('open');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .getElementById('editor-workspace')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document
          .getElementById('question-instructions-' + questionId)
          ?.focus({ preventScroll: true });
      });
    });
  };

  // Des champs viennent d'être choisis sans génération : on amène « Ajuste » à l'écran
  const handleFieldsApplied = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .getElementById('editor-workspace')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  // « Importer depuis n8n » dans « Ajuste » : on rouvre « Décris » sur la case des données
  const handlePasteData = () => {
    setStartingPointMode('open');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const input = document.getElementById('generation-data-input');
        input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input?.focus({ preventScroll: true });
      });
    });
  };

  const handleGenerated = (report: GenerationReportInfo | null, questionsCount: number) => {
    setLastGeneration(report ? { report, count: questionsCount } : null);
  };

  const handleTemplateLoaded = (questionId: string) => {
    setLastGeneration(null);
    handleContentLoaded(questionId);
  };

  const handleRequestReset = () => setIsResetConfirmOpen(true);
  const handleCancelReset = () => setIsResetConfirmOpen(false);
  const handleConfirmReset = () => {
    const defaults = createDefaultSpec();
    dispatch({
      type: 'spec/replaceContent',
      fields: defaults.fields,
      questions: defaults.questions,
    });
    dispatch({ type: 'detected/set', names: [] });
    setSelectedQuestionId(null);
    setLastGeneration(null);
    setStartingPointMode('auto');
    setResetCount(count => count + 1);
    setIsResetConfirmOpen(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .getElementById('step-describe-title')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  const tUi = dict.generation.ui;

  return (
    <div className="w-full space-y-10 lg:space-y-12">
      {/* Étape 1 : Décris */}
      <section aria-labelledby="step-describe-title">
        <StepHeading
          id="step-describe-title"
          number={1}
          done={state.spec.questions.length > 0}
          title={tSteps.describe}
          subtitle={tSp.sectionSubtitle}
        />

        <OsWindow
          title={dict.windows.describe.title}
          badge={<span>{dict.windows.describe.badge}</span>}
          collapsible={hasWork}
          isOpen={startingPointOpen}
          onToggle={handleToggleStartingPoint}
          toggleAriaLabel={startingPointOpen ? tSp.collapse : tSp.expand}
          collapseLabel={dict.windows.collapse}
          expandLabel={dict.windows.expand}
          collapseAriaLabel={dict.windows.collapseAria}
          expandAriaLabel={dict.windows.expandAria}
          className="w-full"
        >
          <GenerationCard
            key={resetCount}
            spec={state.spec}
            dispatch={dispatch}
            dict={dict}
            locale={currentLocale}
            onQuestionFocusRequest={handleContentLoaded}
            onGenerated={handleGenerated}
            onFieldsApplied={handleFieldsApplied}
          />

          {/* Sans clé IA : modèles prêts à l'emploi ou création à la main, toujours visibles */}
          <div className="mt-6 pt-5 border-t border-line/20 space-y-3">
            <p className="text-sm font-bold text-ink">{dict.home.templates.sectionTitle}</p>
            <TemplateGallery
              spec={state.spec}
              dispatch={dispatch}
              dict={dict}
              locale={currentLocale}
              onQuestionFocusRequest={handleTemplateLoaded}
            />
          </div>
        </OsWindow>
      </section>

      {/* Étape 2 : Ajuste */}
      <section id="editor-workspace" aria-labelledby="step-adjust-title" className="scroll-mt-6">
        <StepHeading
          id="step-adjust-title"
          number={2}
          done={validationResult.isValid}
          title={tSteps.adjust}
          subtitle={tSteps.adjustSubtitle}
          action={
            hasWork ? (
              <button
                type="button"
                onClick={handleRequestReset}
                className="min-h-[40px] px-4 inline-flex items-center rounded-pill border-2 border-line bg-white hover:bg-surface-2 text-ink hover:text-error text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
              >
                {dict.editor.output.barReset}
              </button>
            ) : undefined
          }
        />
        <OsWindow
          title={dict.windows.adjust.title}
          badge={<span>{dict.windows.adjust.badge(state.spec.questions.length)}</span>}
          className="w-full"
        >
          {lastGeneration && (
            <div
              role="status"
              className="mb-6 space-y-0.5 rounded-control border border-line/20 bg-brand-100/60 px-4 py-3"
            >
              <p className="text-sm font-bold text-ink">
                {tUi.generatedNotice(
                  lastGeneration.count,
                  getModelShortLabel(lastGeneration.report.model)
                )}
              </p>
              <p className="text-xs font-mono text-muted">
                <GenerationReportLine
                  report={lastGeneration.report}
                  dict={dict}
                  locale={currentLocale}
                />
              </p>
            </div>
          )}
          <EditorReads
            spec={state.spec}
            dispatch={dispatch}
            dict={dict}
            detectedFields={state.detectedFields ?? []}
            onPasteData={handlePasteData}
          />
          <div className="border-t border-line/20 pt-6">
            <QuestionList
              questions={state.spec.questions}
              fields={state.spec.fields}
              issues={validationResult.issues}
              dispatch={dispatch}
              dict={dict}
              selectedQuestionId={activeQuestionId}
              onSelectedQuestionChange={setSelectedQuestionId}
            />
          </div>
        </OsWindow>
      </section>

      {/* Étape 3 : Copie (résultat en bas, pleine largeur) */}
      <EditorOutput
        spec={state.spec}
        dispatch={dispatch}
        dict={dict}
        onErrorClick={handleErrorClick}
      />

      <ConfirmReplaceDialog
        isOpen={isResetConfirmOpen}
        title={dict.editor.output.resetConfirmTitle}
        message={dict.editor.output.resetConfirmMessage}
        confirmLabel={dict.editor.output.resetConfirmAction}
        cancelLabel={dict.editor.output.resetConfirmCancel}
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
      />
    </div>
  );
}

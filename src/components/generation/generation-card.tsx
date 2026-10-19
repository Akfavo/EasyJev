'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { EasyJevSpec, QuestionSpec, SpecField } from '@/modules/spec';
import type { EditorAction } from '@/modules/editor';
import {
  hasUserContent,
  splitCitations,
  parseN8nInput,
  resolveGeneratedFields,
  MAX_DETECTED_FIELDS_SENT,
} from '@/modules/editor';
import type { Dictionary } from '@/modules/i18n';
import type { Locale } from '@/modules/i18n';
import {
  MIN_DESCRIPTION_CHARS,
  MAX_DESCRIPTION_CHARS,
  generateQuestionsFromDescription,
  getModelShortLabel,
} from '@/modules/claude-client';
import { useAiSettings } from '@/components/ai-settings/ai-settings-context';
import { ConfirmReplaceDialog } from '@/components/confirm-replace-dialog';
import { FieldRemapDialog, type CitedRemovedField } from '@/components/editor/field-remap-dialog';
import { GenerationDescription } from './generation-description';
import { GenerationDataBox } from './generation-data-box';
import {
  GenerationStatus,
  type GenerationErrorInfo,
  type GenerationReportInfo,
} from './generation-status';

interface GenerationCardProps {
  spec: EasyJevSpec;
  dispatch: (action: EditorAction) => void;
  dict: Dictionary;
  locale: Locale;
  onQuestionFocusRequest?: (questionId: string) => void;
  /** Appelé quand des questions générées viennent d'être appliquées, avec le rapport de coût réel et le nombre de questions (pour l'afficher même quand la zone « Décris » est repliée). */
  onGenerated?: (report: GenerationReportInfo | null, questionsCount: number) => void;
  /** Appelé quand des champs viennent d'être appliqués sans génération (bouton « Utiliser les champs cochés »). */
  onFieldsApplied?: () => void;
}

interface PendingGeneration {
  questions: QuestionSpec[];
  report: GenerationReportInfo | null;
  fieldsUsed: string[];
}

export function GenerationCard({
  spec,
  dispatch,
  dict,
  locale,
  onQuestionFocusRequest,
  onGenerated,
  onFieldsApplied,
}: GenerationCardProps) {
  const { state: aiState, dispatch: aiDispatch } = useAiSettings();
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastError, setLastError] = useState<GenerationErrorInfo | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [pending, setPending] = useState<PendingGeneration | null>(null);
  // Données n8n collées : restent dans cette carte (jamais stockées), seuls les noms de champs sont conservés ailleurs
  const [dataText, setDataText] = useState('');
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  // Champs choisis qui retirent des champs cités dans les questions : on demande par quoi les remplacer
  const [pendingRemap, setPendingRemap] = useState<{ names: string[]; cited: CitedRemovedField[] } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingGenerateRef = useRef(false);

  const tUi = dict.generation.ui;
  const tAi = dict.header.aiSettings;
  const tConfirm = dict.home.templates.confirmDialog;
  const hasKey = aiState.apiKey.trim().length > 0;

  const parsedData = useMemo(
    () => (dataText.trim().length > 0 ? parseN8nInput(dataText) : null),
    [dataText]
  );
  const detected = useMemo(
    () =>
      parsedData && parsedData.ok
        ? parsedData.fields.filter(f => f.usable).slice(0, MAX_DETECTED_FIELDS_SENT)
        : [],
    [parsedData]
  );
  const hasDetected = detected.length > 0;

  const handleToggleField = (name: string) => {
    setSelectedNames(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Réutilise l'identifiant et l'exemple d'un champ déjà présent de même nom
  const buildSpecFields = (names: string[]): SpecField[] => {
    const existingByName = new Map(spec.fields.map(f => [f.name, f]));
    return names.map(name => {
      const existing = existingByName.get(name);
      if (existing) return existing;
      const example =
        spec.outputMode === 'example-text'
          ? detected.find(f => f.name === name)?.exampleValue
          : undefined;
      return {
        id: crypto.randomUUID(),
        name,
        ...(example !== undefined ? { exampleValue: example } : {}),
      };
    });
  };

  const applySelectedFields = (names: string[], remap?: Record<string, string>) => {
    const newFields = buildSpecFields(names);
    dispatch({
      type: 'field/replaceAll',
      fields: newFields.map(f => ({
        id: f.id,
        name: f.name,
        ...(f.exampleValue !== undefined ? { exampleValue: f.exampleValue } : {}),
      })),
      ...(remap && Object.keys(remap).length > 0 ? { remap } : {}),
    });
    dispatch({ type: 'detected/set', names: detected.map(f => f.name) });
    onFieldsApplied?.();
  };

  const handleUseSelected = () => {
    const names = detected.filter(f => selectedNames.has(f.name)).map(f => f.name);
    if (names.length === 0) return;
    // Champs retirés encore cités entre accents graves dans des questions
    const cited: CitedRemovedField[] = spec.fields
      .filter(f => !names.includes(f.name))
      .map(f => ({
        name: f.name,
        questionCount: spec.questions.filter(q =>
          splitCitations(q.instructions).some(seg => seg.type === 'field' && seg.value === f.name)
        ).length,
      }))
      .filter(c => c.questionCount > 0);
    if (cited.length > 0) {
      setPendingRemap({ names, cited });
    } else {
      applySelectedFields(names);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const applyGeneratedQuestions = (
    questions: QuestionSpec[],
    report: GenerationReportInfo | null,
    fieldsUsed: string[]
  ) => {
    if (hasDetected) {
      const finalNames = resolveGeneratedFields({
        detectedNames: detected.map(f => f.name),
        selectedNames: Array.from(selectedNames),
        fieldsUsed,
        instructions: questions.map(q => q.instructions),
      });
      dispatch({ type: 'spec/replaceContent', fields: buildSpecFields(finalNames), questions });
      dispatch({ type: 'detected/set', names: detected.map(f => f.name) });
    } else {
      dispatch({ type: 'spec/replaceQuestions', questions });
    }
    setPending(null);
    setLiveAnnouncement(tUi.questionsGeneratedAnnouncement(questions.length));
    onGenerated?.(report, questions.length);
    // Le défilement et le focus sont gérés par l'éditeur (une seule source de défilement).
    const firstQuestion = questions[0];
    if (firstQuestion && onQuestionFocusRequest) onQuestionFocusRequest(firstQuestion.id);
  };

  const handleGenerate = async (options?: { fromPending?: boolean }) => {
    if (isGenerating) return;
    const trimmedDesc = description.trim();
    const trimmedKey = aiState.apiKey.trim();
    const isDescriptionValid =
      trimmedDesc.length >= MIN_DESCRIPTION_CHARS && trimmedDesc.length <= MAX_DESCRIPTION_CHARS;
    if (options?.fromPending) {
      // Reprise après la fermeture du pop-up de réglages : on ne relance que si tout est prêt.
      if (trimmedKey.length === 0 || !isDescriptionValid) return;
    } else {
      if (!isDescriptionValid) {
        setLastError({ error: 'invalid_input' });
        return;
      }
      if (trimmedKey.length === 0) {
        setLastError(null);
        pendingGenerateRef.current = true;
        aiDispatch({ type: 'OPEN_DIALOG' });
        return;
      }
    }
    setIsGenerating(true);
    setLastError(null);
    setLiveAnnouncement(tUi.loadingState);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => { controller.abort('timeout'); }, 60_000);
    timeoutIdRef.current = timeoutId;
    try {
      // Avec des données collées : Claude reçoit les noms des champs cochés, ou de tous les champs détectés (il choisit)
      const fieldsForClaude: SpecField[] = hasDetected
        ? (selectedNames.size > 0 ? detected.filter(f => selectedNames.has(f.name)) : detected).map(f => ({
            id: `detected-${f.name}`,
            name: f.name,
          }))
        : spec.fields;
      const result = await generateQuestionsFromDescription(
        { apiKey: trimmedKey, description: trimmedDesc, fields: fieldsForClaude, model: aiState.selectedModel, language: locale },
        { makeId: () => crypto.randomUUID(), signal: controller.signal }
      );
      if (timeoutIdRef.current) { clearTimeout(timeoutIdRef.current); timeoutIdRef.current = null; }
      setIsGenerating(false);
      if (!result.ok) {
        if (controller.signal.aborted && controller.signal.reason === 'timeout') {
          setLastError({ error: 'timeout' });
        } else {
          setLastError({ error: result.error, status: result.status, apiErrorType: result.apiErrorType });
        }
        return;
      }
      const report: GenerationReportInfo = { usage: result.usage, model: result.model };
      if (hasUserContent(spec)) {
        setPending({ questions: result.questions, report, fieldsUsed: result.fieldsUsed });
      } else {
        applyGeneratedQuestions(result.questions, report, result.fieldsUsed);
      }
    } catch {
      if (timeoutIdRef.current) { clearTimeout(timeoutIdRef.current); timeoutIdRef.current = null; }
      setIsGenerating(false);
      if (controller.signal.aborted && controller.signal.reason === 'timeout') {
        setLastError({ error: 'timeout' });
      } else {
        setLastError({ error: 'network' });
      }
    }
  };

  const handleGenerateRef = useRef(handleGenerate);
  handleGenerateRef.current = handleGenerate;

  // Génération en attente : démarre une seule fois quand le pop-up de réglages se ferme avec une clé.
  useEffect(() => {
    if (!aiState.isDialogOpen && pendingGenerateRef.current) {
      pendingGenerateRef.current = false;
      void handleGenerateRef.current({ fromPending: true });
    }
  }, [aiState.isDialogOpen]);

  const handleCancel = () => {
    if (timeoutIdRef.current) { clearTimeout(timeoutIdRef.current); timeoutIdRef.current = null; }
    abortControllerRef.current?.abort();
    setIsGenerating(false);
    setLastError({ error: 'aborted' });
    setLiveAnnouncement(tUi.cancelledAnnouncement);
  };

  const modelShortLabel = getModelShortLabel(aiState.selectedModel);

  return (
    <div className="flex flex-col flex-1 h-full">
      <span className="sr-only" aria-live="polite">{liveAnnouncement}</span>
      <div className="grid grid-cols-1 min-[900px]:grid-cols-2 gap-6 items-stretch">
        <GenerationDescription
          description={description}
          onChange={setDescription}
          fields={spec.fields}
          dict={dict}
          disabled={isGenerating}
          hideFields={hasDetected}
        />
        <GenerationDataBox
          text={dataText}
          onTextChange={setDataText}
          parsed={parsedData}
          detected={detected}
          selectedNames={selectedNames}
          onToggleField={handleToggleField}
          onUseSelected={handleUseSelected}
          dict={dict}
          disabled={isGenerating}
        />
      </div>
      <div className="mt-5 space-y-3 shrink-0">
        <div>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={isGenerating}
            aria-busy={isGenerating}
            className="w-full min-h-[44px] px-6 rounded-pill bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-45 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                <span>{tUi.generatingButton}</span>
              </>
            ) : (
              <span>{tUi.generateButton}</span>
            )}
          </button>
        </div>
        <div>
          {hasKey ? (
            <button
              type="button"
              onClick={() => aiDispatch({ type: 'OPEN_DIALOG' })}
              className="text-xs text-muted hover:text-ink underline cursor-pointer transition-colors"
            >
              {tAi.modelLine(modelShortLabel)}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => aiDispatch({ type: 'OPEN_DIALOG' })}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium underline cursor-pointer transition-colors"
            >
              {tAi.keyPrompt}
            </button>
          )}
        </div>
        <GenerationStatus
          isGenerating={isGenerating}
          onCancel={handleCancel}
          error={lastError}
          onRetry={() => void handleGenerate()}
          dict={dict}
        />
      </div>
      <FieldRemapDialog
        isOpen={pendingRemap !== null}
        citedFields={pendingRemap?.cited ?? []}
        candidateNames={pendingRemap?.names ?? []}
        onApply={remap => {
          if (pendingRemap) applySelectedFields(pendingRemap.names, remap);
          setPendingRemap(null);
        }}
        onCancel={() => setPendingRemap(null)}
        dict={dict}
      />
      <ConfirmReplaceDialog
        isOpen={pending !== null}
        title={tConfirm.title}
        message={tConfirm.message}
        confirmLabel={tConfirm.confirm}
        cancelLabel={tConfirm.cancel}
        onConfirm={() => { if (pending) applyGeneratedQuestions(pending.questions, pending.report, pending.fieldsUsed); }}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

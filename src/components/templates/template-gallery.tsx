'use client';

import { useState } from 'react';
import type { EasyJevSpec } from '@/modules/spec';
import { createDefaultSpec } from '@/modules/spec';
import type { EditorAction } from '@/modules/editor';
import { hasUserContent } from '@/modules/editor';
import type { Dictionary, Locale } from '@/modules/i18n';
import {
  TEMPLATE_IDS,
  getTemplateContent,
  type TemplateId,
  type TemplateContent,
} from '@/modules/templates';
import { ConfirmReplaceDialog } from '@/components/confirm-replace-dialog';

interface TemplateGalleryProps {
  spec: EasyJevSpec;
  dispatch: (action: EditorAction) => void;
  dict: Dictionary;
  locale: Locale;
  onQuestionFocusRequest?: (questionId: string) => void;
}

/**
 * Liste des modèles prêts à l'emploi, en lignes compactes (titre, description, résumé).
 * Le titre de la colonne est fourni par le parent.
 */
export function TemplateGallery({
  spec,
  dispatch,
  dict,
  locale,
  onQuestionFocusRequest,
}: TemplateGalleryProps) {
  const [pendingSelection, setPendingSelection] = useState<
    | { type: 'template'; id: TemplateId; title: string }
    | { type: 'custom'; title: string }
    | null
  >(null);

  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const tTemplates = dict.home.templates;

  const applyContent = (content: TemplateContent, title: string) => {
    dispatch({
      type: 'spec/replaceContent',
      fields: content.fields,
      questions: content.questions,
    });

    setLiveAnnouncement(tTemplates.templateLoaded(title));

    // Le défilement et le focus sont gérés par l'éditeur (une seule source de défilement).
    const firstQuestion = content.questions[0];
    if (firstQuestion && onQuestionFocusRequest) {
      onQuestionFocusRequest(firstQuestion.id);
    }
  };

  const handleSelectTemplate = (id: TemplateId) => {
    const templateTitle = tTemplates.items[id].title;
    // Si l'éditeur contient déjà du contenu personnalisé, demander confirmation
    if (hasUserContent(spec)) {
      setPendingSelection({ type: 'template', id, title: templateTitle });
    } else {
      const content = getTemplateContent(id, locale, () => crypto.randomUUID());
      applyContent(content, templateTitle);
    }
  };

  const handleSelectCustom = () => {
    const customTitle = tTemplates.custom.title;
    if (hasUserContent(spec)) {
      setPendingSelection({ type: 'custom', title: customTitle });
    } else {
      const defaultSpec = createDefaultSpec();
      applyContent(
        { fields: defaultSpec.fields, questions: defaultSpec.questions },
        customTitle
      );
    }
  };

  const handleConfirmReplace = () => {
    if (!pendingSelection) return;

    if (pendingSelection.type === 'template') {
      const content = getTemplateContent(
        pendingSelection.id,
        locale,
        () => crypto.randomUUID()
      );
      applyContent(content, pendingSelection.title);
    } else {
      const defaultSpec = createDefaultSpec();
      applyContent(
        { fields: defaultSpec.fields, questions: defaultSpec.questions },
        pendingSelection.title
      );
    }

    setPendingSelection(null);
  };

  const handleCancelReplace = () => {
    setPendingSelection(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="sr-only" aria-live="polite">{liveAnnouncement}</span>

      <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2 list-none p-0 m-0">
        {TEMPLATE_IDS.map(id => {
          const item = tTemplates.items[id];
          const templateContent = getTemplateContent(id, locale, () => 'preview');
          const metaLabel = tTemplates.templateMeta(
            templateContent.questions.length,
            templateContent.fields.length
          );
          return (
            <li key={id} className="flex">
              <button
                type="button"
                onClick={() => handleSelectTemplate(id)}
                title={item.description}
                className="w-full text-left px-3.5 py-2.5 rounded-control border border-line bg-surface hover:bg-surface-2 hover:border-brand-600 transition-colors cursor-pointer flex flex-col gap-1 group focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
              >
                <span className="text-sm font-bold text-ink group-hover:text-brand-700 transition-colors">
                  {item.title}
                </span>
                <span className="text-xs text-muted">{metaLabel}</span>
              </button>
            </li>
          );
        })}

        <li className="flex">
          <button
            type="button"
            onClick={handleSelectCustom}
            title={tTemplates.custom.description}
            className="w-full text-left px-3.5 py-2.5 rounded-control border border-dashed border-control-border bg-surface hover:bg-surface-2 hover:border-brand-600 transition-colors cursor-pointer flex flex-col gap-1 group focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
          >
            <span className="text-sm font-bold text-ink group-hover:text-brand-700 transition-colors">
              + {tTemplates.custom.title}
            </span>
            <span className="text-xs text-muted">{tTemplates.custom.meta}</span>
          </button>
        </li>
      </ul>

      <ConfirmReplaceDialog
        isOpen={pendingSelection !== null}
        title={tTemplates.confirmDialog.title}
        message={tTemplates.confirmDialog.message}
        confirmLabel={tTemplates.confirmDialog.confirm}
        cancelLabel={tTemplates.confirmDialog.cancel}
        onConfirm={handleConfirmReplace}
        onCancel={handleCancelReplace}
      />
    </div>
  );
}

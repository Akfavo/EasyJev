import type { SpecField, QuestionSpec } from '../spec';

export type TemplateId = 'triage' | 'urgence' | 'lead' | 'avis';

export interface TemplateContent {
  fields: SpecField[];
  questions: QuestionSpec[];
}

export const TEMPLATE_IDS: readonly TemplateId[] = [
  'triage',
  'urgence',
  'lead',
  'avis',
] as const;

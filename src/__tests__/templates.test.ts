import { describe, it, expect } from 'vitest';
import {
  TEMPLATE_IDS,
  getTemplateContent,
  type TemplateId,
} from '@/modules/templates';
import { validateSpec } from '@/modules/validators';
import { generateJevOutput } from '@/modules/generators';
import { SUPPORTED_LOCALES, type Locale } from '@/modules/i18n';
import type { EasyJevSpec, ChoiceQuestionSpec } from '@/modules/spec';

describe('Module templates', () => {
  it('définit 4 modèles ordonnés', () => {
    expect(TEMPLATE_IDS).toEqual(['triage', 'urgence', 'lead', 'avis']);
  });

  const testMatrix: Array<{ id: TemplateId; locale: Locale }> = [];
  for (const id of TEMPLATE_IDS) {
    for (const locale of SUPPORTED_LOCALES) {
      testMatrix.push({ id, locale });
    }
  }

  describe.each(testMatrix)(
    'Modèle "$id" en langue "$locale"',
    ({ id, locale }) => {
      it('génère une spec valide sans aucune erreur ni aucun avertissement', () => {
        let counter = 0;
        const makeId = () => `mock-id-${++counter}`;

        const content = getTemplateContent(id, locale, makeId);

        const spec: EasyJevSpec = {
          fields: content.fields,
          questions: content.questions,
          target: { provider: 'typesafe', model: 'jev-latest' },
          outputMode: 'n8n-expression',
        };

        const validation = validateSpec(spec);

        // Validation stricte : valide et AUCUN avertissement !
        expect(validation.isValid).toBe(true);
        expect(validation.issues).toEqual([]);
      });

      it('permet à generateJevOutput de générer un JSON valide sans lever d’erreur', () => {
        let counter = 0;
        const makeId = () => `mock-id-${++counter}`;

        const content = getTemplateContent(id, locale, makeId);

        const spec: EasyJevSpec = {
          fields: content.fields,
          questions: content.questions,
          target: { provider: 'typesafe', model: 'jev-latest' },
          outputMode: 'n8n-expression',
        };

        expect(() => {
          const output = generateJevOutput(spec);
          expect(output.jsonString).toBeTruthy();
          expect(typeof output.jsonString).toBe('string');
        }).not.toThrow();
      });

      it('utilise exclusivement les identifiants fournis par la fonction makeId', () => {
        const generatedIds: string[] = [];
        const makeId = () => {
          const newId = `unique-id-${generatedIds.length + 1}`;
          generatedIds.push(newId);
          return newId;
        };

        const content = getTemplateContent(id, locale, makeId);

        for (const field of content.fields) {
          expect(generatedIds).toContain(field.id);
        }
        for (const question of content.questions) {
          expect(generatedIds).toContain(question.id);
        }
      });

      it('ne contient aucun texte vide dans les champs et les questions', () => {
        const content = getTemplateContent(id, locale, () => 'id');

        for (const field of content.fields) {
          expect(field.name.trim().length).toBeGreaterThan(0);
          if (field.exampleValue !== undefined) {
            expect(field.exampleValue.trim().length).toBeGreaterThan(0);
          }
        }

        for (const question of content.questions) {
          expect(question.key.trim().length).toBeGreaterThan(0);
          expect(question.instructions.trim().length).toBeGreaterThan(0);

          if (question.type === 'choice') {
            expect(question.options.length).toBeGreaterThanOrEqual(2);
            for (const opt of question.options) {
              expect(opt.key.trim().length).toBeGreaterThan(0);
              if (opt.description !== undefined) {
                expect(opt.description.trim().length).toBeGreaterThan(0);
              }
            }
          }

          if (question.type === 'score') {
            expect(question.levels.length).toBeGreaterThanOrEqual(2);
            expect(question.levels.length).toBeLessThanOrEqual(10);
            for (const lvl of question.levels) {
              expect(lvl.trim().length).toBeGreaterThan(0);
            }
          }

          if (question.type === 'noul') {
            if (question.criteria?.trueCondition) {
              expect(question.criteria.trueCondition.trim().length).toBeGreaterThan(0);
            }
            if (question.criteria?.falseCondition) {
              expect(question.criteria.falseCondition.trim().length).toBeGreaterThan(0);
            }
          }
        }
      });
    }
  );

  describe('Parité stricte des clés techniques entre FR et EN', () => {
    it.each(TEMPLATE_IDS)(
      'le modèle %s a exactement les mêmes clés de questions et d’options en FR et EN',
      id => {
        const frContent = getTemplateContent(id, 'fr', () => 'id');
        const enContent = getTemplateContent(id, 'en', () => 'id');

        expect(frContent.questions.length).toBe(enContent.questions.length);

        const frKeys = frContent.questions.map(q => q.key);
        const enKeys = enContent.questions.map(q => q.key);
        expect(frKeys).toEqual(enKeys);

        // Vérification des clés d'options pour les questions choice
        for (let i = 0; i < frContent.questions.length; i++) {
          const frQ = frContent.questions[i]!;
          const enQ = enContent.questions[i]!;

          expect(frQ.type).toBe(enQ.type);

          if (frQ.type === 'choice') {
            const frChoice = frQ as ChoiceQuestionSpec;
            const enChoice = enQ as ChoiceQuestionSpec;
            const frOptionKeys = frChoice.options.map(o => o.key);
            const enOptionKeys = enChoice.options.map(o => o.key);
            expect(frOptionKeys).toEqual(enOptionKeys);
          }
        }
      }
    );

    it('définit les clés techniques en anglais pour chaque modèle', () => {
      const triage = getTemplateContent('triage', 'fr', () => 'id');
      expect(triage.questions.map(q => q.key)).toEqual(['request_type', 'urgency']);
      const triageChoice = triage.questions[0] as ChoiceQuestionSpec;
      expect(triageChoice.options.map(o => o.key)).toEqual([
        'billing',
        'support',
        'sales',
        'other',
      ]);

      const urgence = getTemplateContent('urgence', 'fr', () => 'id');
      expect(urgence.questions.map(q => q.key)).toEqual(['is_urgent', 'urgency_level']);

      const lead = getTemplateContent('lead', 'fr', () => 'id');
      expect(lead.questions.map(q => q.key)).toEqual([
        'is_sales_inquiry',
        'maturity',
        'is_decision_maker',
      ]);

      const avis = getTemplateContent('avis', 'fr', () => 'id');
      expect(avis.questions.map(q => q.key)).toEqual(['sentiment', 'topic', 'needs_reply']);
      const avisSentiment = avis.questions[0] as ChoiceQuestionSpec;
      expect(avisSentiment.options.map(o => o.key)).toEqual(['positive', 'neutral', 'negative']);
      const avisTopic = avis.questions[1] as ChoiceQuestionSpec;
      expect(avisTopic.options.map(o => o.key)).toEqual([
        'product',
        'delivery',
        'price',
        'customer_service',
        'other',
      ]);
    });
  });
});

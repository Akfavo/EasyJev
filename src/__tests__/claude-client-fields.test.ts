import { describe, it, expect } from 'vitest';
import {
  extractFieldsUsed,
  generateQuestionsFromDescription,
  buildSystemPrompt,
  buildUserMessage,
  SUBMIT_QUESTIONS_TOOL,
} from '@/modules/claude-client';
import type { SpecField } from '@/modules/spec';

const fields: SpecField[] = [
  { id: 'a', name: 'game' },
  { id: 'b', name: 'publisher' },
  { id: 'c', name: 'total_reviews' },
];

describe('fields_used — champs jugés utiles par Claude', () => {
  it('extractFieldsUsed ne garde que les champs fournis, sans doublon, dans l’ordre fourni', () => {
    expect(
      extractFieldsUsed({ fields_used: ['publisher', 'inconnu', 'game', 'game', 42] }, fields)
    ).toEqual(['game', 'publisher']);
  });

  it('extractFieldsUsed renvoie une liste vide si la valeur est absente ou invalide', () => {
    expect(extractFieldsUsed({}, fields)).toEqual([]);
    expect(extractFieldsUsed({ fields_used: 'game' }, fields)).toEqual([]);
    expect(extractFieldsUsed(null, fields)).toEqual([]);
  });

  it('le schéma de l’outil déclare fields_used sans le rendre obligatoire', () => {
    expect(SUBMIT_QUESTIONS_TOOL.input_schema.properties.fields_used.type).toBe('array');
    expect(SUBMIT_QUESTIONS_TOOL.input_schema.required).toEqual(['questions']);
  });

  it('le prompt demande de choisir les champs utiles quand plusieurs champs sont fournis', () => {
    expect(buildSystemPrompt()).toContain('fields_used');
    expect(buildUserMessage({ description: 'Classer des jeux', fields })).toContain('fields_used');
    expect(
      buildUserMessage({ description: 'Classer des jeux', fields: [fields[0]!] })
    ).not.toContain('Several fields are available');
  });

  it('le client renvoie fieldsUsed à partir de la réponse de Claude', async () => {
    const body = {
      content: [
        {
          type: 'tool_use',
          id: 't1',
          name: 'submit_questions',
          input: {
            fields_used: ['publisher', 'game'],
            questions: [
              {
                key: 'is_mainstream',
                type: 'noul',
                instructions: 'Le jeu `game` de `publisher` vise-t-il le grand public ?',
              },
            ],
          },
        },
      ],
      stop_reason: 'tool_use',
      usage: { input_tokens: 100, output_tokens: 20 },
    };
    const fakeFetch = (async () =>
      ({ ok: true, status: 200, json: async () => body, text: async () => '' }) as unknown as Response) as typeof fetch;
    let counter = 0;
    const result = await generateQuestionsFromDescription(
      { apiKey: 'sk-ant-test', description: 'Classer des jeux selon leur public', fields },
      { fetch: fakeFetch, makeId: () => `id-${++counter}` }
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fieldsUsed).toEqual(['game', 'publisher']);
      expect(result.questions).toHaveLength(1);
    }
  });
});

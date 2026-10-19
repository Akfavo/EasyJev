import { describe, expect, it } from 'vitest';
import type { EasyJevSpec } from '../modules/spec';
import { validateSpec } from '../modules/validators';

function createBaseValidSpec(): EasyJevSpec {
  return {
    fields: [{ id: 'f1', name: 'message' }],
    questions: [
      {
        id: 'q1',
        key: 'is_urgent',
        label: 'Urgence',
        instructions: 'Le message est-il urgent ?',
        type: 'noul',
      },
    ],
    target: { provider: 'typesafe', model: 'jev-latest' },
    outputMode: 'n8n-expression',
  };
}

describe('module validators - validateSpec par tables', () => {
  it('valide une spec complètement conforme sans erreur ni avertissement', () => {
    const spec = createBaseValidSpec();
    const result = validateSpec(spec);

    expect(result.isValid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  describe('Validation des champs', () => {
    it.each([
      {
        description: 'déclenche NO_FIELDS si fields est vide',
        modify: (spec: EasyJevSpec) => {
          spec.fields = [];
        },
        expectedCode: 'NO_FIELDS',
        shouldTrigger: true,
      },
      {
        description: 'ne déclenche pas NO_FIELDS si au moins un champ est présent',
        modify: (spec: EasyJevSpec) => {
          spec.fields = [{ id: 'f1', name: 'message' }];
        },
        expectedCode: 'NO_FIELDS',
        shouldTrigger: false,
      },
      {
        description: 'déclenche FIELD_NAME_INVALID pour nom avec espace',
        modify: (spec: EasyJevSpec) => {
          spec.fields = [{ id: 'f1', name: 'mon message' }];
        },
        expectedCode: 'FIELD_NAME_INVALID',
        shouldTrigger: true,
      },
      {
        description: 'déclenche FIELD_NAME_INVALID pour identifiant interdit __proto__',
        modify: (spec: EasyJevSpec) => {
          spec.fields = [{ id: 'f1', name: '__proto__' }];
        },
        expectedCode: 'FIELD_NAME_INVALID',
        shouldTrigger: true,
      },
      {
        description: 'ne déclenche pas FIELD_NAME_INVALID pour nom ASCII avec underscore',
        modify: (spec: EasyJevSpec) => {
          spec.fields = [{ id: 'f1', name: 'user_message_1' }];
        },
        expectedCode: 'FIELD_NAME_INVALID',
        shouldTrigger: false,
      },
      {
        description: 'déclenche FIELD_NAME_DUPLICATE pour deux champs portant le même nom',
        modify: (spec: EasyJevSpec) => {
          spec.fields = [
            { id: 'f1', name: 'message' },
            { id: 'f2', name: 'message' },
          ];
        },
        expectedCode: 'FIELD_NAME_DUPLICATE',
        shouldTrigger: true,
      },
      {
        description: 'ne déclenche pas FIELD_NAME_DUPLICATE pour deux champs avec noms différents',
        modify: (spec: EasyJevSpec) => {
          spec.fields = [
            { id: 'f1', name: 'objet' },
            { id: 'f2', name: 'message' },
          ];
          spec.questions[0]!.instructions = 'Le `message` et `objet` sont-ils urgents ?';
        },
        expectedCode: 'FIELD_NAME_DUPLICATE',
        shouldTrigger: false,
      },
    ])('$description', ({ modify, expectedCode, shouldTrigger }) => {
      const spec = createBaseValidSpec();
      modify(spec);
      const result = validateSpec(spec);
      const hasCode = result.issues.some(issue => issue.code === expectedCode);
      expect(hasCode).toBe(shouldTrigger);
    });
  });

  describe('Validation des questions', () => {
    it.each([
      {
        description: 'déclenche NO_QUESTIONS si questions est vide',
        modify: (spec: EasyJevSpec) => {
          spec.questions = [];
        },
        expectedCode: 'NO_QUESTIONS',
        shouldTrigger: true,
      },
      {
        description: 'ne déclenche pas NO_QUESTIONS si une question est présente',
        modify: () => {},
        expectedCode: 'NO_QUESTIONS',
        shouldTrigger: false,
      },
      {
        description: 'déclenche QUESTION_KEY_INVALID pour clé commençant par un chiffre',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0]!.key = '1_question';
        },
        expectedCode: 'QUESTION_KEY_INVALID',
        shouldTrigger: true,
      },
      {
        description: 'déclenche QUESTION_KEY_INVALID pour nom réservé constructor',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0]!.key = 'constructor';
        },
        expectedCode: 'QUESTION_KEY_INVALID',
        shouldTrigger: true,
      },
      {
        description: 'ne déclenche pas QUESTION_KEY_INVALID pour clé valide',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0]!.key = 'q_1_valide';
        },
        expectedCode: 'QUESTION_KEY_INVALID',
        shouldTrigger: false,
      },
      {
        description: 'déclenche QUESTION_KEY_DUPLICATE si deux questions ont la même clé',
        modify: (spec: EasyJevSpec) => {
          spec.questions = [
            { id: 'q1', key: 'urgent', label: 'Q1', instructions: 'Test 1', type: 'noul' },
            { id: 'q2', key: 'urgent', label: 'Q2', instructions: 'Test 2', type: 'noul' },
          ];
        },
        expectedCode: 'QUESTION_KEY_DUPLICATE',
        shouldTrigger: true,
      },
      {
        description: 'ne déclenche pas QUESTION_KEY_DUPLICATE si les clés sont distinctes',
        modify: (spec: EasyJevSpec) => {
          spec.questions = [
            { id: 'q1', key: 'urgent_1', label: 'Q1', instructions: 'Test 1', type: 'noul' },
            { id: 'q2', key: 'urgent_2', label: 'Q2', instructions: 'Test 2', type: 'noul' },
          ];
        },
        expectedCode: 'QUESTION_KEY_DUPLICATE',
        shouldTrigger: false,
      },
      {
        description: 'déclenche QUESTION_INSTRUCTIONS_EMPTY si les instructions ne contiennent que des espaces',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0]!.instructions = '   ';
        },
        expectedCode: 'QUESTION_INSTRUCTIONS_EMPTY',
        shouldTrigger: true,
      },
      {
        description: 'ne déclenche pas QUESTION_INSTRUCTIONS_EMPTY si les instructions sont renseignées',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0]!.instructions = 'Instructions valides';
        },
        expectedCode: 'QUESTION_INSTRUCTIONS_EMPTY',
        shouldTrigger: false,
      },
    ])('$description', ({ modify, expectedCode, shouldTrigger }) => {
      const spec = createBaseValidSpec();
      modify(spec);
      const result = validateSpec(spec);
      const hasCode = result.issues.some(issue => issue.code === expectedCode);
      expect(hasCode).toBe(shouldTrigger);
    });
  });

  describe('Validation des questions de type choice', () => {
    it.each([
      {
        description: 'déclenche CHOICE_OPTIONS_TOO_FEW si moins de 2 options',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0] = {
            id: 'q_choice',
            key: 'category',
            label: 'Catégorie',
            instructions: 'Catégoriser le message',
            type: 'choice',
            options: [{ key: 'support' }],
          };
        },
        expectedCode: 'CHOICE_OPTIONS_TOO_FEW',
        shouldTrigger: true,
      },
      {
        description: 'ne déclenche pas CHOICE_OPTIONS_TOO_FEW si 2 options exactement',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0] = {
            id: 'q_choice',
            key: 'category',
            label: 'Catégorie',
            instructions: 'Catégoriser le message',
            type: 'choice',
            options: [{ key: 'support' }, { key: 'vente' }],
          };
        },
        expectedCode: 'CHOICE_OPTIONS_TOO_FEW',
        shouldTrigger: false,
      },
      {
        description: 'déclenche CHOICE_OPTIONS_TOO_MANY si plus de 255 options',
        modify: (spec: EasyJevSpec) => {
          const options = Array.from({ length: 256 }, (_, i) => ({ key: `opt_${i}` }));
          spec.questions[0] = {
            id: 'q_choice',
            key: 'category',
            label: 'Catégorie',
            instructions: 'Catégoriser le message',
            type: 'choice',
            options,
          };
        },
        expectedCode: 'CHOICE_OPTIONS_TOO_MANY',
        shouldTrigger: true,
      },
      {
        description: 'ne déclenche pas CHOICE_OPTIONS_TOO_MANY si 255 options exactement',
        modify: (spec: EasyJevSpec) => {
          const options = Array.from({ length: 255 }, (_, i) => ({ key: `opt_${i}` }));
          spec.questions[0] = {
            id: 'q_choice',
            key: 'category',
            label: 'Catégorie',
            instructions: 'Catégoriser le message',
            type: 'choice',
            options,
          };
        },
        expectedCode: 'CHOICE_OPTIONS_TOO_MANY',
        shouldTrigger: false,
      },
      {
        description: 'déclenche CHOICE_OPTIONS_TOO_FEW si une seule option est nommée',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0] = {
            id: 'q_choice',
            key: 'category',
            label: 'Catégorie',
            instructions: 'Catégoriser le message',
            type: 'choice',
            options: [{ key: 'support' }, { key: '   ' }],
          };
        },
        expectedCode: 'CHOICE_OPTIONS_TOO_FEW',
        shouldTrigger: true,
      },
      {
        description: 'déclenche CHOICE_OPTION_KEY_EMPTY si une option a une clé vide',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0] = {
            id: 'q_choice',
            key: 'category',
            label: 'Catégorie',
            instructions: 'Catégoriser le message',
            type: 'choice',
            options: [{ key: 'support' }, { key: '   ' }],
          };
        },
        expectedCode: 'CHOICE_OPTION_KEY_EMPTY',
        shouldTrigger: true,
      },
      {
        description: 'ne déclenche pas CHOICE_OPTION_KEY_EMPTY si toutes les options ont une clé non vide',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0] = {
            id: 'q_choice',
            key: 'category',
            label: 'Catégorie',
            instructions: 'Catégoriser le message',
            type: 'choice',
            options: [{ key: 'support' }, { key: 'vente' }],
          };
        },
        expectedCode: 'CHOICE_OPTION_KEY_EMPTY',
        shouldTrigger: false,
      },
      {
        description: 'déclenche CHOICE_OPTION_DUPLICATE si deux options partagent la même clé',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0] = {
            id: 'q_choice',
            key: 'category',
            label: 'Catégorie',
            instructions: 'Catégoriser le message',
            type: 'choice',
            options: [{ key: 'support' }, { key: 'support' }],
          };
        },
        expectedCode: 'CHOICE_OPTION_DUPLICATE',
        shouldTrigger: true,
      },
      {
        description: 'ne déclenche pas CHOICE_OPTION_DUPLICATE si les options ont des clés distinctes',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0] = {
            id: 'q_choice',
            key: 'category',
            label: 'Catégorie',
            instructions: 'Catégoriser le message',
            type: 'choice',
            options: [{ key: 'support' }, { key: 'vente' }],
          };
        },
        expectedCode: 'CHOICE_OPTION_DUPLICATE',
        shouldTrigger: false,
      },
    ])('$description', ({ modify, expectedCode, shouldTrigger }) => {
      const spec = createBaseValidSpec();
      modify(spec);
      const result = validateSpec(spec);
      const hasCode = result.issues.some(issue => issue.code === expectedCode);
      expect(hasCode).toBe(shouldTrigger);
    });
  });

  describe('Validation des questions de type score', () => {
    it.each([
      {
        description: 'déclenche SCORE_LEVELS_OUT_OF_RANGE si moins de 2 niveaux non vides',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0] = {
            id: 'q_score',
            key: 'note',
            label: 'Note',
            instructions: 'Évaluer la sévérité',
            type: 'score',
            levels: ['Faible'],
          };
        },
        expectedCode: 'SCORE_LEVELS_OUT_OF_RANGE',
        shouldTrigger: true,
      },
      {
        description: 'ne déclenche pas SCORE_LEVELS_OUT_OF_RANGE pour 2 niveaux non vides',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0] = {
            id: 'q_score',
            key: 'note',
            label: 'Note',
            instructions: 'Évaluer la sévérité',
            type: 'score',
            levels: ['Faible', 'Élevé'],
          };
        },
        expectedCode: 'SCORE_LEVELS_OUT_OF_RANGE',
        shouldTrigger: false,
      },
      {
        description: 'déclenche SCORE_LEVELS_OUT_OF_RANGE si plus de 10 niveaux non vides',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0] = {
            id: 'q_score',
            key: 'note',
            label: 'Note',
            instructions: 'Évaluer la sévérité',
            type: 'score',
            levels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
          };
        },
        expectedCode: 'SCORE_LEVELS_OUT_OF_RANGE',
        shouldTrigger: true,
      },
      {
        description: 'ne déclenche pas SCORE_LEVELS_OUT_OF_RANGE avec exactement 10 niveaux non vides',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0] = {
            id: 'q_score',
            key: 'note',
            label: 'Note',
            instructions: 'Évaluer la sévérité',
            type: 'score',
            levels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
          };
        },
        expectedCode: 'SCORE_LEVELS_OUT_OF_RANGE',
        shouldTrigger: false,
      },
      {
        description: 'déclenche SCORE_LEVEL_EMPTY si un niveau est vide',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0] = {
            id: 'q_score',
            key: 'note',
            label: 'Note',
            instructions: 'Évaluer la sévérité',
            type: 'score',
            levels: ['Faible', '   ', 'Élevé'],
          };
        },
        expectedCode: 'SCORE_LEVEL_EMPTY',
        shouldTrigger: true,
      },
      {
        description: 'ne déclenche pas SCORE_LEVEL_EMPTY si tous les niveaux sont renseignés',
        modify: (spec: EasyJevSpec) => {
          spec.questions[0] = {
            id: 'q_score',
            key: 'note',
            label: 'Note',
            instructions: 'Évaluer la sévérité',
            type: 'score',
            levels: ['Faible', 'Moyen', 'Élevé'],
          };
        },
        expectedCode: 'SCORE_LEVEL_EMPTY',
        shouldTrigger: false,
      },
    ])('$description', ({ modify, expectedCode, shouldTrigger }) => {
      const spec = createBaseValidSpec();
      modify(spec);
      const result = validateSpec(spec);
      const hasCode = result.issues.some(issue => issue.code === expectedCode);
      expect(hasCode).toBe(shouldTrigger);
    });
  });

  describe('Avertissements (warnings)', () => {
    it('déclenche QUESTION_NO_FIELD_CITED si plusieurs champs existent et aucun n’est cité entre accents graves', () => {
      const spec = createBaseValidSpec();
      spec.fields = [
        { id: 'f1', name: 'objet' },
        { id: 'f2', name: 'message' },
      ];
      spec.questions[0]!.instructions = 'Le texte est-il urgent ?'; // Pas d'accents graves

      const result = validateSpec(spec);
      expect(result.isValid).toBe(true); // C'est un avertissement, pas une erreur bloquante
      const warning = result.issues.find(i => i.code === 'QUESTION_NO_FIELD_CITED');
      expect(warning).toBeDefined();
      expect(warning?.severity).toBe('warning');
    });

    it('ne déclenche pas QUESTION_NO_FIELD_CITED s’il n’y a qu’un seul champ', () => {
      const spec = createBaseValidSpec();
      spec.fields = [{ id: 'f1', name: 'message' }];
      spec.questions[0]!.instructions = 'Le texte est-il urgent ?';

      const result = validateSpec(spec);
      const warning = result.issues.find(i => i.code === 'QUESTION_NO_FIELD_CITED');
      expect(warning).toBeUndefined();
    });

    it('ne déclenche pas QUESTION_NO_FIELD_CITED si au moins un champ est cité', () => {
      const spec = createBaseValidSpec();
      spec.fields = [
        { id: 'f1', name: 'objet' },
        { id: 'f2', name: 'message' },
      ];
      spec.questions[0]!.instructions = 'Le `message` est-il urgent ?';

      const result = validateSpec(spec);
      const warning = result.issues.find(i => i.code === 'QUESTION_NO_FIELD_CITED');
      expect(warning).toBeUndefined();
    });

    it('déclenche à la fois QUESTION_NO_FIELD_CITED et QUESTION_CITES_UNKNOWN_FIELD si la question ne cite qu’un nom inconnu avec plusieurs champs', () => {
      const spec = createBaseValidSpec();
      spec.fields = [
        { id: 'f1', name: 'objet' },
        { id: 'f2', name: 'message' },
      ];
      spec.questions[0]!.instructions = 'Le champ `champ_inexistant` est-il urgent ?';

      const result = validateSpec(spec);
      expect(result.isValid).toBe(true);

      const noFieldCited = result.issues.find(i => i.code === 'QUESTION_NO_FIELD_CITED');
      expect(noFieldCited).toBeDefined();

      const unknownFieldCited = result.issues.find(i => i.code === 'QUESTION_CITES_UNKNOWN_FIELD');
      expect(unknownFieldCited).toBeDefined();
      expect(unknownFieldCited?.params?.['fieldName']).toBe('champ_inexistant');
    });

    it('déclenche QUESTION_CITES_UNKNOWN_FIELD si un nom cité entre accents graves n’existe pas', () => {
      const spec = createBaseValidSpec();
      spec.fields = [{ id: 'f1', name: 'message' }];
      spec.questions[0]!.instructions = 'Le `texte_inconnu` exprime-t-il une urgence ?';

      const result = validateSpec(spec);
      expect(result.isValid).toBe(true);
      const warning = result.issues.find(i => i.code === 'QUESTION_CITES_UNKNOWN_FIELD');
      expect(warning).toBeDefined();
      expect(warning?.severity).toBe('warning');
      expect(warning?.params?.['fieldName']).toBe('texte_inconnu');
    });

    it('produit un seul avertissement QUESTION_CITES_UNKNOWN_FIELD si le même nom inconnu est cité deux fois', () => {
      const spec = createBaseValidSpec();
      spec.fields = [{ id: 'f1', name: 'message' }];
      spec.questions[0]!.instructions = 'Le `texte_inconnu` et encore `texte_inconnu` sont-ils urgents ?';

      const result = validateSpec(spec);
      const unknownWarnings = result.issues.filter(
        i => i.code === 'QUESTION_CITES_UNKNOWN_FIELD' && i.params?.['fieldName'] === 'texte_inconnu'
      );
      expect(unknownWarnings).toHaveLength(1);
    });

    it('ne déclenche pas QUESTION_CITES_UNKNOWN_FIELD si le nom cité existe', () => {
      const spec = createBaseValidSpec();
      spec.fields = [{ id: 'f1', name: 'message' }];
      spec.questions[0]!.instructions = 'Le `message` exprime-t-il une urgence ?';

      const result = validateSpec(spec);
      const warning = result.issues.find(i => i.code === 'QUESTION_CITES_UNKNOWN_FIELD');
      expect(warning).toBeUndefined();
    });
  });

  describe('Avertissement TEXT_CONTAINS_N8N_DELIMITERS', () => {
    it('déclenche TEXT_CONTAINS_N8N_DELIMITERS si instructions contient {{ ou }}', () => {
      const spec = createBaseValidSpec();
      spec.questions[0]!.instructions = 'Le {{ message }} est-il urgent ?';

      const result = validateSpec(spec);
      const warning = result.issues.find(i => i.code === 'TEXT_CONTAINS_N8N_DELIMITERS');
      expect(warning).toBeDefined();
      expect(warning?.severity).toBe('warning');
      expect(warning?.questionId).toBe('q1');
    });

    it('ne déclenche pas TEXT_CONTAINS_N8N_DELIMITERS si instructions contient de simples accolades { }', () => {
      const spec = createBaseValidSpec();
      spec.questions[0]!.instructions = 'Le { message } est-il urgent ?';

      const result = validateSpec(spec);
      const warning = result.issues.find(i => i.code === 'TEXT_CONTAINS_N8N_DELIMITERS');
      expect(warning).toBeUndefined();
    });

    it('déclenche TEXT_CONTAINS_N8N_DELIMITERS si une condition noul contient {{ ou }}', () => {
      const spec = createBaseValidSpec();
      spec.questions[0] = {
        id: 'q1',
        key: 'is_urgent',
        label: 'Urgence',
        instructions: 'Le message est-il urgent ?',
        type: 'noul',
        criteria: {
          trueCondition: 'Vrai si {{ urgent }}',
        },
      };

      const result = validateSpec(spec);
      const warning = result.issues.find(i => i.code === 'TEXT_CONTAINS_N8N_DELIMITERS');
      expect(warning).toBeDefined();
      expect(warning?.questionId).toBe('q1');
    });

    it('ne déclenche pas TEXT_CONTAINS_N8N_DELIMITERS si la condition noul ne contient pas {{ ou }}', () => {
      const spec = createBaseValidSpec();
      spec.questions[0] = {
        id: 'q1',
        key: 'is_urgent',
        label: 'Urgence',
        instructions: 'Le message est-il urgent ?',
        type: 'noul',
        criteria: {
          trueCondition: 'Vrai si { urgent }',
          falseCondition: 'Faux sinon',
        },
      };

      const result = validateSpec(spec);
      const warning = result.issues.find(i => i.code === 'TEXT_CONTAINS_N8N_DELIMITERS');
      expect(warning).toBeUndefined();
    });

    it('déclenche TEXT_CONTAINS_N8N_DELIMITERS si une clé ou description de choix contient {{ ou }}', () => {
      const spec = createBaseValidSpec();
      spec.questions[0] = {
        id: 'q1',
        key: 'category',
        label: 'Catégorie',
        instructions: 'Quelle est la catégorie ?',
        type: 'choice',
        options: [
          { key: 'support', description: 'Demande de support {{ technique }}' },
          { key: 'sales', description: 'Ventes' },
        ],
      };

      const result = validateSpec(spec);
      const warning = result.issues.find(i => i.code === 'TEXT_CONTAINS_N8N_DELIMITERS');
      expect(warning).toBeDefined();
      expect(warning?.questionId).toBe('q1');
    });

    it('ne déclenche pas TEXT_CONTAINS_N8N_DELIMITERS si les choix ont des accolades simples { }', () => {
      const spec = createBaseValidSpec();
      spec.questions[0] = {
        id: 'q1',
        key: 'category',
        label: 'Catégorie',
        instructions: 'Quelle est la catégorie ?',
        type: 'choice',
        options: [
          { key: 'support', description: 'Demande de support { technique }' },
          { key: 'sales', description: 'Ventes' },
        ],
      };

      const result = validateSpec(spec);
      const warning = result.issues.find(i => i.code === 'TEXT_CONTAINS_N8N_DELIMITERS');
      expect(warning).toBeUndefined();
    });

    it('déclenche TEXT_CONTAINS_N8N_DELIMITERS si un niveau de score contient {{ ou }}', () => {
      const spec = createBaseValidSpec();
      spec.questions[0] = {
        id: 'q1',
        key: 'score_q',
        label: 'Score',
        instructions: 'Évaluer la priorité',
        type: 'score',
        levels: ['Faible', 'Moyen }} critique', 'Élevé'],
      };

      const result = validateSpec(spec);
      const warning = result.issues.find(i => i.code === 'TEXT_CONTAINS_N8N_DELIMITERS');
      expect(warning).toBeDefined();
      expect(warning?.questionId).toBe('q1');
    });

    it('ne déclenche pas TEXT_CONTAINS_N8N_DELIMITERS si les niveaux de score ont des accolades simples { }', () => {
      const spec = createBaseValidSpec();
      spec.questions[0] = {
        id: 'q1',
        key: 'score_q',
        label: 'Score',
        instructions: 'Évaluer la priorité',
        type: 'score',
        levels: ['Faible', 'Moyen { critique }', 'Élevé'],
      };

      const result = validateSpec(spec);
      const warning = result.issues.find(i => i.code === 'TEXT_CONTAINS_N8N_DELIMITERS');
      expect(warning).toBeUndefined();
    });

    it('ne déclenche aucun avertissement TEXT_CONTAINS_N8N_DELIMITERS en mode example-text', () => {
      const spec = createBaseValidSpec();
      spec.outputMode = 'example-text';
      spec.questions[0]!.instructions = 'Le {{ message }} avec {{ délimiteurs }} est-il urgent ?';

      const result = validateSpec(spec);
      const warning = result.issues.find(i => i.code === 'TEXT_CONTAINS_N8N_DELIMITERS');
      expect(warning).toBeUndefined();
    });

    it('ne produit qu’un seul avertissement par question même si plusieurs emplacements contiennent des délimiteurs', () => {
      const spec = createBaseValidSpec();
      spec.questions[0] = {
        id: 'q1',
        key: 'is_urgent',
        label: 'Urgence',
        instructions: 'Instructions avec {{ a }} et }} b {{',
        type: 'noul',
        criteria: {
          trueCondition: 'Vrai avec {{ c }}',
          falseCondition: 'Faux avec {{ d }}',
        },
      };

      const result = validateSpec(spec);
      const warnings = result.issues.filter(
        i => i.code === 'TEXT_CONTAINS_N8N_DELIMITERS' && i.questionId === 'q1'
      );
      expect(warnings).toHaveLength(1);
    });

    it('ne déclenche pas TEXT_CONTAINS_N8N_DELIMITERS si seules les valeurs d’exemple de champ contiennent {{ ou }}', () => {
      const spec = createBaseValidSpec();
      spec.fields[0]!.exampleValue = 'Exemple avec {{ champ }} dans la valeur';
      spec.questions[0]!.instructions = 'Instructions normales sans délimiteurs';

      const result = validateSpec(spec);
      const warning = result.issues.find(i => i.code === 'TEXT_CONTAINS_N8N_DELIMITERS');
      expect(warning).toBeUndefined();
    });
  });
});

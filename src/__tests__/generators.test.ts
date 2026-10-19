import { describe, expect, it } from 'vitest';
import { createDefaultSpec, type EasyJevSpec } from '../modules/spec';
import { generateJevOutput, generateN8nExpressions, InvalidSpecError } from '../modules/generators';

describe('module generators - generateJevOutput', () => {
  it('génère un JSON exact pour un seul champ en mode n8n-expression', () => {
    const spec: EasyJevSpec = {
      fields: [{ id: 'f1', name: 'message' }],
      questions: [
        {
          id: 'q1',
          key: 'urgent',
          label: 'Urgence',
          instructions: 'Le message est-il urgent ?',
          type: 'noul',
        },
      ],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'n8n-expression',
    };

    const output = generateJevOutput(spec);

    const expectedJson = [
      '{',
      '  "state": {{ JSON.stringify($json.message) }},',
      '  "model": "jev-latest",',
      '  "questions": {',
      '    "urgent": {',
      '      "type": "noul",',
      '      "instructions": "Le message est-il urgent ?"',
      '    }',
      '  }',
      '}',
    ].join('\n');

    expect(output.jsonString).toBe(expectedJson);
    expect(output.endpointUrl).toBe('https://api.typesafe.ai/v1/systemone');
    expect(output.authHeaderPrefix).toBe('Bearer ');
    expect(output.rawObject.model).toBe('jev-latest');
    expect(typeof output.rawObject.state).toBe('string');
  });

  it('génère un JSON exact pour deux champs en mode n8n-expression', () => {
    const spec: EasyJevSpec = {
      fields: [
        { id: 'f1', name: 'objet' },
        { id: 'f2', name: 'corps' },
      ],
      questions: [
        {
          id: 'q1',
          key: 'urgent',
          label: 'Urgence',
          instructions: 'Le `corps` et `objet` sont-ils urgents ?',
          type: 'noul',
        },
      ],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'n8n-expression',
    };

    const output = generateJevOutput(spec);

    const expectedJson = [
      '{',
      '  "state": {',
      '    "objet": {{ JSON.stringify($json.objet) }},',
      '    "corps": {{ JSON.stringify($json.corps) }}',
      '  },',
      '  "model": "jev-latest",',
      '  "questions": {',
      '    "urgent": {',
      '      "type": "noul",',
      '      "instructions": "Le `corps` et `objet` sont-ils urgents ?"',
      '    }',
      '  }',
      '}',
    ].join('\n');

    expect(output.jsonString).toBe(expectedJson);
    expect(typeof output.rawObject.state).toBe('object');
    expect(Object.keys(output.rawObject.state)).toEqual(['objet', 'corps']);
  });

  it('génère un JSON strictement valide en mode example-text pour un champ', () => {
    const spec: EasyJevSpec = {
      fields: [{ id: 'f1', name: 'message', exampleValue: 'Bonjour le support !' }],
      questions: [
        {
          id: 'q1',
          key: 'urgent',
          label: 'Urgence',
          instructions: 'Le message est-il urgent ?',
          type: 'noul',
        },
      ],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'example-text',
    };

    const output = generateJevOutput(spec);

    const expectedJson = [
      '{',
      '  "state": "Bonjour le support !",',
      '  "model": "jev-latest",',
      '  "questions": {',
      '    "urgent": {',
      '      "type": "noul",',
      '      "instructions": "Le message est-il urgent ?"',
      '    }',
      '  }',
      '}',
    ].join('\n');

    expect(output.jsonString).toBe(expectedJson);
    expect(JSON.parse(output.jsonString)).toEqual(output.rawObject);
  });

  it('génère un JSON strictement valide en mode example-text pour deux champs', () => {
    const spec: EasyJevSpec = {
      fields: [
        { id: 'f1', name: 'objet', exampleValue: 'Facture' },
        { id: 'f2', name: 'corps', exampleValue: 'Veuillez trouver ci-joint.' },
      ],
      questions: [
        {
          id: 'q1',
          key: 'urgent',
          label: 'Urgence',
          instructions: 'Le `corps` et `objet` sont-ils urgents ?',
          type: 'noul',
        },
      ],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'example-text',
    };

    const output = generateJevOutput(spec);

    const expectedJson = [
      '{',
      '  "state": {',
      '    "objet": "Facture",',
      '    "corps": "Veuillez trouver ci-joint."',
      '  },',
      '  "model": "jev-latest",',
      '  "questions": {',
      '    "urgent": {',
      '      "type": "noul",',
      '      "instructions": "Le `corps` et `objet` sont-ils urgents ?"',
      '    }',
      '  }',
      '}',
    ].join('\n');

    expect(output.jsonString).toBe(expectedJson);
    expect(JSON.parse(output.jsonString)).toEqual(output.rawObject);
  });

  it('génère l’URL et le modèle appropriés pour la cible vercel-gateway', () => {
    const spec: EasyJevSpec = {
      fields: [{ id: 'f1', name: 'message', exampleValue: 'Hello' }],
      questions: [
        {
          id: 'q1',
          key: 'salut',
          label: 'Salutation',
          instructions: 'Le message est-il une salutation ?',
          type: 'noul',
        },
      ],
      target: { provider: 'vercel-gateway', model: 'typesafe-ai/jev' },
      outputMode: 'example-text',
    };

    const output = generateJevOutput(spec);

    expect(output.endpointUrl).toBe('https://ai-gateway.vercel.sh/typesafe/v1/systemone');
    expect(output.authHeaderPrefix).toBe('Bearer ');
    expect(output.rawObject.model).toBe('typesafe-ai/jev');

    const expectedJson = [
      '{',
      '  "state": "Hello",',
      '  "model": "typesafe-ai/jev",',
      '  "questions": {',
      '    "salut": {',
      '      "type": "noul",',
      '      "instructions": "Le message est-il une salutation ?"',
      '    }',
      '  }',
      '}',
    ].join('\n');

    expect(output.jsonString).toBe(expectedJson);
  });

  it('génère fidèlement chaque type de question (noul sans/avec conditions, choice avec description/null, score)', () => {
    const spec: EasyJevSpec = {
      fields: [{ id: 'f1', name: 'message' }],
      questions: [
        {
          id: 'q1',
          key: 'noul_simple',
          label: 'Oui / Non simple',
          instructions: 'Est-ce clair ?',
          type: 'noul',
        },
        {
          id: 'q2',
          key: 'noul_avec_cond',
          label: 'Oui / Non conditionné',
          instructions: 'Est-ce prioritaire ?',
          type: 'noul',
          criteria: {
            trueCondition: 'Demande urgente de niveau 1',
            falseCondition: 'Demande standard',
          },
        },
        {
          id: 'q3',
          key: 'choix_cat',
          label: 'Catégorie',
          instructions: 'Classifier le message',
          type: 'choice',
          options: [
            { key: 'support', description: 'Assistance technique' },
            { key: 'autre' }, // description absente -> null
          ],
        },
        {
          id: 'q4',
          key: 'note_gravite',
          label: 'Gravité',
          instructions: 'Évaluer la sévérité',
          type: 'score',
          levels: [' Faible ', 'Moyenne', ' Élevée '],
        },
      ],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'example-text',
    };

    const output = generateJevOutput(spec);

    const expectedJson = [
      '{',
      '  "state": "",',
      '  "model": "jev-latest",',
      '  "questions": {',
      '    "noul_simple": {',
      '      "type": "noul",',
      '      "instructions": "Est-ce clair ?"',
      '    },',
      '    "noul_avec_cond": {',
      '      "type": "noul",',
      '      "instructions": "Est-ce prioritaire ?",',
      '      "criteria": {',
      '        "true": "Demande urgente de niveau 1",',
      '        "false": "Demande standard"',
      '      }',
      '    },',
      '    "choix_cat": {',
      '      "type": "choice",',
      '      "instructions": "Classifier le message",',
      '      "criteria": {',
      '        "support": "Assistance technique",',
      '        "autre": null',
      '      }',
      '    },',
      '    "note_gravite": {',
      '      "type": "score",',
      '      "instructions": "Évaluer la sévérité",',
      '      "criteria": [',
      '        "Faible",',
      '        "Moyenne",',
      '        "Élevée"',
      '      ]',
      '    }',
      '  }',
      '}',
    ].join('\n');

    expect(output.jsonString).toBe(expectedJson);
    expect(JSON.parse(output.jsonString)).toEqual(output.rawObject);
  });

  it('permet de parser en JSON valide une fois les expressions n8n remplacées par une chaîne quelconque', () => {
    const spec: EasyJevSpec = {
      fields: [
        { id: 'f1', name: 'objet' },
        { id: 'f2', name: 'message' },
      ],
      questions: [
        {
          id: 'q1',
          key: 'test',
          label: 'Test',
          instructions: 'Le `objet` et `message` sont-ils valides ?',
          type: 'noul',
        },
      ],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'n8n-expression',
    };

    const output = generateJevOutput(spec);

    // Remplace les expressions {{ ... }} non entourées de guillemets par une valeur JSON valide (ex: "valeur_simulee")
    const validJsonString = output.jsonString.replace(
      /\{\{\s*JSON\.stringify\([^)]+\)\s*\}\}/g,
      '"valeur_simulee"'
    );

    const parsed = JSON.parse(validJsonString);
    expect(parsed).toEqual({
      state: {
        objet: 'valeur_simulee',
        message: 'valeur_simulee',
      },
      model: 'jev-latest',
      questions: {
        test: {
          type: 'noul',
          instructions: 'Le `objet` et `message` sont-ils valides ?',
        },
      },
    });
  });

  it('lève InvalidSpecError pour une spec invalide et génère normalement pour une spec avec avertissements seuls', () => {
    // 1. Spec invalide (sans questions)
    const invalidSpec: EasyJevSpec = {
      fields: [{ id: 'f1', name: 'message' }],
      questions: [],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'n8n-expression',
    };

    expect(() => generateJevOutput(invalidSpec)).toThrow(InvalidSpecError);

    try {
      generateJevOutput(invalidSpec);
    } catch (err) {
      expect(err).toBeInstanceOf(InvalidSpecError);
      if (err instanceof InvalidSpecError) {
        expect(err.issues).toHaveLength(1);
        expect(err.issues[0]?.code).toBe('NO_QUESTIONS');
      }
    }

    // 2. Spec avec avertissements uniquement (plusieurs champs mais aucun cité dans la question)
    const warningSpec: EasyJevSpec = {
      fields: [
        { id: 'f1', name: 'objet' },
        { id: 'f2', name: 'message' },
      ],
      questions: [
        {
          id: 'q1',
          key: 'urgent',
          label: 'Urgence',
          instructions: 'Le texte est-il urgent ?', // aucun accent grave -> QUESTION_NO_FIELD_CITED
          type: 'noul',
        },
      ],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'n8n-expression',
    };

    expect(() => generateJevOutput(warningSpec)).not.toThrow();
    const output = generateJevOutput(warningSpec);
    expect(output.jsonString).toBeDefined();
    expect(output.rawObject.model).toBe('jev-latest');
  });

  it('conserve une option nommée __proto__ dans jsonString sans polluer le prototype', () => {
    const spec: EasyJevSpec = {
      fields: [{ id: 'f1', name: 'message' }],
      questions: [
        {
          id: 'q1',
          key: 'categories',
          label: 'Catégories',
          instructions: 'Classifier le message',
          type: 'choice',
          options: [
            { key: '__proto__', description: 'Option prototype' },
            { key: 'standard', description: 'Option standard' },
          ],
        },
      ],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'example-text',
    };

    const output = generateJevOutput(spec);

    expect(output.jsonString).toContain('"__proto__": "Option prototype"');
    const criteria = output.rawObject.questions['categories']?.criteria;
    expect(criteria).toBeDefined();
    expect(Object.prototype.hasOwnProperty.call(criteria, '__proto__')).toBe(true);
  });

  it('préserve les caractères spéciaux (guillemets, retours à la ligne, accents graves, accents, emoji)', () => {
    const specialInstructions = 'L\'expéditeur dit :\n"Urgent !" `message` éàù 🚀';
    const specialDescription = 'Description avec "quotes", \n retours et emoji 🎯';
    const specialExample = 'Exemple "citant" avec \n saut de ligne et ✨';

    const spec: EasyJevSpec = {
      fields: [{ id: 'f1', name: 'message', exampleValue: specialExample }],
      questions: [
        {
          id: 'q1',
          key: 'choix',
          label: 'Choix',
          instructions: specialInstructions,
          type: 'choice',
          options: [
            { key: 'opt_1', description: specialDescription },
            { key: 'opt_2' },
          ],
        },
      ],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'example-text',
    };

    const output = generateJevOutput(spec);

    expect(output.rawObject.state).toBe(specialExample);
    expect(output.rawObject.questions['choix']?.instructions).toBe(specialInstructions);

    // jsonString est un JSON valide qui conserve fidèlement les caractères après désérialisation
    const parsed = JSON.parse(output.jsonString);
    expect(parsed.state).toBe(specialExample);
    expect(parsed.questions.choix.instructions).toBe(specialInstructions);
    expect(parsed.questions.choix.criteria.opt_1).toBe(specialDescription);
  });

  it('ne déclenche aucun remplacement pour un texte utilisateur ressemblant à un marqueur', () => {
    const fakeMarker = '@@EASYJEV_EXPR_fake_message@@';
    const fakeExpr = '{{ JSON.stringify($json.fake) }}';
    const trickyInstructions = `Attention : ne pas confondre avec ${fakeMarker} ou ${fakeExpr} !`;

    const spec: EasyJevSpec = {
      fields: [{ id: 'f1', name: 'message' }],
      questions: [
        {
          id: 'q1',
          key: 'verification',
          label: 'Vérification',
          instructions: trickyInstructions,
          type: 'noul',
        },
      ],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'n8n-expression',
    };

    const output = generateJevOutput(spec);

    // Le texte des instructions doit être strictement intact dans jsonString
    expect(output.jsonString).toContain(
      `"instructions": "Attention : ne pas confondre avec ${fakeMarker} ou ${fakeExpr} !"`
    );
    expect(output.rawObject.questions['verification']?.instructions).toBe(trickyInstructions);
  });

  it('insère telle quelle l’expression n8n sans altération par les motifs spéciaux ($1, $&, $$, $\')', () => {
    const spec: EasyJevSpec = {
      fields: [{ id: 'f1', name: 'champ_special' }],
      questions: [
        {
          id: 'q1',
          key: 'check',
          label: 'Vérification',
          instructions: 'Analyser `champ_special`',
          type: 'noul',
        },
      ],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'n8n-expression',
    };

    const output = generateJevOutput(spec);
    // L'expression n8n contenant $json doit être insérée strictement telle quelle
    expect(output.jsonString).toContain('"state": {{ JSON.stringify($json.champ_special) }}');
  });
});

describe('module generators - generateN8nExpressions', () => {
  it('génère les expressions n8n exactes pour les trois types de questions', () => {
    const spec: EasyJevSpec = {
      fields: [{ id: 'f1', name: 'message' }],
      questions: [
        {
          id: 'q1',
          key: 'is_urgent',
          label: 'Urgence',
          instructions: 'Urgent ?',
          type: 'noul',
        },
        {
          id: 'q2',
          key: 'categorie',
          label: 'Catégorie',
          instructions: 'Catégorie ?',
          type: 'choice',
          options: [{ key: 'support' }, { key: 'autre' }],
        },
        {
          id: 'q3',
          key: 'gravite',
          label: 'Gravité',
          instructions: 'Gravité ?',
          type: 'score',
          levels: ['Faible', 'Moyenne', 'Élevée'],
        },
      ],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'n8n-expression',
    };

    const expressions = generateN8nExpressions(spec);

    expect(expressions).toEqual({
      byQuestionKey: {
        is_urgent: {
          primaryPath: '{{ $json.answers.is_urgent.noul }}',
          secondaryPaths: {
            yesNo: "{{ $json.answers.is_urgent.noul > 0.5 ? 'Yes' : 'No' }}",
            yesMaybeNo:
              "{{ $json.answers.is_urgent.noul > 0.7 ? 'Yes' : ($json.answers.is_urgent.noul < 0.3 ? 'No' : 'Maybe') }}",
          },
        },
        categorie: {
          primaryPath: '{{ $json.answers.categorie.choice }}',
          secondaryPaths: {
            confidence: '{{ $json.answers.categorie.confidence }}',
          },
        },
        gravite: {
          primaryPath: '{{ $json.answers.gravite.score }}',
          secondaryPaths: {
            confidence: '{{ $json.answers.gravite.confidence }}',
          },
        },
      },
    });

    // Comparaisons exactes de chaînes individuelles
    expect(expressions.byQuestionKey['is_urgent']?.primaryPath).toBe(
      '{{ $json.answers.is_urgent.noul }}'
    );
    expect(Object.keys(expressions.byQuestionKey['is_urgent']?.secondaryPaths ?? {})).toEqual(['yesNo', 'yesMaybeNo']);

    expect(expressions.byQuestionKey['categorie']?.primaryPath).toBe(
      '{{ $json.answers.categorie.choice }}'
    );
    expect(expressions.byQuestionKey['categorie']?.secondaryPaths?.['confidence']).toBe(
      '{{ $json.answers.categorie.confidence }}'
    );

    expect(expressions.byQuestionKey['gravite']?.primaryPath).toBe(
      '{{ $json.answers.gravite.score }}'
    );
    expect(expressions.byQuestionKey['gravite']?.secondaryPaths?.['confidence']).toBe(
      '{{ $json.answers.gravite.confidence }}'
    );
  });

  it('lève InvalidSpecError si generateN8nExpressions est appelé avec une spec invalide', () => {
    const invalidSpec: EasyJevSpec = {
      fields: [],
      questions: [],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'n8n-expression',
    };

    expect(() => generateN8nExpressions(invalidSpec)).toThrow(InvalidSpecError);
  });
});

describe('module generators - generateN8nExpressions : oui/non en texte', () => {
  function noulSpec(): EasyJevSpec {
    return {
      ...createDefaultSpec(),
      questions: [
        {
          id: 'q1',
          key: 'is_popular',
          label: 'Populaire',
          type: 'noul',
          instructions: 'Le `message` est-il populaire ?',
        },
      ],
    };
  }

  it('utilise les libellés fournis par l’appelant (langue de l’interface)', () => {
    const result = generateN8nExpressions(noulSpec(), { yes: 'Oui', no: 'Non', maybe: 'Peut-être' });
    const entry = result.byQuestionKey['is_popular'];
    expect(entry?.secondaryPaths?.yesNo).toBe(
      "{{ $json.answers.is_popular.noul > 0.5 ? 'Oui' : 'Non' }}"
    );
    expect(entry?.secondaryPaths?.yesMaybeNo).toBe(
      "{{ $json.answers.is_popular.noul > 0.7 ? 'Oui' : ($json.answers.is_popular.noul < 0.3 ? 'Non' : 'Peut-être') }}"
    );
  });

  it('échappe une apostrophe dans un libellé', () => {
    const result = generateN8nExpressions(noulSpec(), { yes: "C'est oui", no: 'Non', maybe: 'Peut-être' });
    expect(result.byQuestionKey['is_popular']?.secondaryPaths?.yesNo).toContain("'C\\'est oui'");
  });

  it('ne change pas les expressions des questions choice et score', () => {
    const spec: EasyJevSpec = {
      ...createDefaultSpec(),
      questions: [
        {
          id: 'q1',
          key: 'genre',
          label: 'Genre',
          type: 'choice',
          instructions: 'Le genre du `message` ?',
          options: [{ key: 'rpg' }, { key: 'action' }],
        },
      ],
    };
    const entry = generateN8nExpressions(spec).byQuestionKey['genre'];
    expect(entry?.primaryPath).toBe('{{ $json.answers.genre.choice }}');
    expect(entry?.secondaryPaths).toEqual({ confidence: '{{ $json.answers.genre.confidence }}' });
  });
});

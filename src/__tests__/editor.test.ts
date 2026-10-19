import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  editorReducer,
  nextFieldName,
  insertCitation,
  tokenizeJson,
  hasUserContent,
  type EditorState,
  type EditorAction,
} from '@/modules/editor';
import { createDefaultSpec, type EasyJevSpec, type ChoiceQuestionSpec, type ScoreQuestionSpec, type NoulQuestionSpec } from '@/modules/spec';

describe('Module editor — nextFieldName', () => {
  it('premier nom libre : commence à field_2 avec un champ par défaut ou une liste vide', () => {
    expect(nextFieldName([])).toBe('field_2');
    expect(nextFieldName([{ name: 'message' }])).toBe('field_2');
  });

  it('nom déjà pris : incrémente pour éviter les collisions', () => {
    expect(nextFieldName([{ name: 'field_2' }])).toBe('field_3');
    expect(
      nextFieldName([
        { name: 'message' },
        { name: 'field_2' },
        { name: 'field_3' },
      ])
    ).toBe('field_4');
  });

  it('plusieurs champs : comble le premier trou libre dans la séquence', () => {
    expect(
      nextFieldName([
        { name: 'message' },
        { name: 'field_2' },
        { name: 'field_4' },
      ])
    ).toBe('field_3');
  });
});

describe('Module editor — insertCitation', () => {
  it('insère au début du texte', () => {
    const res = insertCitation('analyse ce message', 0, 0, 'champ');
    expect(res.text).toBe('`champ` analyse ce message');
    expect(res.cursorPosition).toBe(8);
  });

  it('insère au milieu du texte', () => {
    const res = insertCitation('Bonjour le monde', 8, 8, 'nom');
    expect(res.text).toBe('Bonjour `nom` le monde');
    expect(res.cursorPosition).toBe(14);
  });

  it('insère à la fin du texte', () => {
    const res = insertCitation('Regarde le ', 11, 11, 'sujet');
    expect(res.text).toBe('Regarde le `sujet`');
    expect(res.cursorPosition).toBe(18);
  });

  it('remplace la sélection courante', () => {
    const res = insertCitation('Bonjour ANCIEN monde', 8, 14, 'nouveau');
    expect(res.text).toBe('Bonjour `nouveau` monde');
    expect(res.cursorPosition).toBe(17);
  });

  it('sépare par une espace deux citations insérées l’une après l’autre', () => {
    const first = insertCitation('Classer le ', 11, 11, 'game');
    const second = insertCitation(first.text, first.cursorPosition, first.cursorPosition, 'publisher');
    expect(second.text).toBe('Classer le `game` `publisher`');
    expect(second.cursorPosition).toBe(second.text.length);
  });

  it('ajoute une espace avant la citation collée à un mot', () => {
    const res = insertCitation('Le titre', 8, 8, 'game');
    expect(res.text).toBe('Le titre `game`');
  });

  it('n’ajoute pas d’espace après une parenthèse ouvrante ni avant un point', () => {
    const res = insertCitation('Voir (.', 6, 6, 'game');
    expect(res.text).toBe('Voir (`game`.');
    expect(res.cursorPosition).toBe(12);
  });
});

describe('Module editor — tokenizeJson', () => {
  it('identifie chaque type de jeton et préserve fidèlement le texte source', () => {
    const rawJson = `{\n  "statut": "actif",\n  "count": 42,\n  "valide": true,\n  "vide": null,\n  "expr": {{ JSON.stringify($json.test) }}\n}`;
    const tokens = tokenizeJson(rawJson);

    // Vérifie la présence de chaque type de jeton
    const types = new Set(tokens.map(t => t.type));
    expect(types.has('key')).toBe(true);
    expect(types.has('string')).toBe(true);
    expect(types.has('number')).toBe(true);
    expect(types.has('literal')).toBe(true);
    expect(types.has('expression')).toBe(true);
    expect(types.has('punctuation')).toBe(true);

    // Vérifie les jetons spécifiques
    expect(tokens.some(t => t.type === 'key' && t.value === '"statut"')).toBe(true);
    expect(tokens.some(t => t.type === 'string' && t.value === '"actif"')).toBe(true);
    expect(tokens.some(t => t.type === 'number' && t.value === '42')).toBe(true);
    expect(tokens.some(t => t.type === 'literal' && t.value === 'true')).toBe(true);
    expect(tokens.some(t => t.type === 'literal' && t.value === 'null')).toBe(true);
    expect(
      tokens.some(
        t => t.type === 'expression' && t.value === '{{ JSON.stringify($json.test) }}'
      )
    ).toBe(true);

    // Reconstitution exacte
    const reconstructed = tokens.map(t => t.value).join('');
    expect(reconstructed).toBe(rawJson);
  });

  it('gère les chaînes avec échappements et les expressions non fermées', () => {
    const textWithEscape = '{"texte": "valeur \\"avec guillemets\\""}';
    const tokens = tokenizeJson(textWithEscape);
    expect(tokens.map(t => t.value).join('')).toBe(textWithEscape);

    const unclosedExpr = '{"expr": {{ non_ferme}';
    const unclosedTokens = tokenizeJson(unclosedExpr);
    expect(unclosedTokens.map(t => t.value).join('')).toBe(unclosedExpr);
  });
});

describe('Module editor — editorReducer', () => {
  function getCustomState(): EditorState {
    const spec: EasyJevSpec = {
      fields: [
        { id: 'f-1', name: 'message' },
        { id: 'f-2', name: 'field_2' },
      ],
      questions: [
        {
          id: 'q-1',
          key: 'urgency',
          label: 'Urgence',
          instructions: 'Le message `message` exprime-t-il de l’urgence ?',
          type: 'noul',
        },
      ],
      target: {
        provider: 'typesafe',
        model: 'jev-latest',
      },
      outputMode: 'n8n-expression',
    };
    return { spec };
  }

  it('createInitialState génère un état valide avec la spec par défaut', () => {
    const state = createInitialState();
    expect(state.spec.fields).toHaveLength(1);
    expect(state.spec.fields[0]?.name).toBe('message');
    expect(state.spec.questions).toHaveLength(0);
    expect(state.spec.outputMode).toBe('n8n-expression');
    expect(state.spec.target).toEqual({
      provider: 'typesafe',
      model: 'jev-latest',
    });
  });

  it('action field/add : ajoute un champ avec nom auto et id fourni en préservant l’ordre', () => {
    const initialState = createInitialState();
    const action: EditorAction = { type: 'field/add', id: 'custom-uuid-1' };
    const nextState = editorReducer(initialState, action);

    expect(nextState.spec.fields).toHaveLength(2);
    expect(nextState.spec.fields[0]).toEqual(initialState.spec.fields[0]);
    expect(nextState.spec.fields[1]).toEqual({
      id: 'custom-uuid-1',
      name: 'field_2',
    });
  });

  it('action field/remove : supprime le champ ciblé', () => {
    const state = getCustomState();
    const action: EditorAction = { type: 'field/remove', id: 'f-2' };
    const nextState = editorReducer(state, action);

    expect(nextState.spec.fields).toHaveLength(1);
    expect(nextState.spec.fields[0]?.id).toBe('f-1');
  });

  it('action field/remove : suppression refusée s’il ne reste qu’un seul champ', () => {
    const initialState = createInitialState();
    const action: EditorAction = { type: 'field/remove', id: initialState.spec.fields[0]!.id };
    const nextState = editorReducer(initialState, action);

    expect(nextState).toBe(initialState);
    expect(nextState.spec.fields).toHaveLength(1);
  });

  it('action field/rename : renomme et propage aux citations exactes', () => {
    const state = getCustomState();
    const action: EditorAction = {
      type: 'field/rename',
      id: 'f-1',
      newName: 'contenu',
    };
    const nextState = editorReducer(state, action);

    expect(nextState.spec.fields[0]?.name).toBe('contenu');
    expect(nextState.spec.questions[0]?.instructions).toBe(
      'Le message `contenu` exprime-t-il de l’urgence ?'
    );
  });

  it('action field/rename : renommage vers un nom invalide (le champ change, pas les citations)', () => {
    const state = getCustomState();
    const action: EditorAction = {
      type: 'field/rename',
      id: 'f-1',
      newName: 'nom avec espaces',
    };
    const nextState = editorReducer(state, action);

    expect(nextState.spec.fields[0]?.name).toBe('nom avec espaces');
    expect(nextState.spec.questions[0]?.instructions).toBe(
      'Le message `message` exprime-t-il de l’urgence ?'
    );
  });

  it('actions avec id inconnu : renvoient l’état inchangé', () => {
    const state = getCustomState();

    expect(editorReducer(state, { type: 'field/remove', id: 'id-inexistant' })).toBe(state);
    expect(
      editorReducer(state, {
        type: 'field/rename',
        id: 'id-inexistant',
        newName: 'test',
      })
    ).toBe(state);
    expect(
      editorReducer(state, {
        type: 'field/setExample',
        id: 'id-inexistant',
        value: 'valeur',
      })
    ).toBe(state);
    expect(editorReducer(state, { type: 'question/remove', id: 'id-inexistant' })).toBe(state);
    expect(editorReducer(state, { type: 'question/duplicate', id: 'id-inexistant', newId: 'dup-1' })).toBe(state);
    expect(editorReducer(state, { type: 'question/setType', id: 'id-inexistant', questionType: 'score' })).toBe(state);
    expect(editorReducer(state, { type: 'question/setText', id: 'id-inexistant', text: 'txt' })).toBe(state);
    expect(editorReducer(state, { type: 'question/setKey', id: 'id-inexistant', key: 'cle' })).toBe(state);
  });

  it('action field/setExample : met à jour la valeur d’exemple du champ', () => {
    const state = getCustomState();
    const action: EditorAction = {
      type: 'field/setExample',
      id: 'f-1',
      value: 'Bonjour le monde',
    };
    const nextState = editorReducer(state, action);

    expect(nextState.spec.fields[0]?.exampleValue).toBe('Bonjour le monde');
    expect(nextState.spec.fields[1]?.exampleValue).toBeUndefined();
    expect(editorReducer(nextState, action)).toBe(nextState);
  });

  it('action field/replaceAll : remplace la liste des champs et préserve les questions inchangées', () => {
    const state = getCustomState();
    const originalQuestions = state.spec.questions;
    const action: EditorAction = {
      type: 'field/replaceAll',
      fields: [
        { id: 'f-fixe-1', name: 'nouveau_champ_1' },
        { id: 'f-fixe-2', name: 'nouveau_champ_2' },
      ],
    };
    const nextState = editorReducer(state, action);

    expect(nextState.spec.fields).toHaveLength(2);
    expect(nextState.spec.fields.map(f => f.name)).toEqual(['nouveau_champ_1', 'nouveau_champ_2']);
    expect(nextState.spec.fields[0]?.id).toBe('f-fixe-1');
    expect(nextState.spec.fields[1]?.id).toBe('f-fixe-2');
    expect(nextState.spec.questions).toEqual(originalQuestions);
  });

  it('action field/replaceAll : conserve l’identifiant et l’exemple des champs de même nom', () => {
    const initialState = createInitialState();
    const state: EditorState = {
      spec: {
        ...initialState.spec,
        fields: [
          { id: 'id-fixe-1', name: 'conservé', exampleValue: 'exemple original' },
          { id: 'id-fixe-2', name: 'supprimé' },
        ],
      },
    };

    const action: EditorAction = {
      type: 'field/replaceAll',
      fields: [
        { id: 'id-fixe-3', name: 'autre_champ' },
        { id: 'id-fixe-4', name: 'conservé', exampleValue: 'nouvel exemple ignoré' },
      ],
    };
    const nextState = editorReducer(state, action);

    expect(nextState.spec.fields).toHaveLength(2);
    expect(nextState.spec.fields[0]?.name).toBe('autre_champ');
    expect(nextState.spec.fields[0]?.id).toBe('id-fixe-3');
    expect(nextState.spec.fields[1]?.name).toBe('conservé');

    expect(nextState.spec.fields[1]?.id).toBe('id-fixe-1');
    expect(nextState.spec.fields[1]?.exampleValue).toBe('exemple original');
  });

  it('action field/replaceAll avec remap : remplace les champs et réécrit les citations des questions', () => {
    const base = createInitialState();
    const state: EditorState = {
      spec: {
        ...base.spec,
        fields: [{ id: 'f-msg', name: 'message' }],
        questions: [
          {
            id: 'q1',
            key: 'urgent',
            label: 'Urgent',
            type: 'noul',
            instructions: 'Le `message` est-il urgent ? Relis `message` et `autre`.',
          },
          {
            id: 'q2',
            key: 'sans_citation',
            label: 'Sans citation',
            type: 'noul',
            instructions: 'Question sans aucun champ cité.',
          },
        ],
      },
    };
    const nextState = editorReducer(state, {
      type: 'field/replaceAll',
      fields: [{ id: 'f-game', name: 'game' }],
      remap: { message: 'game' },
    });

    expect(nextState.spec.fields.map(f => f.name)).toEqual(['game']);
    expect(nextState.spec.questions[0]?.instructions).toBe(
      'Le `game` est-il urgent ? Relis `game` et `autre`.'
    );
    expect(nextState.spec.questions[1]?.instructions).toBe('Question sans aucun champ cité.');
  });

  it('action field/replaceAll avec remap : ignore une cible absente des champs et un champ conservé', () => {
    const base = createInitialState();
    const state: EditorState = {
      spec: {
        ...base.spec,
        fields: [
          { id: 'f-a', name: 'garde' },
          { id: 'f-b', name: 'retire' },
        ],
        questions: [
          {
            id: 'q1',
            key: 'q',
            label: 'Q',
            type: 'noul',
            instructions: 'Voir `garde` et `retire`.',
          },
        ],
      },
    };
    const nextState = editorReducer(state, {
      type: 'field/replaceAll',
      fields: [{ id: 'f-c', name: 'garde' }, { id: 'f-d', name: 'nouveau' }],
      remap: { retire: 'inexistant', garde: 'nouveau' },
    });

    expect(nextState.spec.questions[0]?.instructions).toBe('Voir `garde` et `retire`.');
  });

  it('action field/replaceAll avec remap : même état et même action donnent le même résultat', () => {
    const base = createInitialState();
    const state: EditorState = {
      spec: {
        ...base.spec,
        fields: [{ id: 'f-msg', name: 'message' }],
        questions: [
          { id: 'q1', key: 'q', label: 'Q', type: 'noul', instructions: 'Voir `message`.' },
        ],
      },
    };
    const action: EditorAction = {
      type: 'field/replaceAll',
      fields: [{ id: 'f-x', name: 'x' }],
      remap: { message: 'x' },
    };
    expect(editorReducer(state, action)).toEqual(editorReducer(state, action));
  });

  it('action detected/set : mémorise les noms des champs détectés sans toucher à la spec', () => {
    const state = createInitialState();
    const nextState = editorReducer(state, { type: 'detected/set', names: ['game', 'publisher'] });
    expect(nextState.detectedFields).toEqual(['game', 'publisher']);
    expect(nextState.spec).toBe(state.spec);
    expect(editorReducer(nextState, { type: 'detected/set', names: [] }).detectedFields).toEqual([]);
  });

  it('detectedFields survit à un remplacement du contenu', () => {
    const state = editorReducer(createInitialState(), { type: 'detected/set', names: ['game'] });
    const next = editorReducer(state, {
      type: 'spec/replaceContent',
      fields: [{ id: 'f1', name: 'game' }],
      questions: [],
    });
    expect(next.detectedFields).toEqual(['game']);
  });

  it('action field/replaceAll : liste vide ignorée, renvoie l’état inchangé', () => {
    const state = getCustomState();
    const nextState = editorReducer(state, {
      type: 'field/replaceAll',
      fields: [],
    });
    expect(nextState).toBe(state);
  });

  it('action field/replaceAll : pureté du réducteur (même état et même action donnent exactement le même résultat deux fois de suite)', () => {
    const state = getCustomState();
    const action: EditorAction = {
      type: 'field/replaceAll',
      fields: [
        { id: 'pure-id-1', name: 'champ_un' },
        { id: 'pure-id-2', name: 'champ_deux' },
      ],
    };
    const res1 = editorReducer(state, action);
    const res2 = editorReducer(state, action);
    expect(res1).toEqual(res2);
  });

  it('action output/setMode : change le mode d’évaluation', () => {
    const state = getCustomState();
    expect(state.spec.outputMode).toBe('n8n-expression');

    const nextState = editorReducer(state, {
      type: 'output/setMode',
      mode: 'example-text',
    });
    expect(nextState.spec.outputMode).toBe('example-text');
    expect(
      editorReducer(nextState, {
        type: 'output/setMode',
        mode: 'example-text',
      })
    ).toBe(nextState);
  });

  it('action question/add : ajoute une question selon son type avec ses critères par défaut', () => {
    const state = getCustomState();

    // Ajout choice : 2 options vides
    const stateWithChoice = editorReducer(state, {
      type: 'question/add',
      id: 'q-choice',
      questionType: 'choice',
    });
    expect(stateWithChoice.spec.questions).toHaveLength(2);
    const addedChoice = stateWithChoice.spec.questions[1] as ChoiceQuestionSpec;
    expect(addedChoice.type).toBe('choice');
    expect(addedChoice.options).toHaveLength(2);
    expect(addedChoice.options).toEqual([
      { key: '', description: '' },
      { key: '', description: '' },
    ]);

    // Ajout score : 3 niveaux vides
    const stateWithScore = editorReducer(state, {
      type: 'question/add',
      id: 'q-score',
      questionType: 'score',
    });
    const addedScore = stateWithScore.spec.questions[1] as ScoreQuestionSpec;
    expect(addedScore.type).toBe('score');
    expect(addedScore.levels).toHaveLength(3);
    expect(addedScore.levels).toEqual(['', '', '']);

    // Ajout noul : critères trueCondition/falseCondition
    const stateWithNoul = editorReducer(state, {
      type: 'question/add',
      id: 'q-noul',
      questionType: 'noul',
    });
    const addedNoul = stateWithNoul.spec.questions[1] as NoulQuestionSpec;
    expect(addedNoul.type).toBe('noul');
    expect(addedNoul.criteria).toEqual({ trueCondition: '', falseCondition: '' });
  });

  it('action question/remove : supprime la question ciblée', () => {
    const state = getCustomState();
    const nextState = editorReducer(state, { type: 'question/remove', id: 'q-1' });
    expect(nextState.spec.questions).toHaveLength(0);
  });

  it('action question/duplicate : duplique en garantissant une clé unique', () => {
    const state = getCustomState();
    const nextState = editorReducer(state, {
      type: 'question/duplicate',
      id: 'q-1',
      newId: 'q-1-dup',
    });

    expect(nextState.spec.questions).toHaveLength(2);
    expect(nextState.spec.questions[0]?.id).toBe('q-1');
    expect(nextState.spec.questions[0]?.key).toBe('urgency');

    expect(nextState.spec.questions[1]?.id).toBe('q-1-dup');
    expect(nextState.spec.questions[1]?.key).toBe('urgency_2');
    expect(nextState.spec.questions[1]?.instructions).toBe(
      state.spec.questions[0]?.instructions
    );
  });

  it('action question/setType : conserve instructions et label mais réinitialise les critères', () => {
    const state = getCustomState(); // q-1 est un noul
    const nextState = editorReducer(state, {
      type: 'question/setType',
      id: 'q-1',
      questionType: 'choice',
    });

    const question = nextState.spec.questions[0] as ChoiceQuestionSpec;
    expect(question.type).toBe('choice');
    expect(question.instructions).toBe(state.spec.questions[0]?.instructions);
    expect(question.options).toHaveLength(2);

    // Même type réassigné -> renvoie l'état inchangé
    expect(
      editorReducer(nextState, {
        type: 'question/setType',
        id: 'q-1',
        questionType: 'choice',
      })
    ).toBe(nextState);
  });

  it('action question/setText : dérive la clé automatiquement tant que non modifiée manuellement', () => {
    const state = getCustomState();
    // Par défaut, q-1 n'a pas isKeyCustomized: true
    const nextState = editorReducer(state, {
      type: 'question/setText',
      id: 'q-1',
      text: 'Le client souhaite-t-il un remboursement rapide ?',
    });

    expect(nextState.spec.questions[0]?.instructions).toBe(
      'Le client souhaite-t-il un remboursement rapide ?'
    );
    expect(nextState.spec.questions[0]?.key).toBe('client_souhaite_remboursement');
  });

  it('action question/setKey : fige la clé manuellement pour bloquer le recalcul automatique', () => {
    const state = getCustomState();
    const stateWithCustomKey = editorReducer(state, {
      type: 'question/setKey',
      id: 'q-1',
      key: 'ma_cle_perso',
    });

    expect(stateWithCustomKey.spec.questions[0]?.key).toBe('ma_cle_perso');
    expect(stateWithCustomKey.spec.questions[0]?.isKeyCustomized).toBe(true);

    // Une modification de texte ne doit plus écraser la clé manuelle
    const stateAfterText = editorReducer(stateWithCustomKey, {
      type: 'question/setText',
      id: 'q-1',
      text: 'Autre texte complètement différent',
    });

    expect(stateAfterText.spec.questions[0]?.instructions).toBe(
      'Autre texte complètement différent'
    );
    expect(stateAfterText.spec.questions[0]?.key).toBe('ma_cle_perso');
  });

  it('actions choice : ajout, plancher de suppression à 2, et modification d’option', () => {
    const state = editorReducer(getCustomState(), {
      type: 'question/add',
      id: 'q-choice',
      questionType: 'choice',
    });

    // Ajout d'une 3e option
    const stateWith3 = editorReducer(state, {
      type: 'choice/addOption',
      questionId: 'q-choice',
    });
    const choiceWith3 = stateWith3.spec.questions[1] as ChoiceQuestionSpec;
    expect(choiceWith3.options).toHaveLength(3);

    // Mise à jour de l'option 1
    const stateUpdated = editorReducer(stateWith3, {
      type: 'choice/updateOption',
      questionId: 'q-choice',
      index: 0,
      key: 'prospect',
      description: 'Demande commerciale',
    });
    const choiceUpdated = stateUpdated.spec.questions[1] as ChoiceQuestionSpec;
    expect(choiceUpdated.options[0]).toEqual({
      key: 'prospect',
      description: 'Demande commerciale',
    });

    // Suppression d'une option (passe de 3 à 2)
    const stateWith2 = editorReducer(stateUpdated, {
      type: 'choice/removeOption',
      questionId: 'q-choice',
      index: 2,
    });
    expect((stateWith2.spec.questions[1] as ChoiceQuestionSpec).options).toHaveLength(2);

    // Refus de suppression en dessous de 2 options
    const stateRefused = editorReducer(stateWith2, {
      type: 'choice/removeOption',
      questionId: 'q-choice',
      index: 0,
    });
    expect(stateRefused).toBe(stateWith2);
    expect((stateRefused.spec.questions[1] as ChoiceQuestionSpec).options).toHaveLength(2);
  });

  it('actions score : ajout (max 10), suppression (min 2), et modification de niveau', () => {
    const state = editorReducer(getCustomState(), {
      type: 'question/add',
      id: 'q-score',
      questionType: 'score',
    });
    // Initialisé avec 3 niveaux

    // Modification du niveau 0
    const stateUpdated = editorReducer(state, {
      type: 'score/updateLevel',
      questionId: 'q-score',
      index: 0,
      value: 'Faible',
    });
    expect((stateUpdated.spec.questions[1] as ScoreQuestionSpec).levels[0]).toBe('Faible');

    // Suppression niveau 2 (passe de 3 à 2)
    const stateWith2 = editorReducer(stateUpdated, {
      type: 'score/removeLevel',
      questionId: 'q-score',
      index: 2,
    });
    expect((stateWith2.spec.questions[1] as ScoreQuestionSpec).levels).toHaveLength(2);

    // Refus de suppression sous le plancher de 2
    const stateRefusedUnder2 = editorReducer(stateWith2, {
      type: 'score/removeLevel',
      questionId: 'q-score',
      index: 0,
    });
    expect(stateRefusedUnder2).toBe(stateWith2);

    // Ajout jusqu'au plafond de 10
    let currentState = stateWith2;
    for (let i = 2; i < 10; i++) {
      currentState = editorReducer(currentState, {
        type: 'score/addLevel',
        questionId: 'q-score',
      });
    }
    expect((currentState.spec.questions[1] as ScoreQuestionSpec).levels).toHaveLength(10);

    // Tentative d'ajout au-delà de 10 -> refusée
    const stateBeyond10 = editorReducer(currentState, {
      type: 'score/addLevel',
      questionId: 'q-score',
    });
    expect(stateBeyond10).toBe(currentState);
    expect((stateBeyond10.spec.questions[1] as ScoreQuestionSpec).levels).toHaveLength(10);
  });

  it('actions noul : modification des conditions oui / non', () => {
    const state = getCustomState(); // q-1 est noul
    const nextState = editorReducer(state, {
      type: 'noul/setConditions',
      questionId: 'q-1',
      trueCondition: 'Demande urgente',
      falseCondition: 'Demande normale',
    });

    const question = nextState.spec.questions[0] as NoulQuestionSpec;
    expect(question.criteria).toEqual({
      trueCondition: 'Demande urgente',
      falseCondition: 'Demande normale',
    });
  });

  it('action target/setProvider : bascule de fournisseur avec son modèle cohérent', () => {
    const state = getCustomState();
    expect(state.spec.target).toEqual({
      provider: 'typesafe',
      model: 'jev-latest',
    });

    const stateVercel = editorReducer(state, {
      type: 'target/setProvider',
      provider: 'vercel-gateway',
    });
    expect(stateVercel.spec.target).toEqual({
      provider: 'vercel-gateway',
      model: 'typesafe-ai/jev',
    });

    // Même fournisseur -> état inchangé
    expect(
      editorReducer(stateVercel, {
        type: 'target/setProvider',
        provider: 'vercel-gateway',
      })
    ).toBe(stateVercel);

    const stateTypeSafe = editorReducer(stateVercel, {
      type: 'target/setProvider',
      provider: 'typesafe',
    });
    expect(stateTypeSafe.spec.target).toEqual({
      provider: 'typesafe',
      model: 'jev-latest',
    });
  });

  it('immutabilité : aucune action ne modifie l’état précédent par référence (copie profonde avant/après)', () => {
    const state = getCustomState();
    const deepCloneBefore = structuredClone(state);

    const actions: EditorAction[] = [
      { type: 'field/add', id: 'f-3' },
      { type: 'field/rename', id: 'f-1', newName: 'body' },
      { type: 'field/setExample', id: 'f-2', value: 'Test' },
      { type: 'output/setMode', mode: 'example-text' },
      { type: 'question/add', id: 'q-choice', questionType: 'choice' },
      { type: 'choice/addOption', questionId: 'q-choice' },
      { type: 'choice/updateOption', questionId: 'q-choice', index: 0, key: 'lead' },
      { type: 'question/duplicate', id: 'q-choice', newId: 'q-choice-2' },
      { type: 'question/setText', id: 'q-1', text: 'Nouvelle consigne' },
      { type: 'question/setKey', id: 'q-1', key: 'custom_key' },
      { type: 'target/setProvider', provider: 'vercel-gateway' },
      { type: 'question/remove', id: 'q-choice-2' },
      { type: 'field/remove', id: 'f-2' },
    ];

    let currentState = state;
    for (const action of actions) {
      const snapshotBeforeAction = structuredClone(currentState);
      const resultingState = editorReducer(currentState, action);

      expect(currentState).toEqual(snapshotBeforeAction);
      expect(resultingState).not.toBe(currentState);
      currentState = resultingState;
    }

    expect(state).toEqual(deepCloneBefore);
  });

  it('action spec/replaceContent : remplace les champs et les questions tout en conservant target et outputMode', () => {
    const initialState = getCustomState();
    // Personnalisons target et outputMode pour vérifier leur conservation stricte
    const stateWithCustomTarget = editorReducer(initialState, {
      type: 'target/setProvider',
      provider: 'vercel-gateway',
    });
    const stateWithCustomMode = editorReducer(stateWithCustomTarget, {
      type: 'output/setMode',
      mode: 'example-text',
    });

    const newFields = [
      { id: 'new-f-1', name: 'email_body' },
      { id: 'new-f-2', name: 'sender' },
    ];
    const newQuestions = [
      {
        id: 'new-q-1',
        type: 'noul' as const,
        key: 'is_urgent',
        label: 'Urgent',
        instructions: 'Is `email_body` urgent?',
        isKeyCustomized: true,
      },
    ];

    const deepCloneBefore = structuredClone(stateWithCustomMode);

    const nextState = editorReducer(stateWithCustomMode, {
      type: 'spec/replaceContent',
      fields: newFields,
      questions: newQuestions,
    });

    // L'état initial reste intact
    expect(stateWithCustomMode).toEqual(deepCloneBefore);

    // Les nouveaux champs et questions sont en place avec leurs IDs exacts
    expect(nextState.spec.fields).toEqual(newFields);
    expect(nextState.spec.questions).toEqual(newQuestions);

    // target et outputMode sont strictement conservés
    expect(nextState.spec.target).toEqual({
      provider: 'vercel-gateway',
      model: 'typesafe-ai/jev',
    });
    expect(nextState.spec.outputMode).toBe('example-text');
  });

  it('action spec/replaceQuestions : conserve les champs courants, remplace les questions, conserve target et outputMode', () => {
    const initialState = getCustomState();
    const stateWithCustomTarget = editorReducer(initialState, {
      type: 'target/setProvider',
      provider: 'vercel-gateway',
    });
    const stateWithCustomMode = editorReducer(stateWithCustomTarget, {
      type: 'output/setMode',
      mode: 'example-text',
    });

    const originalFields = stateWithCustomMode.spec.fields;
    const newQuestions = [
      {
        id: 'gen-q-1',
        type: 'choice' as const,
        key: 'category',
        label: 'Catégorie',
        instructions: 'Quelle est la catégorie du `message` ?',
        options: [
          { key: 'support', description: 'Assistance technique' },
          { key: 'billing', description: 'Facturation' },
        ],
      },
    ];

    const deepCloneBefore = structuredClone(stateWithCustomMode);

    const nextState = editorReducer(stateWithCustomMode, {
      type: 'spec/replaceQuestions',
      questions: newQuestions,
    });

    // L'état initial reste intact (immutabilité)
    expect(stateWithCustomMode).toEqual(deepCloneBefore);

    // Les champs sont strictement conservés
    expect(nextState.spec.fields).toEqual(originalFields);
    expect(nextState.spec.fields).toBe(originalFields);

    // Les questions sont remplacées
    expect(nextState.spec.questions).toEqual(newQuestions);

    // target et outputMode sont strictement conservés
    expect(nextState.spec.target).toEqual({
      provider: 'vercel-gateway',
      model: 'typesafe-ai/jev',
    });
    expect(nextState.spec.outputMode).toBe('example-text');

    // Nouvelle référence d'état et de spec
    expect(nextState).not.toBe(stateWithCustomMode);
    expect(nextState.spec).not.toBe(stateWithCustomMode.spec);
  });
});

describe('Module editor — hasUserContent', () => {
  it('renvoie false pour la spec par défaut (aucun contenu personnalisé)', () => {
    const defaultSpec = createDefaultSpec();
    expect(hasUserContent(defaultSpec)).toBe(false);
  });

  it('renvoie true si un champ est renommé', () => {
    const spec: EasyJevSpec = {
      ...createDefaultSpec(),
      fields: [{ id: 'f-1', name: 'email' }],
    };
    expect(hasUserContent(spec)).toBe(true);
  });

  it('renvoie true si un champ supplémentaire est ajouté', () => {
    const spec: EasyJevSpec = {
      ...createDefaultSpec(),
      fields: [
        { id: 'f-1', name: 'message' },
        { id: 'f-2', name: 'sujet' },
      ],
    };
    expect(hasUserContent(spec)).toBe(true);
  });

  it('renvoie true si aucun champ n’est présent', () => {
    const spec: EasyJevSpec = {
      ...createDefaultSpec(),
      fields: [],
    };
    expect(hasUserContent(spec)).toBe(true);
  });

  it('renvoie true si une valeur d’exemple non vide est saisie dans le champ par défaut', () => {
    const spec: EasyJevSpec = {
      ...createDefaultSpec(),
      fields: [{ id: 'f-1', name: 'message', exampleValue: 'Bonjour Jev' }],
    };
    expect(hasUserContent(spec)).toBe(true);
  });

  it('renvoie false si la valeur d’exemple ne contient que des espaces blancs', () => {
    const spec: EasyJevSpec = {
      ...createDefaultSpec(),
      fields: [{ id: 'f-1', name: 'message', exampleValue: '   ' }],
    };
    expect(hasUserContent(spec)).toBe(false);
  });

  it('renvoie true si au moins une question est présente même avec le champ par défaut', () => {
    const defaultSpec = createDefaultSpec();
    const specWithQuestion: EasyJevSpec = {
      ...defaultSpec,
      questions: [
        {
          id: 'q-1',
          type: 'noul',
          key: 'is_urgent',
          label: 'Urgent',
          instructions: 'Est-ce urgent ?',
          isKeyCustomized: false,
        },
      ],
    };
    expect(hasUserContent(specWithQuestion)).toBe(true);
  });
});

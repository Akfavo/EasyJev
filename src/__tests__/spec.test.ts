import { describe, expect, it } from 'vitest';
import {
  createDefaultSpec,
  deriveQuestionKey,
  renameField,
  type EasyJevSpec,
} from '../modules/spec';
import { validateSpec } from '../modules/validators';

describe('module spec - createDefaultSpec', () => {
  it('crée une spécification par défaut avec champ message, cible TypeSafe et sans questions', () => {
    const spec = createDefaultSpec();

    expect(spec.fields).toHaveLength(1);
    expect(spec.fields[0]?.name).toBe('message');
    expect(spec.questions).toHaveLength(0);
    expect(spec.target).toEqual({
      provider: 'typesafe',
      model: 'jev-latest',
    });
    expect(spec.outputMode).toBe('n8n-expression');
  });

  it('est valide selon validateSpec à la seule exception de NO_QUESTIONS', () => {
    const spec = createDefaultSpec();
    const result = validateSpec(spec);

    expect(result.isValid).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.code).toBe('NO_QUESTIONS');
  });
});

describe('module spec - deriveQuestionKey', () => {
  it('supprime les accents', () => {
    const key = deriveQuestionKey('Détecter la sévérité du problème');
    expect(key).toBe('detecter_severite_probleme');
  });

  it('filtre les mots vides en français', () => {
    const key = deriveQuestionKey("Le client est-il satisfait de la commande ?");
    expect(key).toBe('client_satisfait_commande');
  });

  it('filtre les mots vides en anglais', () => {
    const key = deriveQuestionKey('Is this customer request urgent?');
    expect(key).toBe('customer_request_urgent');
  });

  it('préfixe avec q_ si la clé commence par un chiffre', () => {
    const key = deriveQuestionKey('24 heures de délai maximum');
    expect(key).toBe('q_24_heures_delai');
  });

  it("gère l'unicité avec les suffixes _2, _3...", () => {
    const used = ['urgence'];
    expect(deriveQuestionKey('Urgence', used)).toBe('urgence_2');

    const multipleUsed = ['urgence', 'urgence_2'];
    expect(deriveQuestionKey('Urgence', multipleUsed)).toBe('urgence_3');
  });

  it('génère question_N lorsque la source est vide ou ne contient que des symboles/mots vides', () => {
    expect(deriveQuestionKey('')).toBe('question_1');
    expect(deriveQuestionKey('??? ... ---')).toBe('question_1');
    expect(deriveQuestionKey('le la de')).toBe('question_1');

    const used = ['question_1'];
    expect(deriveQuestionKey('', used)).toBe('question_2');

    const usedMultiple = ['question_1', 'question_2'];
    expect(deriveQuestionKey('', usedMultiple)).toBe('question_3');
  });

  it("extrait correctement les mots d'une question citant un champ entre accents graves", () => {
    const key = deriveQuestionKey("Le message `message` exprime-t-il de l'insatisfaction ?");
    expect(key).toBe('message_exprime_insatisfaction');
  });

  it('ne conserve chaque mot significatif qu’une seule fois', () => {
    const key = deriveQuestionKey('Urgence urgence et urgence détectée');
    expect(key).toBe('urgence_detectee');
  });

  it('utilise question_N si la clé dérivée est un identifiant interdit (constructor, prototype)', () => {
    expect(deriveQuestionKey('constructor')).toBe('question_1');
    expect(deriveQuestionKey('prototype')).toBe('question_1');
    expect(deriveQuestionKey('constructor', ['question_1'])).toBe('question_2');
  });

  it('limite la clé aux 3 premiers mots significatifs', () => {
    const key = deriveQuestionKey('Demande client prioritaire urgente requise');
    expect(key).toBe('demande_client_prioritaire');
  });
});

describe('module spec - renameField', () => {
  function createSampleSpec(): EasyJevSpec {
    return {
      fields: [
        { id: 'f1', name: 'id', exampleValue: '123' },
        { id: 'f2', name: 'message', exampleValue: 'Bonjour' },
      ],
      questions: [
        {
          id: 'q1',
          key: 'check_id',
          label: 'Vérification ID',
          instructions: 'Le `id` correspond-il à une idée claire de `identifiant` ?',
          type: 'noul',
        },
        {
          id: 'q2',
          key: 'check_content',
          label: 'Contenu',
          instructions: 'Comparer `id` avec un autre `id` dans le message sans toucher idée.',
          type: 'choice',
          options: [
            { key: 'opt_id', description: 'Description citant `id` qui ne doit pas changer' },
            { key: 'opt_other', description: 'Autre option' },
          ],
        },
      ],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'n8n-expression',
    };
  }

  it('renommage simple : propage le nouveau nom dans les citations exactes entre accents graves', () => {
    const spec = createSampleSpec();
    const updated = renameField(spec, 'message', 'texte');

    expect(updated.fields.find(f => f.id === 'f2')?.name).toBe('texte');
    expect(updated.fields.find(f => f.id === 'f2')?.exampleValue).toBe('Bonjour');
  });

  it('plusieurs occurrences dans une question : remplace toutes les occurrences', () => {
    const spec = createSampleSpec();
    const updated = renameField(spec, 'id', 'reference');

    expect(updated.questions[1]?.instructions).toBe(
      'Comparer `reference` avec un autre `reference` dans le message sans toucher idée.'
    );
  });

  it('plusieurs questions : propage dans toutes les questions de la spec', () => {
    const spec = createSampleSpec();
    const updated = renameField(spec, 'id', 'reference');

    expect(updated.questions[0]?.instructions).toBe(
      'Le `reference` correspond-il à une idée claire de `identifiant` ?'
    );
    expect(updated.questions[1]?.instructions).toBe(
      'Comparer `reference` avec un autre `reference` dans le message sans toucher idée.'
    );
  });

  it('un mot sans accents graves n’est pas modifié', () => {
    const spec = createSampleSpec();
    // Le mot "message" apparaît sans backticks dans q2.instructions
    const updated = renameField(spec, 'message', 'texte');

    expect(updated.questions[1]?.instructions).toContain('dans le message sans toucher');
    expect(updated.questions[1]?.instructions).not.toContain('dans le texte sans toucher');
  });

  it('un nom qui en contient un autre n’est pas modifié (`id` renommé ne touche pas `identifiant` ni « idée »)', () => {
    const spec = createSampleSpec();
    const updated = renameField(spec, 'id', 'reference');

    expect(updated.questions[0]?.instructions).toBe(
      'Le `reference` correspond-il à une idée claire de `identifiant` ?'
    );
  });

  it('nom inconnu : renvoie la spec inchangée', () => {
    const spec = createSampleSpec();
    const updated = renameField(spec, 'inconnu', 'nouveau');

    expect(updated).toBe(spec);
  });

  it('même nom : renvoie la spec inchangée', () => {
    const spec = createSampleSpec();
    const updated = renameField(spec, 'message', 'message');

    expect(updated).toBe(spec);
  });

  it('nouveau nom invalide : le champ change de nom, mais les citations ne sont pas propagées', () => {
    const spec = createSampleSpec();
    const updated = renameField(spec, 'id', 'mon id');

    expect(updated.fields.find(f => f.id === 'f1')?.name).toBe('mon id');
    expect(updated.questions[0]?.instructions).toBe(
      'Le `id` correspond-il à une idée claire de `identifiant` ?'
    );
    expect(updated.questions[1]?.instructions).toBe(
      'Comparer `id` avec un autre `id` dans le message sans toucher idée.'
    );
  });

  it('ancien nom invalide : le champ change de nom, mais les citations ne sont pas propagées', () => {
    const spec = createSampleSpec();
    spec.fields[0]!.name = 'bad name';
    const updated = renameField(spec, 'bad name', 'valid_name');

    expect(updated.fields.find(f => f.id === 'f1')?.name).toBe('valid_name');
    expect(updated.questions[0]?.instructions).toBe(
      'Le `id` correspond-il à une idée claire de `identifiant` ?'
    );
  });

  it('nouveau nom déjà pris : le champ change de nom, mais les citations ne sont pas propagées', () => {
    const spec = createSampleSpec();
    const updated = renameField(spec, 'id', 'message');

    expect(updated.fields[0]?.name).toBe('message');
    expect(updated.questions[0]?.instructions).toBe(
      'Le `id` correspond-il à une idée claire de `identifiant` ?'
    );
  });

  it('la spec d’origine n’est jamais modifiée (pureté / immutabilité par comparaison de copie profonde)', () => {
    const spec = createSampleSpec();
    const snapshotBefore = JSON.parse(JSON.stringify(spec));

    renameField(spec, 'id', 'reference');

    expect(spec).toEqual(snapshotBefore);
  });

  it('ne modifie ni les clés de questions, ni les descriptions d’options, ni les valeurs d’exemple', () => {
    const spec = createSampleSpec();
    const updated = renameField(spec, 'id', 'reference');

    expect(updated.questions[0]?.key).toBe('check_id');
    expect(updated.questions[1]?.key).toBe('check_content');

    const q2 = updated.questions[1];
    if (q2 && q2.type === 'choice') {
      expect(q2.options[0]?.description).toBe(
        'Description citant `id` qui ne doit pas changer'
      );
    } else {
      expect.fail('q2 doit être de type choice');
    }
    expect(updated.fields[0]?.exampleValue).toBe('123');
  });

  it('après un renommage valide, validateSpec ne signale aucun QUESTION_CITES_UNKNOWN_FIELD nouveau', () => {
    const spec: EasyJevSpec = {
      fields: [{ id: 'f1', name: 'ancien' }],
      questions: [
        {
          id: 'q1',
          key: 'q1',
          label: 'Q1',
          instructions: 'Que penser de `ancien` ?',
          type: 'noul',
        },
      ],
      target: { provider: 'typesafe', model: 'jev-latest' },
      outputMode: 'n8n-expression',
    };

    const initialResult = validateSpec(spec);
    expect(
      initialResult.issues.filter(i => i.code === 'QUESTION_CITES_UNKNOWN_FIELD')
    ).toHaveLength(0);

    const updated = renameField(spec, 'ancien', 'nouveau');
    const updatedResult = validateSpec(updated);
    expect(
      updatedResult.issues.filter(i => i.code === 'QUESTION_CITES_UNKNOWN_FIELD')
    ).toHaveLength(0);
    expect(updatedResult.isValid).toBe(true);
  });
});

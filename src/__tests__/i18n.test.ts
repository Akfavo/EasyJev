import { describe, it, expect, vi } from 'vitest';
import {
  isLocale,
  buildLangCookie,
  setLangCookie,
  getDictionary,
  fr,
  en,
  validationMessagesFr,
  validationMessagesEn,
  buildAlternateUrls,
  buildMetadata,
  type Locale,
} from '@/modules/i18n';
import type { ValidationCode } from '@/modules/validators';

function getDeepKeyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...getDeepKeyPaths(value as Record<string, unknown>, fullPath));
    } else {
      keys.push(fullPath);
    }
  }

  return keys;
}

describe('Module i18n — locales & cookies', () => {
  it('isLocale valide uniquement les langues supportées', () => {
    expect(isLocale('fr')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('es')).toBe(false);
    expect(isLocale('de')).toBe(false);
    expect(isLocale('')).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(123)).toBe(false);
    expect(isLocale({})).toBe(false);
  });

  it('buildLangCookie produit la chaîne exacte attendue', () => {
    expect(buildLangCookie('fr')).toBe(
      'easyjev_lang=fr; Path=/; Max-Age=31536000; SameSite=Lax'
    );
    expect(buildLangCookie('en')).toBe(
      'easyjev_lang=en; Path=/; Max-Age=31536000; SameSite=Lax'
    );
  });

  it('buildLangCookie ajoute Secure quand le site est en HTTPS', () => {
    expect(buildLangCookie('fr', true)).toBe(
      'easyjev_lang=fr; Path=/; Max-Age=31536000; SameSite=Lax; Secure'
    );
  });

  it('setLangCookie marque le cookie Secure sur une page HTTPS', () => {
    const originalDocument = globalThis.document;
    const originalWindow = globalThis.window;
    const fakeDocument = { cookie: '' };
    vi.stubGlobal('document', fakeDocument);
    vi.stubGlobal('window', { location: { protocol: 'https:' } });

    setLangCookie('en');
    expect(fakeDocument.cookie).toBe(
      'easyjev_lang=en; Path=/; Max-Age=31536000; SameSite=Lax; Secure'
    );

    vi.stubGlobal('document', originalDocument);
    vi.stubGlobal('window', originalWindow);
  });

  it('setLangCookie écrit dans document.cookie', () => {
    const originalDocument = globalThis.document;
    const fakeDocument = { cookie: '' };
    vi.stubGlobal('document', fakeDocument);

    setLangCookie('fr');
    expect(fakeDocument.cookie).toBe(
      'easyjev_lang=fr; Path=/; Max-Age=31536000; SameSite=Lax'
    );

    setLangCookie('en');
    expect(fakeDocument.cookie).toBe(
      'easyjev_lang=en; Path=/; Max-Age=31536000; SameSite=Lax'
    );

    vi.stubGlobal('document', originalDocument);
  });
});

describe('Module i18n — dictionnaires', () => {
  it('les dictionnaires fr et en ont exactement les mêmes clés (parcours récursif)', () => {
    const frKeys = getDeepKeyPaths(fr as unknown as Record<string, unknown>).sort();
    const enKeys = getDeepKeyPaths(en as unknown as Record<string, unknown>).sort();

    expect(frKeys).toEqual(enKeys);
    expect(frKeys.length).toBeGreaterThan(0);
  });

  it('getDictionary retourne le dictionnaire correspondant ou repli sur en', () => {
    expect(getDictionary('fr')).toBe(fr);
    expect(getDictionary('en')).toBe(en);
    expect(getDictionary('es' as Locale)).toBe(en);
  });

  it('fournit les 12 types d’erreur de génération Claude dans fr et en', () => {
    const errorKeys = [
      'invalid_input',
      'invalid_key',
      'forbidden',
      'billing',
      'bad_request',
      'rate_limited',
      'overloaded',
      'network',
      'aborted',
      'bad_output',
      'model_unavailable',
      'timeout',
    ] as const;

    for (const key of errorKeys) {
      expect(fr.generation.errors[key]).toBeTruthy();
      expect(typeof fr.generation.errors[key]).toBe('string');
      expect(en.generation.errors[key]).toBeTruthy();
      expect(typeof en.generation.errors[key]).toBe('string');
    }

    // Mention des crédits sur console Anthropic pour billing
    expect(fr.generation.errors.billing.toLowerCase()).toContain('crédits');
    expect(en.generation.errors.billing.toLowerCase()).toContain('credits');

    // model_unavailable propose de choisir l'autre modèle
    expect(fr.generation.errors.model_unavailable.toLowerCase()).toContain('modèle');
    expect(en.generation.errors.model_unavailable.toLowerCase()).toContain('model');

    // timeout mentionne le délai de 60 secondes
    expect(fr.generation.errors.timeout).toContain('60');
    expect(en.generation.errors.timeout).toContain('60');
  });

  it('définit les 4 encadrés de confiance (data, key, boundaries, recommendations) dans fr et en', () => {
    expect(fr.trust.sectionAriaLabel).toBe('Sécurité et transparence');
    expect(en.trust.sectionAriaLabel).toBe('Security and transparency');

    expect(fr.trust.data.title).toBeTruthy();
    expect(en.trust.data.title).toBeTruthy();
    expect(fr.trust.key.title).toBeTruthy();
    expect(en.trust.key.title).toBeTruthy();
    expect(fr.trust.boundaries.title).toBeTruthy();
    expect(en.trust.boundaries.title).toBeTruthy();
    expect(fr.trust.recommendations.title).toBeTruthy();
    expect(en.trust.recommendations.title).toBeTruthy();
  });

  it('définit le pitch d’accueil (heroLine, jev, easy) dans fr et en', () => {
    expect(fr.home.pitch.heroLine).toBeTruthy();
    expect(en.home.pitch.heroLine).toBeTruthy();

    expect(fr.home.pitch.jev.title).toBeTruthy();
    expect(fr.home.pitch.jev.text).toBeTruthy();
    expect(en.home.pitch.jev.title).toBeTruthy();
    expect(en.home.pitch.jev.text).toBeTruthy();

    expect(fr.home.pitch.easy.title).toBeTruthy();
    expect(fr.home.pitch.easy.text).toBeTruthy();
    expect(en.home.pitch.easy.title).toBeTruthy();
    expect(en.home.pitch.easy.text).toBeTruthy();

    // Vérifie que les textes mentionnent TypeSafe AI
    expect(fr.home.pitch.jev.text).toContain('TypeSafe AI');
    expect(en.home.pitch.jev.text).toContain('TypeSafe AI');
  });

  it('définit les libellés de fenêtres et gère le pluriel du badge adjust dans fr et en', () => {
    expect(fr.footer.disclaimer).toBe('Outil indépendant, non affilié à TypeSafe AI.');
    expect(en.footer.disclaimer).toBe('Independent tool, not affiliated with TypeSafe AI.');

    expect(fr.windows.about.title).toBe('explications.app');
    expect(en.windows.about.title).toBe('about.app');
    expect(fr.windows.describe.title).toBe('decris.app');
    expect(en.windows.describe.title).toBe('describe.app');
    expect(fr.windows.adjust.title).toBe('ajuste.app');
    expect(en.windows.adjust.title).toBe('adjust.app');
    expect(fr.windows.copy.title).toBe('copie.app');
    expect(en.windows.copy.title).toBe('copy.app');
    expect(fr.windows.settings.title).toBe('reglages.app');
    expect(en.windows.settings.title).toBe('settings.app');
    expect(fr.windows.n8nHelp.title).toBe('n8n-aide.app');
    expect(en.windows.n8nHelp.title).toBe('n8n-help.app');

    // Pluriel français : 0 et 1 singulier, >= 2 pluriel
    expect(fr.windows.adjust.badge(0)).toContain('0 QUESTION');
    expect(fr.windows.adjust.badge(1)).toContain('1 QUESTION');
    expect(fr.windows.adjust.badge(2)).toContain('2 QUESTIONS');

    // Pluriel anglais : 1 singulier, 0 et >= 2 pluriel
    expect(en.windows.adjust.badge(0)).toContain('0 QUESTIONS');
    expect(en.windows.adjust.badge(1)).toContain('1 QUESTION');
    expect(en.windows.adjust.badge(2)).toContain('2 QUESTIONS');
  });

  it('fournit les chaînes et fonctions d’interface de génération dans fr et en', () => {
    expect(fr.generation.ui.cardSubtitle).toBeTruthy();
    expect(en.generation.ui.cardSubtitle).toBeTruthy();
    expect(fr.generation.ui.charCount(50, 10, 4000)).toContain('50');
    expect(en.generation.ui.charCount(50, 10, 4000)).toContain('50');
    expect(fr.generation.ui.questionsGeneratedAnnouncement(3)).toContain('3');
    expect(en.generation.ui.questionsGeneratedAnnouncement(3)).toContain('3');
    expect(fr.generation.ui.technicalDetails(404, 'not_found')).toContain('404');
    expect(en.generation.ui.technicalDetails(404, 'not_found')).toContain('404');
  });

  it('chaque identifiant de CLAUDE_MODELS a une description non vide en FR et en EN', async () => {
    const { CLAUDE_MODELS } = await import('@/modules/claude-client');
    for (const model of CLAUDE_MODELS) {
      const descFr = fr.generation.ui.modelDescriptions[model.id];
      const descEn = en.generation.ui.modelDescriptions[model.id];

      expect(descFr).toBeTruthy();
      expect(typeof descFr).toBe('string');
      expect(descFr.trim().length).toBeGreaterThan(10);

      expect(descEn).toBeTruthy();
      expect(typeof descEn).toBe('string');
      expect(descEn.trim().length).toBeGreaterThan(10);
    }
  });

  it('vérifie les formulations justes de confiance et de sécurité (sans termes trompeurs)', () => {
    // trust.key.item1 et apiKeyWhereDetails mentionnent HTTPS et pas "sécurisé"
    expect(fr.trust.key.item1).toContain('HTTPS');
    expect(fr.trust.key.item1.toLowerCase()).not.toContain('sécurisé');
    expect(en.trust.key.item1).toContain('HTTPS');
    expect(en.trust.key.item1.toLowerCase()).not.toContain('secure');

    expect(fr.generation.ui.apiKeyWhereDetails).toContain('HTTPS');
    expect(fr.generation.ui.apiKeyWhereDetails.toLowerCase()).not.toContain('sécurisé');
    expect(en.generation.ui.apiKeyWhereDetails).toContain('HTTPS');
    expect(en.generation.ui.apiKeyWhereDetails.toLowerCase()).not.toContain('secure');

    // trust.data.item3 mentionne les conditions d'utilisation
    expect(fr.trust.data.item3).toContain('conditions d’utilisation');
    expect(en.trust.data.item3).toContain('terms of service');

    // Absence totale de "sécurisé", "garanti" ou "100 %" dans les textes de confiance
    const allTrustFr = JSON.stringify(fr.trust).toLowerCase();
    expect(allTrustFr).not.toContain('sécurisé');
    expect(allTrustFr).not.toContain('garanti');
    expect(allTrustFr).not.toContain('100 %');
    expect(allTrustFr).not.toContain('100%');
  });

  it('vérifie le message bad_request révisé qui ne blâme plus la description seule', () => {
    expect(fr.generation.errors.bad_request).toContain('l’autre modèle');
    expect(fr.generation.errors.bad_request).toContain('détails techniques');

    expect(en.generation.errors.bad_request).toContain('other model');
    expect(en.generation.errors.bad_request).toContain('technical details');
  });

  it('vérifie l’étape 13 définitive de l’aide n8n (test réel n8n 2.33.4)', () => {
    expect(fr.editor.help.steps.step13.title).toContain('13.');
    expect(fr.editor.help.steps.step13.desc).toContain('bascule seul le champ en mode Expression');
    expect(fr.editor.help.steps.step13.desc).toContain('icône `fx`');

    expect(en.editor.help.steps.step13.title).toContain('13.');
    expect(en.editor.help.steps.step13.desc).toContain('automatically switches the field to Expression mode');
    expect(en.editor.help.steps.step13.desc).toContain('`fx` icon');
  });

  it('vérifie la parité FR/EN du nombre d’étapes (14) et de blocs (5) de l’aide n8n', () => {
    const frGroups = Object.keys(fr.editor.help.steps.groups);
    const enGroups = Object.keys(en.editor.help.steps.groups);
    expect(frGroups).toEqual(['node', 'auth', 'headers', 'body', 'reading']);
    expect(enGroups).toEqual(frGroups);
    expect(frGroups.length).toBe(5);

    const stepKeys = [
      'step1',
      'step2',
      'step3',
      'step4',
      'step5',
      'step6',
      'step7',
      'step8',
      'step9',
      'step10',
      'step11',
      'step12',
      'step13',
      'step14',
    ] as const;

    expect(stepKeys.length).toBe(14);
    for (const key of stepKeys) {
      expect(fr.editor.help.steps[key]).toBeDefined();
      expect(en.editor.help.steps[key]).toBeDefined();
      expect(fr.editor.help.steps[key].title).toBeTruthy();
      expect(en.editor.help.steps[key].title).toBeTruthy();
    }
  });

  it('vérifie la parité FR/EN des 4 étapes courtes (shortSteps) de l’aide n8n', () => {
    const shortStepKeys = ['step1', 'step2', 'step3', 'step4'] as const;
    for (const key of shortStepKeys) {
      expect(fr.editor.help.shortSteps[key]).toBeDefined();
      expect(en.editor.help.shortSteps[key]).toBeDefined();
      expect(fr.editor.help.shortSteps[key].title).toBeTruthy();
      expect(en.editor.help.shortSteps[key].title).toBeTruthy();
      expect(fr.editor.help.shortSteps[key].desc).toBeTruthy();
      expect(en.editor.help.shortSteps[key].desc).toBeTruthy();
    }
  });

  it('vérifie la présence des 10 libellés n8n clés en anglais exact dans les deux langues', () => {
    const keyLabels = [
      'Create new credential',
      'Credential for Header Auth',
      'Generic Credential Type',
      'Header Auth',
      'Send Headers',
      'Using Fields Below',
      'Content-Type',
      'application/json',
      'Send Body',
      'Using JSON',
    ];

    const frHelpAll = JSON.stringify(fr.editor.help);
    const enHelpAll = JSON.stringify(en.editor.help);

    for (const label of keyLabels) {
      expect(frHelpAll).toContain(label);
      expect(enHelpAll).toContain(label);
    }
  });


  it('utilise exclusivement « token » / « tokens » dans les estimations et tarifs', () => {
    expect(fr.generation.ui.pricingIndicative(1, 5)).toContain('tokens');
    expect(fr.generation.ui.costEstimate('$0.01', 1500, 450)).toContain('tokens');
    expect(en.generation.ui.pricingIndicative(1, 5)).toContain('tokens');
    expect(en.generation.ui.costEstimate('$0.01', 1500, 450)).toContain('tokens');
  });

  it('aucune chaîne des dictionnaires FR et EN (fonctions comprises, avec des valeurs d exemple) ne contient « jeton »', () => {
    function collectStrings(obj: unknown, path = ''): { path: string; text: string }[] {
      const results: { path: string; text: string }[] = [];
      if (typeof obj === 'string') {
        results.push({ path, text: obj });
      } else if (typeof obj === 'function') {
        const testArgs = [
          [],
          [1],
          [2],
          [1, 2],
          [1, 5],
          [100, 200],
          ['$0.01', 1500, 450],
          ['test'],
          ['test', 'test'],
          ['test', 'test', 'test'],
          [1, 1, 1],
          [1, 'modèle'],
          [500, 'error_type'],
          [{ name: 'champ', key: 'cle', count: 1, length: 1, max: 5 }],
          [{ name: 'champ', key: 'cle', count: 2, length: 10, max: 20 }],
        ];
        for (const args of testArgs) {
          try {
            const res = (obj as (...a: unknown[]) => unknown)(...args);
            if (typeof res === 'string') {
              results.push({
                path: `${path}(${args.map(a => JSON.stringify(a)).join(', ')})`,
                text: res,
              });
            }
          } catch {
            // Ignorer si la signature ne correspond pas aux arguments testés
          }
        }
      } else if (obj !== null && typeof obj === 'object') {
        for (const [key, val] of Object.entries(obj)) {
          results.push(...collectStrings(val, path ? `${path}.${key}` : key));
        }
      }
      return results;
    }

    const frStrings = collectStrings(fr, 'fr');
    const enStrings = collectStrings(en, 'en');
    const allStrings = [...frStrings, ...enStrings];

    expect(allStrings.length).toBeGreaterThan(150);

    const occurrencesWithJeton = allStrings.filter(item =>
      item.text.toLowerCase().includes('jeton')
    );

    expect(occurrencesWithJeton).toEqual([]);
  });

  it('detailHeading formate correctement le titre de détail en FR et en EN', () => {
    expect(fr.editor.questions.detailHeading(2, 3, 'Catégorie')).toBe('Question 2 sur 3 · Catégorie');
    expect(en.editor.questions.detailHeading(2, 3, 'Category')).toBe('Question 2 of 3 · Category');
  });

  it('vérifie la parité FR/EN et les termes exacts n8n pour l’import depuis n8n (ticket 8.5)', () => {
    expect(fr.editor.reads.importFromN8n).toBe('Importer depuis n8n');
    expect(en.editor.reads.importFromN8n).toBe('Import from n8n');

    const frImport = fr.editor.n8nImport;
    const enImport = en.editor.n8nImport;

    expect(frImport.errorTableView).toContain('Table');
    expect(frImport.errorTableView).toContain('JSON');
    expect(enImport.errorTableView).toContain('Table');
    expect(enImport.errorTableView).toContain('JSON');

    expect(frImport.remapCitedIn(1)).toBe('cité dans 1 question');
    expect(frImport.remapCitedIn(3)).toBe('cité dans 3 questions');
    expect(enImport.remapCitedIn(1)).toBe('cited in 1 question');
    expect(enImport.remapCitedIn(3)).toBe('cited in 3 questions');
    expect(Object.keys(frImport).sort()).toEqual(Object.keys(enImport).sort());
  });
});

describe('Module i18n — messages de validation pour chaque ValidationCode', () => {
  const realisticCases: Array<{
    code: ValidationCode;
    params?: Record<string, string | number>;
    expectedSubstringsFr: string[];
    expectedSubstringsEn: string[];
  }> = [
    {
      code: 'NO_FIELDS',
      params: undefined,
      expectedSubstringsFr: ['au moins un champ'],
      expectedSubstringsEn: ['at least one field'],
    },
    {
      code: 'FIELD_NAME_INVALID',
      params: { name: '1bad_name' },
      expectedSubstringsFr: ['1bad_name', 'invalide'],
      expectedSubstringsEn: ['1bad_name', 'invalid'],
    },
    {
      code: 'FIELD_NAME_DUPLICATE',
      params: { name: 'message' },
      expectedSubstringsFr: ['message', 'déjà utilisé'],
      expectedSubstringsEn: ['message', 'already used'],
    },
    {
      code: 'NO_QUESTIONS',
      params: undefined,
      expectedSubstringsFr: ['au moins une question'],
      expectedSubstringsEn: ['at least one question'],
    },
    {
      code: 'QUESTION_KEY_INVALID',
      params: { key: '0invalid' },
      expectedSubstringsFr: ['0invalid', 'invalide'],
      expectedSubstringsEn: ['0invalid', 'invalid'],
    },
    {
      code: 'QUESTION_KEY_DUPLICATE',
      params: { key: 'urgency' },
      expectedSubstringsFr: ['urgency', 'déjà utilisée'],
      expectedSubstringsEn: ['urgency', 'already used'],
    },
    {
      code: 'QUESTION_INSTRUCTIONS_EMPTY',
      params: undefined,
      expectedSubstringsFr: ['vide'],
      expectedSubstringsEn: ['empty'],
    },
    {
      code: 'QUESTION_NO_FIELD_CITED',
      params: undefined,
      expectedSubstringsFr: ['accents graves'],
      expectedSubstringsEn: ['backticks'],
    },
    {
      code: 'QUESTION_CITES_UNKNOWN_FIELD',
      params: { fieldName: 'inconnu' },
      expectedSubstringsFr: ['inconnu', "n'existe pas"],
      expectedSubstringsEn: ['inconnu', 'does not exist'],
    },
    {
      code: 'CHOICE_OPTIONS_TOO_FEW',
      params: { count: 1 },
      expectedSubstringsFr: ['au moins 2', '1'],
      expectedSubstringsEn: ['at least 2', '1'],
    },
    {
      code: 'CHOICE_OPTIONS_TOO_MANY',
      params: { count: 256 },
      expectedSubstringsFr: ['255', '256'],
      expectedSubstringsEn: ['255', '256'],
    },
    {
      code: 'CHOICE_OPTION_KEY_EMPTY',
      params: undefined,
      expectedSubstringsFr: ['vide'],
      expectedSubstringsEn: ['empty'],
    },
    {
      code: 'CHOICE_OPTION_DUPLICATE',
      params: { key: 'opt_dup' },
      expectedSubstringsFr: ['opt_dup', 'double'],
      expectedSubstringsEn: ['opt_dup', 'duplicated'],
    },
    {
      code: 'SCORE_LEVEL_EMPTY',
      params: undefined,
      expectedSubstringsFr: ['vide'],
      expectedSubstringsEn: ['empty'],
    },
    {
      code: 'SCORE_LEVELS_OUT_OF_RANGE',
      params: { count: 12 },
      expectedSubstringsFr: ['entre 2 et 10', '12'],
      expectedSubstringsEn: ['between 2 and 10', '12'],
    },
    {
      code: 'TEXT_CONTAINS_N8N_DELIMITERS',
      params: undefined,
      expectedSubstringsFr: ['{{', '}}'],
      expectedSubstringsEn: ['{{', '}}'],
    },
  ];

  it('couvre l ensemble des 16 ValidationCodes', () => {
    expect(realisticCases).toHaveLength(16);
    const codesInFr = Object.keys(validationMessagesFr);
    const codesInEn = Object.keys(validationMessagesEn);
    expect(codesInFr).toHaveLength(16);
    expect(codesInEn).toHaveLength(16);
  });

  describe.each(realisticCases)(
    'Code $code',
    ({ code, params, expectedSubstringsFr, expectedSubstringsEn }) => {
      it(`génère un message non vide et interpolé en FR pour ${code}`, () => {
        const fnFr = validationMessagesFr[code];
        expect(fnFr).toBeDefined();
        const msgFr = fnFr(params);
        expect(typeof msgFr).toBe('string');
        expect(msgFr.trim().length).toBeGreaterThan(0);
        for (const sub of expectedSubstringsFr) {
          expect(msgFr).toContain(sub);
        }
      });

      it(`génère un message non vide et interpolé en EN pour ${code}`, () => {
        const fnEn = validationMessagesEn[code];
        expect(fnEn).toBeDefined();
        const msgEn = fnEn(params);
        expect(typeof msgEn).toBe('string');
        expect(msgEn.trim().length).toBeGreaterThan(0);
        for (const sub of expectedSubstringsEn) {
          expect(msgEn).toContain(sub);
        }
      });
    }
  );

  it('relecture rédactionnelle : aucun message ne contient le terme technique "ASCII"', () => {
    for (const code of Object.keys(validationMessagesFr) as ValidationCode[]) {
      const msgFr = validationMessagesFr[code]({ name: 'x', key: 'y', count: 1 });
      const msgEn = validationMessagesEn[code]({ name: 'x', key: 'y', count: 1 });
      expect(msgFr).not.toContain('ASCII');
      expect(msgEn).not.toContain('ASCII');
    }
  });

  it('relecture rédactionnelle : explicite l action pour TEXT_CONTAINS_N8N_DELIMITERS', () => {
    const msgFr = validationMessagesFr.TEXT_CONTAINS_N8N_DELIMITERS();
    const msgEn = validationMessagesEn.TEXT_CONTAINS_N8N_DELIMITERS();
    expect(msgFr).toContain('Retire-les ou reformule');
    expect(msgEn).toContain('Remove them or rephrase');
  });

  it('relecture rédactionnelle : gestion soignée des singuliers/pluriels', () => {
    expect(validationMessagesFr.CHOICE_OPTIONS_TOO_FEW({ count: 1 })).toContain('1 fournie');
    expect(validationMessagesFr.CHOICE_OPTIONS_TOO_FEW({ count: 2 })).toContain('2 fournies');
    expect(validationMessagesFr.SCORE_LEVELS_OUT_OF_RANGE({ count: 1 })).toContain('1 fourni');
    expect(validationMessagesFr.SCORE_LEVELS_OUT_OF_RANGE({ count: 12 })).toContain('12 fournis');
  });
});

describe('Module i18n — metadata & hreflang', () => {
  it('construit les URLs relatives si NEXT_PUBLIC_SITE_URL est absente', () => {
    const urls = buildAlternateUrls();
    expect(urls).toEqual({
      fr: '/fr',
      en: '/en',
      'x-default': '/en',
    });
  });

  it('construit les URLs absolues avec domaine et normalise le slash final', () => {
    const urls = buildAlternateUrls('https://easyjev.com/');
    expect(urls).toEqual({
      fr: 'https://easyjev.com/fr',
      en: 'https://easyjev.com/en',
      'x-default': 'https://easyjev.com/en',
    });
  });

  it('génère les métadonnées avec hreflang et balises de langue pour fr et en', () => {
    const metaFr = buildMetadata('fr', 'https://easyjev.com');
    expect(metaFr.title).toBe(fr.meta.title);
    expect(metaFr.description).toBe(fr.meta.description);
    expect(metaFr.alternates?.canonical).toBe('https://easyjev.com/fr');
    expect(metaFr.alternates?.languages).toEqual({
      fr: 'https://easyjev.com/fr',
      en: 'https://easyjev.com/en',
      'x-default': 'https://easyjev.com/en',
    });

    const metaEn = buildMetadata('en', 'https://easyjev.com');
    expect(metaEn.title).toBe(en.meta.title);
    expect(metaEn.description).toBe(en.meta.description);
    expect(metaEn.alternates?.canonical).toBe('https://easyjev.com/en');
    expect(metaEn.alternates?.languages).toEqual({
      fr: 'https://easyjev.com/fr',
      en: 'https://easyjev.com/en',
      'x-default': 'https://easyjev.com/en',
    });
  });

  it('génère les métadonnées de la page démo avec path /demo et hreflang corrects', () => {
    const metaDemoFr = buildMetadata('fr', 'https://easyjev.com', {
      path: '/demo',
      title: fr.demo.meta.title,
      description: fr.demo.meta.description,
    });
    expect(metaDemoFr.title).toBe(fr.demo.meta.title);
    expect(metaDemoFr.description).toBe(fr.demo.meta.description);
    expect(metaDemoFr.alternates?.canonical).toBe('https://easyjev.com/fr/demo');
    expect(metaDemoFr.alternates?.languages).toEqual({
      fr: 'https://easyjev.com/fr/demo',
      en: 'https://easyjev.com/en/demo',
      'x-default': 'https://easyjev.com/en/demo',
    });

    const metaDemoEn = buildMetadata('en', 'https://easyjev.com', {
      path: '/demo',
      title: en.demo.meta.title,
      description: en.demo.meta.description,
    });
    expect(metaDemoEn.title).toBe(en.demo.meta.title);
    expect(metaDemoEn.description).toBe(en.demo.meta.description);
    expect(metaDemoEn.alternates?.canonical).toBe('https://easyjev.com/en/demo');
    expect(metaDemoEn.alternates?.languages).toEqual({
      fr: 'https://easyjev.com/fr/demo',
      en: 'https://easyjev.com/en/demo',
      'x-default': 'https://easyjev.com/en/demo',
    });
  });

  it('interdit rigoureusement le mot jeton dans fr.ts et en.ts (règle produit token uniquement)', () => {
    const frJson = JSON.stringify(fr);
    const enJson = JSON.stringify(en);
    const jetonRegex = /\bjetons?\b/i;

    expect(jetonRegex.test(frJson)).toBe(false);
    expect(jetonRegex.test(enJson)).toBe(false);
  });

  it('couvre avec parité stricte FR/EN toutes les clés et fonctions de la section demo', () => {
    const keys = (o: object): string[] => Object.keys(o).sort();
    expect(keys(fr.demo)).toEqual(keys(en.demo));
    expect(keys(fr.demo.controls)).toEqual(keys(en.demo.controls));
    expect(keys(fr.demo.scenes)).toEqual(keys(en.demo.scenes));
    expect(keys(fr.demo.stage)).toEqual(keys(en.demo.stage));
    expect(Object.keys(fr.demo.scenes)).toHaveLength(6);
    expect(fr.demo.stage.q1Options).toHaveLength(en.demo.stage.q1Options.length);

    expect(fr.demo.controls.stepsNavAria).not.toBe(en.demo.controls.stepsNavAria);
    expect(fr.demo.stage.itemsCount(1)).toContain('1');
    expect(en.demo.stage.itemsCount(1)).toBe('1 item');
    expect(en.demo.stage.itemsCount(3)).toBe('3 items');
    expect(fr.demo.stage.charCount(15)).toContain('15');
    expect(en.demo.stage.charCount(15)).toContain('15');
    expect(fr.demo.controls.stepAria(2, 'x')).toContain('2');
    expect(en.demo.controls.stepAria(2, 'x')).toContain('2');
  });
});

import { describe, it, expect } from 'vitest';
import { parseN8nInput, MAX_N8N_INPUT_SIZE } from '@/modules/editor/n8n-input';

describe('Module editor — parseN8nInput', () => {
  it('tableau d’objets : retient les champs du premier élément', () => {
    const raw = JSON.stringify([
      { id: 101, nom: 'Alpha', statut: 'actif' },
      { id: 102, nom: 'Beta', statut: 'inactif' },
    ]);
    const res = parseN8nInput(raw);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.fields.map(f => f.name)).toEqual(['id', 'nom', 'statut']);
    expect(res.fields[0]?.kind).toBe('number');
    expect(res.fields[1]?.kind).toBe('text');
  });

  it('objet seul : extrait les clés et les types', () => {
    const raw = JSON.stringify({
      titre: 'Mon titre',
      score: 95,
      actif: true,
    });
    const res = parseN8nInput(raw);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.fields.map(f => f.name)).toEqual(['titre', 'score', 'actif']);
    expect(res.fields[0]?.kind).toBe('text');
    expect(res.fields[1]?.kind).toBe('number');
    expect(res.fields[2]?.kind).toBe('other');
  });

  it('format n8n enveloppé dans { "json": { … } } : extrait le contenu de json', () => {
    const singleWrapped = JSON.stringify({
      json: {
        message: 'hello',
        count: 3,
      },
    });
    const resSingle = parseN8nInput(singleWrapped);
    expect(resSingle.ok).toBe(true);
    if (resSingle.ok) {
      expect(resSingle.fields.map(f => f.name)).toEqual(['message', 'count']);
    }

    const arrayWrapped = JSON.stringify([
      {
        json: {
          client: 'Acme',
          total: 450,
        },
      },
    ]);
    const resArray = parseN8nInput(arrayWrapped);
    expect(resArray.ok).toBe(true);
    if (resArray.ok) {
      expect(resArray.fields.map(f => f.name)).toEqual(['client', 'total']);
    }
  });

  it('JSON invalide : renvoie invalid_json pour du JSON malformé', () => {
    const badJson = '{"champ": 1, }';
    const res = parseN8nInput(badJson);

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe('invalid_json');
    }

    const unclosedJson = '{"champ": "texte';
    const resUnclosed = parseN8nInput(unclosedJson);
    expect(resUnclosed.ok).toBe(false);
    if (!resUnclosed.ok) {
      expect(resUnclosed.error).toBe('invalid_json');
    }
  });

  it('tableau vide : renvoie empty', () => {
    const res = parseN8nInput('[]');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe('empty');
    }
  });

  it('objet vide ou aucune clé : renvoie empty', () => {
    expect(parseN8nInput('{}')).toEqual({ ok: false, error: 'empty' });
    expect(parseN8nInput('[{}]')).toEqual({ ok: false, error: 'empty' });
    expect(parseN8nInput('{"json": {}}')).toEqual({ ok: false, error: 'empty' });
    expect(parseN8nInput('[{"json": {}}]')).toEqual({ ok: false, error: 'empty' });
    expect(parseN8nInput('   \n  ')).toEqual({ ok: false, error: 'empty' });
  });

  it('valeur non objet (42, "texte", null, etc.) : renvoie not_object', () => {
    expect(parseN8nInput('42')).toEqual({ ok: false, error: 'not_object' });
    expect(parseN8nInput('"texte"')).toEqual({ ok: false, error: 'not_object' });
    expect(parseN8nInput('true')).toEqual({ ok: false, error: 'not_object' });
    expect(parseN8nInput('null')).toEqual({ ok: false, error: 'not_object' });
    expect(parseN8nInput('[42]')).toEqual({ ok: false, error: 'not_object' });
    expect(parseN8nInput('["texte"]')).toEqual({ ok: false, error: 'not_object' });
  });

  it('vue Table collée (texte non JSON ou TSV) : renvoie table_view', () => {
    const tsv = 'row_number\tsteam_store_url\tcategorie\n1\thttps://store...\tIndie';
    expect(parseN8nInput(tsv)).toEqual({ ok: false, error: 'table_view' });

    const plainText = 'Ceci est un texte brut copié sans accolades';
    expect(parseN8nInput(plainText)).toEqual({ ok: false, error: 'table_view' });
  });

  it('champs imbriqués (objets ou tableaux) : non cochables avec unusableReason = nested', () => {
    const raw = JSON.stringify({
      metadata: { source: 'api', version: 2 },
      tags: ['indie', 'rpg'],
      normal: 'valeur',
    });
    const res = parseN8nInput(raw);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const meta = res.fields.find(f => f.name === 'metadata');
    expect(meta).toBeDefined();
    expect(meta?.kind).toBe('nested');
    expect(meta?.usable).toBe(false);
    expect(meta?.unusableReason).toBe('nested');

    const tags = res.fields.find(f => f.name === 'tags');
    expect(tags).toBeDefined();
    expect(tags?.kind).toBe('nested');
    expect(tags?.usable).toBe(false);
    expect(tags?.unusableReason).toBe('nested');

    const normal = res.fields.find(f => f.name === 'normal');
    expect(normal?.usable).toBe(true);
    expect(normal?.unusableReason).toBeUndefined();
  });

  it('noms incompatibles (espaces, accents, commence par un chiffre) : grisés avec unusableReason = invalid_name', () => {
    const raw = JSON.stringify({
      'champ avec espace': 'test',
      'catégorie': 'jeux',
      '123chiffre': 'num',
      'champ_valide': 'ok',
    });
    const res = parseN8nInput(raw);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const spaceField = res.fields.find(f => f.name === 'champ avec espace');
    expect(spaceField?.usable).toBe(false);
    expect(spaceField?.unusableReason).toBe('invalid_name');

    const accentField = res.fields.find(f => f.name === 'catégorie');
    expect(accentField?.usable).toBe(false);
    expect(accentField?.unusableReason).toBe('invalid_name');

    const digitField = res.fields.find(f => f.name === '123chiffre');
    expect(digitField?.usable).toBe(false);
    expect(digitField?.unusableReason).toBe('invalid_name');

    const validField = res.fields.find(f => f.name === 'champ_valide');
    expect(validField?.usable).toBe(true);
    expect(validField?.unusableReason).toBeUndefined();
  });

  it('clés réelles n8n comme row_number, steam_store_url, categorie : acceptées et utilisables', () => {
    const raw = JSON.stringify({
      row_number: 1,
      steam_store_url: 'https://store.steampowered.com/app/12345',
      categorie: 'Indie',
    });
    const res = parseN8nInput(raw);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.fields).toHaveLength(3);
    expect(res.fields.every(f => f.usable)).toBe(true);
    expect(res.fields.find(f => f.name === 'row_number')?.kind).toBe('number');
    expect(res.fields.find(f => f.name === 'steam_store_url')?.kind).toBe('text');
    expect(res.fields.find(f => f.name === 'categorie')?.kind).toBe('text');
  });

  it('types détectés : texte, nombre, booléen/null → autre', () => {
    const raw = JSON.stringify({
      texte: 'bonjour',
      nombre: 42,
      booleen: false,
      vide: null,
    });
    const res = parseN8nInput(raw);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.fields.find(f => f.name === 'texte')?.kind).toBe('text');
    expect(res.fields.find(f => f.name === 'nombre')?.kind).toBe('number');
    expect(res.fields.find(f => f.name === 'booleen')?.kind).toBe('other');
    expect(res.fields.find(f => f.name === 'vide')?.kind).toBe('other');
  });

  it('aperçu de valeur tronqué (~40 caractères)', () => {
    const longString = 'A'.repeat(60);
    const shortString = 'Court';
    const raw = JSON.stringify({ longString, shortString });
    const res = parseN8nInput(raw);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const longField = res.fields.find(f => f.name === 'longString');
    expect(longField?.preview.length).toBeLessThanOrEqual(41);
    expect(longField?.preview).toContain('…');

    const shortField = res.fields.find(f => f.name === 'shortString');
    expect(shortField?.preview).toBe('Court');
  });

  it('valeur d’exemple tronquée à 200 caractères sans ellipse', () => {
    const longVal = 'B'.repeat(300);
    const raw = JSON.stringify({ longVal });
    const res = parseN8nInput(raw);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const field = res.fields.find(f => f.name === 'longVal');
    expect(field?.exampleValue).toBeDefined();
    expect(field?.exampleValue?.length).toBe(200);
    expect(field?.exampleValue).toBe('B'.repeat(200));
  });

  it('refus au-delà de 1 Mo de texte collé : renvoie too_large', () => {
    const bigText = ' '.repeat(MAX_N8N_INPUT_SIZE + 1);
    const res = parseN8nInput(bigText);

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe('too_large');
    }
  });

  it('ordre conservé fidèlement selon le JSON collé', () => {
    const raw = JSON.stringify({
      zulu: 1,
      alpha: 2,
      mike: 3,
      bravo: 4,
    });
    const res = parseN8nInput(raw);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.fields.map(f => f.name)).toEqual(['zulu', 'alpha', 'mike', 'bravo']);
  });
});

import { describe, it, expect } from 'vitest';
import { splitCitations, remapFieldCitations } from '@/modules/editor';

describe('splitCitations — découpage des citations de champs', () => {
  it('gère une chaîne vide', () => {
    expect(splitCitations('')).toEqual([]);
  });

  it('gère un texte sans citation', () => {
    const text = 'Une question simple sans citation de champ.';
    expect(splitCitations(text)).toEqual([
      { type: 'text', value: 'Une question simple sans citation de champ.' },
    ]);
  });

  it('détecte une seule citation de champ', () => {
    const text = 'Le message `message` exprime-t-il de l’urgence ?';
    expect(splitCitations(text)).toEqual([
      { type: 'text', value: 'Le message ' },
      { type: 'field', value: 'message' },
      { type: 'text', value: ' exprime-t-il de l’urgence ?' },
    ]);
  });

  it('détecte plusieurs citations de champs', () => {
    const text = 'Comparer `nom` et `entreprise` pour qualifier le lead';
    expect(splitCitations(text)).toEqual([
      { type: 'text', value: 'Comparer ' },
      { type: 'field', value: 'nom' },
      { type: 'text', value: ' et ' },
      { type: 'field', value: 'entreprise' },
      { type: 'text', value: ' pour qualifier le lead' },
    ]);
  });

  it('traite un accent grave non fermé comme du texte simple', () => {
    const text = 'Voici un `accent grave non fermé';
    expect(splitCitations(text)).toEqual([
      { type: 'text', value: 'Voici un `accent grave non fermé' },
    ]);
  });

  it('traite un accent grave non fermé après une citation valide', () => {
    const text = 'Le champ `message` et un `autre non fermé';
    expect(splitCitations(text)).toEqual([
      { type: 'text', value: 'Le champ ' },
      { type: 'field', value: 'message' },
      { type: 'text', value: ' et un `autre non fermé' },
    ]);
  });

  it('gère un accent grave seul', () => {
    expect(splitCitations('`')).toEqual([
      { type: 'text', value: '`' },
    ]);
  });

  it('gère des accents collés sans espace intermédiaire', () => {
    expect(splitCitations('`a``b`')).toEqual([
      { type: 'field', value: 'a' },
      { type: 'field', value: 'b' },
    ]);
  });

  it('gère des citations collées entourées de texte', () => {
    expect(splitCitations('Prefix `a``b` suffix')).toEqual([
      { type: 'text', value: 'Prefix ' },
      { type: 'field', value: 'a' },
      { type: 'field', value: 'b' },
      { type: 'text', value: ' suffix' },
    ]);
  });

  it('gère un texte commençant directement par une citation', () => {
    expect(splitCitations('`objet` est-il pertinent ?')).toEqual([
      { type: 'field', value: 'objet' },
      { type: 'text', value: ' est-il pertinent ?' },
    ]);
  });

  it('gère un texte se terminant directement par une citation', () => {
    expect(splitCitations('Vérifie le champ `email`')).toEqual([
      { type: 'text', value: 'Vérifie le champ ' },
      { type: 'field', value: 'email' },
    ]);
  });

  it('gère un texte contenant uniquement une citation', () => {
    expect(splitCitations('`lead_status`')).toEqual([
      { type: 'field', value: 'lead_status' },
    ]);
  });
});

describe('remapFieldCitations — remplacement des champs cités', () => {
  it('remplace une citation', () => {
    expect(remapFieldCitations('Le `message` est-il urgent ?', { message: 'game' })).toBe(
      'Le `game` est-il urgent ?'
    );
  });

  it('remplace plusieurs citations avec une table de plusieurs champs', () => {
    expect(
      remapFieldCitations('`nom` et `entreprise` et `nom`', { nom: 'studio', entreprise: 'editeur' })
    ).toBe('`studio` et `editeur` et `studio`');
  });

  it('laisse inchangée une citation absente de la table', () => {
    expect(remapFieldCitations('`a` et `b`', { a: 'x' })).toBe('`x` et `b`');
  });

  it('laisse inchangé un accent grave non fermé', () => {
    expect(remapFieldCitations('Voir `message` puis `reste', { message: 'game' })).toBe(
      'Voir `game` puis `reste'
    );
  });

  it('ne touche pas le mot écrit en clair', () => {
    expect(remapFieldCitations('Le message est urgent', { message: 'game' })).toBe(
      'Le message est urgent'
    );
  });

  it('table vide : texte identique', () => {
    expect(remapFieldCitations('Le `message` compte', {})).toBe('Le `message` compte');
  });

  it('chaîne vide : chaîne vide', () => {
    expect(remapFieldCitations('', { a: 'b' })).toBe('');
  });
});

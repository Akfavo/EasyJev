import { describe, it, expect } from 'vitest';
import { resolveGeneratedFields } from '@/modules/editor';

const detected = ['row_number', 'game', 'publisher', 'total_reviews', 'categorie'];

describe('resolveGeneratedFields — champs lus après génération avec données collées', () => {
  it('rien de coché : garde les champs choisis par Claude, dans l’ordre des données', () => {
    expect(
      resolveGeneratedFields({
        detectedNames: detected,
        selectedNames: [],
        fieldsUsed: ['publisher', 'game'],
        instructions: ['Classer le jeu `game`', 'Éditeur `publisher` connu ?'],
      })
    ).toEqual(['game', 'publisher']);
  });

  it('champs cochés : ce sont eux, Claude n’a rien à choisir', () => {
    expect(
      resolveGeneratedFields({
        detectedNames: detected,
        selectedNames: ['categorie'],
        fieldsUsed: ['game'],
        instructions: ['Voir `categorie`'],
      })
    ).toEqual(['categorie']);
  });

  it('ajoute un champ détecté cité dans une question même absent de fields_used', () => {
    expect(
      resolveGeneratedFields({
        detectedNames: detected,
        selectedNames: [],
        fieldsUsed: ['game'],
        instructions: ['Le `game` de `publisher` est-il connu ?'],
      })
    ).toEqual(['game', 'publisher']);
  });

  it('ignore un nom inconnu (ni détecté, ni cité sur un champ détecté)', () => {
    expect(
      resolveGeneratedFields({
        detectedNames: detected,
        selectedNames: [],
        fieldsUsed: ['inconnu', 'game'],
        instructions: ['Voir `game` et `fantome`'],
      })
    ).toEqual(['game']);
  });

  it('repli : premier champ détecté quand rien n’est retenu', () => {
    expect(
      resolveGeneratedFields({
        detectedNames: detected,
        selectedNames: [],
        fieldsUsed: [],
        instructions: ['Question sans citation'],
      })
    ).toEqual(['row_number']);
  });

  it('aucun champ détecté : liste vide', () => {
    expect(
      resolveGeneratedFields({ detectedNames: [], selectedNames: [], fieldsUsed: [], instructions: [] })
    ).toEqual([]);
  });
});

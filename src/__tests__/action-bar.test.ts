import { describe, it, expect } from 'vitest';
import {
  shouldShowActionBar,
  getActionBarStatus,
  getActionBarSummary,
} from '@/modules/editor';
import { fr, en } from '@/modules/i18n';

describe('Logique pure de la barre d action (action-bar)', () => {
  const frLabels = fr.editor.output;
  const enLabels = en.editor.output;

  describe('shouldShowActionBar', () => {
    it('renvoie false si 0 question, que le résultat soit visible ou masqué', () => {
      expect(shouldShowActionBar(0, true)).toBe(false);
      expect(shouldShowActionBar(0, false)).toBe(false);
    });

    it('renvoie false si le résultat est visible, même avec au moins une question', () => {
      expect(shouldShowActionBar(1, true)).toBe(false);
      expect(shouldShowActionBar(5, true)).toBe(false);
    });

    it('renvoie true si au moins une question et le résultat est hors écran (masqué)', () => {
      expect(shouldShowActionBar(1, false)).toBe(true);
      expect(shouldShowActionBar(3, false)).toBe(true);
    });
  });

  describe('getActionBarStatus', () => {
    it('renvoie ready si isValid est vrai', () => {
      expect(getActionBarStatus(true)).toBe('ready');
    });

    it('renvoie errors si isValid est faux', () => {
      expect(getActionBarStatus(false)).toBe('errors');
    });
  });

  describe('getActionBarSummary en français', () => {
    it('affiche le résumé prêt avec accord singulier (1 question)', () => {
      const summary = getActionBarSummary(1, true, 0, frLabels);
      expect(summary).toBe('1 question · JSON prêt');
    });

    it('affiche le résumé prêt avec accord pluriel (3 questions)', () => {
      const summary = getActionBarSummary(3, true, 0, frLabels);
      expect(summary).toBe('3 questions · JSON prêt');
    });

    it('affiche le résumé des erreurs avec accord singulier (1 erreur)', () => {
      const summary = getActionBarSummary(2, false, 1, frLabels);
      expect(summary).toBe('1 erreur à corriger');
    });

    it('affiche le résumé des erreurs avec accord pluriel (2 erreurs)', () => {
      const summary = getActionBarSummary(2, false, 2, frLabels);
      expect(summary).toBe('2 erreurs à corriger');
    });
  });

  describe('getActionBarSummary en anglais', () => {
    it('affiche le résumé prêt avec accord singulier (1 question)', () => {
      const summary = getActionBarSummary(1, true, 0, enLabels);
      expect(summary).toBe('1 question · JSON ready');
    });

    it('affiche le résumé prêt avec accord pluriel (3 questions)', () => {
      const summary = getActionBarSummary(3, true, 0, enLabels);
      expect(summary).toBe('3 questions · JSON ready');
    });

    it('affiche le résumé des erreurs avec accord singulier (1 error)', () => {
      const summary = getActionBarSummary(2, false, 1, enLabels);
      expect(summary).toBe('1 error to fix');
    });

    it('affiche le résumé des erreurs avec accord pluriel (2 errors)', () => {
      const summary = getActionBarSummary(2, false, 2, enLabels);
      expect(summary).toBe('2 errors to fix');
    });
  });
});

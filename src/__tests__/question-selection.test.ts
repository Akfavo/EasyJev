import { describe, it, expect } from 'vitest';
import {
  resolveSelectedQuestionId,
  getSelectionAfterDelete,
} from '@/modules/editor';

describe('question-selection (fonctions pures)', () => {
  describe('resolveSelectedQuestionId', () => {
    it('renvoie null si la liste est vide', () => {
      expect(resolveSelectedQuestionId([], null)).toBeNull();
      expect(resolveSelectedQuestionId([], 'q1')).toBeNull();
    });

    it('renvoie selectedId si la question existe toujours dans la liste', () => {
      const questions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }];
      expect(resolveSelectedQuestionId(questions, 'q2')).toBe('q2');
      expect(resolveSelectedQuestionId(questions, 'q3')).toBe('q3');
      expect(resolveSelectedQuestionId(questions, 'q1')).toBe('q1');
    });

    it('renvoie la première question si selectedId est null ou inconnu', () => {
      const questions = [{ id: 'q1' }, { id: 'q2' }];
      expect(resolveSelectedQuestionId(questions, null)).toBe('q1');
      expect(resolveSelectedQuestionId(questions, 'inconnu')).toBe('q1');
    });

    it('ne mute pas la liste d entrée', () => {
      const questions = Object.freeze([{ id: 'q1' }, { id: 'q2' }]);
      expect(resolveSelectedQuestionId(questions, 'q2')).toBe('q2');
    });
  });

  describe('getSelectionAfterDelete', () => {
    it('renvoie null si la liste est vide', () => {
      expect(getSelectionAfterDelete([], 'q1')).toBeNull();
    });

    it('renvoie null si l unique question de la liste est supprimée', () => {
      const questions = [{ id: 'q1' }];
      expect(getSelectionAfterDelete(questions, 'q1')).toBeNull();
    });

    it('renvoie le voisin suivant quand la première question est supprimée', () => {
      const questions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }];
      expect(getSelectionAfterDelete(questions, 'q1')).toBe('q2');
    });

    it('renvoie le voisin suivant quand une question intermédiaire est supprimée', () => {
      const questions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }];
      expect(getSelectionAfterDelete(questions, 'q2')).toBe('q3');
    });

    it('renvoie le voisin précédent quand la dernière question est supprimée', () => {
      const questions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }];
      expect(getSelectionAfterDelete(questions, 'q3')).toBe('q2');
    });

    it('renvoie la première question si l identifiant à supprimer est inconnu', () => {
      const questions = [{ id: 'q1' }, { id: 'q2' }];
      expect(getSelectionAfterDelete(questions, 'inconnu')).toBe('q1');
    });

    it('ne mute pas la liste d entrée', () => {
      const questions = Object.freeze([{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }]);
      expect(getSelectionAfterDelete(questions, 'q2')).toBe('q3');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { isStartingPointOpen } from '@/modules/editor';
import { getModelShortLabel, CLAUDE_MODELS } from '@/modules/claude-client';

describe('isStartingPointOpen', () => {
  it('en mode auto : ouverte sans travail, repliée avec du travail', () => {
    expect(isStartingPointOpen('auto', false)).toBe(true);
    expect(isStartingPointOpen('auto', true)).toBe(false);
  });

  it('en mode open : toujours ouverte, même avec du travail', () => {
    expect(isStartingPointOpen('open', false)).toBe(true);
    expect(isStartingPointOpen('open', true)).toBe(true);
  });

  it('en mode closed : toujours repliée, même sans travail', () => {
    expect(isStartingPointOpen('closed', false)).toBe(false);
    expect(isStartingPointOpen('closed', true)).toBe(false);
  });
});

describe('getModelShortLabel', () => {
  it('renvoie le libellé court de chaque modèle configuré', () => {
    for (const model of CLAUDE_MODELS) {
      expect(getModelShortLabel(model.id)).toBe(model.shortLabel);
      expect(model.shortLabel.length).toBeGreaterThan(0);
    }
  });

  it('renvoie l’identifiant tel quel pour un modèle inconnu', () => {
    expect(getModelShortLabel('modele-inconnu')).toBe('modele-inconnu');
  });
});

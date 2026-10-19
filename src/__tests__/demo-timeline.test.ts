import { describe, it, expect } from 'vitest';
import {
  DEMO_SCENES,
  DEMO_RESULT_ROWS,
  getDemoResult,
  getTotalDuration,
  clampTime,
  getSceneStart,
  getSceneAt,
  nextSceneStart,
  previousSceneStart,
  cursorAt,
  between,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  quadBezier,
} from '@/modules/demo';

describe('demo timeline', () => {
  it('définit 6 scènes ordonnées pour une durée totale de 29 secondes', () => {
    expect(DEMO_SCENES.map(s => s.id)).toEqual(['hook', 'describe', 'adjust', 'copy', 'run', 'result']);
    expect(getTotalDuration()).toBe(29000);
    expect(DEMO_SCENES.every(s => s.durationMs > 0)).toBe(true);
  });

  it('clampTime borne les valeurs', () => {
    expect(clampTime(-500, 29000)).toBe(0);
    expect(clampTime(Number.NaN, 29000)).toBe(0);
    expect(clampTime(12000, 29000)).toBe(12000);
    expect(clampTime(30000, 29000)).toBe(29000);
  });

  it('getSceneStart cumule les durées', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(i => getSceneStart(i))).toEqual([0, 4500, 10000, 15000, 18500, 23500, 29000]);
    expect(getSceneStart(-1)).toBe(0);
    expect(getSceneStart(10)).toBe(29000);
  });

  it('getSceneAt donne la scène et la progression', () => {
    expect(getSceneAt(0)).toEqual({ index: 0, progress: 0 });
    expect(getSceneAt(29000)).toEqual({ index: 5, progress: 1 });
    expect(getSceneAt(2250).progress).toBeCloseTo(0.5, 4);
    expect(getSceneAt(4499).index).toBe(0);
    expect(getSceneAt(4500)).toEqual({ index: 1, progress: 0 });
  });

  it('nextSceneStart et previousSceneStart naviguent entre les scènes', () => {
    expect(nextSceneStart(0)).toBe(4500);
    expect(nextSceneStart(4500)).toBe(10000);
    expect(nextSceneStart(26000)).toBe(29000);
    expect(previousSceneStart(200)).toBe(0);
    expect(previousSceneStart(7000)).toBe(4500);
    expect(previousSceneStart(10200)).toBe(4500);
  });
});

describe('demo cursorAt', () => {
  const path = [
    [0, 0, 0],
    [0.5, 50, 20],
    [1, 100, 40],
  ] as const;

  it('interpole entre les points de passage', () => {
    expect(cursorAt(path, 0)).toEqual({ x: 0, y: 0 });
    expect(cursorAt(path, 0.25)).toEqual({ x: 25, y: 10 });
    expect(cursorAt(path, 0.75)).toEqual({ x: 75, y: 30 });
    expect(cursorAt(path, 1)).toEqual({ x: 100, y: 40 });
  });

  it('borne hors intervalle et gère une liste vide', () => {
    expect(cursorAt(path, -1)).toEqual({ x: 0, y: 0 });
    expect(cursorAt(path, 2)).toEqual({ x: 100, y: 40 });
    expect(cursorAt([], 0.5)).toEqual({ x: 0, y: 0 });
  });
});

describe('demo motion', () => {
  it('between borne la progression entre deux instants', () => {
    expect(between(0.1, 0.2, 0.6)).toBe(0);
    expect(between(0.4, 0.2, 0.6)).toBeCloseTo(0.5, 6);
    expect(between(0.9, 0.2, 0.6)).toBe(1);
    expect(between(0.5, 0.5, 0.5)).toBe(1);
  });

  it('les courbes partent de 0 et arrivent à 1', () => {
    for (const ease of [easeOutCubic, easeInOutCubic, easeOutBack]) {
      expect(ease(0)).toBeCloseTo(0, 6);
      expect(ease(1)).toBeCloseTo(1, 6);
    }
    expect(easeOutBack(0.7)).toBeGreaterThan(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 6);
  });

  it('quadBezier passe par les extrémités et se courbe vers le point de contrôle', () => {
    const a = { x: 0, y: 0 };
    const c = { x: 50, y: -40 };
    const b = { x: 100, y: 0 };
    expect(quadBezier(a, c, b, 0)).toEqual(a);
    expect(quadBezier(a, c, b, 1)).toEqual(b);
    expect(quadBezier(a, c, b, 0.5)).toEqual({ x: 50, y: -20 });
  });

  it('cursorAt applique la courbe entre deux points', () => {
    const path = [
      [0, 0, 0],
      [1, 100, 0],
    ] as const;
    expect(cursorAt(path, 0.5, easeInOutCubic).x).toBeCloseTo(50, 6);
    expect(cursorAt(path, 0.25, easeInOutCubic).x).toBeLessThan(25);
  });
});

describe('demo résultats', () => {
  it('répond Oui au-dessus de 1000 avis et Non en dessous', () => {
    expect(DEMO_RESULT_ROWS.map(r => r.popular)).toEqual([true, false, true]);
    expect(getDemoResult({ game: 'x', publisher: 'y', total_reviews: 1000, categorie: 'RPG' }).popular).toBe(false);
    expect(getDemoResult({ game: 'x', publisher: 'y', total_reviews: 1001, categorie: 'RPG' }).popular).toBe(true);
  });

  it('associe chaque jeu à un genre existant des options', () => {
    expect(DEMO_RESULT_ROWS.map(r => r.genreIndex)).toEqual([0, 1, 2]);
  });
});

/** Outils de motion design purs : courbes d'accélération et trajectoires (aucune dépendance au DOM). */

export const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

/** Progression 0 → 1 entre deux instants de la scène (0 avant `from`, 1 après `to`). */
export function between(progress: number, from: number, to: number): number {
  if (to <= from) return progress >= to ? 1 : 0;
  return clamp01((progress - from) / (to - from));
}

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - clamp01(t), 3);

export const easeInOutCubic = (t: number): number => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/** Léger dépassement puis retour : effet « pop » à l'apparition. */
export const easeOutBack = (t: number): number => {
  const x = clamp01(t);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

export interface Point {
  x: number;
  y: number;
}

/** Point d'une courbe de Bézier quadratique (trajectoire en arc). */
export function quadBezier(p0: Point, control: Point, p2: Point, t: number): Point {
  const x = clamp01(t);
  const a = (1 - x) * (1 - x);
  const b = 2 * (1 - x) * x;
  const c = x * x;
  return { x: a * p0.x + b * control.x + c * p2.x, y: a * p0.y + b * control.y + c * p2.y };
}

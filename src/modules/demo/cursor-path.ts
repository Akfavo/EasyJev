/** Point de passage du curseur : [progression 0-1, x en %, y en %]. */
export type CursorWaypoint = readonly [number, number, number];

/** Position du curseur ; `ease` adoucit chaque déplacement entre deux points (linéaire par défaut). */
export function cursorAt(
  waypoints: readonly CursorWaypoint[],
  progress: number,
  ease: (t: number) => number = t => t
): { x: number; y: number } {
  const first = waypoints[0];
  if (!first) return { x: 0, y: 0 };
  if (progress <= first[0]) return { x: first[1], y: first[2] };
  for (let i = 1; i < waypoints.length; i++) {
    const a = waypoints[i - 1]!;
    const b = waypoints[i]!;
    if (progress <= b[0]) {
      const span = b[0] - a[0];
      const t = ease(span > 0 ? (progress - a[0]) / span : 1);
      return { x: a[1] + (b[1] - a[1]) * t, y: a[2] + (b[2] - a[2]) * t };
    }
  }
  const last = waypoints[waypoints.length - 1]!;
  return { x: last[1], y: last[2] };
}

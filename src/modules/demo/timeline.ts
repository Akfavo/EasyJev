export type DemoSceneId = 'hook' | 'describe' | 'adjust' | 'copy' | 'run' | 'result';

export interface DemoSceneDefinition {
  readonly id: DemoSceneId;
  readonly durationMs: number;
}

export const DEMO_SCENES: readonly DemoSceneDefinition[] = [
  { id: 'hook', durationMs: 4500 },
  { id: 'describe', durationMs: 5500 },
  { id: 'adjust', durationMs: 5000 },
  { id: 'copy', durationMs: 3500 },
  { id: 'run', durationMs: 5000 },
  { id: 'result', durationMs: 5500 },
] as const;

export function getTotalDuration(
  scenes: readonly DemoSceneDefinition[] = DEMO_SCENES
): number {
  return scenes.reduce((sum, scene) => sum + scene.durationMs, 0);
}

export function clampTime(elapsedMs: number, totalDuration: number): number {
  if (Number.isNaN(elapsedMs) || elapsedMs <= 0) return 0;
  if (elapsedMs >= totalDuration) return totalDuration;
  return elapsedMs;
}

export function getSceneStart(
  index: number,
  scenes: readonly DemoSceneDefinition[] = DEMO_SCENES
): number {
  if (scenes.length === 0 || index <= 0) return 0;
  const targetIndex = Math.min(index, scenes.length);
  let acc = 0;
  for (let i = 0; i < targetIndex; i++) {
    acc += scenes[i]!.durationMs;
  }
  return acc;
}

export function getSceneAt(
  elapsedMs: number,
  scenes: readonly DemoSceneDefinition[] = DEMO_SCENES
): { index: number; progress: number } {
  if (scenes.length === 0) {
    return { index: 0, progress: 0 };
  }
  const total = getTotalDuration(scenes);
  if (elapsedMs <= 0) {
    return { index: 0, progress: 0 };
  }
  if (elapsedMs >= total) {
    return { index: scenes.length - 1, progress: 1 };
  }

  let acc = 0;
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i]!;
    const start = acc;
    const end = start + scene.durationMs;
    if (elapsedMs < end || i === scenes.length - 1) {
      const progress = scene.durationMs > 0 ? (elapsedMs - start) / scene.durationMs : 1;
      return { index: i, progress: Math.min(1, Math.max(0, progress)) };
    }
    acc = end;
  }

  return { index: scenes.length - 1, progress: 1 };
}

export function nextSceneStart(
  elapsedMs: number,
  scenes: readonly DemoSceneDefinition[] = DEMO_SCENES
): number {
  if (scenes.length === 0) return 0;
  const { index } = getSceneAt(elapsedMs, scenes);
  if (index < scenes.length - 1) {
    return getSceneStart(index + 1, scenes);
  }
  return getTotalDuration(scenes);
}

export function previousSceneStart(
  elapsedMs: number,
  scenes: readonly DemoSceneDefinition[] = DEMO_SCENES
): number {
  if (scenes.length === 0 || elapsedMs <= 0) return 0;
  const { index } = getSceneAt(elapsedMs, scenes);
  const currentStart = getSceneStart(index, scenes);
  if (elapsedMs - currentStart > 500) {
    return currentStart;
  }
  if (index > 0) {
    return getSceneStart(index - 1, scenes);
  }
  return 0;
}

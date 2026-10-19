'use client';

import { useEffect, useRef, useState } from 'react';
import { getDictionary, type Locale } from '@/modules/i18n';
import {
  DEMO_SCENES,
  getTotalDuration,
  getSceneAt,
  getSceneStart,
} from '@/modules/demo';
import { DemoStage } from './demo-stage';

interface DemoPlayerProps {
  currentLocale: Locale;
}

export function DemoPlayer({ currentLocale }: DemoPlayerProps) {
  const dict = getDictionary(currentLocale);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [playing, setPlaying] = useState(false);

  const lastTimeRef = useRef<number | null>(null);
  const totalDuration = getTotalDuration(DEMO_SCENES);

  const tDemo = dict.demo;
  const tControls = tDemo.controls;

  const scenesList = [
    tDemo.scenes.hook,
    tDemo.scenes.describe,
    tDemo.scenes.adjust,
    tDemo.scenes.copy,
    tDemo.scenes.run,
    tDemo.scenes.result,
  ];

  // Lecture automatique, sauf si l'utilisateur a réduit les animations
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mediaQuery.matches) {
      setPlaying(true);
    }
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) setPlaying(false);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Pause quand l'onglet est caché
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Boucle d'animation basée sur le temps écoulé réel
  useEffect(() => {
    if (!playing) {
      lastTimeRef.current = null;
      return;
    }

    let animationFrameId: number;

    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setElapsedMs(prev => {
        const nextTime = prev + delta;
        if (nextTime >= totalDuration) {
          setPlaying(false);
          return totalDuration;
        }
        return nextTime;
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [playing, totalDuration]);

  const { index: activeIndex, progress: activeProgress } = getSceneAt(elapsedMs, DEMO_SCENES);
  const activeSceneDef = DEMO_SCENES[activeIndex] ?? DEMO_SCENES[0]!;
  const activeSceneInfo = scenesList[activeIndex] ?? scenesList[0]!;
  const finished = elapsedMs >= totalDuration;

  const handleTogglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (finished) {
      setElapsedMs(0);
    }
    setPlaying(true);
  };

  // En pause, on montre la scène presque terminée pour qu'elle soit lisible
  const handleJumpToScene = (sceneIndex: number) => {
    const start = getSceneStart(sceneIndex, DEMO_SCENES);
    const duration = DEMO_SCENES[sceneIndex]?.durationMs ?? 0;
    setElapsedMs(playing ? start : start + duration * 0.92);
  };

  const playLabel = playing ? tControls.pause : finished ? tControls.replay : tControls.play;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Lecteurs d'écran : annonce de l'étape en cours */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {activeSceneInfo.title}. {activeSceneInfo.legend}
      </div>

      <div aria-hidden="true" className="demo-zoom">
        <DemoStage
          sceneId={activeSceneDef.id}
          progress={activeProgress}
          dict={dict}
          currentLocale={currentLocale}
        />
      </div>

      <div className="flex flex-col gap-2.5 p-3 bg-white/90 border-2 border-line rounded-card shadow-sm">
        <p className="text-sm sm:text-base font-medium text-ink text-center leading-snug">
          {activeSceneInfo.legend}
        </p>

        <div className="flex flex-wrap items-stretch gap-2.5">
          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label={playLabel}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-pill bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              {playing ? (
                <>
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </>
              ) : (
                <polygon points="5 3 19 12 5 21 5 3" />
              )}
            </svg>
            <span>{playLabel}</span>
          </button>

          <nav
            aria-label={tControls.stepsNavAria}
            className="order-last sm:order-none basis-full sm:basis-0 flex-1 min-w-0 grid grid-cols-6 gap-1.5"
          >
            {DEMO_SCENES.map((scene, i) => {
              const isCurrent = i === activeIndex;
              const info = scenesList[i]!;
              const fill = i < activeIndex ? 100 : isCurrent ? activeProgress * 100 : 0;
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => handleJumpToScene(i)}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={tControls.stepAria(i + 1, info.title)}
                  className={`min-h-[44px] min-w-0 px-2 pt-1.5 pb-1 rounded-control border-2 flex flex-col justify-between gap-1 text-ink cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2 ${
                    isCurrent ? 'bg-brand-100 border-brand-600' : 'bg-white border-line-subtle hover:border-line'
                  }`}
                >
                  <span className="text-[11px] sm:text-xs font-bold leading-tight text-left">
                    <span className="sm:hidden">{i + 1}</span>
                    <span className="hidden sm:inline">{info.title}</span>
                  </span>
                  <span className="block h-1 w-full rounded-pill bg-line-subtle overflow-hidden">
                    <span className="block h-full bg-brand-600" style={{ width: `${fill}%` }} />
                  </span>
                </button>
              );
            })}
          </nav>

        </div>
      </div>

      <p className="text-xs text-ink-page font-medium text-center">{tDemo.notice}</p>
    </div>
  );
}

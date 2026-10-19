import type { CSSProperties, ReactNode } from 'react';
import type { Dictionary, Locale } from '@/modules/i18n';
import {
  DEMO_DATA_JSON,
  DEMO_DATA_RECORDS,
  DEMO_PROMPTS,
  DEMO_RESULT_ROWS,
  between,
  cursorAt,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  quadBezier,
  type CursorWaypoint,
  type DemoSceneId,
} from '@/modules/demo';
import { DemoCursor } from './cursor';

interface DemoStageProps {
  sceneId: DemoSceneId;
  progress: number; // 0 à 1 dans la scène courante
  dict: Dictionary;
  currentLocale: Locale;
}

type StageText = Dictionary['demo']['stage'];

/* Coordonnées en % de la scène entière (les deux écrans). Écran de gauche : x de 1 à 49, de droite : x de 51 à 99. */
const CURSOR_PATHS: Partial<Record<DemoSceneId, readonly CursorWaypoint[]>> = {
  describe: [
    [0, 62, 70],
    [0.08, 70, 32],
    [0.42, 72, 33],
    [0.5, 82, 57],
    [0.78, 75, 89],
  ],
  adjust: [
    [0, 75, 89],
    [0.45, 88, 46],
    [1, 90, 50],
  ],
  copy: [
    [0, 90, 50],
    [0.28, 75, 55],
  ],
  run: [
    [0, 50, 20],
    [0.42, 26, 52],
  ],
};

/* Le nœud copié vole en arc du bouton « Copier » (à droite) vers son emplacement dans le workflow (à gauche). */
const FLIGHT = {
  from: { x: 75, y: 55 },
  control: { x: 52, y: -12 },
  to: { x: 37, y: 30 },
};

/** Apparition douce : fondu et glissement vers le haut. */
function rise(t: number, distance = 12): CSSProperties {
  const e = easeOutCubic(t);
  return { opacity: e, transform: `translateY(${(1 - e) * distance}px)` };
}

/** Apparition « pop » : petit rebond d'échelle. */
function pop(t: number): CSSProperties {
  return { opacity: easeOutCubic(t), transform: `scale(${0.6 + 0.4 * easeOutBack(t)})` };
}

function highlightGame(text: string): ReactNode {
  return text.split('`game`').map((part, i, arr) => (
    <span key={i}>
      {part}
      {i < arr.length - 1 && (
        <span className="font-mono px-1 rounded bg-brand-100 text-brand-700 font-semibold mx-0.5">game</span>
      )}
    </span>
  ));
}

function Pane({
  title,
  active,
  dark = false,
  muted = false,
  children,
}: {
  title: string;
  active: boolean;
  dark?: boolean;
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative h-[310px] md:h-[320px] min-w-0 flex-col overflow-hidden rounded-card border-2 border-line transition-[opacity,transform,box-shadow] duration-500 ease-out ${
        dark ? 'bg-[#141115] text-[#FAF8FA]' : 'bg-white text-ink'
      } ${active ? 'flex ring-4 ring-brand-500/40 md:scale-100' : 'hidden md:flex md:scale-[0.97]'} ${
        muted ? 'md:opacity-25' : active ? '' : 'md:opacity-60'
      }`}
    >
      <div
        className={`shrink-0 px-3 py-2 text-xs font-bold ${
          dark ? 'bg-[#1F1A21] text-[#D5CED5] font-mono' : 'bg-line text-white font-pixel tracking-wider'
        }`}
      >
        {title}
      </div>
      <div className="relative flex-1 p-3 overflow-hidden">{children}</div>
    </div>
  );
}

const DARK_NODE = 'rounded-card border bg-[#1F1A21] px-3 py-2 transition-colors duration-300';

/* ---------- Écran de gauche : le workflow ---------- */

function TableNode({ t, done = false }: { t: StageText; done?: boolean }) {
  return (
    <div className={`${DARK_NODE} ${done ? 'border-[#22C55E]' : 'border-[#2E2732]'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold">{t.nodeTable}</span>
        <span className="px-1.5 rounded-control bg-[#153E26] text-[#6EE7B7] text-[10px] font-mono font-semibold">
          {t.statusOk}
        </span>
      </div>
      <div className="text-[11px] text-[#B5ABB6]">{t.nodeTableSub}</div>
    </div>
  );
}

/** Le workflow avant l'arrivée de Jev : le nœud de données et son JSON, puis l'emplacement du nœud à coller. */
function WorkflowData({ t, slot }: { t: StageText; slot: number }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-6 items-center">
        <TableNode t={t} />
        <div
          className="h-[52px] rounded-card border-2 border-dashed border-brand-500 flex items-center justify-center font-mono text-xs text-brand-100"
          style={{ opacity: slot, transform: `scale(${0.9 + 0.1 * slot})` }}
        >
          {t.dropHere}
        </div>
      </div>
      <div className="mt-4 rounded-card border border-[#3C2C2F] bg-[#1A161C]">
        <div className="px-3 py-1.5 bg-[#231D26] border-b border-[#2E2732] text-[10px] font-mono font-bold tracking-wider text-brand-100">
          {t.outputLabel}{' '}
          <span className="text-[#B5ABB6] font-normal">({t.itemsCount(DEMO_DATA_RECORDS.length)})</span>
        </div>
        <div className="relative h-[130px] overflow-hidden">
          <pre className="m-0 p-3 font-mono text-[11px] leading-relaxed text-[#E4DFE4]">
            {DEMO_DATA_JSON.slice(0, 220)}
          </pre>
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#1A161C] to-transparent" aria-hidden="true" />
        </div>
      </div>
    </>
  );
}

/** Le nœud Jev collé : il atterrit, se relie au tableur, puis le workflow s'exécute. */
function WorkflowRun({ t, p }: { t: StageText; p: number }) {
  const land = between(p, 0, 0.18);
  const wire = easeInOutCubic(between(p, 0.12, 0.3));
  const hint = between(p, 0.22, 0.32) * (1 - between(p, 0.4, 0.48));
  const pressing = p >= 0.44 && p < 0.52;
  const pulse = easeInOutCubic(between(p, 0.5, 0.68));
  const running = p >= 0.62 && p < 0.84;
  const done = p >= 0.84;

  return (
    <>
      <div className="relative grid grid-cols-2 gap-6 items-center">
        <TableNode t={t} done={p >= 0.5} />
        {/* Câble entre les deux nœuds, dessiné progressivement, puis parcouru par une impulsion */}
        <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-2 overflow-visible" aria-hidden="true">
          <line x1="-2" y1="4" x2="26" y2="4" stroke="#8C808E" strokeWidth="2" strokeDasharray="28" strokeDashoffset={28 * (1 - wire)} />
          {pulse > 0 && pulse < 1 && <circle cx={-2 + 28 * pulse} cy="4" r="3.5" fill="#E86FB0" />}
        </svg>
        <div
          className={`${DARK_NODE} relative ${done ? 'border-[#22C55E]' : 'border-brand-500'}`}
          style={pop(land)}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold">{t.nodeJev}</span>
            {running && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {done && (
              <span className="px-1.5 rounded-control bg-[#153E26] text-[#6EE7B7] text-[10px] font-mono font-semibold" style={pop(between(p, 0.84, 0.92))}>
                {t.statusOk}
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#B5ABB6]">{t.nodeJevSub}</div>
          <span
            className="absolute -top-3 right-2 px-2 py-0.5 rounded-pill bg-[#FEEAA2] text-[#3B2900] text-[10px] font-bold whitespace-nowrap"
            style={{ opacity: hint, transform: `translateY(${(1 - hint) * 4}px)` }}
          >
            {t.tokenHint}
          </span>
        </div>
      </div>
      <div className="mt-10 flex justify-center">
        <span
          className={`px-5 py-2.5 rounded-pill text-xs font-bold text-white transition-transform duration-150 ${
            pressing ? 'bg-brand-700 ring-4 ring-brand-500/40 scale-95' : 'bg-brand-600'
          }`}
        >
          {t.runWorkflow}
        </span>
      </div>
    </>
  );
}

function WorkflowResult({ t, p }: { t: StageText; p: number }) {
  return (
    <>
      <div className="text-[10px] font-mono font-bold tracking-wider text-brand-100 mb-2">{t.resultTitle}</div>
      <div className="flex flex-col gap-2">
        {DEMO_RESULT_ROWS.map((row, i) => {
          const a = between(p, 0.04 + i * 0.12, 0.24 + i * 0.12);
          const badge = between(p, 0.14 + i * 0.12, 0.3 + i * 0.12);
          return (
            <div
              key={row.record.game}
              className={`${DARK_NODE} border-[#2E2732] flex items-center justify-between gap-2`}
              style={rise(a, 10)}
            >
              <span className="text-xs font-semibold truncate">{row.record.game}</span>
              <span className="flex items-center gap-1.5 shrink-0">
                <span className="px-2 py-0.5 rounded-pill bg-[#2D252E] text-white text-[11px] font-mono" style={pop(badge)}>
                  {t.q1Options[row.genreIndex]}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-pill text-[11px] font-bold ${
                    row.popular ? 'bg-[#D7F5E5] text-[#0F5B35]' : 'bg-[#FDE4E4] text-[#991B1B]'
                  }`}
                  style={pop(badge)}
                >
                  {row.popular ? t.q2True : t.q2False}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---------- Écran de droite : EasyJev ---------- */

function Describe({ t, p, prompt }: { t: StageText; p: number; prompt: string }) {
  const typed = prompt.slice(0, Math.floor(easeInOutCubic(between(p, 0.1, 0.42)) * prompt.length));
  const pasted = between(p, 0.5, 0.56);
  const active = p >= 0.82;
  return (
    <div className="flex flex-col gap-2 h-full">
      <div>
        <div className="flex justify-between text-[11px] font-bold mb-1">
          <span>{t.promptLabel}</span>
          <span className="font-mono text-muted">{t.charCount(typed.length)}</span>
        </div>
        <div className="h-[60px] p-2 rounded-control border border-control-border bg-surface-2 text-xs leading-relaxed overflow-hidden">
          {typed}
          {p > 0.08 && p < 0.44 && <span className="inline-block w-1.5 h-3 ml-0.5 bg-brand-600 align-middle animate-pulse" />}
        </div>
      </div>
      <div>
        <div className="flex justify-between text-[11px] font-bold mb-1">
          <span>{t.dataLabel}</span>
          <span className="font-mono text-[#0F5B35]" style={{ opacity: pasted }}>
            {t.itemsCount(DEMO_DATA_RECORDS.length)}
          </span>
        </div>
        <div className="h-[40px] p-2 rounded-control border border-control-border bg-surface-2 font-mono text-[10px] text-ink overflow-hidden">
          <span style={{ opacity: pasted }}>{DEMO_DATA_JSON.replace(/\s+/g, ' ').slice(0, 90)}…</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-bold mr-1" style={{ opacity: between(p, 0.56, 0.6) }}>
            {t.fieldDetected}
          </span>
          {['game', 'publisher', 'total_reviews', 'categorie'].map((name, i) => (
            <span
              key={name}
              className={`px-2 py-0.5 rounded-pill font-mono text-[10px] ${
                i === 0 ? 'bg-brand-600 text-white font-semibold' : 'bg-surface-2 border border-line-subtle'
              }`}
              style={pop(between(p, 0.58 + i * 0.04, 0.68 + i * 0.04))}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-auto flex justify-center">
        <span
          className={`px-5 py-2 rounded-pill text-xs font-bold text-white flex items-center gap-2 transition-transform duration-150 ${
            active ? 'bg-brand-700 ring-4 ring-brand-500/40' : 'bg-brand-600'
          } ${p >= 0.8 && p < 0.86 ? 'scale-95' : ''}`}
        >
          {active && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {active ? t.generating : t.generate}
        </span>
      </div>
    </div>
  );
}

function Questions({ t, p }: { t: StageText; p: number }) {
  const q1 = between(p, 0.04, 0.22);
  const q2 = between(p, 0.14, 0.32);
  const added = between(p, 0.52, 0.66);
  const pressing = p >= 0.46 && p < 0.54;
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[11px] font-semibold flex items-center gap-2">
        <span>{t.readsField}</span>
        <span className="px-2 rounded-pill bg-brand-100 text-brand-700 font-mono font-bold">game</span>
      </div>
      <div className="rounded-card border-2 border-line-subtle bg-surface-2 p-2" style={rise(q1, 16)}>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 rounded-pill bg-brand-600 text-white font-mono text-[10px] font-bold">{t.q1Type}</span>
          <span className="text-xs font-bold">{t.q1Title}</span>
        </div>
        <p className="text-[11px] mb-1.5">{highlightGame(t.q1Instruction)}</p>
        <div className="flex flex-wrap items-center gap-1">
          {t.q1Options.slice(0, 2).map(opt => (
            <span key={opt} className="px-2 rounded-pill bg-white border border-line-subtle text-[11px]">{opt}</span>
          ))}
          {/* La 3e option est ajoutée à la main : c'est le geste « Ajuster » */}
          {added > 0 && (
            <span className="px-2 rounded-pill bg-brand-100 border border-brand-600 text-brand-700 text-[11px] font-semibold" style={pop(added)}>
              {t.q1Options[2]}
            </span>
          )}
          <span
            className={`px-2 rounded-pill border border-dashed border-control-border text-[11px] text-muted transition-transform duration-150 ${
              pressing ? 'scale-90 bg-brand-100' : ''
            }`}
          >
            {t.addOption}
          </span>
        </div>
      </div>
      <div className="rounded-card border-2 border-line-subtle bg-surface-2 p-2" style={rise(q2, 16)}>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 rounded-pill bg-[#0F5B35] text-white font-mono text-[10px] font-bold">{t.q2Type}</span>
          <span className="text-xs font-bold">{t.q2Title}</span>
        </div>
        <p className="text-[11px] mb-1.5">{highlightGame(t.q2Instruction)}</p>
        <div className="flex gap-1">
          <span className="px-2.5 rounded-pill bg-[#D7F5E5] text-[#0F5B35] text-[11px] font-semibold">{t.q2True}</span>
          <span className="px-2.5 rounded-pill bg-white border border-line-subtle text-[11px]">{t.q2False}</span>
        </div>
      </div>
    </div>
  );
}

function CopyNode({ t, p }: { t: StageText; p: number }) {
  const pressing = p >= 0.28 && p < 0.38;
  const copied = p >= 0.36;
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <span className="inline-flex rounded-pill bg-surface-2 border border-line p-1">
        <span className="px-3 py-1 rounded-pill bg-ink text-white text-[11px] font-medium">{t.provider}</span>
      </span>
      <span
        className={`w-full max-w-[280px] min-h-[52px] px-6 inline-flex items-center justify-center gap-2 rounded-pill font-bold text-sm text-white shadow-md transition-[transform,background-color] duration-200 ${
          copied ? 'bg-success' : 'bg-brand-600'
        } ${pressing ? 'scale-95 ring-4 ring-brand-500/40' : ''}`}
      >
        {copied ? `✓ ${t.nodeCopied}` : t.copyNode}
      </span>
    </div>
  );
}

function ReadExpression({ t, p }: { t: StageText; p: number }) {
  const expression = `{{ $json.answers.is_popular.noul > 0.5 ? '${t.q2True}' : '${t.q2False}' }}`;
  const typed = expression.slice(0, Math.floor(easeInOutCubic(between(p, 0.15, 0.5)) * expression.length));
  const yes = between(p, 0.52, 0.64);
  const no = between(p, 0.58, 0.7);
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] font-bold">{t.readTitle}</span>
      <code className="block min-h-[52px] p-2 rounded-control bg-surface-2 border border-line font-mono text-[11px] text-ink break-all">
        {typed}
      </code>
      <div className="grid grid-cols-2 gap-2">
        <span className="rounded-card border-2 border-[#0F5B35] bg-[#D7F5E5] px-2 py-1.5 text-[11px] font-bold text-[#0F5B35]" style={rise(yes, 10)}>
          {t.q2True} → {t.routeYes}
        </span>
        <span className="rounded-card border-2 border-[#991B1B] bg-[#FDE4E4] px-2 py-1.5 text-[11px] font-bold text-[#991B1B]" style={rise(no, 10)}>
          {t.q2False} → {t.routeNo}
        </span>
      </div>
    </div>
  );
}

/* ---------- Textes animés plein écran ---------- */

function Hook({ t, p }: { t: StageText; p: number }) {
  const out = 1 - easeInOutCubic(between(p, 0.88, 1));
  const lines = [t.hookLine1, t.hookLine2, t.hookLine3];
  return (
    <div
      className="absolute inset-3 z-20 rounded-card bg-white/92 border-2 border-line flex flex-col items-center justify-center gap-3 px-6 text-center"
      style={{ opacity: out }}
    >
      {lines.map((line, i) => (
        <p
          key={line}
          className={`text-ink leading-snug ${i === 0 ? 'text-base sm:text-lg font-medium' : 'text-lg sm:text-2xl font-bold'}`}
          style={rise(between(p, 0.04 + i * 0.16, 0.2 + i * 0.16), 16)}
        >
          {line}
        </p>
      ))}
      <div className="flex flex-wrap justify-center gap-2 mt-1" style={rise(between(p, 0.5, 0.62), 10)}>
        {DEMO_DATA_RECORDS.map(record => (
          <span key={record.game} className="px-2.5 py-1 rounded-pill bg-line text-white text-[11px] font-mono">
            {record.game.split(' ')[0]} · {t.pending}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xl sm:text-3xl font-extrabold tracking-tight text-ink" style={pop(between(p, 0.64, 0.8))}>
        {t.hookLine4}
      </p>
    </div>
  );
}

function Outro({ t, p, slogan }: { t: StageText; p: number; slogan: string }) {
  const a = between(p, 0.72, 0.86);
  if (a === 0) return null;
  return (
    <div
      className="absolute inset-x-3 bottom-3 z-20 rounded-card bg-line text-white px-5 py-3 flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-1 text-center"
      style={rise(a, 18)}
    >
      <span className="text-lg sm:text-2xl font-extrabold tracking-tight">
        {slogan.split('.').filter(Boolean).map((part, i) => (
          <span key={i}>
            {part.trim()}
            <span className="text-brand-500">.</span>{' '}
          </span>
        ))}
      </span>
      <span className="text-xs sm:text-sm font-medium text-[#D5CED5]">{t.outroLine}</span>
    </div>
  );
}

/* ---------- Scène ---------- */

export function DemoStage({ sceneId, progress, dict, currentLocale }: DemoStageProps) {
  const t = dict.demo.stage;
  const p = progress;
  const leftActive = sceneId === 'run' || sceneId === 'result';

  let left: ReactNode;
  if (sceneId === 'run') left = <WorkflowRun t={t} p={p} />;
  else if (sceneId === 'result') left = <WorkflowResult t={t} p={p} />;
  else left = <WorkflowData t={t} slot={sceneId === 'copy' ? easeOutCubic(between(p, 0.4, 0.6)) : 0} />;

  let right: ReactNode;
  if (sceneId === 'hook') right = null;
  else if (sceneId === 'describe') right = <Describe t={t} p={p} prompt={DEMO_PROMPTS[currentLocale]} />;
  else if (sceneId === 'adjust') right = <Questions t={t} p={p} />;
  else if (sceneId === 'copy' || sceneId === 'run') right = <CopyNode t={t} p={sceneId === 'copy' ? p : 1} />;
  else right = <ReadExpression t={t} p={p} />;

  // Vol du nœud copié, en arc, avec une rotation légère pendant le trajet
  const flight = sceneId === 'copy' ? easeInOutCubic(between(p, 0.42, 0.95)) : 0;
  const flightPoint = quadBezier(FLIGHT.from, FLIGHT.control, FLIGHT.to, flight);

  const path = CURSOR_PATHS[sceneId];
  const cursor = path ? cursorAt(path, p, easeInOutCubic) : null;
  const clicking =
    (sceneId === 'describe' && ((p >= 0.08 && p < 0.12) || (p >= 0.5 && p < 0.54) || (p >= 0.8 && p < 0.86))) ||
    (sceneId === 'adjust' && p >= 0.46 && p < 0.54) ||
    (sceneId === 'copy' && p >= 0.28 && p < 0.38) ||
    (sceneId === 'run' && p >= 0.44 && p < 0.52);
  const cursorVisible = cursor !== null && !(sceneId === 'copy' && p > 0.45);

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-win border-2 border-line bg-white/70 shadow-md select-none">
      <Pane title={t.workflowPane} active={leftActive || sceneId === 'hook'} dark muted={sceneId === 'hook'}>
        {left}
      </Pane>
      <Pane title={t.easyjevPane} active={!leftActive && sceneId !== 'hook'} muted={sceneId === 'hook'}>
        {right}
      </Pane>

      {sceneId === 'hook' && <Hook t={t} p={p} />}
      {sceneId === 'result' && <Outro t={t} p={p} slogan={dict.home.title} />}

      {flight > 0 && flight < 1 && (
        <span
          className="hidden md:block absolute z-30 px-3 py-1.5 rounded-card bg-brand-600 text-white text-xs font-bold shadow-lg border-2 border-white"
          style={{
            left: `${flightPoint.x}%`,
            top: `${flightPoint.y}%`,
            transform: `translate(-50%, -50%) rotate(${Math.sin(flight * Math.PI) * -8}deg) scale(${1 + Math.sin(flight * Math.PI) * 0.15})`,
          }}
        >
          {t.nodeJev}
        </span>
      )}

      {cursorVisible && cursor && (
        <div className="hidden md:block absolute inset-0 pointer-events-none">
          <DemoCursor x={cursor.x} y={cursor.y} isClicking={clicking} />
        </div>
      )}
    </div>
  );
}

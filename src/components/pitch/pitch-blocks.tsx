import type { Dictionary } from '@/modules/i18n';

interface PitchBlocksProps {
  dict: Dictionary;
}

/** Les deux colonnes « C'est quoi Jev ? » et « Et EasyJev, ça sert à quoi ? » (sans fenêtre autour). */
export function PitchColumns({ dict }: PitchBlocksProps) {
  const pitch = dict.home.pitch;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="font-pixel text-xs bg-line text-white px-2 py-0.5 rounded-[3px] tracking-wider" aria-hidden="true">
            01
          </span>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-ink">
            {pitch.jev.title}
          </h2>
        </div>
        <p className="text-base leading-relaxed text-muted">
          {pitch.jev.text}
        </p>
      </div>

      <div className="space-y-3 lg:border-l lg:border-line/20 lg:pl-8">
        <div className="flex items-center gap-2.5">
          <span className="font-pixel text-xs bg-line text-white px-2 py-0.5 rounded-[3px] tracking-wider" aria-hidden="true">
            02
          </span>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-ink">
            {pitch.easy.title}
          </h2>
        </div>
        <p className="text-base leading-relaxed text-muted">
          {pitch.easy.text}
        </p>
      </div>
    </div>
  );
}

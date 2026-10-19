import type { ReactNode } from 'react';

export interface BaseOsWindowProps {
  /** Titre pixel affiché dans la barre de titre (ex : 'explications.app') */
  title: string;
  /** Étiquette ou composant optionnel aligné à droite dans la barre de titre */
  badge?: ReactNode;
  /** Contenu du corps de la fenêtre */
  children: ReactNode;
  /** Classe CSS additionnelle sur le conteneur externe */
  className?: string;
  /** Classe CSS additionnelle sur le corps dépoli */
  bodyClassName?: string;
  /** ID pour l'accessibilité */
  id?: string;
}

export interface CollapsibleOsWindowProps extends BaseOsWindowProps {
  /** Si vrai, propose un bouton de réduction/déploiement */
  collapsible: true;
  /** État d'ouverture si la fenêtre est pliable */
  isOpen?: boolean;
  /** Callback lors du clic sur le bouton de réduction */
  onToggle?: () => void;
  /** Libellé accessible optionnel du bouton de bascule */
  toggleAriaLabel?: string;
  /** Libellé affiché pour réduire */
  collapseLabel: string;
  /** Libellé affiché pour ouvrir */
  expandLabel: string;
  /** Libellé accessible pour réduire */
  collapseAriaLabel: string;
  /** Libellé accessible pour ouvrir */
  expandAriaLabel: string;
}

export interface NonCollapsibleOsWindowProps extends BaseOsWindowProps {
  /** Si faux ou absent, la fenêtre n'est pas pliable */
  collapsible?: false;
  /** État d'ouverture si la fenêtre est pliable */
  isOpen?: boolean;
  /** Callback lors du clic sur le bouton de réduction */
  onToggle?: () => void;
  /** Libellé accessible optionnel du bouton de bascule */
  toggleAriaLabel?: string;
  /** Libellé affiché pour réduire */
  collapseLabel?: string;
  /** Libellé affiché pour ouvrir */
  expandLabel?: string;
  /** Libellé accessible pour réduire */
  collapseAriaLabel?: string;
  /** Libellé accessible pour ouvrir */
  expandAriaLabel?: string;
}

export interface DynamicCollapsibleOsWindowProps extends BaseOsWindowProps {
  /** Condition dynamique où la fenêtre peut être pliable ou non */
  collapsible: boolean;
  /** État d'ouverture si la fenêtre est pliable */
  isOpen?: boolean;
  /** Callback lors du clic sur le bouton de réduction */
  onToggle?: () => void;
  /** Libellé accessible optionnel du bouton de bascule */
  toggleAriaLabel?: string;
  /** Libellé affiché pour réduire */
  collapseLabel: string;
  /** Libellé affiché pour ouvrir */
  expandLabel: string;
  /** Libellé accessible pour réduire */
  collapseAriaLabel: string;
  /** Libellé accessible pour ouvrir */
  expandAriaLabel: string;
}

export type OsWindowProps =
  | CollapsibleOsWindowProps
  | NonCollapsibleOsWindowProps
  | DynamicCollapsibleOsWindowProps;

/**
 * Fenêtre façon OS rétro Mac 1-bit avec corps en verre dépoli (Piste A).
 * - Barre de titre noire (#141115)
 * - Titre pixel en minuscules (Silkscreen)
 * - Case carrée rétro décorative (aria-hidden, un seul bouton accessible par fenêtre)
 * - Corps en verre dépoli (88% blanc, backdrop-blur)
 * - Focus visible net blanc sur fond sombre
 */
export function OsWindow(props: OsWindowProps) {
  const {
    title,
    badge,
    children,
    className = '',
    bodyClassName = '',
    collapsible = false,
    isOpen = true,
    onToggle,
    id,
  } = props;

  const windowId = id || `os-win-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
  const titleId = `${windowId}-title`;

  const ariaToggle =
    props.toggleAriaLabel ||
    (isOpen ? props.collapseAriaLabel : props.expandAriaLabel);

  return (
    <div
      id={windowId}
      className={`border-2 border-line rounded-win shadow-[0_16px_36px_-12px_rgba(42,27,32,0.18),0_2px_6px_rgba(42,27,32,0.08)] overflow-hidden bg-transparent transition-all ${className}`}
    >
      <div className="bg-line text-white px-4 py-2 flex items-center justify-between select-none border-b-2 border-line">
        <div className="flex items-center gap-2.5">
          <span
            className="min-h-[32px] min-w-[32px] inline-flex items-center justify-center p-1 select-none"
            aria-hidden="true"
          >
            <span
              className="w-3.5 h-3.5 border-[1.5px] border-white bg-black inline-block shadow-[inset_1px_1px_0_#FFFFFF]"
            />
          </span>
          <span
            id={titleId}
            className="font-pixel text-xs sm:text-sm tracking-wide lowercase text-white"
          >
            {title}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-[#D5CED5]">
          {badge && <span className="hidden sm:inline">{badge}</span>}
          {collapsible && onToggle && props.collapseLabel && props.expandLabel && (
            <button
              type="button"
              onClick={onToggle}
              aria-label={ariaToggle}
              aria-expanded={isOpen}
              className="font-pixel text-xs text-white hover:text-brand-100 uppercase tracking-wider cursor-pointer bg-transparent border-none min-h-[32px] px-2 inline-flex items-center justify-center rounded-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 transition-colors"
            >
              {isOpen ? `[ ${props.collapseLabel} ]` : `[ ${props.expandLabel} ]`}
            </button>
          )}
        </div>
      </div>

      {/* Le contenu reste monté quand la fenêtre est repliée (attribut hidden) : on ne perd ni la saisie ni les résultats en cours */}
      <div
        hidden={!isOpen}
        className={`os-window-body bg-white/88 backdrop-blur-md p-5 sm:p-6 lg:p-8 text-ink border-t border-white/60 ${bodyClassName}`}
      >
        {children}
      </div>
    </div>
  );
}

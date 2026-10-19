'use client';

import { useEffect, useRef } from 'react';
import type { Dictionary } from '@/modules/i18n';
import { PitchColumns } from '@/components/pitch';
import { TrustCards } from '@/components/trust';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dict: Dictionary;
}

/**
 * Fenêtre « À propos » : ce qu'est Jev, à quoi sert EasyJev, et les encadrés de confiance.
 * Ces explications ne chargent plus la page principale.
 */
export function AboutDialog({ isOpen, onClose, dict }: AboutDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={e => {
        e.preventDefault();
        onClose();
      }}
      onMouseDown={e => {
        mouseDownTargetRef.current = e.target;
      }}
      onClick={e => {
        if (mouseDownTargetRef.current === e.currentTarget && e.target === e.currentTarget) {
          onClose();
        }
      }}
      aria-label={dict.header.aboutAriaLabel}
      className="fixed inset-0 m-auto p-0 rounded-win border-2 border-line bg-white shadow-[0_24px_50px_rgba(0,0,0,0.35)] backdrop:bg-line/60 backdrop:backdrop-blur-sm w-[min(64rem,calc(100vw-2rem))] max-h-[90vh] overflow-hidden"
    >
      {isOpen && (
        <div className="flex flex-col max-h-[90vh]">
          <div className="bg-line text-white px-4 py-2 flex items-center justify-between gap-4 shrink-0 select-none min-h-[44px]">
            <h2 className="font-pixel text-xs sm:text-sm tracking-wide lowercase text-white">
              {dict.windows.about.title}
            </h2>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline font-mono text-xs text-[#D5CED5]">
                {dict.windows.about.badge}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label={dict.windows.closeAria}
                className="font-pixel text-xs text-white hover:text-brand-100 uppercase tracking-wider cursor-pointer bg-transparent border-none py-1.5 px-2 min-h-[44px] inline-flex items-center focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-1"
              >
                [ {dict.windows.close} ]
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
            <PitchColumns dict={dict} />
            <TrustCards
              dict={dict}
              gridClassName="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
            />
          </div>
        </div>
      )}
    </dialog>
  );
}

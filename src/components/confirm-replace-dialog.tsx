'use client';

import { useEffect, useRef } from 'react';

export interface ConfirmReplaceDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmReplaceDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmReplaceDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      cancelButtonRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onMouseDown={(e) => {
        mouseDownTargetRef.current = e.target;
      }}
      onClick={(e) => {
        if (mouseDownTargetRef.current === e.currentTarget && e.target === e.currentTarget) {
          onCancel();
        }
      }}
      aria-labelledby="confirm-replace-dialog-title"
      aria-describedby="confirm-replace-dialog-description"
      className="fixed inset-0 m-auto p-0 rounded-win border-2 border-line bg-white shadow-[0_24px_50px_rgba(0,0,0,0.35)] backdrop:bg-line/60 backdrop:backdrop-blur-sm max-w-md w-[calc(100%-2rem)]"
    >
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
            <svg
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </span>

          <div>
            <h3 id="confirm-replace-dialog-title" className="text-lg font-bold text-ink">
              {title}
            </h3>
            <p
              id="confirm-replace-dialog-description"
              className="text-xs sm:text-sm text-muted mt-1 leading-relaxed"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3 flex-wrap">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 rounded-pill border border-line bg-surface hover:bg-surface-2 text-ink text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[44px] px-4 rounded-pill bg-error text-white hover:bg-error/90 text-sm font-bold transition-colors cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}

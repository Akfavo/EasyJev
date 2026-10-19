'use client';

import {
  useRef,
  useLayoutEffect,
  useEffect,
  forwardRef,
  useImperativeHandle,
  type TextareaHTMLAttributes,
} from 'react';

export interface AutoGrowTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Zone de texte qui s'agrandit automatiquement avec son contenu.
 * Hauteur recalculée au montage et à chaque changement de valeur.
 */
export const AutoGrowTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoGrowTextareaProps
>(function AutoGrowTextarea(
  { value, onChange, className = '', minRows = 1, rows, ...rest },
  forwardedRef
) {
  const innerRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(forwardedRef, () => innerRef.current as HTMLTextAreaElement);

  const adjustHeight = () => {
    const textarea = innerRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useIsomorphicLayoutEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={innerRef}
      rows={rows ?? minRows}
      value={value}
      onChange={e => {
        onChange?.(e);
        adjustHeight();
      }}
      className={`resize-none overflow-hidden ${className}`}
      {...rest}
    />
  );
});

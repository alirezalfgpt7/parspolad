import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/i18n.ts';
import '../effects/ExplosionModal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = 'lg',
}) => {
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return createPortal(
    <div className="effect-modal-backdrop fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div
        className={cn(
          'theme-solid-surface effect-modal-panel flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-(--theme-border) bg-(--theme-surface) text-(--theme-text) shadow-2xl',
          sizeMap[size]
        )}
        style={{ backgroundColor: 'var(--theme-surface)', backdropFilter: 'none' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between border-b border-(--theme-border) px-5 py-4">
          <h3 id={titleId} className="text-base font-bold text-(--theme-text)">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-(--theme-text-muted) transition-colors hover:bg-(--theme-surface-muted) hover:text-(--theme-text)"
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

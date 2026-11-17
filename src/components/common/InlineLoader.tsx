import React from 'react';
import { Win11BootSpinnerEffect } from '../effects/Spinners.tsx';

export const InlineLoader: React.FC<{ label: string; className?: string }> = ({ label, className = '' }) => (
  <span
    role="status"
    aria-live="polite"
    className={`inline-flex items-center gap-2 ${className}`}
  >
    <Win11BootSpinnerEffect size="sm" className="shrink-0" />
    <span>{label}</span>
  </span>
);

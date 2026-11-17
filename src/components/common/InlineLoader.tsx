import React from 'react';

export const InlineLoader: React.FC<{ label: string; className?: string }> = ({ label, className = '' }) => (
  <span
    role="status"
    aria-live="polite"
    className={`inline-flex items-center gap-2 ${className}`}
  >
    <span className="effect-inline-spinner shrink-0" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
    <span>{label}</span>
  </span>
);

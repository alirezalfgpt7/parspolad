import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface PublicHoneypotFieldProps {
  registration: UseFormRegisterReturn;
}

export const PublicHoneypotField: React.FC<PublicHoneypotFieldProps> = ({ registration }) => (
  <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
    <label htmlFor={registration.name}>این فیلد را خالی بگذارید</label>
    <input
      {...registration}
      id={registration.name}
      type="text"
      tabIndex={-1}
      autoComplete="off"
    />
  </div>
);

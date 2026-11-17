import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface PublicHoneypotFieldProps {
  registration: UseFormRegisterReturn;
}

export const PublicHoneypotField: React.FC<PublicHoneypotFieldProps> = ({ registration }) => (
  <div aria-hidden="true" className="sr-only">
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

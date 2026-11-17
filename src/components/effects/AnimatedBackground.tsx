import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="effect-animated-background pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="effect-animated-background-glow absolute inset-0" />
      <span className="effect-orb effect-orb-red absolute -inset-s-28 top-1/4 h-80 w-80 rounded-full bg-red-600/15 blur-3xl" />
      <span className="effect-orb effect-orb-blue absolute -bottom-24 -inset-e-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="effect-animated-background-grid absolute inset-0" />
    </div>
  );
};

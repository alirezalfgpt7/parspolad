import React, { useEffect, useState } from 'react';
import { formatLocalizedNumber } from '../../utils/i18n.ts';
import type { Language } from '../../types/index.ts';

interface StatCounterProps {
  target: number;
  suffix: string;
  label: string;
  lang: Language;
}

export const StatCounter: React.FC<StatCounterProps> = ({ target, suffix, label, lang }) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 900;
    const stepTime = 24;
    const steps = Math.max(1, Math.floor(duration / stepTime));
    const inc = target / steps;
    const timer = setInterval(() => {
      start += inc;
      if (start >= target) {
        setVal(target);
        clearInterval(timer);
      } else {
        setVal(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="flex flex-col gap-1.5 border-b border-slate-200/70 pb-4 md:border-b-0 md:border-e md:pb-0 md:pe-6 last:border-0 dark:border-slate-800">
      <div className="flex items-baseline gap-1.5 text-3xl font-extrabold tracking-tight text-[var(--theme-primary)] tabular-nums sm:text-4xl">
        <span>{formatLocalizedNumber(val, lang)}</span>
        <span className="text-lg font-bold text-slate-600 dark:text-slate-300">{suffix}</span>
      </div>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 sm:text-sm">{label}</p>
    </div>
  );
};

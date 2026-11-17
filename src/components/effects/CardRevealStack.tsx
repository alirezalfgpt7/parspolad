import React from 'react';
import { cn } from '../../utils/i18n.ts';
import './CardRevealStack.css';

export interface CardRevealItem {
  id: string | number;
  badge?: string;
  title: string;
  description: string;
  meta?: string;
  icon?: React.ReactNode;
}

interface CardRevealStackProps {
  items: CardRevealItem[];
  className?: string;
}

/**
 * Effect 004: Card Reveal Effect
 * Overlapping cards reveal adjacent siblings cleanly on hover/focus via margin-inline-start shift.
 */
export const CardRevealStack: React.FC<CardRevealStackProps> = ({ items, className }) => {
  if (items.length === 0) return null;

  return (
    <div className={cn('effect-card-deck', className)}>
      {items.map((item) => (
        <article
          key={item.id}
          tabIndex={0}
          className="effect-card-deck-item outline-none"
        >
          <div className="flex items-center justify-between gap-2">
            {item.icon ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--theme-primary)/10 text-(--theme-primary)">
                {item.icon}
              </div>
            ) : null}
            {item.badge && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {item.badge}
              </span>
            )}
          </div>
          <h3 className="mt-4 text-sm font-extrabold text-slate-900 dark:text-white">
            {item.title}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {item.description}
          </p>
          {item.meta && (
            <div className="mt-4 border-t border-slate-100 pt-2.5 text-[11px] font-semibold text-(--theme-primary) dark:border-slate-800">
              {item.meta}
            </div>
          )}
        </article>
      ))}
    </div>
  );
};

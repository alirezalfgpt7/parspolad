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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--theme-primary)/10 text-(--theme-primary-ink)">
                {item.icon}
              </div>
            ) : null}
            {item.badge && (
              <span className="rounded-md border border-(--theme-border) bg-(--theme-surface-muted) px-2 py-0.5 text-[10px] font-bold text-(--theme-text-muted)">
                {item.badge}
              </span>
            )}
          </div>
          <h3 className="mt-4 text-sm font-extrabold text-(--theme-text)">
            {item.title}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-(--theme-text-muted)">
            {item.description}
          </p>
          {item.meta && (
            <div className="mt-4 border-t border-(--theme-border) pt-2.5 text-[11px] font-semibold text-(--theme-primary-ink)">
              {item.meta}
            </div>
          )}
        </article>
      ))}
    </div>
  );
};

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/i18n.ts';
import './AnimatedTabsEffect.css';

export interface AnimatedTabOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface AnimatedTabsEffectProps {
  items: AnimatedTabOption[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Effect 022: Animation Tabs
 * Floating dark pill navigation bar with spring-lifted active icons and sliding orb selector,
 * measuring DOM geometry so it aligns accurately in both RTL and LTR and responsive widths.
 */
export const AnimatedTabsEffect: React.FC<AnimatedTabsEffectProps> = ({
  items,
  activeId,
  onChange,
  className,
}) => {
  const navRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [orbLeft, setOrbLeft] = useState<number | null>(null);

  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));

  const recalcSelector = useCallback(() => {
    const nav = navRef.current;
    const btn = btnRefs.current[activeId];
    if (!nav || !btn) {
      setOrbLeft(null);
      return;
    }
    const center = btn.offsetLeft + btn.offsetWidth / 2 - 28;
    setOrbLeft(center);
  }, [activeId]);

  useEffect(() => {
    recalcSelector();
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(recalcSelector)
      : null;
    if (observer && navRef.current) observer.observe(navRef.current);
    window.addEventListener('resize', recalcSelector);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', recalcSelector);
    };
  }, [recalcSelector, items.length]);

  return (
    <div
      ref={navRef}
      role="tablist"
      className={cn('effect-animated-tabs-bar pt-5', className)}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            ref={(el) => {
              btnRefs.current[item.id] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            data-active={active}
            onClick={() => onChange(item.id)}
            className="effect-animated-tab-item"
          >
            {item.icon && <span className="inline-flex items-center justify-center">{item.icon}</span>}
            <span className="inline-flex items-center gap-1.5">
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] tabular-nums">
                  {item.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
      {orbLeft !== null && (
        <span
          className="effect-animated-tabs-selector"
          style={{
            left: `${orbLeft}px`,
            filter: `hue-rotate(${activeIndex * 28}deg)`,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

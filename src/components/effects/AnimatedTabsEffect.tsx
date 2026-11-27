import React, { useRef, useState } from 'react';
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
  ariaLabel?: string;
  dir?: 'ltr' | 'rtl';
  orientation?: 'horizontal' | 'vertical';
}

export const AnimatedTabsEffect: React.FC<AnimatedTabsEffectProps> = ({
  items,
  activeId,
  onChange,
  className,
  ariaLabel = 'Tabs',
  dir = 'rtl',
  orientation = 'horizontal',
}) => {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const highlightedId = hoveredId && items.some((item) => item.id === hoveredId)
    ? hoveredId
    : activeId;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = items.findIndex((item) => item.id === activeId);
    if (currentIndex === -1 || items.length === 0) return;

    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % items.length;
        break;

      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;

      case 'Home':
        nextIndex = 0;
        break;

      case 'End':
        nextIndex = items.length - 1;
        break;

      default:
        return;
    }

    event.preventDefault();

    const nextItem = items[nextIndex];
    onChange(nextItem.id);
    buttonRefs.current[nextItem.id]?.focus();
  };

  return (
    <nav
      className={cn('modern-tabs-shell', className)}
      aria-label={ariaLabel}
      data-orientation={orientation}
      dir={dir}
      onMouseLeave={() => setHoveredId(null)}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setHoveredId(null);
        }
      }}
    >
      <div
        className="modern-tabs-track"
        role="tablist"
        aria-orientation={orientation}
      >
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <button
              key={item.id}
              ref={(element) => {
                buttonRefs.current[item.id] = element;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              data-active={isActive}
              data-highlighted={item.id === highlightedId}
              onClick={() => onChange(item.id)}
              onMouseEnter={() => setHoveredId(item.id)}
              onFocus={() => setHoveredId(item.id)}
              onKeyDown={handleKeyDown}
              title={item.label}
              className="modern-tab"
            >
              <span className="modern-tab-content">
                {item.icon && (
                  <span className="modern-tab-icon">
                    {item.icon}
                  </span>
                )}

                <span className="modern-tab-text">
                  {item.label}
                </span>

                {item.badge !== undefined && (
                  <span
                    className="modern-tab-badge"
                    aria-label={`${item.badge}`}
                  >
                    {item.badge}
                  </span>
                )}
              </span>

              <span className="modern-tab-indicator" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default AnimatedTabsEffect;
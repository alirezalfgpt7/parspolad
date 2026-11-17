import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils/i18n.ts';
import './ExpandingSearchEffect.css';

interface ExpandingSearchEffectProps {
  placeholder?: string;
  onTriggerSearch: (initialQuery?: string) => void;
  className?: string;
}

/**
 * Effect 044: Expanding Search Bar
 * Collapses cleanly to an icon button and smoothly expands the text input on hover/focus.
 */
export const ExpandingSearchEffect: React.FC<ExpandingSearchEffectProps> = ({
  placeholder = 'جستجو...',
  onTriggerSearch,
  className,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onTriggerSearch(query.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-expanded={query.length > 0}
      className={cn('effect-expanding-search', className)}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="effect-expanding-search__input"
      />
      <button
        type="button"
        onClick={() => onTriggerSearch(query.trim())}
        aria-label={placeholder}
        className="effect-expanding-search__btn"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
};

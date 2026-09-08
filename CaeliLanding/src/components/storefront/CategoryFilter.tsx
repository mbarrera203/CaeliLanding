import React from 'react';
import { Category, CATEGORIES } from '../../types/product';

export type CategoryFilterValue = Category | 'Todos';

interface CategoryFilterProps {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
  counts: Record<CategoryFilterValue, number>;
}

const OPTIONS: CategoryFilterValue[] = ['Todos', ...CATEGORIES];

const CATEGORY_ICONS: Record<CategoryFilterValue, string> = {
  'Todos': '✦',
  'Collares': '📿',
  'Anillos': '💍',
  'Aretes': '✦',
  'Pulseras': '✦',
};

export function CategoryFilter({
  value,
  onChange,
  counts,
}: CategoryFilterProps) {
  return (
    <nav
      aria-label="Categorías de productos"
      className="sticky top-[73px] z-20 border-b border-line/60 bg-ivory/95 backdrop-blur-sm sm:top-[81px]"
    >
      <div className="no-scrollbar mx-auto flex max-w-[1240px] gap-2 overflow-x-auto px-5 py-3 sm:px-8">
        {OPTIONS.map((option) => {
          const isActive = option === value;
          return (
            <button
              key={option}
              type="button"
              id={`category-filter-${option.toLowerCase()}`}
              onClick={() => onChange(option)}
              aria-current={isActive ? 'true' : undefined}
              className={[
                'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 ease-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory',
                isActive
                  ? 'bg-ink text-ivory shadow-sm'
                  : 'bg-sand text-muted hover:bg-greige hover:text-ink',
              ].join(' ')}
            >
              {option}
              <span
                className={[
                  'ml-1.5 tabular-nums text-[11px]',
                  isActive ? 'text-ivory/60' : 'text-muted/60',
                ].join(' ')}
              >
                {counts[option]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
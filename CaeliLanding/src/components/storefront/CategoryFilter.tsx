import React from 'react';
import { Category, CATEGORIES } from '../../types/product';

export type CategoryFilterValue = Category | 'All';

interface CategoryFilterProps {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
  counts: Record<CategoryFilterValue, number>;
}

const OPTIONS: CategoryFilterValue[] = ['All', ...CATEGORIES];

export function CategoryFilter({
  value,
  onChange,
  counts
}: CategoryFilterProps) {
  return (
    <nav
      aria-label="Product categories"
      className="sticky top-0 z-20 border-b border-line/70 bg-ivory/90 backdrop-blur-sm">
      
      <div className="no-scrollbar mx-auto flex max-w-[1240px] gap-2 overflow-x-auto px-5 py-3 sm:px-8">
        {OPTIONS.map((option) => {
          const isActive = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-current={isActive ? 'true' : undefined}
              className={[
              'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] transition-colors duration-150 ease-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory',
              isActive ?
              'bg-ink text-ivory' :
              'bg-sand text-muted hover:bg-greige hover:text-ink'].
              join(' ')}>
              
              {option}
              <span
                className={[
                'ml-1.5 tabular-nums',
                isActive ? 'text-ivory/60' : 'text-muted/60'].
                join(' ')}>
                
                {counts[option]}
              </span>
            </button>);

        })}
      </div>
    </nav>);

}
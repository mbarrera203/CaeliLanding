import React from 'react';

interface StatusToggleProps {
  active: boolean;
  onChange: () => void;
  productName: string;
}

export function StatusToggle({
  active,
  onChange,
  productName
}: StatusToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label={`${productName} status`}
        onClick={onChange}
        className={[
        'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ease-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        active ? 'bg-ink' : 'bg-greige'].
        join(' ')}>
        
        <span
          className={[
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-150 ease-soft',
          active ? 'translate-x-[22px]' : 'translate-x-0.5'].
          join(' ')} />
        
      </button>
      <span
        className={[
        'w-[86px] text-[13px]',
        active ? 'text-ink' : 'text-muted'].
        join(' ')}>
        
        {active ? 'Active' : 'Out of stock'}
      </span>
    </div>);

}
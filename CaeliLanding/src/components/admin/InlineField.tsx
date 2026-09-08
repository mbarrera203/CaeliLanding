import React, { useEffect, useState } from 'react';

interface InlineFieldProps {
  value: string | number;
  onCommit: (value: string) => void;
  label: string;
  prefix?: string;
  suffix?: string;
  type?: 'text' | 'number';
  width?: string;
}

/**
 * A field that reads as plain table text until it is hovered or focused,
 * so the grid stays quiet but every value is one click from editable.
 */
export function InlineField({
  value,
  onCommit,
  label,
  prefix,
  suffix,
  type = 'text',
  width = 'w-full'
}: InlineFieldProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    if (draft !== String(value)) onCommit(draft);
  };

  return (
    <label
      className={[
      'group/field inline-flex items-center gap-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-[14px] text-ink transition-colors duration-150 ease-soft',
      'hover:border-line hover:bg-white',
      'focus-within:border-ink/40 focus-within:bg-white',
      width].
      join(' ')}>
      
      <span className="sr-only">{label}</span>
      {prefix &&
      <span className="shrink-0 text-muted" aria-hidden="true">
          {prefix}
        </span>
      }
      <input
        type={type}
        inputMode={type === 'number' ? 'numeric' : undefined}
        min={type === 'number' ? 0 : undefined}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === 'Escape') {
            setDraft(String(value));
            (e.target as HTMLInputElement).blur();
          }
        }}
        aria-label={label}
        className={[
        'inline-number w-full min-w-0 bg-transparent tabular-nums outline-none placeholder:text-muted/60',
        type === 'number' ? 'text-ink' : 'text-ink'].
        join(' ')} />
      
      {suffix &&
      <span className="shrink-0 text-[12px] text-muted" aria-hidden="true">
          {suffix}
        </span>
      }
    </label>);

}
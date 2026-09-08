import React, { useEffect, useState, useRef } from 'react';

interface InlineFieldProps {
  value: string | number;
  onCommit: (value: string) => void;
  label: string;
  prefix?: string;
  suffix?: string;
  type?: 'text' | 'number';
  width?: string;
  isTextArea?: boolean;
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
  width = 'w-full',
  isTextArea = false,
}: InlineFieldProps) {
  const [draft, setDraft] = useState(String(value));
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    if (draft !== String(value)) onCommit(draft);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDraft(String(value));
      (e.target as HTMLElement).blur();
    }
    // Enter normally submits for input, but creates newline for textarea
    if (!isTextArea && e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  };

  return (
    <label
      className={[
        'group/field inline-flex rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-[14px] text-ink transition-colors duration-150 ease-soft',
        isTextArea ? 'items-start flex-col' : 'items-center gap-1',
        'hover:border-line hover:bg-white',
        'focus-within:border-ink/40 focus-within:bg-white',
        width,
      ].join(' ')}
    >
      <span className="sr-only">{label}</span>
      
      {prefix && (
        <span className="shrink-0 text-muted" aria-hidden="true">
          {prefix}
        </span>
      )}
      
      {isTextArea ? (
        <textarea
          ref={textAreaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          aria-label={label}
          rows={3}
          className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted/60 text-ink resize-y min-h-[60px]"
        />
      ) : (
        <input
          type={type}
          inputMode={type === 'number' ? 'numeric' : undefined}
          min={type === 'number' ? 0 : undefined}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          aria-label={label}
          className={[
            'inline-number w-full min-w-0 bg-transparent tabular-nums outline-none placeholder:text-muted/60',
            type === 'number' ? 'text-ink' : 'text-ink',
          ].join(' ')}
        />
      )}
      
      {suffix && (
        <span className="shrink-0 text-[12px] text-muted" aria-hidden="true">
          {suffix}
        </span>
      )}
    </label>
  );
}
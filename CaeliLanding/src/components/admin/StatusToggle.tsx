interface StatusToggleProps {
  active: boolean;
  onChange: () => void;
  productName: string;
  showLabel?: boolean;
}

export function StatusToggle({
  active,
  onChange,
  productName,
  showLabel = true,
}: StatusToggleProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer shrink-0 max-w-full">
      <input
        type="checkbox"
        checked={active}
        onChange={onChange}
        aria-label={`Estado de ${productName}`}
        className="w-4 h-4 text-ink bg-white border-stone-300 rounded focus:ring-ink/20 focus:ring-2 cursor-pointer accent-ink"
      />
      {showLabel && (
        <span
          className={[
            'text-xs font-medium select-none truncate',
            active ? 'text-ink' : 'text-stone-400',
          ].join(' ')}
        >
          {active ? 'Activo' : 'Pausado'}
        </span>
      )}
    </label>
  );
}
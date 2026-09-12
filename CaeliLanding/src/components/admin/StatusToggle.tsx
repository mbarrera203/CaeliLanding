interface StatusToggleProps {

  active: boolean;
  onChange: () => void;
  productName: string;
}

export function StatusToggle({
  active,
  onChange,
  productName,
}: StatusToggleProps) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label={`Estado de ${productName}`}
        onClick={onChange}
        className={[
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20',
          active ? 'bg-ink' : 'bg-stone-200',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className={[
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
            active ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
      <span
        className={[
          'text-[13px] font-medium select-none min-w-[65px]',
          active ? 'text-ink' : 'text-stone-400',
        ].join(' ')}
      >
        {active ? 'Activo' : 'Sin stock'}
      </span>
    </div>
  );
}
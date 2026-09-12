import { Link } from 'react-router-dom';

import { ArrowUpRightIcon, LogOutIcon } from 'lucide-react';

interface AdminHeaderProps {
  userEmail?: string | null;
  onLogout?: () => void;
}

export function AdminHeader({ userEmail, onLogout }: AdminHeaderProps) {
  return (
    <header className="border-b border-line bg-ivory">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          <img
            src="/LogoCaeli-removebg-preview.png"
            alt="Caeli"
            className="h-10 sm:h-12 w-auto object-contain"
          />

          <span className="text-[13px] text-muted">Panel de productos</span>
          {userEmail && (
            <span className="hidden sm:inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-600 border border-stone-200">
              {userEmail}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] text-muted transition-colors duration-150 ease-soft hover:border-ink/30 hover:text-ink"
          >
            Ver tienda
            <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200/80 bg-red-50/50 px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-100/70 hover:text-red-700 transition-colors"
            >
              <LogOutIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
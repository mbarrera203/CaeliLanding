import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, LogOutIcon, Loader2 } from 'lucide-react';

interface AdminHeaderProps {
  userEmail?: string | null;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export function AdminHeader({ userEmail, onLogout, isLoggingOut = false }: AdminHeaderProps) {
  return (
    <header className="border-b border-line bg-ivory sticky top-0 z-30">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <img
            src="/LogoCaeli-removebg-preview.png"
            alt="Caeli"
            className="h-8 sm:h-12 w-auto object-contain shrink-0"
          />

          <span className="text-[12px] sm:text-[13px] text-muted truncate">Panel de productos</span>
          {userEmail && (
            <span className="hidden md:inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-600 border border-stone-200 truncate max-w-[180px]">
              {userEmail}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 sm:px-3 py-1.5 text-[12px] text-muted transition-colors duration-150 ease-soft hover:border-ink/30 hover:text-ink"
          >
            <span className="hidden sm:inline">Ver tienda</span>
            <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          {onLogout && (
            <button
              onClick={onLogout}
              disabled={isLoggingOut}
              title="Cerrar sesión"
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200/80 bg-red-50/50 px-2.5 sm:px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-100/70 hover:text-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600" />
                  <span className="hidden sm:inline">Saliendo...</span>
                </>
              ) : (
                <>
                  <LogOutIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Salir</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
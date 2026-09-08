import React from 'react';
import { Link } from 'react-router-dom';
import { LockIcon } from 'lucide-react';
import { WHATSAPP_DISPLAY } from '../../utils/whatsapp';

export function StoreHeader() {
  return (
    <header className="border-b border-line/70 bg-ivory">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 sm:px-8">
        <Link
          to="/"
          className="text-[13px] font-medium uppercase tracking-wordmark text-ink transition-opacity duration-150 ease-soft hover:opacity-70 sm:text-sm">
          
          Caeli
        </Link>
        <div className="flex items-center gap-5">
          <span className="hidden text-[13px] text-muted sm:inline">
            {WHATSAPP_DISPLAY}
          </span>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] text-muted transition-colors duration-150 ease-soft hover:border-ink/30 hover:text-ink">
            
            <LockIcon className="h-3 w-3" aria-hidden="true" />
            Admin
          </Link>
        </div>
      </div>
    </header>);

}
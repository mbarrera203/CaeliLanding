import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';

export function AdminHeader() {
  return (
    <header className="border-b border-line bg-ivory">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          <img
            src="/LogoCaeli.png"
            alt="Caeli"
            className="h-9 w-auto"
          />
          <span className="text-[13px] text-muted">Panel de productos</span>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] text-muted transition-colors duration-150 ease-soft hover:border-ink/30 hover:text-ink"
        >
          Ver tienda
          <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
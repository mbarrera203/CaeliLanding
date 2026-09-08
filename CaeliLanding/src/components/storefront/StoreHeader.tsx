import React from 'react';
import { Link } from 'react-router-dom';
import { LockIcon, MessageCircleIcon } from 'lucide-react';
import { whatsappLink, WHATSAPP_DISPLAY } from '../../utils/whatsapp';

export function StoreHeader() {
  return (
    <header className="border-b border-line/60 bg-ivory/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8 relative">
        
        {/* Izquierda: Contacto (WhatsApp) */}
        <div className="flex-1 flex justify-start">
          <a
            href={whatsappLink('¡Hola Caeli! Tengo una pregunta sobre una pieza que vi.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-muted transition-colors hover:text-gold-dark"
          >
            <MessageCircleIcon className="h-4 w-4 text-whatsapp" aria-hidden="true" />
            <span className="hidden sm:inline">{WHATSAPP_DISPLAY}</span>
          </a>
        </div>

        {/* Centro: Logo más grande */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link to="/" className="flex items-center justify-center transition-transform hover:scale-[1.02]">
            <img
              src="/LogoCaeli-removebg-preview.png"
              alt="Caeli Joyas y Accesorios"
              className="h-20 w-auto sm:h-24 drop-shadow-sm"
            />
          </Link>
        </div>

        {/* Derecha: Admin */}
        <div className="flex-1 flex justify-end">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-[12px] text-muted transition-all hover:bg-white hover:border-ink/20 hover:text-ink hover:shadow-sm"
          >
            <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Admin
          </Link>
        </div>

      </div>
    </header>
  );
}
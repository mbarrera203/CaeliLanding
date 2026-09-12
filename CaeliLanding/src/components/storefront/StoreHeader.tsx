import React from 'react';
import { Link } from 'react-router-dom';
import { LockIcon, MessageCircleIcon } from 'lucide-react';
import { whatsappLink, WHATSAPP_DISPLAY } from '../../utils/whatsapp';

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-50 h-[68px] sm:h-[80px] border-b border-line/70 bg-[#fdfcfa] shadow-[0_1px_4px_rgba(44,36,22,0.03)]">
      <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between px-4 sm:px-8 relative">


        
        {/* Izquierda: Contacto (WhatsApp) */}
        <div className="flex-1 flex justify-start">
          <a
            href={whatsappLink('¡Hola Caeli! Tengo una pregunta sobre una pieza que vi.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-medium text-muted transition-colors hover:text-ink"
          >
            <MessageCircleIcon className="h-4 w-4 text-[#25D366]" aria-hidden="true" />
            <span className="hidden sm:inline">{WHATSAPP_DISPLAY}</span>
          </a>
        </div>

        {/* Centro: Logo centrado y sin desbordar */}
        <div className="flex items-center justify-center">
          <Link to="/" className="flex items-center justify-center transition-transform hover:scale-[1.02]">
            <img
              src="/LogoCaeli-removebg-preview.png"
              alt="Caeli Joyas y Accesorios"
              className="h-12 sm:h-16 w-auto drop-shadow-sm object-contain"
            />
          </Link>
        </div>

        {/* Derecha: Admin */}
        <div className="flex-1 flex justify-end">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-3.5 py-1.5 text-[12px] text-muted transition-all hover:bg-white hover:border-ink/20 hover:text-ink hover:shadow-xs"
          >
            <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Admin</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
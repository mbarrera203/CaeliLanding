import React from 'react';
import { ShieldCheckIcon, TruckIcon, StarIcon, HeartIcon } from 'lucide-react';

const BENEFITS = [
  { icon: TruckIcon,       text: 'Envíos a todo el país · Argentina' },
  { icon: ShieldCheckIcon, text: 'Plata 925 & Acero Quirúrgico' },
  { icon: HeartIcon,       text: 'Joyas y accesorios hipoalergénicos' },
  { icon: StarIcon,        text: 'Atención personalizada por WhatsApp' },
  { icon: TruckIcon,       text: 'Envíos rápidos a toda la Argentina' },
  { icon: ShieldCheckIcon, text: 'Calidad y brillo garantizados' },
  { icon: HeartIcon,       text: 'Piezas seleccionadas con amor' },
  { icon: StarIcon,        text: 'Brillo y estilo que te acompañan' },
];

export function BenefitsBar() {
  return (
    <div
      className="border-b border-line/40 bg-gold-pale/60 overflow-hidden"
      aria-label="Beneficios de Caeli"
    >
      <div className="marquee-wrapper py-2.5">
        <div className="marquee-content">
          {/* Duplicate for seamless loop */}
          {[...BENEFITS, ...BENEFITS].map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <span
                key={i}
                className="mx-8 inline-flex items-center gap-2 text-[12px] font-medium tracking-wide text-gold-dark"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
                {benefit.text}
                <span className="mx-4 text-gold/40">·</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

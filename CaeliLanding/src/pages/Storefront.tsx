import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LockIcon } from 'lucide-react';
import { StoreHeader } from '../components/storefront/StoreHeader';
import { BenefitsBar } from '../components/storefront/BenefitsBar';
import { AccessoriesCarousel } from '../components/storefront/AccessoriesCarousel';
import {
  CategoryFilter,
  CategoryFilterValue,
} from '../components/storefront/CategoryFilter';
import {
  ProductCard,
  CardActionStyle,
} from '../components/storefront/ProductCard';
import { WhatsAppBubble } from '../components/storefront/WhatsAppBubble';
import { products } from '../data/products';
import { CATEGORIES } from '../types/product';
import { WHATSAPP_DISPLAY, whatsappLink } from '../utils/whatsapp';

interface StorefrontProps {
  actionStyle: CardActionStyle;
}

export function Storefront({ actionStyle }: StorefrontProps) {
  const [category, setCategory] = useState<CategoryFilterValue>('Todos');

  const counts = useMemo(() => {
    const base = { Todos: products.length } as Record<CategoryFilterValue, number>;
    CATEGORIES.forEach((c) => {
      base[c] = products.filter((p) => p.category === c).length;
    });
    return base;
  }, []);

  const visible = useMemo(
    () =>
      category === 'Todos'
        ? products
        : products.filter((p) => p.category === category),
    [category]
  );

  return (
    <div className="min-h-full w-full bg-ivory font-sans">
      {/* Header con Logo */}
      <StoreHeader />

      {/* Barra de beneficios animada */}
      <BenefitsBar />

      <main>
        {/* Carrusel de accesorios destacados */}
        <AccessoriesCarousel />

        {/* Separador decorativo */}
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="gold-line my-2 opacity-60" />
        </div>

        {/* Hero / Encabezado del catálogo */}
        <section className="mx-auto max-w-[1240px] px-5 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                ✦ &nbsp;Toda la Colección
              </p>
              <h1 className="mt-2 font-serif text-[32px] font-medium leading-tight tracking-tight text-ink sm:text-[48px]">
                Joyas para cada momento
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted sm:text-base">
                Joyería fina para el día a día, terminada a mano en pequeños lotes.
                Sin carrito, sin checkout — elige tu pieza y escríbenos directo.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[13px] leading-relaxed text-muted">
                Hecho en México
                <br />
                Envíos en 3–5 días hábiles
              </p>
            </div>
          </div>
        </section>

        {/* Filtros de categoría */}
        <CategoryFilter
          value={category}
          onChange={setCategory}
          counts={counts}
        />

        {/* Catálogo */}
        <section
          aria-label="Catálogo de joyería"
          className="mx-auto max-w-[1240px] px-5 pb-28 pt-8 sm:px-8 sm:pt-12"
        >
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl bg-gold-pale/40 border border-line/60 px-6 py-20 text-center">
              <span className="text-3xl">✦</span>
              <p className="font-serif text-lg text-ink">Próximamente nuevas piezas</p>
              <p className="max-w-sm text-[13px] leading-relaxed text-muted">
                Las piezas de esta categoría llegan cada pocas semanas.
                Escríbenos y te avisamos primero.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4 xl:gap-x-8">
              {visible.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  actionStyle={actionStyle}
                  featured={category === 'Todos' && Boolean(product.featured)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line/60 bg-sand">
        <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
          <div className="flex flex-col items-center gap-10 sm:flex-row sm:justify-between relative">
            
            {/* Izquierda: Contacto */}
            <div className="flex-1 flex flex-col items-center sm:items-start gap-2">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-ink">
                Contacto
              </p>
              <a href={whatsappLink('¡Hola Caeli!')} target="_blank" rel="noopener noreferrer" className="text-[14px] font-medium text-gold-dark hover:text-gold transition-colors">
                {WHATSAPP_DISPLAY}
              </a>
              <p className="max-w-[200px] text-[12px] leading-relaxed text-muted mt-2 text-center sm:text-left">
                Joyería artesanal de calidad, terminada con cuidado en México.
              </p>
            </div>

            {/* Centro: Logo más grande */}
            <div className="flex-1 flex justify-center sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2">
              <img
                src="/LogoCaeli-removebg-preview.png"
                alt="Caeli Joyas y Accesorios"
                className="h-28 w-auto drop-shadow-sm"
              />
            </div>

            {/* Derecha: Admin */}
            <div className="flex-1 flex justify-center sm:justify-end">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 rounded-full border border-line/80 bg-white/50 px-4 py-1.5 text-[12px] text-muted transition-all hover:bg-white hover:border-ink/20 hover:text-ink hover:shadow-sm"
              >
                <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Admin
              </Link>
            </div>
          </div>

          {/* Línea decorativa */}
          <div className="gold-line my-8 opacity-50" />

          <p className="text-center text-[12px] text-muted">
            © {new Date().getFullYear()} Caeli Joyas y Accesorios · Hecho con ♥ en México
          </p>
        </div>
      </footer>

      <WhatsAppBubble />
    </div>
  );
}
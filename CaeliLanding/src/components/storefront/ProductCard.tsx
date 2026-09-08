import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import { Product } from '../../types/product';
import { formatPrice, orderLink } from '../../utils/whatsapp';

export type CardActionStyle = 'soft' | 'solid';

interface ProductCardProps {
  product: Product;
  index: number;
  actionStyle: CardActionStyle;
  featured?: boolean;
}

export function ProductCard({
  product,
  index,
  actionStyle,
  featured = false,
}: ProductCardProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const soldOut = !product.active || product.stock === 0;
  const hasMultipleImages = product.images && product.images.length > 1;

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1],
        delay: Math.min(index, 7) * 0.05,
      }}
      className="group relative flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-card-hover transition-shadow duration-500 overflow-hidden"
    >
      {/* Contenedor de Imagen y Efecto Hover */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-sand">
        {/* Carrusel Interno (Efecto de subida en hover) */}
        <div className="absolute inset-0 h-full w-full transition-transform duration-500 ease-soft group-hover:-translate-y-8">
          <AnimatePresence initial={false}>
            <motion.img
              key={imgIndex}
              src={product.images[imgIndex]}
              alt={product.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              loading={index > 3 ? 'lazy' : 'eager'}
              className={[
                'absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.03]',
                soldOut ? 'opacity-55' : '',
              ].join(' ')}
            />
          </AnimatePresence>

          {/* Controles del carrusel */}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={prevImage}
                aria-label="Imagen anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-1.5 text-ink opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-white focus:opacity-100 group-hover:opacity-100 z-20 shadow-sm"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label="Siguiente imagen"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-1.5 text-ink opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-white focus:opacity-100 group-hover:opacity-100 z-20 shadow-sm"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
              
              {/* Dots indicadores */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
                {product.images.map((_, i) => (
                  <div
                    key={i}
                    className={[
                      'h-1 rounded-full transition-all duration-300',
                      i === imgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50',
                    ].join(' ')}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Overlay que sube con la descripción */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ivory/95 via-ivory/90 to-transparent p-5 pt-12 transition-transform duration-500 ease-soft group-hover:translate-y-0 z-30">
          <p className="text-[13px] leading-relaxed text-ink/80 line-clamp-3">
            {product.description || product.detail}
          </p>
          
          <div className="mt-4">
            {soldOut ? (
              <span className="flex w-full items-center justify-center rounded-full border border-line bg-sand/80 px-4 py-2.5 text-[13px] text-muted">
                No disponible
              </span>
            ) : (
              <a
                href={orderLink(product)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={[
                  'flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-[13px] font-medium transition-all duration-500 ease-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory',
                  actionStyle === 'solid'
                    ? 'border-whatsapp bg-whatsapp text-white hover:border-whatsapp-deep hover:bg-whatsapp-deep'
                    : 'border-whatsapp/30 bg-whatsapp-tint text-whatsapp-deep hover:border-whatsapp hover:bg-whatsapp hover:text-white',
                ].join(' ')}
              >
                <WhatsAppIcon className="h-4 w-4" />
                Pedir ahora
              </a>
            )}
          </div>
        </div>

        {/* Badges superiores (Fijos) */}
        {featured && (
          <span className="absolute left-3 top-3 rounded-full bg-gold/90 px-3 py-1 text-[11px] font-medium text-ivory backdrop-blur-sm z-10 shadow-sm">
            ✦ Esta semana
          </span>
        )}

        {soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-ivory/95 px-3 py-1 text-[11px] text-muted backdrop-blur-sm z-10 shadow-sm">
            Agotado
          </span>
        )}

        {!soldOut && product.stock <= 3 && !featured && (
          <span className="absolute right-3 top-3 rounded-full bg-rose/90 px-3 py-1 text-[11px] font-medium text-ivory backdrop-blur-sm z-10 shadow-sm">
            ¡Últimas {product.stock}!
          </span>
        )}
      </div>

      {/* Info estática de la tarjeta */}
      <div className="flex flex-col p-4 bg-white z-20 relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-[17px] font-medium leading-tight text-ink">
              {product.name}
            </h3>
            <p className="mt-1 text-[12px] text-muted">
              {product.detail}
            </p>
          </div>
          <span className="shrink-0 tabular-nums font-medium text-[15px] text-gold-dark mt-0.5">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
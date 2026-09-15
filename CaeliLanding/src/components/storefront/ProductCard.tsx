import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, X } from 'lucide-react';
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

function ImageModal({ images, initialIndex, onClose }: { images: string[], initialIndex: number, onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex);
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIndex((prev) => (prev + 1) % images.length); };
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIndex((prev) => (prev - 1 + images.length) % images.length); };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ivory/80 backdrop-blur-md p-4 sm:p-8 select-none touch-none"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-ink/70 hover:text-ink z-50 p-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors shadow-sm">
        <X className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {images.length > 1 && (
        <button onClick={prev} className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-ink/70 hover:text-ink p-2 sm:p-3 z-50 rounded-full bg-white/50 hover:bg-white/80 transition-colors shadow-sm">
          <ChevronLeftIcon className="w-8 h-8 sm:w-10 sm:h-10" />
        </button>
      )}

      {images.length > 1 && (
        <button onClick={next} className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-ink/70 hover:text-ink p-2 sm:p-3 z-50 rounded-full bg-white/50 hover:bg-white/80 transition-colors shadow-sm">
          <ChevronRightIcon className="w-8 h-8 sm:w-10 sm:h-10" />
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="max-w-full max-h-[85vh] sm:max-h-[90vh] object-contain rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>

      {images.length > 1 && (
         <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-50">
           {images.map((_, i) => (
             <button
               key={i}
               onClick={(e) => { e.stopPropagation(); setIndex(i); }}
               className={['h-1.5 rounded-full transition-all duration-300', i === index ? 'w-6 bg-ink' : 'w-2 bg-ink/30 hover:bg-ink/50'].join(' ')}
             />
           ))}
         </div>
      )}
    </motion.div>,
    document.body
  );
}

export function ProductCard({
  product,
  index,
  actionStyle,
  featured = false,
}: ProductCardProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <>
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
        <div 
          className="relative aspect-[4/5] w-full overflow-hidden bg-sand cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
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
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1 items-start">
          {product.onSale && (
            <span className="rounded-full bg-rose-600/95 px-2.5 py-1 text-[11px] font-bold tracking-tight text-white backdrop-blur-sm shadow-sm flex items-center gap-1">
              <span>🔥</span>
              <span>{product.discountPercentage ? `-${product.discountPercentage}% OFF` : 'OFERTA'}</span>
            </span>
          )}
          {featured && !product.onSale && (
            <span className="rounded-full bg-gold/90 px-3 py-1 text-[11px] font-medium text-ivory backdrop-blur-sm shadow-sm">
              ✦ Esta semana
            </span>
          )}
        </div>

        {soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-ivory/95 px-3 py-1 text-[11px] text-muted backdrop-blur-sm z-10 shadow-sm">
            Agotado
          </span>
        )}

        {!soldOut && product.stock <= 3 && !featured && !product.onSale && (
          <span className="absolute right-3 top-3 rounded-full bg-dusty-rose/90 px-3 py-1 text-[11px] font-medium text-ivory backdrop-blur-sm z-10 shadow-sm">
            {product.stock === 1 ? '¡Última unidad!' : `¡Últimas ${product.stock}!`}
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
          <div className="shrink-0 flex flex-col items-end">
            {product.onSale && product.originalPrice && product.originalPrice > product.price ? (
              <>
                <span className="text-[12px] line-through text-stone-400 tabular-nums leading-none">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="tabular-nums font-bold text-[16px] text-rose-700 leading-tight mt-0.5">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="shrink-0 tabular-nums font-medium text-[15px] text-gold-dark mt-0.5">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
      </motion.article>

      <AnimatePresence>
        {isModalOpen && (
          <ImageModal
            images={product.images}
            initialIndex={imgIndex}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, X, Share2, Check } from 'lucide-react';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import { Product } from '../../types/product';
import { formatPrice, orderLink } from '../../utils/whatsapp';
import { createSlug } from '../../utils/slug';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const soldOut = !product.active || product.stock === 0;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const slug = createSlug(product.name);
    const url = `${window.location.origin}/?p=${slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Caeli - ${product.name}`,
          text: `Mirá esta joya de Caeli: ${product.name}`,
          url: url,
        });
      } catch (err) {
        console.log('Error al compartir', err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botones de acción superior (Absolutos) */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-50 flex items-center gap-2.5">
          <button 
            onClick={handleShare} 
            className="p-2.5 rounded-full bg-white/80 backdrop-blur-md text-ink/70 hover:text-ink hover:bg-white shadow-sm transition-all tooltip-trigger"
            title="Compartir joya"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
          </button>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-full bg-white/80 backdrop-blur-md text-ink/70 hover:text-ink hover:bg-white shadow-sm transition-all"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sección de Imagen */}
        <div className="relative w-full sm:w-1/2 bg-sand flex-shrink-0 h-[45vh] sm:h-[75vh]">
          <AnimatePresence mode="wait">
            <motion.img
              key={imgIndex}
              src={product.images[imgIndex]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full h-full object-cover"
              alt={product.name}
            />
          </AnimatePresence>

          {/* Botones de navegación de imagen */}
          {product.images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/70 backdrop-blur-md text-ink/70 hover:text-ink hover:bg-white transition-all shadow-sm">
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/70 backdrop-blur-md text-ink/70 hover:text-ink hover:bg-white transition-all shadow-sm">
                <ChevronRightIcon className="w-5 h-5" />
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={['h-1.5 rounded-full transition-all duration-300', i === imgIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'].join(' ')}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges de producto (Oferta/Agotado) */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.onSale && (
              <span className="rounded-full bg-rose-600 px-3 py-1.5 text-[12px] font-bold tracking-tight text-white shadow-sm flex items-center gap-1.5">
                <span>🔥</span>
                <span>{product.discountPercentage ? `-${product.discountPercentage}% OFF` : 'OFERTA'}</span>
              </span>
            )}
            {soldOut && (
              <span className="rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 text-[12px] font-medium text-muted shadow-sm">
                Agotado
              </span>
            )}
          </div>
        </div>

        {/* Sección de Info */}
        <div className="flex-1 flex flex-col p-6 sm:p-10 overflow-y-auto">
          <div className="flex-1">
            <div className="mb-2 sm:pr-14">
              <h2 className="font-serif text-2xl sm:text-3xl text-ink leading-tight">
                {product.name}
              </h2>
            </div>
            
            <p className="text-[14px] text-muted mb-6">
              {product.detail}
            </p>

            <div className="flex items-end gap-3 mb-8">
              {product.onSale && product.originalPrice && product.originalPrice > product.price ? (
                <>
                  <span className="text-xl sm:text-2xl font-bold text-rose-700 leading-none">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm sm:text-base line-through text-stone-400 tabular-nums leading-none mb-0.5">
                    {formatPrice(product.originalPrice)}
                  </span>
                </>
              ) : (
                <span className="text-xl sm:text-2xl font-medium text-gold-dark leading-none">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-ink/70">
                Descripción
              </h3>
              <p className="text-[14px] leading-relaxed text-ink/80 whitespace-pre-wrap">
                {product.description || 'Sin descripción adicional.'}
              </p>
            </div>

            {!soldOut && product.stock <= 3 && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-dusty-rose/10 px-4 py-2 text-sm text-dusty-rose font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dusty-rose opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-dusty-rose"></span>
                </span>
                {product.stock === 1 ? '¡Última unidad disponible!' : `¡Solo quedan ${product.stock} unidades!`}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-line/60">
            {soldOut ? (
              <div className="w-full text-center p-4 rounded-xl bg-stone-100 text-muted font-medium">
                No disponible por el momento
              </div>
            ) : (
              <a
                href={orderLink(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-3 rounded-full bg-whatsapp px-6 py-4 text-[15px] font-medium text-white shadow-lg shadow-whatsapp/30 transition-all hover:bg-whatsapp-deep hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-whatsapp/50 focus:ring-offset-2"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Pedir por WhatsApp
              </a>
            )}
            
            <p className="mt-4 text-center text-[12px] text-muted flex items-center justify-center gap-1.5">
              <span>🇦🇷</span> Envíos a todo el país
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

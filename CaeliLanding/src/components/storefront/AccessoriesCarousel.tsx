import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import { Product } from '../../types/product';
import { formatPrice, orderLink } from '../../utils/whatsapp';

interface AccessoriesCarouselProps {
  products?: Product[];
}

const AUTOPLAY_INTERVAL = 4500;

export function AccessoriesCarousel({ products = [] }: AccessoriesCarouselProps) {
  const carouselItems = useMemo(() => {
    if (!products || products.length === 0) return [];
    // Priorizar productos con fotos reales, con stock y sin fotos rotas viejas
    const valid = products.filter(
      (p) =>
        p.active &&
        p.stock > 0 &&
        p.images &&
        p.images.length > 0 &&
        !p.images[0].includes('LogoCaeli') &&
        !p.images[0].includes('35158862') &&
        !p.images[0].includes('1f4d47dd') &&
        !p.images[0].includes('cfe65ea2') &&
        !p.images[0].includes('cd18ea47') &&
        !p.images[0].includes('8ad73b65')
    );

    if (valid.length === 0) return [];

    // Si la dueña marcó productos con estrella (destacados), mostrar prioritariamente esos
    const featuredItems = valid.filter((p) => p.featured);
    if (featuredItems.length > 0) {
      return featuredItems;
    }

    // Si aún no marcó ninguno, mostrar hasta 8 piezas al azar
    const shuffled = [...valid];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, 8);
  }, [products]);


  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const total = carouselItems.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number, dir: 1 | -1) => {
      if (total === 0) return;
      setDirection(dir);
      setCurrent(((index % total) + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  // Autoplay
  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = setInterval(() => next(), AUTOPLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, paused, total]);

  if (carouselItems.length === 0) return null;

  const product = carouselItems[current] || carouselItems[0];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <section
      aria-label="Colección destacada"
      className="relative overflow-hidden bg-gradient-to-br from-ivory-warm via-ivory to-gold-pale/30"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Decoración de fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-champagne/20 blur-2xl" />
      </div>

      <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8 sm:py-16">
        {/* Encabezado de sección */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
              ✦ &nbsp;Colección Destacada
            </p>
            <h2 className="mt-1.5 font-serif text-2xl font-medium text-ink sm:text-3xl">
              Nuestras Piezas Favoritas
            </h2>
          </div>

          {/* Controles */}
          {total > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="carousel-prev"
                onClick={prev}
                aria-label="Anterior"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-ivory text-muted transition-all duration-200 hover:border-gold hover:bg-gold-pale hover:text-gold-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 cursor-pointer"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                id="carousel-next"
                onClick={next}
                aria-label="Siguiente"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-ivory text-muted transition-all duration-200 hover:border-gold hover:bg-gold-pale hover:text-gold-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 cursor-pointer"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Slide principal */}
        <div className="relative h-[420px] overflow-hidden rounded-3xl shadow-card sm:h-[480px]">
          <AnimatePresence custom={direction} initial={false}>
            <motion.div
              key={product.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 flex flex-col-reverse sm:flex-row"
            >
              {/* Info */}
              <div className="flex flex-col justify-end gap-3 bg-ivory/97 px-7 py-8 sm:w-[38%] sm:justify-center sm:py-12">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
                  {product.category}
                </span>

                <h3 className="font-serif text-2xl font-medium leading-tight text-ink sm:text-3xl">
                  {product.name}
                </h3>

                <p className="text-[13px] leading-relaxed text-muted sm:text-sm">
                  {product.detail}
                </p>

                <div className="gold-line my-1" />

                <div className="flex items-center justify-between">
                  <span className="font-serif text-xl font-medium text-gold-dark">
                    {formatPrice(product.price)}
                  </span>
                  {product.stock <= 5 && (
                    <span className="text-[11px] text-rose font-medium">
                      {product.stock === 1 ? '¡Última unidad disponible!' : `Últimas ${product.stock} unidades`}
                    </span>
                  )}

                </div>

                <a
                  href={orderLink(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`carousel-order-${product.id}`}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-5 py-3 text-[13px] font-medium text-white transition-all duration-500 hover:bg-whatsapp-deep hover:shadow-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40 sm:w-auto"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Pedir por WhatsApp
                </a>
              </div>

              {/* Imagen */}
              <div className="relative flex-1 overflow-hidden bg-sand/40">
                <img
                  src={product.images[0] || '/LogoCaeli-removebg-preview.png'}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src = '/LogoCaeli-removebg-preview.png';
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Overlay gradiente para transición suave con el panel */}
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ivory/60 to-transparent hidden sm:block" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        {total > 1 && (
          <div className="mt-5 flex items-center justify-center gap-1.5" role="tablist" aria-label="Slides del carrusel">
            {carouselItems.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                id={`carousel-dot-${i}`}
                aria-selected={i === current}
                aria-label={`Ver ${p.name}`}
                onClick={() => goTo(i, i > current ? 1 : -1)}
                className={[
                  'rounded-full transition-all duration-300 cursor-pointer',
                  i === current
                    ? 'h-2 w-6 bg-gold'
                    : 'h-2 w-2 bg-line hover:bg-gold/40',
                ].join(' ')}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Category, CATEGORIES, Product } from '../types/product';
import { WHATSAPP_DISPLAY, whatsappLink } from '../utils/whatsapp';
import { supabase } from '../lib/supabase';

interface StorefrontProps {
  actionStyle: CardActionStyle;
}

export function Storefront({ actionStyle }: StorefrontProps) {
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryFilterValue>('Todos');

  useEffect(() => {
    async function loadStoreCatalog() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const liveProducts: Product[] = data.map((row: any) => ({
            id: String(row.id),
            name: row.name,
            category: row.category as Category,
            price: Number(row.price),
            detail: row.detail || '',
            description: row.description || '',
            images: Array.isArray(row.images) && row.images.length > 0 ? row.images : ['/LogoCaeli-removebg-preview.png'],
            stock: Number(row.stock),
            active: Boolean(row.active),
            featured: Boolean(row.featured),
          }));
          setCatalog(liveProducts);
        }
      } catch (err) {
        console.warn('Error cargando catálogo desde Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStoreCatalog();
  }, []);

  const counts = useMemo(() => {
    const base = { Todos: catalog.length } as Record<CategoryFilterValue, number>;
    CATEGORIES.forEach((c) => {
      base[c] = catalog.filter((p) => p.category === c).length;
    });
    return base;
  }, [catalog]);

  const visible = useMemo(() => {
    const filtered =
      category === 'Todos'
        ? catalog
        : catalog.filter((p) => p.category === category);

    // Los productos disponibles van primero; los agotados o sin stock van estrictamente al final
    return [...filtered].sort((a, b) => {
      const aAvailable = a.active && a.stock > 0 ? 1 : 0;
      const bAvailable = b.active && b.stock > 0 ? 1 : 0;
      if (bAvailable !== aAvailable) {
        return bAvailable - aAvailable;
      }
      if (aAvailable === 1) {
        const aFeatured = a.featured ? 1 : 0;
        const bFeatured = b.featured ? 1 : 0;
        if (bFeatured !== aFeatured) {
          return bFeatured - aFeatured;
        }
      }
      return 0;
    });
  }, [category, catalog]);



  return (
    <div className="min-h-full w-full bg-ivory font-sans">
      {/* Pantalla de carga inicial a pantalla completa */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="caeli-preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fdfcfa]"
          >
            <div className="flex flex-col items-center gap-6 px-6 text-center select-none">
              {/* Logo con respiración suave */}
              <motion.div
                animate={{
                  scale: [0.97, 1.03, 0.97],
                  opacity: [0.85, 1, 0.85],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <img
                  src="/LogoCaeli-removebg-preview.png"
                  alt="Caeli Joyas y Accesorios"
                  className="h-24 sm:h-28 w-auto object-contain drop-shadow-sm"
                />
              </motion.div>

              {/* Barra de brillo dorada sutil */}
              <div className="w-36 sm:w-44 h-[2px] bg-stone-200/60 rounded-full overflow-hidden relative">
                <motion.div
                  className="absolute inset-y-0 bg-gradient-to-r from-transparent via-gold to-transparent w-24"
                  animate={{ x: [-90, 180] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.3,
                    ease: 'easeInOut',
                  }}
                />
              </div>

              <p className="font-serif text-[12px] tracking-[0.2em] uppercase text-muted">
                Joyas & Accesorios
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header con Logo */}
      <StoreHeader />

      {/* Barra de beneficios animada */}
      <BenefitsBar />

      <main>
        {/* Carrusel de accesorios destacados */}
        <AccessoriesCarousel products={catalog} />


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
                Plata 925 y acero quirúrgico seleccionados para acompañarte todos los días.
                Sin vueltas ni registros — elegí tu pieza favorita y pedila directo por WhatsApp.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[13px] leading-relaxed text-muted">
                Plata 925 & Acero Quirúrgico
                <br />
                Envíos a todo el país 🇦🇷
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
          className="relative z-10 mx-auto max-w-[1240px] px-5 pb-28 pt-8 sm:px-8 sm:pt-12"
        >

          {loading ? (
            <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4 xl:gap-x-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col rounded-2xl bg-white overflow-hidden shadow-sm border border-line/40">
                  <div className="aspect-[4/5] bg-stone-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-stone-200/70 rounded w-3/4" />
                    <div className="h-3 bg-stone-100 rounded w-1/2" />
                    <div className="h-4 bg-stone-200/70 rounded w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
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
              <p className="max-w-[220px] text-[12px] leading-relaxed text-muted mt-2 text-center sm:text-left">
                Joyas y accesorios en plata 925 y acero quirúrgico de primera calidad. Envíos a toda la Argentina.
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
            © {new Date().getFullYear()} Caeli Joyas y Accesorios · Argentina
          </p>
        </div>
      </footer>

      <WhatsAppBubble />
    </div>
  );
}
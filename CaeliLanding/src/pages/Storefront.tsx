import React, { useMemo, useState } from 'react';
import { StoreHeader } from '../components/storefront/StoreHeader';
import {
  CategoryFilter,
  CategoryFilterValue } from
'../components/storefront/CategoryFilter';
import {
  ProductCard,
  CardActionStyle } from
'../components/storefront/ProductCard';
import { WhatsAppBubble } from '../components/storefront/WhatsAppBubble';
import { products } from '../data/products';
import { CATEGORIES } from '../types/product';
import { WHATSAPP_DISPLAY } from '../utils/whatsapp';

interface StorefrontProps {
  actionStyle: CardActionStyle;
}

export function Storefront({ actionStyle }: StorefrontProps) {
  const [category, setCategory] = useState<CategoryFilterValue>('All');

  const counts = useMemo(() => {
    const base = { All: products.length } as Record<CategoryFilterValue, number>;
    CATEGORIES.forEach((c) => {
      base[c] = products.filter((p) => p.category === c).length;
    });
    return base;
  }, []);

  const visible = useMemo(
    () =>
    category === 'All' ?
    products :
    products.filter((p) => p.category === category),
    [category]
  );

  return (
    <div className="min-h-full w-full bg-ivory font-sans">
      <StoreHeader />

      <main>
        <section className="mx-auto max-w-[1240px] px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-20">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <h1 className="text-[34px] font-light leading-[1.08] tracking-tight text-ink sm:text-[56px]">
                Caeli Accesorios
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
                Fine everyday jewelry, hand-finished in small batches. No cart,
                no checkout — choose a piece and message us directly.
              </p>
            </div>
            <p className="shrink-0 text-[13px] leading-relaxed text-muted sm:text-right">
              Made in Mexico City
              <br />
              Ships worldwide in 3–5 days
            </p>
          </div>
        </section>

        <CategoryFilter
          value={category}
          onChange={setCategory}
          counts={counts} />
        

        <section
          aria-label="Jewelry catalog"
          className="mx-auto max-w-[1240px] px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
          
          {visible.length === 0 ?
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-sand px-6 py-20 text-center">
              <p className="text-[15px] text-ink">Nothing here just yet</p>
              <p className="max-w-sm text-[13px] leading-relaxed text-muted">
                New pieces in this category drop every few weeks. Message us and
                we'll let you know first.
              </p>
            </div> :

          <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4 xl:gap-x-8">
              {visible.map((product, index) =>
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              actionStyle={actionStyle}
              featured={category === 'All' && Boolean(product.featured)} />

            )}
            </div>
          }
        </section>
      </main>

      <footer className="border-t border-line/70 bg-sand">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-wordmark text-ink">
              Caeli
            </p>
            <p className="mt-2 text-[13px] text-muted">
              Orders and questions on WhatsApp · {WHATSAPP_DISPLAY}
            </p>
          </div>
          <p className="text-[12px] text-muted">
            © {new Date().getFullYear()} Caeli Accesorios
          </p>
        </div>
      </footer>

      <WhatsAppBubble />
    </div>);

}
import React from 'react';
import { motion } from 'framer-motion';
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
  featured = false
}: ProductCardProps) {
  const soldOut = !product.active || product.stock === 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.23, 1, 0.32, 1],
        delay: Math.min(index, 7) * 0.04
      }}
      className={[
      'group flex',
      featured ?
      'col-span-1 flex-col sm:col-span-2 sm:flex-row sm:items-stretch sm:gap-8' :
      'flex-col'].
      join(' ')}>
      
      <div
        className={[
        'relative overflow-hidden rounded-2xl bg-sand',
        featured ?
        'aspect-[4/5] sm:aspect-auto sm:min-h-[360px] sm:w-1/2 sm:shrink-0' :
        'aspect-[4/5]'].
        join(' ')}>
        
        <img
          src={product.image}
          alt={product.name}
          loading={index > 3 ? 'lazy' : 'eager'}
          className={[
          'absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-soft group-hover:scale-[1.03]',
          soldOut ? 'opacity-60' : ''].
          join(' ')} />
        
        {featured &&
        <span className="absolute left-3 top-3 rounded-full bg-ivory/95 px-3 py-1 text-[11px] text-ink">
            This week's piece
          </span>
        }
        {soldOut &&
        <span className="absolute right-3 top-3 rounded-full bg-ivory/95 px-3 py-1 text-[11px] text-muted">
            Sold out
          </span>
        }
      </div>

      <div
        className={[
        'flex flex-1 flex-col pt-4',
        featured ? 'sm:justify-center sm:pt-0' : ''].
        join(' ')}>
        
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className={[
            'font-medium text-ink',
            featured ? 'text-xl sm:text-2xl' : 'text-[15px]'].
            join(' ')}>
            
            {product.name}
          </h3>
          <span
            className={[
            'shrink-0 tabular-nums text-ink',
            featured ? 'text-lg' : 'text-[15px]'].
            join(' ')}>
            
            {formatPrice(product.price)}
          </span>
        </div>

        <p
          className={[
          'mt-1 text-[13px] leading-relaxed text-muted',
          featured ? 'sm:mt-2 sm:max-w-sm sm:text-sm' : ''].
          join(' ')}>
          
          {product.detail}
        </p>

        {featured &&
        <p className="mt-3 hidden max-w-sm text-sm leading-relaxed text-muted sm:block">
            Hand-finished in small batches. Message us and we'll confirm
            availability, wrap it, and send a payment link the same day.
          </p>
        }

        <div className={featured ? 'mt-6 sm:max-w-xs' : 'mt-auto pt-4'}>
          {soldOut ?
          <span className="flex w-full items-center justify-center rounded-full border border-line bg-sand px-4 py-3 text-[13px] text-muted">
              Currently unavailable
            </span> :

          <a
            href={orderLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            className={[
            'flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 py-3 text-[13px] font-medium transition-colors duration-150 ease-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory',
            actionStyle === 'solid' ?
            'border-whatsapp bg-whatsapp text-white hover:border-whatsapp-deep hover:bg-whatsapp-deep' :
            'border-whatsapp/30 bg-whatsapp-tint text-whatsapp-deep hover:border-whatsapp hover:bg-whatsapp hover:text-white'].
            join(' ')}>
            
              <WhatsAppIcon className="h-4 w-4" />
              Order via WhatsApp
            </a>
          }
        </div>
      </div>
    </motion.article>);

}
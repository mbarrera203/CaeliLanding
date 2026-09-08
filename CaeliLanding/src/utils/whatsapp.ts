import { Product } from '../types/product';

/** Boutique's WhatsApp business line, in international format. */
export const WHATSAPP_NUMBER = '5215544332211';

export const WHATSAPP_DISPLAY = '+52 55 4433 2211';

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function orderLink(product: Product): string {
  return whatsappLink(
    `Hi Caeli! I'd like to order the ${product.name} (${formatPrice(
      product.price
    )}). Is it available?`
  );
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
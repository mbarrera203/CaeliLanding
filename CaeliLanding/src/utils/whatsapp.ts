import { Product } from '../types/product';

/** Número de WhatsApp de la tienda en Argentina (+54 9 ...). */
export const WHATSAPP_NUMBER = '5492622532989';

export const WHATSAPP_DISPLAY = '+54 9 2622532989';

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function orderLink(product: Product): string {
  return whatsappLink(
    `¡Hola Caeli! Me gustaría consultar y pedir el/la ${product.name} (${formatPrice(product.price)}). ¿Tienen stock disponible?`
  );
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
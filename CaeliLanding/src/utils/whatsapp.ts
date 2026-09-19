import { Product } from '../types/product';

/** Número de WhatsApp de la tienda en Argentina (+54 9 ...). */
export const WHATSAPP_NUMBER = '5492622532989';

export const WHATSAPP_DISPLAY = '+54 9 2622532989';

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function orderLink(product: Product): string {
  const priceText =
    product.onSale && product.originalPrice && product.originalPrice > product.price
      ? `${formatPrice(product.price)} (¡en oferta, precio regular ${formatPrice(product.originalPrice)}!)`
      : formatPrice(product.price);

  const materialText = product.material ? `Material: ${product.material}` : (product.detail ? `Detalle: ${product.detail}` : '');
  const idShort = product.id.split('-')[0]; // Primer bloque del UUID para referencia rápida
  const imageUrl = product.images?.[0] || '';

    const productLink = `${window.location.origin}/?p=${product.id}`;

    const messageLines = [
      `¡Hola Caeli! 🌸 Me gustaría consultar por este producto:`,
      '',
      `*${product.name}*`,
      materialText,
      `Precio: ${priceText}`,
      `Ref: #${idShort}`,
      '',
      `¿Tienen stock disponible?`,
      '',
      `Link directo: ${productLink}`
    ];

  const message = messageLines.filter(line => line !== null).join('\n').trim();

  return whatsappLink(message);
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
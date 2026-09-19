import { Product } from '../types/product';
import { createSlug } from './slug';

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

  const slug = createSlug(product.name);
  const productLink = `${window.location.origin}/?p=${slug}`;

  const messageLines = [
    `¡Hola Caeli! Me gustaría consultar por este producto:`,
    '',
    `*${product.name}*`,
    materialText,
    `Precio: ${priceText}`,
    `Ref: #${idShort}`,
    '',
    `¿Tienen stock disponible?`,
    '',
    `Ver producto: ${productLink}`
  ];

  const message = messageLines.filter(line => line !== null).join('\n').trim();

  return whatsappLink(message);
}

export function cartCheckoutLink(items: { product: Product, quantity: number }[], totalPrice: number): string {
  if (items.length === 0) return whatsappLink('¡Hola Caeli!');

  const intro = `¡Hola Caeli! Me gustaría hacer un pedido con los siguientes productos:`;

  const itemsText = items.map(item => {
    const priceText = item.product.onSale && item.product.originalPrice && item.product.originalPrice > item.product.price
      ? formatPrice(item.product.price)
      : formatPrice(item.product.price);

    const slug = createSlug(item.product.name);
    const productLink = `${window.location.origin}/?p=${slug}`;

    return `${item.quantity}x ${item.product.name} - ${priceText}\n   ↳ Ver joya: ${productLink}`;
  }).join('\n\n');

  const totalText = `Total estimado: ${formatPrice(totalPrice)}`;
  const outro = `¿Tienen stock disponible y me pasas los datos para el pago?`;

  const message = [intro, '', itemsText, '', totalText, '', outro].join('\n');
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
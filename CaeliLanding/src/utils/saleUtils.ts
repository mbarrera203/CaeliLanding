export interface SaleInfo {
  onSale: boolean;
  originalPrice?: number;
  discountPercentage?: number;
  cleanDescription: string;
}

/**
 * Parsea información de oferta almacenada en el campo description como metadata HTML comment
 * Formato: <!--sale:originalPrice:discountPercentage-->
 */
export function parseSaleInfo(description?: string, currentPrice?: number): SaleInfo {
  if (!description) {
    return { onSale: false, cleanDescription: '' };
  }

  const match = description.match(/<!--sale:(\d+(?:\.\d+)?)(?::(\d+(?:\.\d+)?))?-->/);
  if (!match) {
    return { onSale: false, cleanDescription: description };
  }

  const fullTag = match[0];
  const origPrice = Math.round(parseFloat(match[1]));
  let discount = match[2] ? Math.round(parseFloat(match[2])) : undefined;

  const cleanDescription = description.replace(fullTag, '').trim();

  if (origPrice > 0) {
    if (!discount && currentPrice && origPrice > currentPrice) {
      discount = Math.round(((origPrice - currentPrice) / origPrice) * 100);
    }
    return {
      onSale: true,
      originalPrice: origPrice,
      discountPercentage: discount || (currentPrice && origPrice > currentPrice ? Math.round(((origPrice - currentPrice) / origPrice) * 100) : 0),
      cleanDescription,
    };
  }

  return { onSale: false, cleanDescription };
}

/**
 * Incrusta o remueve la metadata de oferta en el campo description para persistir en Supabase
 */
export function formatDescriptionWithSale(
  cleanDescription: string,
  onSale: boolean,
  originalPrice?: number,
  discountPercentage?: number
): string {
  const stripped = cleanDescription.replace(/<!--sale:[^>]+-->/g, '').trim();
  if (!onSale || !originalPrice || originalPrice <= 0) {
    return stripped;
  }
  const discount = discountPercentage || 0;
  return `<!--sale:${originalPrice}:${discount}-->\n${stripped}`.trim();
}

/**
 * Calcula el precio con descuento a partir del precio original y el porcentaje
 */
export function calculateDiscountPrice(originalPrice: number, discountPercentage: number): number {
  if (originalPrice <= 0) return 0;
  const pct = Math.max(0, Math.min(100, discountPercentage));
  return Math.max(0, Math.round(originalPrice * (1 - pct / 100)));
}

/**
 * Calcula el porcentaje de descuento a partir del precio original y el precio con descuento
 */
export function calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0;
  return Math.max(0, Math.min(100, Math.round(((originalPrice - salePrice) / originalPrice) * 100)));
}

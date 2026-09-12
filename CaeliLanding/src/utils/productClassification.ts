import { Product, Material } from '../types/product';
import tiendanubeCategories from '../data/tiendanubeCategories.json';

const categoryMap = tiendanubeCategories as Record<
  string,
  { material: string; subcategory: string; fullCategory: string }
>;

export interface Classification {
  material: string;
  subcategory: string;
  fullCategory: string;
}

export function getProductClassification(product: Product): Classification {
  // 1. Revisar si el producto ya tiene definidos material y subcategoría
  if (product.material && product.subcategory) {
    return {
      material: product.material,
      subcategory: product.subcategory,
      fullCategory: `${product.material} > ${product.subcategory}`,
    };
  }

  // 2. Buscar en el mapa pregenerado de TiendaNube por ID / slug
  const fromMap = categoryMap[product.id];
  if (fromMap) {
    return fromMap;
  }

  // 3. Inferencia inteligente a partir del nombre, detalle y categoría
  const text = `${product.name} ${product.detail} ${product.category} ${product.description || ''}`.toLowerCase();

  let material = 'Plata';
  if (text.includes('acero blanco') || text.includes('(ab)')) {
    material = 'Acero Blanco';
  } else if (text.includes('acero dorado') || text.includes('dorado') || text.includes('oro')) {
    material = 'Acero Dorado';
  } else if (text.includes('joyero') || text.includes('traba') || text.includes('billetera') || text.includes('perfume')) {
    material = 'Cositas Varias :)';
  } else if (text.includes('cristal')) {
    material = 'Collares Cristal';
  } else if (text.includes('fantasia') || text.includes('fantasía')) {
    material = 'Fantasía';
  } else if (text.includes('plata')) {
    material = 'Plata';
  }

  let subcategory = 'Aros';
  if (text.includes('dije')) {
    subcategory = 'Dijes';
  } else if (text.includes('anillo') || text.includes('alianza') || text.includes('sinfin')) {
    subcategory = 'Anillos';
  } else if (text.includes('collar') || text.includes('cadena') || text.includes('choker') || text.includes('chocker') || text.includes('colgante')) {
    subcategory = 'Collares y Cadenas';
  } else if (text.includes('pulsera') || text.includes('brazalete') || text.includes('esclava')) {
    subcategory = 'Pulseras';
  } else if (text.includes('aro') || text.includes('arete') || text.includes('argolla') || text.includes('piercing') || text.includes('huggie')) {
    subcategory = 'Aros';
  } else if (text.includes('joyero')) {
    subcategory = 'Joyeros';
  } else if (text.includes('traba') || text.includes('pelo')) {
    subcategory = 'Trabas para el pelo';
  } else if (text.includes('billetera')) {
    subcategory = 'Billeteras';
  } else if (text.includes('perfume')) {
    subcategory = 'Perfumes de bolsillo';
  } else {
    subcategory = 'Accesorios';
  }

  return {
    material,
    subcategory,
    fullCategory: `${material} > ${subcategory}`,
  };
}

/**
 * Normaliza nombres de subcategorías para comparar (ej: 'Cadenas y collares' vs 'Collares y Cadenas')
 */
export function normalizeSubcategory(sub: string): string {
  const s = sub.toLowerCase().trim();
  if (s.includes('aro') || s.includes('arete')) return 'Aros';
  if (s.includes('collar') || s.includes('cadena') || s.includes('choker') || s.includes('chocker')) return 'Collares y Cadenas';
  if (s.includes('pulsera') || s.includes('brazalete')) return 'Pulseras';
  if (s.includes('anillo')) return 'Anillos';
  if (s.includes('dije')) return 'Dijes';
  if (s.includes('joyero')) return 'Joyeros';
  if (s.includes('traba') || s.includes('pelo')) return 'Trabas para el pelo';
  if (s.includes('billetera')) return 'Billeteras';
  if (s.includes('perfume')) return 'Perfumes de bolsillo';
  return sub;
}

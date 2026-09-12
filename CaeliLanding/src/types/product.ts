export type Category = 'Anillos' | 'Collares' | 'Pulseras' | 'Aretes';

export const CATEGORIES: Category[] = [
  'Anillos',
  'Collares',
  'Pulseras',
  'Aretes',
];

export type Material =
  | 'Plata'
  | 'Acero Blanco'
  | 'Acero Dorado'
  | 'Cositas Varias :)'
  | 'Fantasía'
  | 'Collares Cristal';

export const MATERIALS: Material[] = [
  'Plata',
  'Acero Blanco',
  'Acero Dorado',
  'Cositas Varias :)',
  'Fantasía',
  'Collares Cristal',
];

export const TIENDANUBE_TREE: Record<Material, string[]> = {
  'Plata': ['Aros', 'Collares y Cadenas', 'Dijes', 'Pulseras', 'Anillos'],
  'Acero Blanco': ['Aros', 'Cadenas y collares', 'Chockers gamuza', 'Pulseras'],
  'Acero Dorado': ['Aros', 'Collares y cadenas', 'Pulseras'],
  'Cositas Varias :)': ['Billeteras', 'Joyeros', 'Perfumes de bolsillo', 'Trabas para el pelo'],
  'Fantasía': ['Aros', 'Collares', 'Brazaletes'],
  'Collares Cristal': ['Collares cristal'],
};

export interface Product {
  id: string;
  name: string;
  category: Category;
  material?: string;
  subcategory?: string;
  price: number;
  /** Línea corta de material / detalle que se muestra bajo el nombre del producto. */
  detail: string;
  /** Descripción más larga del producto, visible al hacer hover en la tarjeta. */
  description?: string;
  /** Arreglo de imágenes del producto (mínimo una). */
  images: string[];
  stock: number;
  active: boolean;
  /** Marca la pieza principal del catálogo. */
  featured?: boolean;
  /** True para piezas recién subidas desde la zona de carga del admin. */
  isDraft?: boolean;
}
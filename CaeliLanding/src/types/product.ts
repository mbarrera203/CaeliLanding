export type Category = 'Anillos' | 'Collares' | 'Pulseras' | 'Aretes';

export const CATEGORIES: Category[] = [
  'Anillos',
  'Collares',
  'Pulseras',
  'Aretes',
];

export interface Product {
  id: string;
  name: string;
  category: Category;
  /** Precio en USD. */
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
export type Category = 'Rings' | 'Necklaces' | 'Bracelets' | 'Earrings';

export const CATEGORIES: Category[] = [
'Rings',
'Necklaces',
'Bracelets',
'Earrings'];


export interface Product {
  id: string;
  name: string;
  category: Category;
  /** Price in USD. */
  price: number;
  /** Short material / detail line shown under the product name. */
  detail: string;
  image: string;
  stock: number;
  active: boolean;
  /** Marks the piece that leads the catalog. */
  featured?: boolean;
  /** True for pieces just dropped into the admin upload zone. */
  isDraft?: boolean;
}
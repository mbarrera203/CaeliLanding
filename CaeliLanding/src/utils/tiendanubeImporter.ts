import Papa from 'papaparse';
import { Category, Product } from '../types/product';
import tiendanubeImageMap from '../data/tiendanubeImages.json';

// Normaliza texto eliminando acentos y minúsculas
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}


// Detectar categoría a partir del nombre o categoría de TiendaNube
export function matchCategory(categoryStr: string, nameStr: string): Category {
  const combined = normalize(`${categoryStr} ${nameStr}`);

  if (combined.includes('anillo') || combined.includes('alianza') || combined.includes('solitario') || combined.includes('sinfin')) {
    return 'Anillos';
  }
  if (combined.includes('collar') || combined.includes('cadena') || combined.includes('dije') || combined.includes('gargantilla') || combined.includes('choker') || combined.includes('colgante')) {
    return 'Collares';
  }
  if (combined.includes('pulsera') || combined.includes('brazalete') || combined.includes('esclava')) {
    return 'Pulseras';
  }
  if (combined.includes('arete') || combined.includes('aro') || combined.includes('argolla') || combined.includes('arito') || combined.includes('piercing') || combined.includes('earring')) {
    return 'Aretes';
  }

  // Si la categoría de TiendaNube tiene alguna coincidencia directa
  if (categoryStr.includes('Anillos')) return 'Anillos';
  if (categoryStr.includes('Collares')) return 'Collares';
  if (categoryStr.includes('Pulseras')) return 'Pulseras';
  if (categoryStr.includes('Aretes') || categoryStr.includes('Aros')) return 'Aretes';

  return 'Anillos';
}

// Limpiar HTML de descripciones
function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Extraer detalle / material corto a partir de tags o nombre
function extractDetail(name: string, tags: string, desc: string): string {
  const text = `${name} ${tags} ${desc}`.toLowerCase();
  const details: string[] = [];

  if (text.includes('plata 925') || text.includes('plata925')) {
    details.push('Plata 925');
  } else if (text.includes('plata')) {
    details.push('Plata');
  }

  if (text.includes('acero quirurgico') || text.includes('acero quirúrgico') || text.includes('acero')) {
    details.push('Acero Quirúrgico');
  }

  if (text.includes('oro') || text.includes('enchapado') || text.includes('dorado')) {
    details.push('Baño en Oro');
  }

  if (text.includes('perla')) {
    details.push('Perlas');
  }

  if (text.includes('circon') || text.includes('circonia') || text.includes('zircon')) {
    details.push('Circonias');
  }

  if (details.length > 0) {
    return details.slice(0, 2).join(' · ');
  }

  return 'Plata 925 / Acero Quirúrgico';
}

// Parsear precio numérico tolerante a formatos de TiendaNube y Argentina (ej: 160,000.00 o 160.000,00 o 25000)
function parsePrice(raw: any): number {
  if (typeof raw === 'number') return Math.max(0, Math.round(raw));
  if (!raw) return 0;
  const str = String(raw).trim();
  const clean = str.replace(/[^0-9.,]/g, '');
  if (!clean) return 0;

  // Caso 1: Formato TiendaNube (coma para miles, punto para decimales): 160,000.00
  if (clean.includes(',') && clean.includes('.')) {
    if (clean.indexOf(',') < clean.lastIndexOf('.')) {
      // Quitar separador de miles ','
      return Math.round(parseFloat(clean.replace(/,/g, ''))) || 0;
    } else {
      // 160.000,00 -> quitar '.' y reemplazar ',' por '.'
      return Math.round(parseFloat(clean.replace(/\./g, '').replace(',', '.'))) || 0;
    }
  }

  // Caso 2: Solo coma (ej: 160000,00 o 5,900)
  if (clean.includes(',')) {
    const parts = clean.split(',');
    if (parts.length === 2 && parts[1].length === 2) {
      // Decimales: 5900,00
      return Math.round(parseFloat(clean.replace(',', '.'))) || 0;
    }
    // Miles: 160,000 o 5,900
    return Math.round(parseFloat(clean.replace(/,/g, ''))) || 0;
  }

  // Caso 3: Solo punto (ej: 160000.00 o 160.000)
  if (clean.includes('.')) {
    const parts = clean.split('.');
    if (parts.length === 2 && parts[1].length === 2) {
      // Decimales: 160000.00
      return Math.round(parseFloat(clean)) || 0;
    }
    // Miles: 160.000
    return Math.round(parseFloat(clean.replace(/\./g, ''))) || 0;
  }

  return Math.round(parseFloat(clean)) || 0;
}


export interface TiendaNubeProductResult {
  products: Product[];
  totalCsvRows: number;
  totalImages: number;
}

export async function parseTiendaNubeCsv(file: File): Promise<TiendaNubeProductResult> {
  // Leer el buffer y decodificar en ISO-8859-1 (Latin1 de TiendaNube Argentina) o UTF-8
  const buffer = await file.arrayBuffer();
  let text = '';
  try {
    const textUtf8 = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    if (textUtf8.includes('\uFFFD')) {
      text = new TextDecoder('iso-8859-1').decode(buffer);
    } else {
      text = textUtf8;
    }
  } catch {
    text = new TextDecoder('iso-8859-1').decode(buffer);
  }

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),

      complete: (results) => {
        try {
          const rows = results.data as Record<string, any>[];
          if (!rows || rows.length === 0) {
            return reject(new Error('El archivo CSV está vacío o no tiene el formato esperado.'));
          }

          // Mapa para agrupar variantes y múltiples fotos por producto
          // TiendaNube agrupa por "Identificador de URL" o "Nombre"
          const productMap = new Map<string, {
            id: string;
            name: string;
            category: Category;
            price: number;
            detail: string;
            description: string;
            images: Set<string>;
            stock: number;
            active: boolean;
            featured: boolean;
          }>();

          let totalImagesCount = 0;

          for (const row of rows) {
            // Buscar columnas con tolerancia a diferentes versiones de TiendaNube
            const slug = (
              row['Identificador de URL'] ||
              row['URL'] ||
              row['Handle'] ||
              row['Slug'] ||
              ''
            ).toString().trim();

            const name = (
              row['Nombre'] ||
              row['Nombre del producto'] ||
              row['Title'] ||
              ''
            ).toString().trim();

            // Clave única para agrupar fotos del mismo producto
            const groupKey = slug || name;
            if (!groupKey) continue; // Fila sin identificador ni nombre

            const rawCategory = (
              row['Categorías'] ||
              row['Categorias'] ||
              row['Categoría'] ||
              row['Categoria'] ||
              ''
            ).toString();

            const rawPrice =
              row['Precio promocional'] ||
              row['Precio'] ||
              row['Precio de lista'] ||
              0;

            const rawStock = row['Stock'] || row['Cantidad'] || '0';
            const stockNum = rawStock === 'Sin límite' || rawStock === 'Ilimitado' ? 99 : (parseInt(rawStock, 10) || 0);

            const rawDesc = (row['Descripción'] || row['Descripcion'] || '').toString();
            const cleanDesc = cleanHtml(rawDesc);

            const tags = (row['Tags'] || row['Etiquetas'] || '').toString();

            // Extraer foto de la fila
            const imageUrl = (
              row['URL de la imagen'] ||
              row['Imagen'] ||
              row['Image Src'] ||
              row['URL de imagen'] ||
              ''
            ).toString().trim();

            const isVisible = (
              row['Mostrar en tienda'] ||
              row['Visible'] ||
              row['Publicado'] ||
              'SI'
            ).toString().toUpperCase().trim();

            const active = isVisible !== 'NO' && isVisible !== 'FALSE' && isVisible !== '0';

            if (!productMap.has(groupKey)) {
              const category = matchCategory(rawCategory, name);
              const price = parsePrice(rawPrice);
              const detail = extractDetail(name, tags, cleanDesc);

              // ID limpio y compatible con URLs
              const safeId = (slug || name)
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '') || `prod-${Date.now()}`;

              const cleanDescFinal = cleanDesc.replace(/https?:\/\/photos\.google\.com[^\s"']*/gi, '').trim();

              // Buscar imágenes de alta resolución en el mapa de TiendaNube por slug
              const sitemapImages = (tiendanubeImageMap as Record<string, string[]>)[slug] ||
                (tiendanubeImageMap as Record<string, string[]>)[safeId] || [];

              const initialImages = new Set<string>();
              for (const img of sitemapImages) {
                initialImages.add(img);
                totalImagesCount++;
              }

              productMap.set(groupKey, {
                id: safeId,
                name: name || 'Accesorio Caeli',
                category,
                price,
                detail,
                description: cleanDescFinal || 'Joya en plata 925 y acero quirúrgico.',
                images: initialImages,
                stock: stockNum,
                active,
                featured: false,
              });
            }


            const current = productMap.get(groupKey)!;

            // Si esta fila tiene un precio válido y el actual es 0, actualizarlo
            if (current.price === 0 && rawPrice) {
              current.price = parsePrice(rawPrice);
            }

            // Sumar stock de variantes
            if (stockNum > 0 && current.stock === 0) {
              current.stock = stockNum;
            }

            // Si el CSV trae una URL de imagen válida (que no sea google photos privada)
            if (
              imageUrl &&
              !imageUrl.includes('photos.google.com') &&
              (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))
            ) {
              if (!current.images.has(imageUrl)) {
                current.images.add(imageUrl);
                totalImagesCount++;
              }
            }
          }

          // Convertir el Map a lista final de productos
          const products: Product[] = Array.from(productMap.values()).map((p) => {
            const imageArray = Array.from(p.images);
            return {
              id: p.id,
              name: p.name,
              category: p.category,
              price: p.price,
              detail: p.detail,
              description: p.description,
              images: imageArray.length > 0 ? imageArray : ['/LogoCaeli.png'],
              stock: p.stock,
              active: p.active,
              featured: p.featured,
            };
          });


          resolve({
            products,
            totalCsvRows: rows.length,
            totalImages: totalImagesCount,
          });
        } catch (err) {
          reject(err);
        }
      },
      error: (error: any) => {
        reject(new Error(`Error al leer CSV: ${error.message}`));
      },
    });
  });
}

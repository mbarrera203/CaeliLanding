import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnjavkjhfkefklemqnwm.supabase.co';
const supabaseKey = 'sb_publishable_ynD6bvwajcNx7pVKyDJ-Eg_dLmyuwfQ';
const supabase = createClient(supabaseUrl, supabaseKey);

const TIENDANUBE_TREE = {
  'Plata': ['Aros', 'Collares y Cadenas', 'Dijes', 'Pulseras', 'Anillos'],
  'Acero Blanco': ['Aros', 'Cadenas y collares', 'Chockers gamuza', 'Pulseras'],
  'Acero Dorado': ['Aros', 'Collares y cadenas', 'Pulseras'],
  'Cositas Varias :)': ['Billeteras', 'Joyeros', 'Perfumes de bolsillo', 'Trabas para el pelo'],
  'Fantasía': ['Aros', 'Collares', 'Brazaletes'],
  'Collares Cristal': ['Collares cristal'],
};

function getProductClassification(product) {
  if (product.material && product.subcategory) return { material: product.material, subcategory: product.subcategory };
  if (product.material) return { material: product.material, subcategory: product.subcategory || 'Accesorios' };
  
  let inferredMaterial = null;
  if (product.detail) {
    for (const mat of Object.keys(TIENDANUBE_TREE)) {
      if (product.detail.startsWith(mat)) {
        inferredMaterial = mat;
        const rest = product.detail.slice(mat.length).replace(/^[·\/:>\s-]+/, '').trim();
        const availableSubs = TIENDANUBE_TREE[mat] || [];
        const matchedSub = availableSubs.find((s) => s.toLowerCase() === rest.toLowerCase());
        if (matchedSub) {
           return { material: inferredMaterial, subcategory: matchedSub };
        }
        break;
      }
    }
  }
  
  if (product.legacyCategory) {
    const legacyUpper = product.legacyCategory.toUpperCase();
    for (const [mat, subs] of Object.entries(TIENDANUBE_TREE)) {
      if (legacyUpper.includes(mat.toUpperCase())) {
        const matchedSub = subs.find((s) => legacyUpper.includes(s.toUpperCase()));
        return { material: inferredMaterial || mat, subcategory: matchedSub || 'Accesorios' };
      }
    }
  }

  const nameUpper = product.name.toUpperCase();
  for (const [mat, subs] of Object.entries(TIENDANUBE_TREE)) {
    if (nameUpper.includes(mat.toUpperCase())) {
      const matchedSub = subs.find((s) => nameUpper.includes(s.toUpperCase()));
      return { material: inferredMaterial || mat, subcategory: matchedSub || 'Accesorios' };
    }
  }
  
  const text = `${product.name} ${product.detail} ${product.legacyCategory || ''}`.toLowerCase();
  let material = inferredMaterial || 'Plata';
  if (!inferredMaterial) {
    if (text.includes('acero blanco')) material = 'Acero Blanco';
    else if (text.includes('acero dorado')) material = 'Acero Dorado';
    else if (text.includes('plata')) material = 'Plata';
  }
  
  let subcategory = 'Aros';
  if (text.includes('dije')) subcategory = 'Dijes';
  else if (text.includes('anillo')) subcategory = 'Anillos';
  else if (text.includes('collar') || text.includes('cadena')) subcategory = 'Collares y Cadenas';
  else if (text.includes('pulsera')) subcategory = 'Pulseras';
  
  return { material, subcategory };
}

async function run() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) return;
  
  const items = data.map(row => ({
     name: row.name, legacyCategory: row.category, detail: row.detail, material: row.material, subcategory: row.subcategory
  }));
  
  const allPlataAros = items.filter(row => {
    const cls = getProductClassification({...row, material: null, subcategory: null});
    return cls.material === 'Plata' && cls.subcategory === 'Aros';
  });

  console.log("Plata Aros (New Logic):", allPlataAros.length);
}
run();

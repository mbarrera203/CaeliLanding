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
  let inferredMaterial = null;
  if (product.detail) {
    for (const mat of Object.keys(TIENDANUBE_TREE)) {
      if (product.detail.startsWith(mat)) {
        inferredMaterial = mat;
        break;
      }
    }
  }
  
  if (product.category) {
    const legacyUpper = product.category.toUpperCase();
    for (const [mat, subs] of Object.entries(TIENDANUBE_TREE)) {
      if (legacyUpper.includes(mat.toUpperCase())) {
        return { material: inferredMaterial || mat };
      }
    }
  }

  const nameUpper = product.name.toUpperCase();
  for (const [mat, subs] of Object.entries(TIENDANUBE_TREE)) {
    if (nameUpper.includes(mat.toUpperCase())) {
      return { material: inferredMaterial || mat };
    }
  }
  
  const text = `${product.name} ${product.detail} ${product.category || ''}`.toLowerCase();
  let material = inferredMaterial || 'Plata';
  if (!inferredMaterial) {
    if (text.includes('acero blanco') || text.includes('(ab)')) material = 'Acero Blanco';
    else if (text.includes('acero dorado')) material = 'Acero Dorado';
    else if (text.includes('plata')) material = 'Plata';
  }
  return { material };
}


async function run() {
  const { data, error } = await supabase.from('products').select('id, name, detail, category');
  if (error) { console.error(error); return; }
  
  let updatedCount = 0;
  for (const product of data) {
    if (!product.detail) continue;
    
    let newDetail = product.detail;
    
    if (newDetail.toLowerCase().includes('quirurgico') || newDetail.toLowerCase().includes('quirúrgico')) {
      newDetail = newDetail.replace(/quirurgico/gi, '').replace(/quirúrgico/gi, '').trim();
    }
    
    const cls = getProductClassification(product);
    
    if (cls.material === 'Acero Blanco' && newDetail.trim() === 'Acero') {
       newDetail = 'Acero Blanco';
    }
    if (cls.material === 'Acero Dorado' && newDetail.trim() === 'Acero') {
       newDetail = 'Acero Dorado';
    }
    
    if (newDetail !== product.detail) {
      await supabase.from('products').update({ detail: newDetail }).eq('id', product.id);
      updatedCount++;
    }
  }
  console.log(`Updated ${updatedCount} products details.`);
}
run();

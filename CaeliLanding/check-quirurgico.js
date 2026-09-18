import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnjavkjhfkefklemqnwm.supabase.co';
const supabaseKey = 'sb_publishable_ynD6bvwajcNx7pVKyDJ-Eg_dLmyuwfQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('products').select('id, name, detail, category');
  if (error) { console.error(error); return; }
  
  const withQuirurgico = data.filter(p => 
    (p.detail || '').toLowerCase().includes('quirurgico') || 
    (p.detail || '').toLowerCase().includes('quirúrgico')
  );
  
  console.log(`Products still with "quirúrgico" in detail: ${withQuirurgico.length}`);
  withQuirurgico.slice(0, 10).forEach(p => {
    console.log(`  - [${p.name}] detail: "${p.detail}"`);
  });

  // Also check for "Acero Quirúrgico" anywhere else
  const withQuirurgicoInCat = data.filter(p =>
    (p.category || '').toLowerCase().includes('quirurgico') ||
    (p.category || '').toLowerCase().includes('quirúrgico')
  );
  console.log(`\nProducts with "quirúrgico" in category: ${withQuirurgicoInCat.length}`);
  withQuirurgicoInCat.slice(0, 5).forEach(p => {
    console.log(`  - [${p.name}] category: "${p.category}"`);
  });
}
run();

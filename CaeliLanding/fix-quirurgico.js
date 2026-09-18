import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnjavkjhfkefklemqnwm.supabase.co';
const supabaseKey = 'sb_publishable_ynD6bvwajcNx7pVKyDJ-Eg_dLmyuwfQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('products').select('id, name, detail, category');
  if (error) { console.error(error); return; }
  
  let updated = 0;
  let failed = 0;
  
  for (const p of data) {
    if (!p.detail) continue;
    const lower = p.detail.toLowerCase();
    if (!lower.includes('quirurgico') && !lower.includes('quirúrgico')) continue;
    
    let newDetail = p.detail
      .replace(/Acero Quir[uú]rgico/gi, 'Acero')
      .replace(/\s+/g, ' ')
      .trim();
    
    const { error: updateError } = await supabase
      .from('products')
      .update({ detail: newDetail })
      .eq('id', p.id);
    
    if (updateError) {
      failed++;
      console.log(`FAILED: [${p.name}] ${updateError.message}`);
    } else {
      updated++;
    }
  }
  
  console.log(`Updated: ${updated}, Failed: ${failed}`);
  
  // Verify
  const { data: check } = await supabase.from('products').select('id, detail').ilike('detail', '%quirurgico%');
  const { data: check2 } = await supabase.from('products').select('id, detail').ilike('detail', '%quirúrgico%');
  console.log(`Remaining with quirurgico: ${(check?.length || 0) + (check2?.length || 0)}`);
}
run();

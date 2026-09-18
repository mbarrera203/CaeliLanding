import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://lnjavkjhfkefklemqnwm.supabase.co', 'sb_publishable_ynD6bvwajcNx7pVKyDJ-Eg_dLmyuwfQ');
async function run() {
  const { data } = await supabase.from('products').select('id, detail');
  const remaining = (data || []).filter(p => (p.detail || '').toLowerCase().includes('quirurgico') || (p.detail || '').toLowerCase().includes('quirúrgico'));
  console.log(`Productos que todavía dicen "quirúrgico": ${remaining.length}`);
  if (remaining.length > 0) remaining.slice(0, 5).forEach(p => console.log(`  - ${p.detail}`));
  else console.log("✅ ¡Perfecto! Ya no queda ninguno.");
}
run();

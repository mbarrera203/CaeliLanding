import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://lnjavkjhfkefklemqnwm.supabase.co', 'sb_publishable_ynD6bvwajcNx7pVKyDJ-Eg_dLmyuwfQ');
async function run() {
  const { data: cats } = await supabase.from('categories').select('name, sort_order').order('sort_order');
  console.log("Categorías con orden:");
  cats.forEach((c, i) => console.log(`  ${c.sort_order}. ${c.name}`));
  
  const { data: subs } = await supabase.from('subcategories').select('name, sort_order, category_id').order('sort_order');
  console.log("\nSubcategorías con orden:");
  subs.forEach((s) => console.log(`  ${s.sort_order}. ${s.name}`));
}
run();

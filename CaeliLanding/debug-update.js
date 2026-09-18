import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnjavkjhfkefklemqnwm.supabase.co';
const supabaseKey = 'sb_publishable_ynD6bvwajcNx7pVKyDJ-Eg_dLmyuwfQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Pick one product and try to update it
  const { data } = await supabase.from('products').select('id, name, detail').limit(1);
  if (!data || data.length === 0) return;
  
  const testProduct = data[0];
  console.log("Before:", testProduct);
  
  const { data: updateData, error: updateError, status, statusText } = await supabase
    .from('products')
    .update({ detail: 'TEST_UPDATE' })
    .eq('id', testProduct.id)
    .select();
  
  console.log("Update response:", { status, statusText, error: updateError, data: updateData });
  
  // Read it back
  const { data: readBack } = await supabase.from('products').select('id, detail').eq('id', testProduct.id).single();
  console.log("After read-back:", readBack);
  
  // Restore original
  if (readBack && readBack.detail === 'TEST_UPDATE') {
    await supabase.from('products').update({ detail: testProduct.detail }).eq('id', testProduct.id);
    console.log("Restored original");
  } else {
    console.log("UPDATE DID NOT PERSIST - RLS issue likely");
  }
}
run();

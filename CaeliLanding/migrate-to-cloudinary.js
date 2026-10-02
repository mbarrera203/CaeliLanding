import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lnjavkjhfkefklemqnwm.supabase.co'; // Hardcoded URL found in src/lib/supabase.ts
const SUPABASE_KEY = 'sb_publishable_ynD6bvwajcNx7pVKyDJ-Eg_dLmyuwfQ'; // Hardcoded Key found in src/lib/supabase.ts

const CLOUD_NAME = 'kk4122by';
const UPLOAD_PRESET = 'caeli_preset';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function uploadUrlToCloudinary(imageUrl) {
  const formData = new FormData();
  formData.append('file', imageUrl);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Error subiendo a Cloudinary: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  return data.secure_url;
}

async function migrate() {
  console.log('Iniciando migración de imágenes de Supabase a Cloudinary...');
  
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error obteniendo productos:', error);
    return;
  }

  console.log(`Se encontraron ${products.length} productos.`);

  for (const product of products) {
    if (!product.images || product.images.length === 0) continue;

    let needsUpdate = false;
    const newImages = [];

    for (const imgUrl of product.images) {
      if (imgUrl.includes('supabase.co')) {
        console.log(`Migrando imagen de producto "${product.name}": ${imgUrl}`);
        try {
          const cloudinaryUrl = await uploadUrlToCloudinary(imgUrl);
          newImages.push(cloudinaryUrl);
          needsUpdate = true;
          console.log(`✅ Éxito: ${cloudinaryUrl}`);
        } catch (err) {
          console.error(`❌ Falló la subida para ${product.name}:`, err.message);
          newImages.push(imgUrl); // Dejar la vieja si falla
        }
      } else {
        newImages.push(imgUrl); // Ya está en Cloudinary u otro lugar
      }
    }

    if (needsUpdate) {
      console.log(`Actualizando base de datos para "${product.name}"...`);
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: newImages })
        .eq('id', product.id);

      if (updateError) {
        console.error(`❌ Error actualizando BD para ${product.name}:`, updateError);
      } else {
        console.log(`✨ Producto actualizado con éxito.\n`);
      }
    }
  }

  console.log('¡Migración completada!');
}

migrate();

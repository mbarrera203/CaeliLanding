import { useCallback, useEffect, useRef, useState } from 'react';
import { Category, Product } from '../types/product';
import { supabase } from '../lib/supabase';

function nameFromFile(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
  return base
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .slice(0, 40);
}

// Subir una imagen a Supabase Storage bucket 'products'
async function uploadFileToSupabase(file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
    const fileName = `${Date.now()}_${cleanName}.${fileExt}`;
    const filePath = `items/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.warn('No se pudo subir la foto a Supabase Storage, usando vista previa local:', uploadError);
      return URL.createObjectURL(file);
    }

    const { data } = supabase.storage.from('products').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error('Error al subir imagen:', err);
    return URL.createObjectURL(file);
  }
}

export function useInventory() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isEmptyDb, setIsEmptyDb] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const savedTimer = useRef<number | undefined>(undefined);

  // Cargar productos desde Supabase
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error al leer de Supabase:', error.message);
        setItems([]);
        return;
      }

      if (data && data.length > 0) {
        const mapped: Product[] = data.map((row: any) => ({
          id: String(row.id),
          name: row.name || 'Sin nombre',
          category: (row.category as Category) || 'Anillos',
          price: Number(row.price) || 0,
          detail: row.detail || '',
          description: row.description || '',
          images: Array.isArray(row.images) && row.images.length > 0 ? row.images : ['/LogoCaeli-removebg-preview.png'],
          stock: Number(row.stock) || 0,
          active: Boolean(row.active),
          featured: Boolean(row.featured),
        }));
        setItems(mapped);
        setIsEmptyDb(false);
      } else {
        // Base de datos vacía
        setIsEmptyDb(true);
        setItems([]);
      }
    } catch (err) {
      console.error('Error cargando inventario:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    return () => {
      if (savedTimer.current) window.clearTimeout(savedTimer.current);
    };
  }, [loadProducts]);

  const flagSaved = useCallback((id: string) => {
    setSavedId(id);
    if (savedTimer.current) window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setSavedId(null), 1500);
  }, []);

  // Actualizar un campo en memoria y en Supabase
  const patch = useCallback(
    async (id: string, changes: Partial<Product>) => {
      // 1. Optimistic update local
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
      );
      flagSaved(id);

      // 2. Persistir en Supabase
      try {
        const { error } = await supabase
          .from('products')
          .update(changes)
          .eq('id', id);

        if (error) {
          console.error('Error al guardar cambio en Supabase:', error.message);
        }
      } catch (err) {
        console.error('Excepción al guardar cambio en Supabase:', err);
      }
    },
    [flagSaved]
  );

  const setName = useCallback(
    (id: string, name: string) => patch(id, { name: name.trim() || 'Pieza sin nombre' }),
    [patch]
  );

  const setPrice = useCallback(
    (id: string, price: number) => patch(id, { price: Math.max(0, price) }),
    [patch]
  );

  const setStock = useCallback(
    (id: string, stock: number) => {
      const next = Math.max(0, Math.round(stock));

      setItems((prev) =>

        prev.map((item) =>
          item.id === id
            ? {
              ...item,
              stock: next,
              active: next === 0 ? false : item.active,
            }
            : item
        )
      );
      flagSaved(id);

      supabase
        .from('products')
        .update(next === 0 ? { stock: 0, active: false } : { stock: next })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error al actualizar stock:', error.message);
        });
    },
    [flagSaved]
  );

  const setCategory = useCallback(
    (id: string, category: Category) => patch(id, { category }),
    [patch]
  );

  const setDescription = useCallback(
    (id: string, description: string) => patch(id, { description }),
    [patch]
  );

  const toggleActive = useCallback(
    (id: string) => {
      setItems((prev) => {
        const target = prev.find((item) => item.id === id);
        if (!target) return prev;
        const nextActive = !target.active;
        const nextStock = nextActive && target.stock === 0 ? 1 : target.stock;

        supabase
          .from('products')
          .update({ active: nextActive, stock: nextStock })
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.error('Error al actualizar estado:', error.message);
          });

        return prev.map((item) =>
          item.id === id
            ? {
              ...item,
              active: nextActive,
              stock: nextStock,
            }
            : item
        );
      });
      flagSaved(id);
    },
    [flagSaved]
  );

  const remove = useCallback(async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error('Error al eliminar producto en Supabase:', error.message);
      }
    } catch (err) {
      console.error('Excepción al eliminar producto:', err);
    }
  }, []);

  const addImagesToProduct = useCallback(
    async (id: string, files: File[]) => {
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));
      if (imageFiles.length === 0) return;

      setIsUploading(true);
      try {
        const uploadedUrls = await Promise.all(
          imageFiles.map((f) => uploadFileToSupabase(f))
        );

        const current = items.find((item) => item.id === id);
        if (!current) return;

        const updatedImages = [...current.images, ...uploadedUrls];
        await patch(id, { images: updatedImages });
      } catch (err) {
        console.error('Error al agregar imágenes al producto:', err);
      } finally {
        setIsUploading(false);
      }
    },
    [items, patch]
  );

  const removeImageFromProduct = useCallback(
    async (id: string, imageIndex: number) => {
      const current = items.find((item) => item.id === id);
      if (!current || current.images.length <= 1) return;

      const newImages = [...current.images];
      newImages.splice(imageIndex, 1);
      await patch(id, { images: newImages });
    },
    [items, patch]
  );

  // Crear un nuevo producto desde la zona de arrastrar y soltar
  const addFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));
      if (imageFiles.length === 0) return;

      setIsUploading(true);
      try {
        // Subir todas las imágenes a Supabase Storage
        const uploadedUrls = await Promise.all(
          imageFiles.map((file) => uploadFileToSupabase(file))
        );

        const newId = `prod-${Date.now()}`;
        const newProduct: Product = {
          id: newId,
          name: nameFromFile(imageFiles[0].name),
          category: 'Anillos',
          price: 0,
          detail: 'Plata 925 / Acero Quirúrgico',
          description: 'Añadir una descripción detallada...',
          images: uploadedUrls,
          stock: 1,
          active: true,
          isDraft: true,
        };

        // 1. Mostrar de inmediato en la tabla
        setItems((prev) => [newProduct, ...prev]);

        // 2. Guardar en Supabase
        const { error } = await supabase.from('products').insert([
          {
            id: newProduct.id,
            name: newProduct.name,
            category: newProduct.category,
            price: newProduct.price,
            detail: newProduct.detail,
            description: newProduct.description,
            images: newProduct.images,
            stock: newProduct.stock,
            active: newProduct.active,
            featured: false,
          },
        ]);

        if (error) {
          console.error('Error al guardar nuevo producto en Supabase:', error.message);
        } else {
          setIsEmptyDb(false);
          flagSaved(newId);
        }
      } catch (err) {
        console.error('Error al procesar archivos de producto:', err);
      } finally {
        setIsUploading(false);
      }
    },
    [flagSaved]
  );

  return {
    items,
    loading,
    isUploading,
    isEmptyDb,
    savedId,
    setName,
    setPrice,
    setStock,
    setCategory,
    setDescription,
    toggleActive,
    remove,
    addFiles,
    addImagesToProduct,
    removeImageFromProduct,
    refresh: loadProducts,
  };
}
import { useCallback, useEffect, useRef, useState } from 'react';
import { products as seedProducts } from '../data/products';
import { Category, Product } from '../types/product';

function nameFromFile(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
  return base
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .slice(0, 40);
}

export function useInventory() {
  const [items, setItems] = useState<Product[]>(() =>
    seedProducts.map((p) => ({ ...p, images: [...p.images] }))
  );
  const [savedId, setSavedId] = useState<string | null>(null);
  const savedTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (savedTimer.current) window.clearTimeout(savedTimer.current);
    },
    []
  );

  const flagSaved = useCallback((id: string) => {
    setSavedId(id);
    if (savedTimer.current) window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setSavedId(null), 1500);
  }, []);

  const patch = useCallback(
    (id: string, changes: Partial<Product>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
      );
      flagSaved(id);
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
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                active: !item.active,
                stock: !item.active && item.stock === 0 ? 1 : item.stock,
              }
            : item
        )
      );
      flagSaved(id);
    },
    [flagSaved]
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addImagesToProduct = useCallback(
    (id: string, files: File[]) => {
      const images = files.filter((file) => file.type.startsWith('image/')).map(f => URL.createObjectURL(f));
      if (images.length === 0) return;

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, images: [...item.images, ...images] }
            : item
        )
      );
      flagSaved(id);
    },
    [flagSaved]
  );

  const removeImageFromProduct = useCallback(
    (id: string, imageIndex: number) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          // No permitir borrar si es la única imagen
          if (item.images.length <= 1) return item;
          const newImages = [...item.images];
          newImages.splice(imageIndex, 1);
          return { ...item, images: newImages };
        })
      );
      flagSaved(id);
    },
    [flagSaved]
  );

  const addFiles = useCallback((files: File[]) => {
    const images = files.filter((file) => file.type.startsWith('image/'));
    if (images.length === 0) return;
    
    // Crear un único producto con todas las imágenes soltadas juntas
    const imageUrls = images.map((file) => URL.createObjectURL(file));
    
    const draft: Product = {
      id: `draft-${Date.now()}`,
      name: nameFromFile(images[0].name),
      category: 'Anillos',
      price: 0,
      detail: 'Agregar materiales',
      description: 'Añadir una descripción detallada...',
      images: imageUrls,
      stock: 0,
      active: false,
      isDraft: true,
    };
    
    setItems((prev) => [draft, ...prev]);
  }, []);

  return {
    items,
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
    removeImageFromProduct
  };
}
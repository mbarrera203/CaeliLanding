import { useCallback, useEffect, useRef, useState } from 'react';
import { products as seedProducts } from '../data/products';
import { Category, Product } from '../types/product';

function nameFromFile(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
  return base.
  split(' ').
  filter(Boolean).
  map((word) => word.charAt(0).toUpperCase() + word.slice(1)).
  join(' ').
  slice(0, 40);
}

export function useInventory() {
  const [items, setItems] = useState<Product[]>(() =>
  seedProducts.map((p) => ({ ...p }))
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
      prev.map((item) => item.id === id ? { ...item, ...changes } : item)
      );
      flagSaved(id);
    },
    [flagSaved]
  );

  const setName = useCallback(
    (id: string, name: string) => patch(id, { name: name.trim() || 'Untitled piece' }),
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
      item.id === id ?
      {
        ...item,
        stock: next,
        active: next === 0 ? false : item.active
      } :
      item
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

  const toggleActive = useCallback(
    (id: string) => {
      setItems((prev) =>
      prev.map((item) =>
      item.id === id ?
      {
        ...item,
        active: !item.active,
        stock: !item.active && item.stock === 0 ? 1 : item.stock
      } :
      item
      )
      );
      flagSaved(id);
    },
    [flagSaved]
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const images = files.filter((file) => file.type.startsWith('image/'));
    if (images.length === 0) return;
    const drafts: Product[] = images.map((file, i) => ({
      id: `draft-${Date.now()}-${i}`,
      name: nameFromFile(file.name),
      category: 'Rings',
      price: 0,
      detail: 'Add materials and size',
      image: URL.createObjectURL(file),
      stock: 0,
      active: false,
      isDraft: true
    }));
    setItems((prev) => [...drafts, ...prev]);
  }, []);

  return {
    items,
    savedId,
    setName,
    setPrice,
    setStock,
    setCategory,
    toggleActive,
    remove,
    addFiles
  };
}
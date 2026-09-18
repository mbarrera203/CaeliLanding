import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Category, Subcategory } from '../types/category';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const [catsResponse, subsResponse] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('subcategories').select('*').order('sort_order', { ascending: true })
      ]);

      if (catsResponse.error) throw catsResponse.error;
      if (subsResponse.error) throw subsResponse.error;

      setCategories(catsResponse.data as Category[]);
      setSubcategories(subsResponse.data as Subcategory[]);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (name: string) => {
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.sort_order ?? 0), -1);
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, sort_order: maxOrder + 1 }])
      .select()
      .single();
    if (error) throw error;
    setCategories((prev) => [...prev, data as Category]);
    return data;
  };

  const addSubcategory = async (categoryId: string, name: string) => {
    const siblingSubs = subcategories.filter((s) => s.category_id === categoryId);
    const maxOrder = siblingSubs.reduce((max, s) => Math.max(max, s.sort_order ?? 0), -1);
    const { data, error } = await supabase
      .from('subcategories')
      .insert([{ category_id: categoryId, name, sort_order: maxOrder + 1 }])
      .select()
      .single();
    if (error) throw error;
    setSubcategories((prev) => [...prev, data as Subcategory]);
    return data;
  };

  const updateCategory = async (id: string, name: string) => {
    const { error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id);
    if (error) throw error;
    await fetchCategories();
  };

  const updateSubcategory = async (id: string, name: string) => {
    const { error } = await supabase
      .from('subcategories')
      .update({ name })
      .eq('id', id);
    if (error) throw error;
    await fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setSubcategories((prev) => prev.filter((s) => s.category_id !== id));
  };

  const deleteSubcategory = async (id: string) => {
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) throw error;
    setSubcategories((prev) => prev.filter((s) => s.id !== id));
  };

  const reorderCategory = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const idx = sorted.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const current = sorted[idx];
    const swap = sorted[swapIdx];

    // Swap sort_order values
    await Promise.all([
      supabase.from('categories').update({ sort_order: swap.sort_order }).eq('id', current.id),
      supabase.from('categories').update({ sort_order: current.sort_order }).eq('id', swap.id),
    ]);

    // Optimistic local update
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === current.id) return { ...c, sort_order: swap.sort_order };
        if (c.id === swap.id) return { ...c, sort_order: current.sort_order };
        return c;
      })
    );
  };

  const reorderSubcategory = async (id: string, direction: 'up' | 'down') => {
    const sub = subcategories.find((s) => s.id === id);
    if (!sub) return;
    const siblings = subcategories
      .filter((s) => s.category_id === sub.category_id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const idx = siblings.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;

    const current = siblings[idx];
    const swap = siblings[swapIdx];

    await Promise.all([
      supabase.from('subcategories').update({ sort_order: swap.sort_order }).eq('id', current.id),
      supabase.from('subcategories').update({ sort_order: current.sort_order }).eq('id', swap.id),
    ]);

    setSubcategories((prev) =>
      prev.map((s) => {
        if (s.id === current.id) return { ...s, sort_order: swap.sort_order };
        if (s.id === swap.id) return { ...s, sort_order: current.sort_order };
        return s;
      })
    );
  };

  return {
    categories: [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    subcategories: [...subcategories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    loading,
    error,
    refresh: fetchCategories,
    addCategory,
    addSubcategory,
    updateCategory,
    updateSubcategory,
    deleteCategory,
    deleteSubcategory,
    reorderCategory,
    reorderSubcategory,
  };
}

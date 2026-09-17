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
        supabase.from('categories').select('*').order('name'),
        supabase.from('subcategories').select('*').order('name')
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
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select()
      .single();
    if (error) throw error;
    setCategories((prev) => [...prev, data as Category].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  };

  const addSubcategory = async (categoryId: string, name: string) => {
    const { data, error } = await supabase
      .from('subcategories')
      .insert([{ category_id: categoryId, name }])
      .select()
      .single();
    if (error) throw error;
    setSubcategories((prev) => [...prev, data as Subcategory].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  };

  const updateCategory = async (id: string, name: string) => {
    const { error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id);
    if (error) throw error;
    await fetchCategories(); // Refetch to get updated data and trigger cascade update sync if needed
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

  return {
    categories,
    subcategories,
    loading,
    error,
    refresh: fetchCategories,
    addCategory,
    addSubcategory,
    updateCategory,
    updateSubcategory,
    deleteCategory,
    deleteSubcategory
  };
}

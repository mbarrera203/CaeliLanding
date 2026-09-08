import React, { useEffect } from 'react';
import { AdminHeader } from '../components/admin/AdminHeader';
import { UploadZone } from '../components/admin/UploadZone';
import { InventoryTable } from '../components/admin/InventoryTable';
import { useInventory } from '../hooks/useInventory';

export function AdminDashboard() {
  const {
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
    removeImageFromProduct,
  } = useInventory();

  const liveCount = items.filter((item) => item.active).length;
  const outOfStock = items.length - liveCount;

  // Escuchar eventos customizados disparados desde InventoryTable
  useEffect(() => {
    const handleAddImages = (e: CustomEvent<{ id: string; files: File[] }>) => {
      addImagesToProduct(e.detail.id, e.detail.files);
    };

    const handleRemoveImage = (e: CustomEvent<{ id: string; index: number }>) => {
      removeImageFromProduct(e.detail.id, e.detail.index);
    };

    const handleUpdateDesc = (e: CustomEvent<{ id: string; value: string }>) => {
      setDescription(e.detail.id, e.detail.value);
    };

    document.addEventListener('add-product-images', handleAddImages as EventListener);
    document.addEventListener('remove-product-image', handleRemoveImage as EventListener);
    document.addEventListener('update-product-desc', handleUpdateDesc as EventListener);

    return () => {
      document.removeEventListener('add-product-images', handleAddImages as EventListener);
      document.removeEventListener('remove-product-image', handleRemoveImage as EventListener);
      document.removeEventListener('update-product-desc', handleUpdateDesc as EventListener);
    };
  }, [addImagesToProduct, removeImageFromProduct, setDescription]);

  return (
    <div className="min-h-full w-full bg-ivory font-sans">
      <AdminHeader />

      <main className="mx-auto max-w-[1180px] px-8 pb-24 pt-10">
        <UploadZone onFiles={addFiles} />

        <div className="mt-12 flex items-end justify-between gap-6">
          <div>
            <h1 className="font-serif text-2xl font-medium tracking-tight text-ink">
              Tus productos
            </h1>
            <p className="mt-1.5 text-[13px] text-muted">
              Haz clic en cualquier precio o cantidad para editarlo — los cambios se guardan solos.
            </p>
          </div>
          <p className="shrink-0 pb-1 text-[13px] tabular-nums text-muted">
            <span className="text-ink">{liveCount} activos</span> ·{' '}
            {outOfStock} sin stock
          </p>
        </div>

        <div className="mt-5">
          <InventoryTable
            items={items}
            savedId={savedId}
            onName={setName}
            onPrice={setPrice}
            onStock={setStock}
            onCategory={setCategory}
            onToggle={toggleActive}
            onRemove={remove}
          />
        </div>
      </main>
    </div>
  );
}
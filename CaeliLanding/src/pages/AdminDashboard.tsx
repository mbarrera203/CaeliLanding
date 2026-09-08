import React from 'react';
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
    toggleActive,
    remove,
    addFiles
  } = useInventory();

  const liveCount = items.filter((item) => item.active).length;
  const outOfStock = items.length - liveCount;

  return (
    <div className="min-h-full w-full bg-ivory font-sans">
      <AdminHeader />

      <main className="mx-auto max-w-[1180px] px-8 pb-24 pt-10">
        <UploadZone onFiles={addFiles} />

        <div className="mt-12 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-ink">
              Your products
            </h1>
            <p className="mt-1.5 text-[13px] text-muted">
              Click any price or stock number to change it — edits save on their
              own.
            </p>
          </div>
          <p className="shrink-0 pb-1 text-[13px] tabular-nums text-muted">
            <span className="text-ink">{liveCount} active</span> ·{' '}
            {outOfStock} out of stock
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
            onRemove={remove} />
          
        </div>
      </main>
    </div>);

}
import { useState, useEffect } from 'react';
import { AdminHeader } from '../components/admin/AdminHeader';
import { UploadZone } from '../components/admin/UploadZone';
import { InventoryTable } from '../components/admin/InventoryTable';
import { AdminLogin } from '../components/admin/AdminLogin';
import { TiendaNubeImportModal } from '../components/admin/TiendaNubeImportModal';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../hooks/useAuth';
import { Loader2, CloudUpload, Database, FileSpreadsheet } from 'lucide-react';

export function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated, signIn, signOut } = useAuth();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const {
    items,
    loading: inventoryLoading,
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
    seedInitialProducts,
    refresh,
  } = useInventory();


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

  // Si está verificando la sesión inicial
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-ivory flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
          <span className="text-xs">Cargando panel de Caeli...</span>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar la pantalla de Login
  if (!isAuthenticated) {
    return <AdminLogin onLogin={(email, pass) => signIn(email, pass)} />;
  }


  const liveCount = items.filter((item) => item.active).length;
  const outOfStock = items.length - liveCount;

  return (
    <div className="min-h-full w-full bg-ivory font-sans">
      <AdminHeader userEmail={user?.email} onLogout={signOut} />

      {/* Notificación flotante de subida a la nube */}
      {isUploading && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-xs text-white shadow-xl animate-fade-in">
          <CloudUpload className="h-4 w-4 animate-bounce text-amber-400" />
          <span>Sincronizando fotos y cambios con la nube...</span>
        </div>
      )}

      <main className="mx-auto max-w-[1180px] px-8 pb-24 pt-10">
        {/* Aviso si la base de datos está vacía para sincronizar el catálogo existente */}
        {isEmptyDb && (
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-amber-900">
                  Tu base de datos de Supabase está lista
                </h2>
                <p className="text-xs text-amber-800/80 mt-0.5">
                  ¿Querés cargar automáticamente los productos iniciales de Caeli en tu base de datos?
                </p>
              </div>
            </div>
            <button
              onClick={seedInitialProducts}
              disabled={isUploading}
              className="shrink-0 rounded-xl bg-amber-700 px-4 py-2 text-xs font-medium text-white shadow hover:bg-amber-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? 'Cargando productos...' : 'Sincronizar catálogo inicial'}
            </button>
          </div>
        )}

        <UploadZone onFiles={addFiles} />

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-medium tracking-tight text-ink">
              Tus productos
            </h1>
            <p className="mt-1.5 text-[13px] text-muted">
              Haz clic en cualquier precio o cantidad para editarlo — los cambios se guardan solos en Supabase.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50/90 px-4 py-2 text-[12px] font-medium text-amber-900 shadow-sm hover:bg-amber-100 hover:border-amber-400 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-amber-700" />
              <span>Importar desde TiendaNube (.csv)</span>
            </button>
            <p className="shrink-0 text-[13px] tabular-nums text-muted">
              <span className="text-ink font-medium">{liveCount} activos</span> ·{' '}
              {outOfStock} sin stock
            </p>
          </div>
        </div>

        <div className="mt-5">
          {inventoryLoading ? (
            <div className="rounded-2xl border border-line bg-white p-12 text-center text-muted">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-600 mb-2" />
              <p className="text-xs">Cargando inventario desde la base de datos...</p>
            </div>
          ) : (
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
          )}
        </div>
      </main>

      {/* Modal de importación de TiendaNube */}
      <TiendaNubeImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          refresh();
        }}
      />
    </div>
  );
}
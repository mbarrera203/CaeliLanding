import { useState, useEffect, useMemo } from 'react';
import { AdminHeader } from '../components/admin/AdminHeader';
import { UploadZone } from '../components/admin/UploadZone';
import { InventoryTable } from '../components/admin/InventoryTable';
import { AdminLogin } from '../components/admin/AdminLogin';
import { TiendaNubeImportModal } from '../components/admin/TiendaNubeImportModal';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../hooks/useAuth';
import { CATEGORIES } from '../types/product';
import { Loader2, CloudUpload, Database, FileSpreadsheet, Search, X } from 'lucide-react';

export function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated, signIn, signOut } = useAuth();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'out_of_stock'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

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

  // Resetear página al filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, statusFilter]);

  // Filtrado de productos
  const filteredItems = useMemo(() => {
    let result = items;

    // Filtro de categoría
    if (selectedCategory !== 'Todas') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Filtro de estado
    if (statusFilter === 'active') {
      result = result.filter((item) => item.active && item.stock > 0);
    } else if (statusFilter === 'out_of_stock') {
      result = result.filter((item) => !item.active || item.stock === 0);
    }

    // Búsqueda por texto (nombre, detalle, descripción)
    if (searchQuery.trim()) {
      const q = searchQuery
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      result = result.filter((item) => {
        const nameMatch = item.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .includes(q);
        const detailMatch = item.detail
          ?.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .includes(q);
        const descMatch = item.description
          ?.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .includes(q);
        return nameMatch || detailMatch || descMatch;
      });
    }

    return result;
  }, [items, selectedCategory, statusFilter, searchQuery]);

  // Paginación
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

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


  const liveCount = items.filter((item) => item.active && item.stock > 0).length;
  const outOfStock = items.length - liveCount;

  return (
    <div className="min-h-full w-full bg-ivory font-sans">
      <AdminHeader
        userEmail={user?.email}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

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
                  Tu base de datos está lista
                </h2>
                <p className="text-xs text-amber-800/80 mt-0.5">
                  Podés importar todos tus productos desde el archivo exportado de TiendaNube (.csv) o arrastrar fotos arriba.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="shrink-0 rounded-xl bg-amber-700 px-4 py-2 text-xs font-medium text-white shadow hover:bg-amber-800 transition-colors cursor-pointer"
            >
              Importar productos (.csv)
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

        {/* Barra de Búsqueda y Filtros */}
        <div className="mt-6 rounded-2xl border border-line bg-white p-4 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, detalle o descripción..."
                className="w-full pl-10 pr-10 py-2 text-sm bg-sand/40 border border-line rounded-xl text-ink placeholder:text-muted focus:outline-none focus:border-ink/40 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Selector de Categoría */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted font-medium shrink-0">Categoría:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-sand/40 border border-line rounded-xl px-3 py-2 text-ink font-medium focus:outline-none focus:border-ink/40 cursor-pointer"
              >
                <option value="Todas">Todas ({items.length})</option>
                {CATEGORIES.map((cat) => {
                  const count = items.filter((i) => i.category === cat).length;
                  return (
                    <option key={cat} value={cat}>
                      {cat} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selector de Estado */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted font-medium shrink-0">Estado:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs bg-sand/40 border border-line rounded-xl px-3 py-2 text-ink font-medium focus:outline-none focus:border-ink/40 cursor-pointer"
              >
                <option value="all">Todos ({items.length})</option>
                <option value="active">Activos / En stock ({liveCount})</option>
                <option value="out_of_stock">Sin stock ({outOfStock})</option>
              </select>
            </div>
          </div>

          {/* Resumen de filtros activos si se ha aplicado alguno */}
          {(searchQuery || selectedCategory !== 'Todas' || statusFilter !== 'all') && (
            <div className="flex items-center justify-between pt-2 border-t border-line/40 text-xs text-muted">
              <span>
                Mostrando <strong className="text-ink font-semibold">{filteredItems.length}</strong> de {items.length} productos
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Todas');
                  setStatusFilter('all');
                }}
                className="text-amber-700 hover:text-amber-800 font-medium underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        <div className="mt-5">
          {inventoryLoading ? (
            <div className="rounded-2xl border border-line bg-white p-12 text-center text-muted">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-600 mb-2" />
              <p className="text-xs">Cargando inventario desde la base de datos...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-12 text-center">
              <p className="font-serif text-lg text-ink">No se encontraron productos</p>
              <p className="text-xs text-muted mt-1">Prueba con otros términos de búsqueda o quitando los filtros aplicados.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Todas');
                  setStatusFilter('all');
                }}
                className="mt-4 rounded-full bg-ink px-4 py-2 text-xs font-medium text-ivory hover:bg-ink/80 transition-colors cursor-pointer"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <>
              <InventoryTable
                items={paginatedItems}
                savedId={savedId}
                onName={setName}
                onPrice={setPrice}
                onStock={setStock}
                onCategory={setCategory}
                onToggle={toggleActive}
                onRemove={remove}
              />

              {/* Controles de paginación si hay más de 50 productos */}
              {totalPages > 1 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted px-2">
                  <div>
                    Mostrando <strong>{(currentPage - 1) * pageSize + 1}</strong> –{' '}
                    <strong>{Math.min(currentPage * pageSize, filteredItems.length)}</strong> de{' '}
                    <strong>{filteredItems.length}</strong> productos
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-sand/60 disabled:opacity-40 disabled:pointer-events-none font-medium text-ink transition-colors cursor-pointer"
                    >
                      Anterior
                    </button>
                    <span className="font-medium text-ink px-2">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-sand/60 disabled:opacity-40 disabled:pointer-events-none font-medium text-ink transition-colors cursor-pointer"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
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
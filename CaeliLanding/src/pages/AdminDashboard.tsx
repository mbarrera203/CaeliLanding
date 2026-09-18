import { useState, useEffect, useMemo } from 'react';
import { AdminHeader } from '../components/admin/AdminHeader';
import { UploadZone } from '../components/admin/UploadZone';
import { InventoryTable } from '../components/admin/InventoryTable';
import { AdminLogin } from '../components/admin/AdminLogin';
import { CategoryManagerModal } from '../components/admin/CategoryManagerModal';
import { TiendaNubeImportModal } from '../components/admin/TiendaNubeImportModal';
import { AddProductModal } from '../components/admin/AddProductModal';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../hooks/useAuth';
import { Material } from '../types/product';
import { getProductClassification, normalizeSubcategory } from '../utils/productClassification';
import { useCategories } from '../hooks/useCategories';
import { Loader2, CloudUpload, Database, FileSpreadsheet, Search, X, SlidersHorizontal, PackagePlus, FolderTree } from 'lucide-react';

export function AdminDashboard() {
  const { categories, subcategories } = useCategories();
  const { user, loading: authLoading, isAuthenticated, signIn, signOut } = useAuth();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedMaterial, setSelectedMaterial] = useState<'Todos' | Material>('Todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState<'Todos' | string>('Todos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'out_of_stock'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
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

    setClassification,
    setDescription,
    setSale,
    toggleActive,
    remove,
    addFiles,
    addProduct,
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

  // Subcategorías disponibles según el material seleccionado
  const availableSubcategories = useMemo(() => {
    if (selectedMaterial === 'Todos') {
      const set = new Set<string>();
      subcategories.forEach((s) => set.add(s.name));
      return Array.from(set);
    }
    const cat = categories.find(c => c.name === selectedMaterial);
    return cat ? subcategories.filter(s => s.category_id === cat.id).map(s => s.name) : [];
  }, [selectedMaterial, categories, subcategories]);

  // Resetear página al filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMaterial, selectedSubcategory, statusFilter]);

  // Filtrado de productos
  const filteredItems = useMemo(() => {
    let result = items;



    if (selectedMaterial !== 'Todos') {
      const normTargetMat = selectedMaterial.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      result = result.filter((item) => {
        const { material } = getProductClassification(item);
        const normItemMat = material.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normItemMat === normTargetMat;
      });
    }

    if (selectedSubcategory !== 'Todos') {
      result = result.filter((item) => {
        const { subcategory } = getProductClassification(item);
        return normalizeSubcategory(subcategory) === normalizeSubcategory(selectedSubcategory);
      });
    }

    if (statusFilter === 'active') {
      result = result.filter((item) => item.active && item.stock > 0);
    } else if (statusFilter === 'out_of_stock') {
      result = result.filter((item) => !item.active || item.stock === 0);
    }

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
  }, [items, selectedMaterial, selectedSubcategory, statusFilter, searchQuery]);

  // Paginación
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const hasActiveFilters =
    searchQuery ||
    selectedMaterial !== 'Todos' ||
    selectedSubcategory !== 'Todos' ||

    statusFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');

    setSelectedMaterial('Todos');
    setSelectedSubcategory('Todos');
    setStatusFilter('all');
  };

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
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-xs text-white shadow-xl animate-fade-in max-w-[calc(100vw-2rem)]">
          <CloudUpload className="h-4 w-4 animate-bounce text-amber-400 shrink-0" />
          <span>Sincronizando fotos y cambios con la nube...</span>
        </div>
      )}

      <main className="mx-auto max-w-[1180px] px-4 sm:px-8 pb-24 pt-4 sm:pt-6">

        {/* Aviso base de datos vacía */}
        {isEmptyDb && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-amber-900">
                  Tu base de datos está lista
                </h2>
                <p className="text-xs text-amber-800/80 mt-0.5">
                  Podés importar productos desde TiendaNube (.csv) o agregar uno nuevo.
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

        {/* Upload Zone — solo visible en desktop como zona secundaria */}
        <div className="hidden md:block">
          <UploadZone onFiles={addFiles} />
        </div>

        {/* Upload Zone — collapsable en mobile */}
        <details className="md:hidden group">
          <summary className="flex items-center justify-between cursor-pointer rounded-xl border border-dashed border-line bg-sand/30 px-4 py-3 text-sm font-medium text-muted hover:text-ink list-none">
            <span className="flex items-center gap-2">
              <PackagePlus className="h-4 w-4" />
              Subir fotos (drag &amp; drop)
            </span>
            <span className="text-xs text-muted group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div className="mt-2">
            <UploadZone onFiles={addFiles} />
          </div>
        </details>

        {/* Título + acciones */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-ink">
              Tus productos
            </h1>
            <p className="mt-1 text-[12px] sm:text-[13px] text-muted">
              Tocá cualquier precio o cantidad para editarlo — los cambios se guardan solos.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Botón principal: Agregar producto */}
            <button
              onClick={() => setIsAddProductModalOpen(true)}
              className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full bg-amber-700 px-5 py-2.5 sm:py-2 text-[13px] font-medium text-white shadow-sm hover:bg-amber-800 transition-colors cursor-pointer active:scale-98"
            >
              <PackagePlus className="h-4 w-4" />
              <span>Agregar producto</span>
            </button>

            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full border border-amber-300 bg-amber-50/90 px-5 py-2.5 sm:py-2 text-[13px] font-medium text-amber-900 shadow-sm hover:bg-amber-100 hover:border-amber-400 transition-all cursor-pointer active:scale-98"
            >
              <FolderTree className="h-4 w-4 text-amber-700" />
              <span>Categorías</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full border border-amber-300 bg-amber-50/90 px-5 py-2.5 sm:py-2 text-[13px] font-medium text-amber-900 shadow-sm hover:bg-amber-100 hover:border-amber-400 transition-all cursor-pointer active:scale-98"
            >
              <FileSpreadsheet className="h-4 w-4 text-amber-700" />
              <span className="hidden sm:inline">Importar desde TiendaNube (.csv)</span>
              <span className="sm:hidden">Importar CSV</span>
            </button>

            <p className="shrink-0 text-center sm:text-left text-[12px] sm:text-[13px] tabular-nums text-muted pt-1 sm:pt-0">
              <span className="text-ink font-medium">{liveCount} activos</span> ·{' '}
              {outOfStock} sin stock
            </p>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="mt-4 sm:mt-6 rounded-2xl border border-line bg-white p-3 sm:p-4 shadow-sm space-y-3">

          {/* Fila superior: buscador + botón filtros (mobile) */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, detalle..."
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

            {/* Botón filtros en mobile */}
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={[
                'md:hidden inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors shrink-0',
                showFilters || hasActiveFilters
                  ? 'border-amber-400 bg-amber-50 text-amber-900'
                  : 'border-line bg-sand/40 text-muted hover:text-ink',
              ].join(' ')}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  !
                </span>
              )}
            </button>
          </div>

          {/* Selectores — siempre visibles en desktop, togglables en mobile */}
          <div className={['flex flex-wrap items-center gap-2.5', showFilters ? 'flex' : 'hidden md:flex'].join(' ')}>
            {/* Material */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted font-medium shrink-0">Material:</label>
              <select
                value={selectedMaterial}
                onChange={(e) => {
                  setSelectedMaterial(e.target.value as any);
                  setSelectedSubcategory('Todos');
                }}
                className="text-xs bg-sand/40 border border-line rounded-xl px-3 py-2 text-ink font-medium focus:outline-none focus:border-ink/40 cursor-pointer"
              >
                <option value="Todos">Todos los materiales</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted font-medium shrink-0">Tipo:</label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="text-xs bg-sand/40 border border-line rounded-xl px-3 py-2 text-ink font-medium focus:outline-none focus:border-ink/40 cursor-pointer"
              >
                <option value="Todos">Todos los tipos</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted font-medium shrink-0">Estado:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs bg-sand/40 border border-line rounded-xl px-3 py-2 text-ink font-medium focus:outline-none focus:border-ink/40 cursor-pointer"
              >
                <option value="all">Todos</option>
                <option value="active">Solo activos</option>
                <option value="out_of_stock">Solo sin stock</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-amber-700 hover:text-amber-800 font-medium underline cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Resumen de resultados — siempre visible */}
          <div className="flex items-center justify-between pt-2 border-t border-line/40 text-xs text-muted">
            <div className="flex items-center gap-2 flex-wrap">
              {hasActiveFilters ? (
                <>
                  <span>
                    Mostrando <strong className="text-ink font-semibold">{filteredItems.length}</strong> de {items.length} productos
                  </span>
                  {selectedMaterial !== 'Todos' && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full text-[11px] font-medium">
                      {selectedMaterial}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMaterial('Todos');
                          setSelectedSubcategory('Todos');
                        }}
                        className="hover:text-amber-700 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedSubcategory !== 'Todos' && (
                    <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 border border-stone-200 px-2 py-0.5 rounded-full text-[11px] font-medium">
                      {selectedSubcategory}
                      <button
                        type="button"
                        onClick={() => setSelectedSubcategory('Todos')}
                        className="hover:text-stone-600 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 border border-stone-200 px-2 py-0.5 rounded-full text-[11px] font-medium">
                      {statusFilter === 'active' ? 'Solo activos' : 'Solo sin stock'}
                      <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        className="hover:text-stone-600 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </>
              ) : (
                <span>
                  <strong className="text-ink font-semibold">{items.length}</strong> productos en total · <span className="text-ink font-medium">{liveCount} activos</span> · {outOfStock} sin stock
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="hidden sm:block text-amber-700 hover:text-amber-800 font-medium underline cursor-pointer shrink-0"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Tabla / Cards de inventario */}
        <div className="mt-4 sm:mt-5">
          {inventoryLoading ? (
            <div className="rounded-2xl border border-line bg-white p-12 text-center text-muted">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-600 mb-2" />
              <p className="text-xs">Cargando inventario desde la base de datos...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-12 text-center">
              <p className="font-serif text-lg text-ink">No se encontraron productos</p>
              <p className="text-xs text-muted mt-1">Probá con otros términos o quitá los filtros.</p>
              <button
                type="button"
                onClick={clearFilters}
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

                onClassification={setClassification}
                onSale={setSale}
                onToggle={toggleActive}
                onRemove={remove}
              />

              {/* Paginación */}
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

      {/* Modal de gestión de categorías */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Modal de agregar producto */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSubmit={addProduct}
      />
    </div>
  );
}

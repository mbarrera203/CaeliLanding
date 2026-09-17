import { useState, useEffect, useRef } from 'react';
import { X, Plus, Check, Trash2, FolderTree, ChevronRight, AlertTriangle } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';


/* ─── Inline editable name ─── */
function EditableName({
  value,
  onSave,
}: {
  value: string;
  onSave: (newName: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) {
      setDraft(value);
      setEditing(false);
      return;
    }
    try {
      await onSave(trimmed);
      setEditing(false);
    } catch {
      alert('Error al guardar el nombre');
    }
  };

  if (!editing) {
    return (
      <span
        className="text-sm font-medium text-ink cursor-pointer hover:text-amber-800 transition-colors"
        onDoubleClick={() => setEditing(true)}
      >
        {value}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-1">
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        className="flex-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-sm text-ink outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
        autoFocus
      />
      <button
        type="button"
        onClick={commit}
        className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors shrink-0"
      >
        <Check className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={() => { setDraft(value); setEditing(false); }}
        className="flex h-6 w-6 items-center justify-center rounded-md border border-line text-muted hover:bg-sand transition-colors shrink-0"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

/* ─── Confirm Delete Popover ─── */
function ConfirmDelete({ label, onConfirm, onCancel }: { label: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-xl border border-rose-200 bg-white p-3 shadow-xl animate-fade-in">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-ink leading-snug">¿Eliminar {label}?</p>
          <p className="text-[11px] text-muted mt-1">Los productos existentes mantendrán su clasificación actual como texto.</p>
          <div className="flex items-center gap-2 mt-2.5">
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-lg bg-rose-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-rose-700 transition-colors"
            >
              Eliminar
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-line px-3 py-1 text-[11px] font-medium text-muted hover:text-ink hover:border-ink/30 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Modal ─── */
export function CategoryManagerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    categories,
    subcategories,
    addCategory,
    addSubcategory,
    updateCategory,
    updateSubcategory,
    deleteCategory,
    deleteSubcategory,
  } = useCategories();

  const [newCatName, setNewCatName] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'cat' | 'sub'; id: string } | null>(null);
  const newCatRef = useRef<HTMLInputElement>(null);
  const newSubRef = useRef<HTMLInputElement>(null);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const selectedCategory = categories.find((c) => c.id === selectedCatId);
  const selectedSubs = subcategories.filter((s) => s.category_id === selectedCatId);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await addCategory(newCatName.trim());
      setNewCatName('');
      newCatRef.current?.focus();
    } catch {
      alert('Error al agregar categoría');
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubName.trim() || !selectedCatId) return;
    try {
      await addSubcategory(selectedCatId, newSubName.trim());
      setNewSubName('');
      newSubRef.current?.focus();
    } catch {
      alert('Error al agregar subcategoría');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'cat') {
        await deleteCategory(deleteTarget.id);
        if (selectedCatId === deleteTarget.id) setSelectedCatId(null);
      } else {
        await deleteSubcategory(deleteTarget.id);
      }
    } catch {
      alert('Error al eliminar');
    }
    setDeleteTarget(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full sm:max-w-3xl bg-ivory rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[95dvh] sm:max-h-[85vh]">

        {/* Drag handle en mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-stone-300" />
        </div>

        {/* Header — same pattern as AddProductModal */}
        <div className="flex items-center justify-between px-5 pt-3 sm:pt-5 pb-4 border-b border-line shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <FolderTree className="h-4 w-4" />
            </div>
            <div>
              <h2 id="category-modal-title" className="font-serif text-lg font-medium text-ink">
                Administrar Categorías
              </h2>
              <p className="text-[11px] text-muted mt-0.5">Doble clic en un nombre para editarlo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-sand hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">

          {/* ─── Left column: Categories ─── */}
          <div className="w-full md:w-[45%] flex flex-col border-b md:border-b-0 md:border-r border-line/60">

            {/* Add new category */}
            <div className="px-4 pt-4 pb-3 shrink-0">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Categorías principales
              </label>
              <div className="flex gap-2">
                <input
                  ref={newCatRef}
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
                  placeholder="Nueva categoría..."
                  className="flex-1 rounded-xl border border-line bg-white px-4 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={!newCatName.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-700 text-white shadow-sm disabled:opacity-40 hover:bg-amber-800 transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Category list */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
              {categories.length === 0 && (
                <p className="text-center text-xs text-muted py-8">No hay categorías aún. ¡Creá la primera!</p>
              )}
              {categories.map((cat) => {
                const subCount = subcategories.filter((s) => s.category_id === cat.id).length;
                const isSelected = selectedCatId === cat.id;
                return (
                  <div
                    key={cat.id}
                    className={[
                      'relative flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer group',
                      isSelected
                        ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                        : 'bg-white border-transparent hover:border-line hover:shadow-xs',
                    ].join(' ')}
                    onClick={() => setSelectedCatId(cat.id)}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className={[
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold transition-colors',
                        isSelected ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-500',
                      ].join(' ')}>
                        {cat.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <EditableName
                          value={cat.name}
                          onSave={(name) => updateCategory(cat.id, name)}
                        />
                        <p className="text-[11px] text-muted mt-0.5">{subCount} subcategoría{subCount !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'cat', id: cat.id }); }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      {isSelected && (
                        <ChevronRight className="h-4 w-4 text-amber-600 hidden md:block" />
                      )}
                    </div>

                    {deleteTarget?.type === 'cat' && deleteTarget.id === cat.id && (
                      <ConfirmDelete
                        label={`"${cat.name}" y sus subcategorías`}
                        onConfirm={confirmDelete}
                        onCancel={() => setDeleteTarget(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Right column: Subcategories ─── */}
          <div className="w-full md:w-[55%] flex flex-col bg-sand/20">
            {selectedCategory ? (
              <>
                {/* Add new subcategory */}
                <div className="px-4 pt-4 pb-3 shrink-0">
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                    Subcategorías de <span className="text-amber-800">{selectedCategory.name}</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      ref={newSubRef}
                      type="text"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubcategory(); }}
                      placeholder="Nueva subcategoría..."
                      className="flex-1 rounded-xl border border-line bg-white px-4 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubcategory}
                      disabled={!newSubName.trim()}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-700 text-white shadow-sm disabled:opacity-40 hover:bg-amber-800 transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategory list */}
                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                  {selectedSubs.length === 0 && (
                    <p className="text-center text-xs text-muted py-8">
                      Esta categoría no tiene subcategorías. ¡Agregá una!
                    </p>
                  )}
                  {selectedSubs.map((sub, idx) => (
                    <div
                      key={sub.id}
                      className="relative flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-line/60 bg-white hover:border-line hover:shadow-xs transition-all group"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-100 text-[10px] font-bold text-stone-400 tabular-nums">
                          {idx + 1}
                        </span>
                        <EditableName
                          value={sub.name}
                          onSave={(name) => updateSubcategory(sub.id, name)}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ type: 'sub', id: sub.id })}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 transition-all shrink-0"
                        title="Eliminar subcategoría"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {deleteTarget?.type === 'sub' && deleteTarget.id === sub.id && (
                        <ConfirmDelete
                          label={`"${sub.name}"`}
                          onConfirm={confirmDelete}
                          onCancel={() => setDeleteTarget(null)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
                  <ChevronRight className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">Seleccioná una categoría</p>
                  <p className="text-xs text-muted mt-1">para ver y editar sus subcategorías</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

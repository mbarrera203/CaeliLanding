import React, { useRef, useState, useCallback, useEffect } from 'react';
import { X, ImagePlusIcon, PlusIcon, XIcon, Loader2, PackagePlus, Tag } from 'lucide-react';
import { MATERIALS, Material, TIENDANUBE_TREE } from '../../types/product';
import { calculateDiscountPrice, calculateDiscountPercentage } from '../../utils/saleUtils';

export interface NewProductData {
  name: string;
  description: string;
  price: number;
  stock: number;

  material: Material | '';
  subcategory: string;
  active: boolean;
  files: File[];
  onSale?: boolean;
  originalPrice?: number;
  discountPercentage?: number;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewProductData) => Promise<void>;
}

const EMPTY_FORM: NewProductData = {
  name: '',
  description: '',
  price: 0,
  stock: 1,

  material: '',
  subcategory: '',
  active: true,
  files: [],
};

export function AddProductModal({ isOpen, onClose, onSubmit }: AddProductModalProps) {
  const [form, setForm] = useState<NewProductData>(EMPTY_FORM);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof NewProductData, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableSubs: string[] =
    form.material && TIENDANUBE_TREE[form.material as Material]
      ? TIENDANUBE_TREE[form.material as Material]
      : [];

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const resetForm = useCallback(() => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    setForm(EMPTY_FORM);
    setPreviews([]);
    setErrors({});
    setIsSubmitting(false);
  }, [previews]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const addFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (!imageFiles.length) return;
    const newPreviews = imageFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
    setForm((prev) => ({ ...prev, files: [...prev.files, ...imageFiles] }));
  }, []);

  const removeFile = useCallback(
    (index: number) => {
      URL.revokeObjectURL(previews[index]);
      setPreviews((prev) => prev.filter((_, i) => i !== index));
      setForm((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
    },
    [previews]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles]
  );

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof NewProductData, string>> = {};
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (form.price < 0) newErrors.price = 'El precio no puede ser negativo';
    if (form.stock < 0) newErrors.stock = 'El stock no puede ser negativo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(form);
      resetForm();
      onClose();
    } catch (err) {
      console.error('Error al crear producto:', err);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-product-modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full sm:max-w-2xl bg-ivory rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[95dvh] sm:max-h-[90vh]">

        {/* Drag handle en mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-stone-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 sm:pt-5 pb-4 border-b border-line shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <PackagePlus className="h-4 w-4" />
            </div>
            <h2 id="add-product-modal-title" className="font-serif text-lg font-medium text-ink">
              Agregar producto
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-sand hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body scrolleable */}
        <form
          id="add-product-form"
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 px-5 py-5 space-y-5"
        >
          {/* Fotos */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Fotos del producto
            </label>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={[
                'rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors cursor-pointer',
                isDragging
                  ? 'border-amber-400 bg-amber-50/50'
                  : 'border-line bg-sand/30 hover:border-amber-300 hover:bg-amber-50/20',
              ].join(' ')}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlusIcon className="mx-auto h-7 w-7 text-muted mb-2" />
              <p className="text-sm font-medium text-ink">Arrastrá o tocá para subir fotos</p>
              <p className="text-xs text-muted mt-1">JPG, PNG · Máx 10 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(Array.from(e.target.files ?? []));
                  e.target.value = '';
                }}
              />
            </div>

            {previews.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {previews.map((url, i) => (
                  <div key={i} className="relative group h-16 w-16 shrink-0">
                    <img
                      src={url}
                      alt=""
                      className="h-16 w-16 rounded-lg object-cover border border-line"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar foto"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border border-dashed border-line text-muted hover:border-amber-400 hover:bg-amber-50/30 hover:text-amber-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="add-product-name" className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
              Nombre <span className="text-rose-400">*</span>
            </label>
            <input
              id="add-product-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ej. Pulsera piedritas de colores"
              className={[
                'w-full rounded-xl border px-4 py-2.5 text-sm text-ink bg-white placeholder:text-muted focus:outline-none focus:border-amber-400 transition-colors',
                errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-line',
              ].join(' ')}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="add-product-description" className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
              Descripción
            </label>
            <textarea
              id="add-product-description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Material, medidas, detalles..."
              rows={3}
              className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink bg-white placeholder:text-muted focus:outline-none focus:border-amber-400 transition-colors resize-none"
            />
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-product-price" className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                {form.onSale ? 'Precio Final con Descuento' : 'Precio (ARS)'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted pointer-events-none">$</span>
                <input
                  id="add-product-price"
                  type="number"
                  min="0"
                  step="1"
                  value={form.price === 0 ? '' : form.price}
                  onChange={(e) => {
                    const newPrice = Number(e.target.value) || 0;
                    if (form.onSale && form.originalPrice && form.originalPrice > 0) {
                      const discount = calculateDiscountPercentage(form.originalPrice, newPrice);
                      setForm((p) => ({ ...p, price: newPrice, discountPercentage: discount }));
                    } else {
                      setForm((p) => ({ ...p, price: newPrice }));
                    }
                  }}
                  placeholder="0"
                  className={[
                    'w-full rounded-xl border pl-8 pr-4 py-2.5 text-sm text-ink bg-white placeholder:text-muted focus:outline-none focus:border-amber-400 transition-colors',
                    errors.price ? 'border-rose-400' : 'border-line',
                  ].join(' ')}
                />
              </div>
              {errors.price && <p className="mt-1 text-xs text-rose-500">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="add-product-stock" className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                Stock
              </label>
              <input
                id="add-product-stock"
                type="number"
                min="0"
                step="1"
                value={form.stock === 0 ? '' : form.stock}
                onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) || 0 }))}
                placeholder="1"
                className={[
                  'w-full rounded-xl border px-4 py-2.5 text-sm text-ink bg-white placeholder:text-muted focus:outline-none focus:border-amber-400 transition-colors',
                  errors.stock ? 'border-rose-400' : 'border-line',
                ].join(' ')}
              />
              {errors.stock && <p className="mt-1 text-xs text-rose-500">{errors.stock}</p>}
            </div>
          </div>

          {/* Sección de Producto en Oferta */}
          <div className="rounded-xl border border-line/70 bg-stone-50/70 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className={`h-4 w-4 ${form.onSale ? 'text-rose-600' : 'text-stone-400'}`} />
                <div>
                  <p className="text-xs font-semibold text-ink">¿Poner en oferta?</p>
                  <p className="text-[11px] text-muted">Aparecerá en el catálogo con badge de descuento y precio tachado</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(form.onSale)}
                onClick={() => {
                  const willBeSale = !form.onSale;
                  if (willBeSale) {
                    const orig = form.price > 0 ? form.price : 1000;
                    const discount = 20;
                    const salePrice = calculateDiscountPrice(orig, discount);
                    setForm((p) => ({
                      ...p,
                      onSale: true,
                      originalPrice: orig,
                      discountPercentage: discount,
                      price: salePrice,
                    }));
                  } else {
                    setForm((p) => ({
                      ...p,
                      onSale: false,
                      price: p.originalPrice || p.price,
                      originalPrice: undefined,
                      discountPercentage: undefined,
                    }));
                  }
                }}
                className={[
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none',
                  form.onSale ? 'bg-rose-600' : 'bg-stone-300',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ml-0.5',
                    form.onSale ? 'translate-x-4' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
            </div>

            {form.onSale && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-3 space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">
                      Precio de Lista (Original)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted pointer-events-none">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.originalPrice || ''}
                        onChange={(e) => {
                          const newOrig = Number(e.target.value) || 0;
                          const discount = form.discountPercentage || 20;
                          const newSale = calculateDiscountPrice(newOrig, discount);
                          setForm((p) => ({
                            ...p,
                            originalPrice: newOrig,
                            price: newSale,
                          }));
                        }}
                        placeholder="Ej: 5000"
                        className="w-full rounded-lg border border-line pl-6 pr-2.5 py-1.5 text-xs text-ink bg-white focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-rose-800 mb-1">
                      Descuento (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={form.discountPercentage || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setForm((p) => ({
                              ...p,
                              discountPercentage: undefined,
                            }));
                            return;
                          }
                          const pct = Math.max(1, Math.min(99, Number(val) || 0));
                          const orig = form.originalPrice || form.price;
                          const newSale = calculateDiscountPrice(orig, pct);
                          setForm((p) => ({
                            ...p,
                            discountPercentage: pct,
                            price: newSale,
                          }));
                        }}
                        placeholder="20"
                        className="w-full rounded-lg border border-rose-300 pr-6 pl-2.5 py-1.5 text-xs font-bold text-rose-900 bg-white focus:outline-none focus:border-rose-500"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-700 pointer-events-none">%</span>
                    </div>
                  </div>
                </div>

                {/* Accesos rápidos a porcentajes de descuento */}
                <div className="flex items-center justify-between gap-1 flex-wrap pt-0.5">
                  <span className="text-[10px] font-semibold text-rose-800">Accesos rápidos:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          const orig = form.originalPrice || form.price;
                          const newSale = calculateDiscountPrice(orig, pct);
                          setForm((p) => ({
                            ...p,
                            discountPercentage: pct,
                            price: newSale,
                          }));
                        }}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors cursor-pointer ${
                          form.discountPercentage === pct
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-rose-700 font-medium pt-1 border-t border-rose-200/80 flex items-center justify-between">
                  <span>Precio regular: <del className="text-stone-400 font-normal">${(form.originalPrice || 0).toLocaleString('es-AR')}</del></span>
                  <span className="font-bold text-rose-800">Precio final: ${form.price.toLocaleString('es-AR')}</span>
                </div>
              </div>
            )}
          </div>



          {/* Material + Subcategoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-product-material" className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                Material
              </label>
              <select
                id="add-product-material"
                value={form.material}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    material: e.target.value as Material | '',
                    subcategory: '',
                  }))
                }
                className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
              >
                <option value="">Sin especificar</option>
                {MATERIALS.map((mat) => (
                  <option key={mat} value={mat}>{mat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="add-product-subcategory" className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                Tipo / Subcategoría
              </label>
              <select
                id="add-product-subcategory"
                value={form.subcategory}
                onChange={(e) => setForm((p) => ({ ...p, subcategory: e.target.value }))}
                disabled={availableSubs.length === 0}
                className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">Sin especificar</option>
                {availableSubs.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Publicar en la tienda</p>
              <p className="text-xs text-muted mt-0.5">Si está activo y tiene stock aparece en el catálogo</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.active}
              onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
              className={[
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none',
                form.active ? 'bg-amber-500' : 'bg-stone-200',
              ].join(' ')}
            >
              <span
                className={[
                  'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5',
                  form.active ? 'translate-x-5' : 'translate-x-0.5',
                ].join(' ')}
              />
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-line shrink-0 bg-ivory rounded-b-3xl sm:rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-muted hover:text-ink hover:border-ink/30 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="add-product-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <PackagePlus className="h-4 w-4" />
                Agregar producto
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

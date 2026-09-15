import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, Trash2Icon, PlusIcon, XIcon, Tag } from 'lucide-react';
import { InlineField } from './InlineField';
import { StatusToggle } from './StatusToggle';
import { Material, MATERIALS, TIENDANUBE_TREE, Product } from '../../types/product';
import { getProductClassification } from '../../utils/productClassification';
import { calculateDiscountPrice, calculateDiscountPercentage } from '../../utils/saleUtils';

interface InventoryTableProps {
  items: Product[];
  savedId: string | null;
  onName: (id: string, value: string) => void;
  onPrice: (id: string, value: number) => void;
  onStock: (id: string, value: number) => void;

  onClassification?: (id: string, material: Material, subcategory: string) => void;
  onSale?: (id: string, onSale: boolean, originalPrice?: number, discountPercentage?: number, finalPrice?: number) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function InventoryTable({
  items,
  savedId,
  onName,
  onPrice,
  onStock,

  onClassification,
  onSale,
  onToggle,
  onRemove,
}: InventoryTableProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const event = new CustomEvent('add-product-images', { detail: { id, files } });
    document.dispatchEvent(event);
    e.target.value = '';
  };

  const handleRemoveImage = (id: string, index: number) => {
    const event = new CustomEvent('remove-product-image', { detail: { id, index } });
    document.dispatchEvent(event);
  };

  const handleDescription = (id: string, value: string) => {
    const event = new CustomEvent('update-product-desc', { detail: { id, value } });
    document.dispatchEvent(event);
  };

  if (items.length === 0) {
    return (
      <p className="px-5 py-16 text-center text-[14px] text-muted rounded-2xl border border-line bg-white">
        Sin productos aún. Usá el botón "Agregar producto" para crear el primero.
      </p>
    );
  }

  return (
    <>
      {/* ── VISTA MOBILE: Cards apiladas y alargadas con espaciado generoso ── */}
      <div className="md:hidden space-y-4">
        {items.map((item) => {
          const classification = getProductClassification(item);
          const isSaved = savedId === item.id;
          const currentMaterial = (classification.material as Material) || 'Plata';
          const availableSubcategories = TIENDANUBE_TREE[currentMaterial] || [];

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-line/80 bg-white p-5 shadow-sm flex flex-col gap-4"
            >
              {/* 1. Cabecera: Imagen + Nombre + Draft */}
              <div className="flex items-start gap-3.5">
                <img
                  src={item.images?.[0] ?? '/LogoCaeli-removebg-preview.png'}
                  alt={item.name}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover border border-line shadow-2xs"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <InlineField
                      value={item.name}
                      label={`Nombre de ${item.name}`}
                      onCommit={(value) => onName(item.id, value)}
                      width="w-full"
                    />
                    {item.isDraft && (
                      <span className="shrink-0 rounded-full bg-gold-pale px-2 py-0.5 text-[11px] font-medium text-gold-dark">
                        Nuevo
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 text-[11px] text-muted font-mono truncate">
                    #{item.id}
                  </p>
                </div>
              </div>

              {/* 2. Sección de Tipo / Material, Subcategoría y Categoría */}
              <div className="rounded-xl border border-line/60 bg-sand/30 p-3.5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Clasificación y Tipo
                  </span>
                  <span className="text-[11px] font-medium text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200">
                    {classification.material}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Selector de Material / Tipo */}
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 mb-1">
                      Tipo (Material)
                    </label>
                    <select
                      value={currentMaterial}
                      onChange={(e) => {
                        const newMat = e.target.value as Material;
                        const newSubs = TIENDANUBE_TREE[newMat] || [];
                        const newSub = newSubs.includes(classification.subcategory)
                          ? classification.subcategory
                          : (newSubs[0] || 'Accesorios');
                        onClassification?.(item.id, newMat, newSub);
                      }}
                      aria-label={`Tipo de material de ${item.name}`}
                      className="w-full rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-amber-900 outline-none hover:border-amber-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors cursor-pointer"
                    >
                      {MATERIALS.map((mat) => (
                        <option key={mat} value={mat}>{mat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Selector de Subcategoría */}
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 mb-1">
                      Subcategoría
                    </label>
                    <select
                      value={classification.subcategory}
                      onChange={(e) => {
                        onClassification?.(item.id, currentMaterial, e.target.value);
                      }}
                      aria-label={`Subcategoría de ${item.name}`}
                      className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-800 outline-none hover:border-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors cursor-pointer"
                    >
                      {(availableSubcategories.length > 0 ? availableSubcategories : [classification.subcategory]).map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>


                </div>
              </div>

              {/* 3. Descripción */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">
                  Descripción
                </label>
                <div className="rounded-xl border border-line/70 bg-stone-50/50 p-1.5 transition-colors focus-within:border-amber-400 focus-within:bg-white hover:bg-white">
                  <InlineField
                    value={item.description || ''}
                    label={`Descripción de ${item.name}`}
                    onCommit={(value) => handleDescription(item.id, value)}
                    width="w-full"
                    isTextArea
                  />
                </div>
              </div>

              {/* 4. Fotos del producto */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Fotos ({item.images?.length || 0})
                  </label>
                  <span className="text-[10px] text-muted">Tocá + para agregar fotos</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {item.images?.map((imgUrl, idx) => (
                    <div key={idx} className="relative group/img h-14 w-14 shrink-0">
                      <img
                        src={imgUrl}
                        alt=""
                        className="h-14 w-14 rounded-xl object-cover border border-line"
                      />
                      {item.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(item.id, idx)}
                          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-sm transition-colors cursor-pointer"
                          title="Eliminar foto"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  <label className="flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-200 text-muted hover:border-amber-400 hover:bg-amber-50/40 hover:text-amber-700 transition-colors">
                    <PlusIcon className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileChange(e, item.id)}
                    />
                  </label>
                </div>
              </div>

              {/* 5. Precios, Oferta, Stock y Estado */}
              <div className="rounded-xl border border-line/70 bg-stone-50/70 p-3.5 flex flex-col gap-3">
                {/* 5a. Precio y Oferta */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      Precio de Venta
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (item.onSale) {
                          // Quitar oferta
                          onSale?.(item.id, false, item.originalPrice || item.price, 0, item.originalPrice || item.price);
                        } else {
                          // Activar oferta con 20% de descuento sugerido
                          const orig = item.originalPrice && item.originalPrice > item.price ? item.originalPrice : (item.price > 0 ? item.price : 1000);
                          const discount = 20;
                          const sale = calculateDiscountPrice(orig, discount);
                          onSale?.(item.id, true, orig, discount, sale);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                        item.onSale
                          ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs'
                          : 'bg-white text-stone-600 border border-line hover:border-amber-400 hover:text-amber-800'
                      }`}
                    >
                      <Tag className="h-3 w-3" />
                      <span>{item.onSale ? '🔥 En Oferta' : '+ Poner en oferta'}</span>
                    </button>
                  </div>

                  {item.onSale ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 flex flex-col gap-2.5">
                      <div className="grid grid-cols-2 gap-2.5 items-end">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 mb-1">
                            Precio Lista (Original)
                          </label>
                          <div className="rounded-lg bg-white border border-stone-200/90 shadow-2xs">
                            <InlineField
                              value={item.originalPrice || item.price}
                              label={`Precio original de ${item.name}`}
                              prefix="$"
                              type="number"
                              onCommit={(val) => {
                                const newOrig = Math.max(0, Number(val) || 0);
                                const discount = item.discountPercentage !== undefined ? item.discountPercentage : 20;
                                const newSale = calculateDiscountPrice(newOrig, discount);
                                onSale?.(item.id, true, newOrig, discount, newSale);
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-rose-800 mb-1">
                            % Descuento (Editable)
                          </label>
                          <div className="rounded-lg bg-white border border-rose-300 shadow-2xs">
                            <InlineField
                              value={item.discountPercentage !== undefined ? item.discountPercentage : 20}
                              label={`Porcentaje de descuento de ${item.name}`}
                              suffix="%"
                              type="number"
                              onCommit={(val) => {
                                const pct = Math.max(0, Math.min(99, Number(val) || 0));
                                const orig = item.originalPrice || item.price;
                                const newSale = calculateDiscountPrice(orig, pct);
                                onSale?.(item.id, true, orig, pct, newSale);
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-rose-900 mb-1">
                          Precio Final en Oferta
                        </label>
                        <div className="rounded-lg bg-white border border-rose-300 shadow-2xs">
                          <InlineField
                            value={item.price}
                            label={`Precio de oferta de ${item.name}`}
                            prefix="$"
                            type="number"
                            onCommit={(val) => {
                              const newSale = Math.max(0, Number(val) || 0);
                              const orig = item.originalPrice || item.price;
                              const discount = calculateDiscountPercentage(orig, newSale);
                              onSale?.(item.id, true, orig, discount, newSale);
                            }}
                          />
                        </div>
                      </div>

                      {/* Selector rápido de porcentaje */}
                      <div className="pt-1 flex items-center justify-between gap-1 flex-wrap">
                        <span className="text-[10px] font-semibold text-rose-800 shrink-0">
                          Atajos:
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => {
                                const orig = item.originalPrice || item.price;
                                const newSale = calculateDiscountPrice(orig, pct);
                                onSale?.(item.id, true, orig, pct, newSale);
                              }}
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors cursor-pointer ${
                                item.discountPercentage === pct
                                  ? 'bg-rose-600 text-white shadow-2xs'
                                  : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-1 border-t border-rose-200/80 flex items-center justify-between text-[11px] text-rose-800 font-medium">
                        <span>Descuento: <strong>{item.discountPercentage || 0}% OFF</strong></span>
                        <span>Ahorro: <strong>${Math.max(0, (item.originalPrice || item.price) - item.price).toLocaleString('es-AR')}</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <InlineField
                        value={item.price}
                        label={`Precio de ${item.name}`}
                        prefix="$"
                        type="number"
                        onCommit={(value) => onPrice(item.id, Number(value) || 0)}
                      />
                    </div>
                  )}
                </div>

                {/* 5b. Fila de Stock y Estado (2 columnas amplias, NUNCA desborda) */}
                <div className="pt-3 border-t border-line/60 grid grid-cols-2 gap-4 items-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                      Stock
                    </p>
                    <InlineField
                      value={item.stock}
                      label={`Stock de ${item.name}`}
                      type="number"
                      suffix="pcs"
                      onCommit={(value) => onStock(item.id, Number(value) || 0)}
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                      Estado
                    </p>
                    <StatusToggle
                      active={item.active}
                      productName={item.name}
                      onChange={() => onToggle(item.id)}
                    />
                  </div>
                </div>
              </div>

              {/* 6. Footer de card: Guardado y Botón eliminar centrado */}
              <div className="pt-3 border-t border-line/60 flex flex-col items-center justify-center gap-2">
                <AnimatePresence>
                  {isSaved && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200"
                    >
                      <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Guardado correctamente
                    </motion.span>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Eliminar ${item.name}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/60 px-5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-colors cursor-pointer active:scale-95"
                >
                  <Trash2Icon className="h-4 w-4 text-rose-500" aria-hidden="true" />
                  <span>Eliminar producto</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── VISTA DESKTOP: Tabla ───────────────────────────── */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[1100px] border-collapse text-left">
          <caption className="sr-only">
            Inventario de productos. El precio y el stock son editables en línea.
          </caption>
          <thead>
            <tr className="border-b border-line text-[12px] uppercase tracking-[0.08em] text-muted">
              <th scope="col" className="px-5 py-3 font-medium w-[400px]">
                Producto
              </th>
              <th scope="col" className="w-[140px] px-3 py-3 font-medium">
                Precio
              </th>
              <th scope="col" className="w-[130px] px-3 py-3 font-medium">
                Stock
              </th>
              <th scope="col" className="w-[200px] px-3 py-3 font-medium">
                Estado
              </th>
              <th scope="col" className="w-[120px] px-5 py-3 text-right font-medium">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const classification = getProductClassification(item);
              return (
                <tr
                  key={item.id}
                  className="group border-b border-line/70 align-top transition-colors duration-150 ease-soft last:border-b-0 hover:bg-sand/30"
                >
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <InlineField
                          value={item.name}
                          label={`Nombre de ${item.name}`}
                          onCommit={(value) => onName(item.id, value)}
                          width="w-full max-w-[280px]"
                        />
                        {item.isDraft && (
                          <span className="shrink-0 rounded-full bg-gold-pale px-2 py-0.5 text-[11px] text-gold-dark">
                            Nuevo
                          </span>
                        )}
                      </div>

                      <div className="ml-2 flex items-center flex-wrap gap-2">
                        {/* Selector de Material */}
                        <select
                          value={(classification.material as Material) || 'Plata'}
                          onChange={(e) => {
                            const newMat = e.target.value as Material;
                            const newSubs = TIENDANUBE_TREE[newMat] || [];
                            const newSub = newSubs.includes(classification.subcategory)
                              ? classification.subcategory
                              : (newSubs[0] || 'Accesorios');
                            onClassification?.(item.id, newMat, newSub);
                          }}
                          aria-label={`Tipo de material de ${item.name}`}
                          className="cursor-pointer rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900 border border-amber-200 outline-none hover:border-amber-400 focus:border-amber-500"
                        >
                          {MATERIALS.map((mat) => (
                            <option key={mat} value={mat}>{mat}</option>
                          ))}
                        </select>

                        {/* Selector de Subcategoría */}
                        <select
                          value={classification.subcategory}
                          onChange={(e) => {
                            onClassification?.(item.id, (classification.material as Material) || 'Plata', e.target.value);
                          }}
                          aria-label={`Subcategoría de ${item.name}`}
                          className="cursor-pointer rounded-md bg-stone-50 px-2 py-0.5 text-[11px] font-medium text-stone-700 border border-stone-200 outline-none hover:border-stone-300 focus:border-amber-500"
                        >
                          {((TIENDANUBE_TREE[classification.material as Material] || []).length > 0
                            ? TIENDANUBE_TREE[classification.material as Material]
                            : [classification.subcategory]
                          ).map((sub) => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>


                      </div>

                      <div className="ml-2 mt-1">
                        <InlineField
                          value={item.description || ''}
                          label={`Descripción de ${item.name}`}
                          onCommit={(value) => handleDescription(item.id, value)}
                          width="w-full max-w-[320px]"
                          isTextArea
                        />
                      </div>

                      {/* Galería de imágenes */}
                      <div className="ml-2 mt-2 flex flex-wrap items-center gap-2">
                        {item.images?.map((imgUrl, idx) => (
                          <div key={idx} className="relative group/img h-14 w-14 shrink-0">
                            <img
                              src={imgUrl}
                              alt=""
                              className="h-14 w-14 rounded-lg object-cover border border-line"
                            />
                            {item.images.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(item.id, idx)}
                                className="absolute -top-1.5 -right-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-rose-500/90 text-white hover:bg-rose-500 group-hover/img:flex shadow-sm"
                                title="Eliminar foto"
                              >
                                <XIcon className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        <label className="flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line text-muted hover:border-amber-400 hover:bg-amber-50/30 hover:text-amber-700 transition-colors">
                          <PlusIcon className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileChange(e, item.id)}
                          />
                        </label>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex flex-col gap-1.5">
                      <InlineField
                        value={item.price}
                        label={`Precio de ${item.name}`}
                        prefix="$"
                        type="number"
                        onCommit={(value) => {
                          const newSale = Math.max(0, Number(value) || 0);
                          if (item.onSale && item.originalPrice) {
                            const discount = calculateDiscountPercentage(item.originalPrice, newSale);
                            onSale?.(item.id, true, item.originalPrice, discount, newSale);
                          } else {
                            onPrice(item.id, newSale);
                          }
                        }}
                      />

                      {item.onSale ? (
                        <div className="flex flex-col gap-1 rounded-lg bg-rose-50/90 border border-rose-200 p-1.5 min-w-[170px]">
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <span className="text-stone-500 font-medium">Lista:</span>
                            <div className="w-20 bg-white rounded border border-stone-200">
                              <InlineField
                                value={item.originalPrice || item.price}
                                label={`Precio de lista de ${item.name}`}
                                prefix="$"
                                type="number"
                                onCommit={(val) => {
                                  const newOrig = Math.max(0, Number(val) || 0);
                                  const discount = item.discountPercentage !== undefined ? item.discountPercentage : 20;
                                  const newSale = calculateDiscountPrice(newOrig, discount);
                                  onSale?.(item.id, true, newOrig, discount, newSale);
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <span className="text-rose-800 font-bold">% Desc:</span>
                            <div className="w-20 bg-white rounded border border-rose-300">
                              <InlineField
                                value={item.discountPercentage !== undefined ? item.discountPercentage : 20}
                                label={`Porcentaje de descuento de ${item.name}`}
                                suffix="%"
                                type="number"
                                onCommit={(val) => {
                                  const pct = Math.max(0, Math.min(99, Number(val) || 0));
                                  const orig = item.originalPrice || item.price;
                                  const newSale = calculateDiscountPrice(orig, pct);
                                  onSale?.(item.id, true, orig, pct, newSale);
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end pt-0.5 border-t border-rose-200/60">
                            <button
                              type="button"
                              onClick={() => onSale?.(item.id, false, item.originalPrice || item.price, 0, item.originalPrice || item.price)}
                              className="text-[10px] font-semibold text-rose-700 hover:text-rose-900 hover:underline cursor-pointer"
                              title="Quitar oferta"
                            >
                              Quitar oferta
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const orig = item.price > 0 ? item.price : 1000;
                            const discount = 20;
                            const sale = calculateDiscountPrice(orig, discount);
                            onSale?.(item.id, true, orig, discount, sale);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-amber-800 cursor-pointer"
                        >
                          <Tag className="h-3 w-3" />
                          <span>+ Oferta</span>
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <InlineField
                      value={item.stock}
                      label={`Stock de ${item.name}`}
                      type="number"
                      suffix="pcs"
                      onCommit={(value) => onStock(item.id, Number(value) || 0)}
                    />
                  </td>

                  <td className="px-3 py-4">
                    <StatusToggle
                      active={item.active}
                      productName={item.name}
                      onChange={() => onToggle(item.id)}
                    />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <AnimatePresence>
                        {savedId === item.id && (
                          <motion.span
                            initial={{ opacity: 0, x: 4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                            className="flex items-center gap-1 text-[12px] text-green-700"
                          >
                            <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            Guardado
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        aria-label={`Eliminar ${item.name}`}
                        className="rounded-lg p-2 text-muted opacity-0 transition-colors duration-150 ease-soft hover:bg-greige hover:text-ink focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 group-hover:opacity-100"
                      >
                        <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

import React, { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, Trash2Icon, PlusIcon, XIcon } from 'lucide-react';
import { InlineField } from './InlineField';
import { StatusToggle } from './StatusToggle';
import { Category, CATEGORIES, Product } from '../../types/product';
import { getProductClassification } from '../../utils/productClassification';

interface InventoryTableProps {
  items: Product[];
  savedId: string | null;
  onName: (id: string, value: string) => void;
  onPrice: (id: string, value: number) => void;
  onStock: (id: string, value: number) => void;
  onCategory: (id: string, value: Category) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function InventoryTable({
  items,
  savedId,
  onName,
  onPrice,
  onStock,
  onCategory,
  onToggle,
  onRemove,
}: InventoryTableProps) {
  // Función para manejar la subida de imágenes en una fila específica
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    // Necesitamos invocar addImagesToProduct que viene de useInventory.
    // Como no está en Props de InventoryTable, lo vamos a disparar usando un evento custom
    // o vamos a pasarlo en props. ¡Ah, lo olvidé en las props! 
    // Lo más rápido es despachar un CustomEvent o pasarlo por Props.
    // Lo pasaré por Props, necesito actualizar AdminDashboard.tsx también.
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

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
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
                    <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700 border border-stone-200">
                      <span className="font-semibold text-amber-800">{classification.material}</span>
                      {classification.subcategory && <span className="text-stone-400">·</span>}
                      {classification.subcategory && <span>{classification.subcategory}</span>}
                    </span>

                    <select
                      value={item.category}
                      onChange={(e) => onCategory(item.id, e.target.value as Category)}
                      aria-label={`Categoría de ${item.name}`}
                      className="cursor-pointer rounded-md bg-transparent py-0.5 pr-1 text-[12px] text-muted outline-none transition-colors duration-150 ease-soft hover:text-ink focus:text-ink"
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
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
                            className="absolute -top-1.5 -right-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-rose/90 text-white hover:bg-rose group-hover/img:flex shadow-sm"
                            title="Eliminar foto"
                          >
                            <XIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Botón para añadir foto */}
                    <label className="flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line text-muted hover:border-gold hover:bg-gold-pale/30 hover:text-gold-dark transition-colors">
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
                <InlineField
                  value={item.price}
                  label={`Precio de ${item.name}`}
                  prefix="$"
                  type="number"
                  onCommit={(value) => onPrice(item.id, Number(value) || 0)}
                />
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
                        className="flex items-center gap-1 text-[12px] text-whatsapp-deep"
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

      {items.length === 0 && (
        <p className="px-5 py-16 text-center text-[14px] text-muted">
          Sin productos aún. Arrastra una foto arriba para crear el primero.
        </p>
      )}
    </div>
  );
}
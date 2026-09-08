import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, Trash2Icon } from 'lucide-react';
import { InlineField } from './InlineField';
import { StatusToggle } from './StatusToggle';
import { Category, CATEGORIES, Product } from '../../types/product';

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
  onRemove
}: InventoryTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <caption className="sr-only">
          Product inventory. Price and stock are editable in place.
        </caption>
        <thead>
          <tr className="border-b border-line text-[12px] uppercase tracking-[0.08em] text-muted">
            <th scope="col" className="px-5 py-3 font-medium">
              Product
            </th>
            <th scope="col" className="w-[140px] px-3 py-3 font-medium">
              Price
            </th>
            <th scope="col" className="w-[130px] px-3 py-3 font-medium">
              Stock
            </th>
            <th scope="col" className="w-[200px] px-3 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="w-[120px] px-5 py-3 text-right font-medium">
              <span className="sr-only">Row actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) =>
          <tr
            key={item.id}
            className="group border-b border-line/70 align-middle transition-colors duration-150 ease-soft last:border-b-0 hover:bg-sand/50">
            
              <td className="px-5 py-3">
                <div className="flex items-center gap-4">
                  <img
                  src={item.image}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <InlineField
                      value={item.name}
                      label={`Name of ${item.name}`}
                      onCommit={(value) => onName(item.id, value)}
                      width="w-full max-w-[280px]" />
                    
                      {item.isDraft &&
                    <span className="shrink-0 rounded-full bg-greige px-2 py-0.5 text-[11px] text-ink">
                          New
                        </span>
                    }
                    </div>
                    <select
                    value={item.category}
                    onChange={(e) =>
                    onCategory(item.id, e.target.value as Category)
                    }
                    aria-label={`Category of ${item.name}`}
                    className="ml-2 mt-0.5 cursor-pointer rounded-md bg-transparent py-0.5 pr-1 text-[12px] text-muted outline-none transition-colors duration-150 ease-soft hover:text-ink focus:text-ink">
                    
                      {CATEGORIES.map((category) =>
                    <option key={category} value={category}>
                          {category}
                        </option>
                    )}
                    </select>
                  </div>
                </div>
              </td>

              <td className="px-3 py-3">
                <InlineField
                value={item.price}
                label={`Price of ${item.name}`}
                prefix="$"
                type="number"
                onCommit={(value) => onPrice(item.id, Number(value) || 0)} />
              
              </td>

              <td className="px-3 py-3">
                <InlineField
                value={item.stock}
                label={`Stock quantity of ${item.name}`}
                type="number"
                suffix="pcs"
                onCommit={(value) => onStock(item.id, Number(value) || 0)} />
              
              </td>

              <td className="px-3 py-3">
                <StatusToggle
                active={item.active}
                productName={item.name}
                onChange={() => onToggle(item.id)} />
              
              </td>

              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-3">
                  <AnimatePresence>
                    {savedId === item.id &&
                  <motion.span
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                    className="flex items-center gap-1 text-[12px] text-whatsapp-deep">
                    
                        <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Saved
                      </motion.span>
                  }
                  </AnimatePresence>
                  <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Delete ${item.name}`}
                  className="rounded-lg p-2 text-muted opacity-0 transition-colors duration-150 ease-soft hover:bg-greige hover:text-ink focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 group-hover:opacity-100">
                  
                    <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {items.length === 0 &&
      <p className="px-5 py-16 text-center text-[14px] text-muted">
          No products yet. Drop a photo above to create your first one.
        </p>
      }
    </div>);

}
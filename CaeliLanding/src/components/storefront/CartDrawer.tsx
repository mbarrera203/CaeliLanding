import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatPrice, cartCheckoutLink } from '../../utils/whatsapp';

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, totalPrice } = useCart();

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-line">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-ink" />
              <h2 className="font-serif text-xl text-ink">Tu Pedido</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-stone-100 text-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                <ShoppingBag className="w-12 h-12 text-stone-300" />
                <p className="text-muted">Tu carrito está vacío</p>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-6 py-2 rounded-full border border-line hover:border-ink transition-colors text-sm"
                >
                  Seguir mirando
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <img
                    src={item.product.images?.[0] || '/LogoCaeli-removebg-preview.png'}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-xl border border-line"
                  />
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <h3 className="font-serif text-ink text-sm sm:text-base leading-tight pr-4">
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-muted mt-1">{item.product.material}</p>
                    
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3 bg-stone-50 rounded-full px-3 py-1 border border-line">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="text-muted hover:text-ink transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium text-ink w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="text-muted hover:text-ink transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-medium text-ink text-sm">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-line bg-stone-50/50">
              <div className="flex items-center justify-between mb-6">
                <span className="text-muted">Total estimado</span>
                <span className="font-serif text-xl text-ink">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <a
                href={cartCheckoutLink(items, totalPrice)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-4 rounded-xl bg-ink text-white font-medium text-center hover:bg-ink-light transition-colors flex items-center justify-center gap-2"
              >
                Pedir por WhatsApp
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

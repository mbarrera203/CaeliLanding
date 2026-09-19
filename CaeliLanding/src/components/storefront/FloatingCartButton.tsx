import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

export function FloatingCartButton() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.button
          onClick={() => setIsCartOpen(true)}
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 12 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 right-5 sm:bottom-24 sm:right-8 z-30 flex items-center justify-center p-3.5 rounded-full bg-ink text-white shadow-float hover:bg-ink-light hover:shadow-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
        >
          <div className="relative">
            <motion.div
              key={`icon-${totalItems}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <ShoppingBag className="w-6 h-6" />
            </motion.div>
            
            <motion.span
              key={`badge-${totalItems}`}
              initial={{ scale: 0, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="absolute -top-2 -right-2 bg-gold-dark text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-ink"
            >
              {totalItems}
            </motion.span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

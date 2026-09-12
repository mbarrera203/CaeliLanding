import { useState } from 'react';
import { Material, MATERIALS, TIENDANUBE_TREE } from '../../types/product';
import { ChevronDown, ChevronUp, Search, X, Sparkles, LayoutGrid, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CategoryFilterProps {
  selectedMaterial: 'Todos' | Material;
  selectedSubcategory: 'Todos' | string;
  searchQuery: string;
  onSelectMaterial: (material: 'Todos' | Material) => void;
  onSelectSubcategory: (subcategory: 'Todos' | string) => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  materialCounts: Record<string, number>;
  subcategoryCounts: Record<string, number>;
  totalFiltered: number;
  totalAll: number;
}

export function CategoryFilter({
  selectedMaterial,
  selectedSubcategory,
  searchQuery,
  onSelectMaterial,
  onSelectSubcategory,
  onSearchChange,
  onReset,
  materialCounts,
  subcategoryCounts,
  totalFiltered,
  totalAll,
}: CategoryFilterProps) {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  // Subcategorías a mostrar según el material seleccionado (solo cuando se elige una categoría específica)
  const currentSubcategories =
    selectedMaterial === 'Todos'
      ? []
      : ['Todos', ...(TIENDANUBE_TREE[selectedMaterial] || [])];

  const hasActiveFilters =
    selectedMaterial !== 'Todos' || selectedSubcategory !== 'Todos' || searchQuery.trim() !== '';

  const handleMegaMenuSelect = (mat: Material, sub?: string) => {
    onSelectMaterial(mat);
    onSelectSubcategory(sub || 'Todos');
    setIsMegaMenuOpen(false);
  };

  return (
    <nav
      aria-label="Filtros detallados de joyería"
      className="sticky top-[76px] sm:top-[90px] z-40 border-b border-line/80 bg-[#fdfcfa] shadow-[0_4px_16px_rgba(44,36,22,0.05)]"
    >
      <div className="mx-auto max-w-[1240px] px-4 py-3 sm:px-8">
        {/* Fila 1: Buscador rápido + Botón Desplegable del Menú Completo de TiendaNube */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
          {/* Buscador de Joyas */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre (ej: argolla, perla, cadena)..."
              className="w-full pl-10 pr-9 py-2 text-[13px] bg-sand/50 border border-line rounded-full text-ink placeholder:text-muted focus:outline-none focus:border-ink/40 focus:bg-white transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1 cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Botón para desplegar el menú completo estilo TiendaNube */}
          <button
            type="button"
            onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 border cursor-pointer ${
              isMegaMenuOpen
                ? 'bg-ink text-ivory border-ink shadow-sm'
                : 'bg-white text-ink border-line/80 hover:border-ink/30 hover:bg-sand/40'
            }`}
          >
            <LayoutGrid className="h-4 w-4 text-gold" />
            <span>Ver menú por material y categoría</span>
            {isMegaMenuOpen ? (
              <ChevronUp className="h-3.5 w-3.5 opacity-70" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            )}
          </button>
        </div>

        {/* Fila 2: Selector de Material Principal (Nivel 1) */}
        <div className="no-scrollbar flex items-center justify-start sm:justify-center gap-2 overflow-x-auto mt-3.5 sm:mt-4 pb-2">
          {/* Botón Todos los materiales */}
          <button
            type="button"
            onClick={() => {
              onSelectMaterial('Todos');
              onSelectSubcategory('Todos');
            }}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-200 cursor-pointer ${
              selectedMaterial === 'Todos'
                ? 'bg-ink text-ivory shadow-sm'
                : 'bg-sand text-muted hover:bg-stone-200/70 hover:text-ink'
            }`}
          >
            Todos
            <span className={`ml-1.5 text-[11px] tabular-nums ${selectedMaterial === 'Todos' ? 'text-ivory/60' : 'text-muted/60'}`}>
              {totalAll}
            </span>
          </button>

          {/* Pastillas de cada Material */}
          {MATERIALS.map((mat) => {
            const isSelected = selectedMaterial === mat;
            const count = materialCounts[mat] || 0;
            return (
              <button
                key={mat}
                type="button"
                onClick={() => {
                  onSelectMaterial(mat);
                  onSelectSubcategory('Todos');
                }}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-ink text-ivory shadow-sm'
                    : 'bg-sand text-muted hover:bg-stone-200/70 hover:text-ink'
                }`}
              >
                {mat === 'Plata' && <span className="text-gold mr-1">✦</span>}
                {mat}
                <span className={`ml-1.5 text-[11px] tabular-nums ${isSelected ? 'text-ivory/60' : 'text-muted/60'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Fila 3: Subcategorías específicas (Nivel 2) - Solo visible cuando se selecciona una categoría/material */}
        {selectedMaterial !== 'Todos' && currentSubcategories.length > 0 && (
          <div className="no-scrollbar flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pt-1 pb-1 animate-fade-in">
            {currentSubcategories.map((sub) => {
              const isSelected = selectedSubcategory === sub;
              const label = sub === 'Todos' ? `Todo en ${selectedMaterial}` : sub;
              const count = subcategoryCounts[sub] ?? 0;

              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => onSelectSubcategory(sub)}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-medium transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-gold text-ivory font-semibold shadow-xs'
                      : 'bg-white/80 text-muted border border-line/60 hover:border-gold/40 hover:text-ink'
                  }`}
                >
                  {label}
                  {sub !== 'Todos' && count > 0 && (
                    <span className={`ml-1 text-[10px] tabular-nums ${isSelected ? 'text-ivory/70' : 'text-muted/60'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Indicador de Filtros Activos con botón para resetear */}
        {hasActiveFilters && (
          <div className="mt-2.5 flex items-center justify-between border-t border-line/40 pt-2 text-xs text-muted">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-ink">Filtrando:</span>
              {selectedMaterial !== 'Todos' && (
                <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 font-medium text-stone-700">
                  {selectedMaterial}
                </span>
              )}
              {selectedSubcategory !== 'Todos' && (
                <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 font-medium text-stone-700">
                  › {selectedSubcategory}
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-stone-700">
                  búsqueda: &ldquo;{searchQuery}&rdquo;
                </span>
              )}
              <span className="text-muted">({totalFiltered} resultados)</span>
            </div>

            <button
              type="button"
              onClick={onReset}
              className="text-amber-800 hover:text-amber-900 font-medium underline text-[11px] cursor-pointer shrink-0 ml-2"
            >
              Quitar filtros
            </button>
          </div>
        )}
      </div>

      {/* MENÚ COMPLETO DESPLEGABLE (RÉPLICA EXACTA DE TIENDANUBE) */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-line bg-white shadow-xl"
          >
            <div className="mx-auto max-w-[1240px] px-6 py-8 sm:px-10">
              <div className="flex items-center justify-between border-b border-line/60 pb-3 mb-6">
                <div>
                  <h3 className="font-serif text-lg font-medium text-ink">
                    Explora por Material y Colección
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    Selecciona cualquier categoría para filtrar instantáneamente el catálogo
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMegaMenuOpen(false)}
                  className="p-1 rounded-full text-muted hover:text-ink hover:bg-sand/60 cursor-pointer"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Grid de 5 columnas idéntico a TiendaNube */}
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5 text-left">
                {/* 1. PLATA */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleMegaMenuSelect('Plata')}
                    className="font-bold text-[13px] tracking-wider text-ink uppercase hover:text-gold transition-colors text-left w-full cursor-pointer flex items-center justify-between group"
                  >
                    <span>PLATA</span>
                    <span className="text-[10px] text-muted group-hover:text-gold">
                      ({materialCounts['Plata'] || 0})
                    </span>
                  </button>
                  <ul className="mt-3 space-y-2 text-[13px] text-muted">
                    {TIENDANUBE_TREE['Plata'].map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => handleMegaMenuSelect('Plata', item)}
                          className={`hover:text-ink transition-colors cursor-pointer text-left w-full ${
                            selectedMaterial === 'Plata' && selectedSubcategory === item
                              ? 'text-gold-dark font-semibold'
                              : ''
                          }`}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. ACERO BLANCO */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleMegaMenuSelect('Acero Blanco')}
                    className="font-bold text-[13px] tracking-wider text-ink uppercase hover:text-gold transition-colors text-left w-full cursor-pointer flex items-center justify-between group"
                  >
                    <span>ACERO BLANCO</span>
                    <span className="text-[10px] text-muted group-hover:text-gold">
                      ({materialCounts['Acero Blanco'] || 0})
                    </span>
                  </button>
                  <ul className="mt-3 space-y-2 text-[13px] text-muted">
                    {TIENDANUBE_TREE['Acero Blanco'].map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => handleMegaMenuSelect('Acero Blanco', item)}
                          className={`hover:text-ink transition-colors cursor-pointer text-left w-full ${
                            selectedMaterial === 'Acero Blanco' && selectedSubcategory === item
                              ? 'text-gold-dark font-semibold'
                              : ''
                          }`}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. ACERO DORADO */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleMegaMenuSelect('Acero Dorado')}
                    className="font-bold text-[13px] tracking-wider text-ink uppercase hover:text-gold transition-colors text-left w-full cursor-pointer flex items-center justify-between group"
                  >
                    <span>ACERO DORADO</span>
                    <span className="text-[10px] text-muted group-hover:text-gold">
                      ({materialCounts['Acero Dorado'] || 0})
                    </span>
                  </button>
                  <ul className="mt-3 space-y-2 text-[13px] text-muted">
                    {TIENDANUBE_TREE['Acero Dorado'].map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => handleMegaMenuSelect('Acero Dorado', item)}
                          className={`hover:text-ink transition-colors cursor-pointer text-left w-full ${
                            selectedMaterial === 'Acero Dorado' && selectedSubcategory === item
                              ? 'text-gold-dark font-semibold'
                              : ''
                          }`}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4. COSITAS VARIAS :) */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleMegaMenuSelect('Cositas Varias :)')}
                    className="font-bold text-[13px] tracking-wider text-ink uppercase hover:text-gold transition-colors text-left w-full cursor-pointer flex items-center justify-between group"
                  >
                    <span>COSITAS VARIAS :)</span>
                    <span className="text-[10px] text-muted group-hover:text-gold">
                      ({materialCounts['Cositas Varias :)'] || 0})
                    </span>
                  </button>
                  <ul className="mt-3 space-y-2 text-[13px] text-muted">
                    {TIENDANUBE_TREE['Cositas Varias :)'].map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => handleMegaMenuSelect('Cositas Varias :)', item)}
                          className={`hover:text-ink transition-colors cursor-pointer text-left w-full ${
                            selectedMaterial === 'Cositas Varias :)' && selectedSubcategory === item
                              ? 'text-gold-dark font-semibold'
                              : ''
                          }`}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 5. FANTASÍA & COLLARES CRISTAL */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleMegaMenuSelect('Fantasía')}
                    className="font-bold text-[13px] tracking-wider text-ink uppercase hover:text-gold transition-colors text-left w-full cursor-pointer flex items-center justify-between group"
                  >
                    <span>FANTASÍA</span>
                    <span className="text-[10px] text-muted group-hover:text-gold">
                      ({materialCounts['Fantasía'] || 0})
                    </span>
                  </button>
                  <ul className="mt-3 space-y-2 text-[13px] text-muted">
                    {TIENDANUBE_TREE['Fantasía'].map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => handleMegaMenuSelect('Fantasía', item)}
                          className={`hover:text-ink transition-colors cursor-pointer text-left w-full ${
                            selectedMaterial === 'Fantasía' && selectedSubcategory === item
                              ? 'text-gold-dark font-semibold'
                              : ''
                          }`}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Sección Collares Cristal */}
                  <div className="mt-5 pt-3 border-t border-line/60">
                    <button
                      type="button"
                      onClick={() => handleMegaMenuSelect('Collares Cristal')}
                      className={`font-bold text-[13px] tracking-wider text-ink uppercase hover:text-gold transition-colors text-left w-full cursor-pointer flex items-center justify-between group ${
                        selectedMaterial === 'Collares Cristal' ? 'text-gold-dark' : ''
                      }`}
                    >
                      <span>COLLARES CRISTAL</span>
                      <span className="text-[10px] text-muted group-hover:text-gold">
                        ({materialCounts['Collares Cristal'] || 0})
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Botón para ver todo */}
              <div className="mt-8 pt-4 border-t border-line flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onSelectMaterial('Todos');
                    onSelectSubcategory('Todos');
                    setIsMegaMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-ink hover:text-gold transition-colors underline cursor-pointer"
                >
                  Ver todos los productos ({totalAll})
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
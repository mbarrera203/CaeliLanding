import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, PackageCheck } from 'lucide-react';
import { parseTiendaNubeCsv, TiendaNubeProductResult } from '../../utils/tiendanubeImporter';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/product';

interface TiendaNubeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TiendaNubeImportModal({ isOpen, onClose, onSuccess }: TiendaNubeImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<TiendaNubeProductResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Por favor subí un archivo en formato .csv');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setParsing(true);
    setResult(null);

    try {
      const parsedData = await parseTiendaNubeCsv(selectedFile);
      if (parsedData.products.length === 0) {
        setError('No se encontraron productos válidos en el archivo CSV.');
      } else {
        setResult(parsedData);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al procesar el archivo CSV.');
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUploadToSupabase = async () => {
    if (!result || result.products.length === 0) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    const products = result.products;
    const CHUNK_SIZE = 50;
    const totalChunks = Math.ceil(products.length / CHUNK_SIZE);

    try {
      for (let i = 0; i < totalChunks; i++) {
        const chunk = products.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        
        const rows = chunk.map((p: Product) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          detail: p.detail,
          description: p.description,
          images: p.images,
          stock: p.stock,
          active: p.active,
          featured: false,
        }));

        const { error: upsertError } = await supabase
          .from('products')
          .upsert(rows, { onConflict: 'id' });

        if (upsertError) {
          throw new Error(`Error en el lote ${i + 1}: ${upsertError.message}`);
        }

        const currentCount = Math.min((i + 1) * CHUNK_SIZE, products.length);
        const percent = Math.round((currentCount / products.length) * 100);
        setProgress(percent);
      }

      setIsDone(true);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al subir los productos a Supabase.');
    } finally {
      setUploading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setIsDone(false);
    setProgress(0);
  };

  // Resumen de categorías
  const categoryStats = result?.products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">Importar catálogo de TiendaNube</h2>
              <p className="text-xs text-muted">Subí el archivo .csv exportado de tu tienda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-1.5 rounded-full text-stone-400 hover:text-ink hover:bg-stone-100 transition-colors disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200/80 p-4 flex items-start gap-3 text-xs text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium">Hubo un inconveniente</p>
                <p className="mt-0.5 text-red-600/90">{error}</p>
              </div>
            </div>
          )}

          {isDone ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-ink">¡Importación completada con éxito!</h3>
                <p className="text-xs text-muted mt-1 max-w-md mx-auto">
                  Se subieron <strong>{result?.products.length} productos</strong> con sus imágenes y datos a Supabase.
                  Ya podés verlos en tu panel y en la tienda.
                </p>
              </div>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    resetAll();
                  }}
                  className="px-6 py-2.5 rounded-full bg-ink text-white text-xs font-medium hover:bg-stone-800 transition-colors shadow-md"
                >
                  Ver inventario actualizado
                </button>
              </div>
            </div>
          ) : !result ? (
            // Zona de carga de archivo
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-stone-200 hover:border-amber-400 rounded-3xl p-10 text-center cursor-pointer transition-colors bg-stone-50/60 hover:bg-amber-50/20 group"
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                }}
              />
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-stone-200 group-hover:border-amber-300 text-muted group-hover:text-amber-600 transition-all mb-4">
                {parsing ? (
                  <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                ) : (
                  <UploadCloud className="h-6 w-6" />
                )}
              </div>
              <h4 className="text-sm font-medium text-ink">
                {parsing ? 'Analizando archivo CSV...' : 'Seleccioná o arrastrá el archivo .csv'}
              </h4>
              <p className="text-xs text-muted mt-1.5 max-w-sm mx-auto">
                El archivo descargado desde TiendaNube (debe incluir títulos, fotos, stock y precios)
              </p>
              <span className="inline-block mt-4 text-[11px] font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                Formato .CSV de Excel
              </span>
            </div>
          ) : (
            // Vista previa y estadísticas
            <div className="space-y-6">
              {file && (
                <div className="flex items-center justify-between text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-stone-600">
                  <span>Archivo procesado: <strong>{file.name}</strong></span>
                  <span className="text-[11px] text-muted">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}

              {/* Tarjetas de estadísticas */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 text-center">
                  <p className="text-[11px] text-muted uppercase tracking-wider font-medium">Productos</p>
                  <p className="text-xl font-serif font-medium text-ink mt-0.5">{result.products.length}</p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 text-center">
                  <p className="text-[11px] text-muted uppercase tracking-wider font-medium">Fotos vinculadas</p>
                  <p className="text-xl font-serif font-medium text-ink mt-0.5">{result.totalImages}</p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 text-center">
                  <p className="text-[11px] text-muted uppercase tracking-wider font-medium">Filas de Excel</p>
                  <p className="text-xl font-serif font-medium text-ink mt-0.5">{result.totalCsvRows}</p>
                </div>
              </div>

              {/* Categorías detectadas */}
              {categoryStats && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-muted mr-1 font-medium">Distribución:</span>
                  {Object.entries(categoryStats).map(([cat, count]) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-[11px] text-stone-700 border border-stone-200/80 font-medium"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {cat}: <strong>{count}</strong>
                    </span>
                  ))}
                </div>
              )}

              {/* Vista previa de los primeros 4 productos */}
              <div>
                <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2.5">
                  Vista previa de productos detectados
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {result.products.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-stone-100 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.images[0] || '/LogoCaeli.png'}
                          alt={p.name}
                          className="h-10 w-10 rounded-lg object-cover bg-stone-100 border border-stone-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/LogoCaeli.png';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-ink truncate">{p.name}</p>
                          <p className="text-[11px] text-muted truncate">{p.category} · {p.images.length} fotos · Stock: {p.stock}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-ink font-sans">
                          ${p.price.toLocaleString('es-AR')}
                        </p>
                        <span className={`text-[10px] font-medium ${p.active ? 'text-emerald-600' : 'text-stone-400'}`}>
                          {p.active ? 'Activo' : 'Pausado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barra de progreso si está subiendo */}
              {uploading && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
                      Subiendo a Supabase...
                    </span>
                    <span className="font-semibold text-ink">{progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
          {result && !isDone ? (
            <>
              <button
                type="button"
                onClick={resetAll}
                disabled={uploading}
                className="text-xs text-muted hover:text-ink transition-colors disabled:opacity-40"
              >
                Elegir otro archivo
              </button>
              <button
                type="button"
                onClick={handleUploadToSupabase}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-xs font-medium text-white hover:bg-stone-800 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Subiendo ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <PackageCheck className="h-4 w-4 text-amber-400" />
                    <span>Confirmar e importar {result.products.length} productos</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-muted hover:text-ink transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

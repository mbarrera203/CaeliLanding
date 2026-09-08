import React, { useRef, useState } from 'react';
import { ImagePlusIcon } from 'lucide-react';

interface UploadZoneProps {
  onFiles: (files: File[]) => void;
}

export function UploadZone({ onFiles }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    onFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={[
        'rounded-2xl border-2 border-dashed px-8 py-12 text-center transition-colors duration-150 ease-soft',
        dragging
          ? 'border-gold/60 bg-gold-pale/40'
          : 'border-line bg-sand hover:border-gold/30 hover:bg-gold-pale/20',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-md flex-col items-center">
        <span
          className={[
            'flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-150 ease-soft',
            dragging ? 'bg-gold text-ivory' : 'bg-white text-gold-dark',
          ].join(' ')}
        >
          <ImagePlusIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-4 font-serif text-lg font-medium text-ink sm:text-xl">
          Arrastra y suelta fotos de productos aquí
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Sube una o varias fotos a la vez para crear un nuevo producto con su propia galería. 
          Agrega el precio y el stock, actívalo y aparecerá en la tienda.
        </p>
        <button
          type="button"
          id="upload-zone-choose"
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-ivory transition-colors duration-150 ease-soft hover:bg-ink/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
        >
          Elegir fotos
        </button>
        <p className="mt-3 text-[12px] text-muted">JPG o PNG · Máximo 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            onFiles(Array.from(e.target.files ?? []));
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
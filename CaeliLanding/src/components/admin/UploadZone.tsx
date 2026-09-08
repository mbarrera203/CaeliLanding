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
      dragging ?
      'border-ink/50 bg-white' :
      'border-line bg-sand hover:border-ink/25'].
      join(' ')}>
      
      <div className="mx-auto flex max-w-md flex-col items-center">
        <span
          className={[
          'flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-150 ease-soft',
          dragging ? 'bg-ink text-ivory' : 'bg-white text-ink'].
          join(' ')}>
          
          <ImagePlusIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-4 text-lg font-medium text-ink sm:text-xl">
          Drag &amp; drop product photos here
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Each photo becomes a new product row below. Add the price and stock,
          switch it to Active, and it's live on the store.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-ivory transition-colors duration-150 ease-soft hover:bg-ink/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 focus-visible:ring-offset-2 focus-visible:ring-offset-sand">
          
          Choose photos
        </button>
        <p className="mt-3 text-[12px] text-muted">JPG or PNG · up to 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            onFiles(Array.from(e.target.files ?? []));
            e.target.value = '';
          }} />
        
      </div>
    </div>);

}
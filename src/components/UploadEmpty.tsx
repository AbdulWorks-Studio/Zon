import { useRef, useState } from 'react';
import { FolderOpen, LockKeyhole, Upload } from 'lucide-react';

export function UploadEmpty({ onFile, accept = 'image/png,image/jpeg,image/webp', hint = 'JPG, PNG, or WebP · up to 20 MB', title = 'Drop an image here' }: { onFile: (file: File) => void; accept?: string; hint?: string; title?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const acceptFile = (candidate: File | undefined) => { if (candidate) onFile(candidate); };
  return (
    <div className={`upload-zone flex flex-col items-center justify-center rounded-[1.5rem] px-5 text-center ${dragging ? 'is-dragging' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); acceptFile(e.dataTransfer.files[0]); }} data-testid="dropzone-image">
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => acceptFile(e.target.files?.[0])} />
      <div className="upload-icon rounded-2xl"><Upload size={24} strokeWidth={1.4} /></div>
      <h3 className="mt-5 font-display text-2xl font-medium tracking-[-.04em] text-[#e8ecd8]">{title}</h3>
      <p className="mt-2 text-sm text-[#8a9e7e]">{hint}</p>
      <button type="button" className="btn-gold mt-6 rounded-xl px-5 py-3 text-[.78rem] font-semibold" onClick={() => inputRef.current?.click()}><FolderOpen size={15} /> Choose file</button>
      <div className="mt-5 flex items-center gap-2 font-mono-zon text-[.58rem] uppercase tracking-[.1em] text-[#7a8f6e]"><LockKeyhole size={12} className="text-amber-400/80" /> browser-first · nothing uploaded</div>
    </div>
  );
}

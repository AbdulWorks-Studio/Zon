export function ImagePreview({ src, label }: { src: string; label: string }) {
  return (
    <div className="relative flex min-h-[18rem] items-center justify-center overflow-hidden rounded-[1.35rem] bg-[#0a2e28]/60 p-3">
      <img src={src} alt={label} className="max-h-[27rem] w-full rounded-xl object-contain shadow-[0_12px_30px_rgba(0,0,0,.35)]" />
      <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-[#042f2e]/70 px-3 py-1.5 font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-amber-300 backdrop-blur-md">{label}</span>
    </div>
  );
}

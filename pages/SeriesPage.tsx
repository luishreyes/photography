import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { series } from '../data/series';

export default function SeriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const s = series.find(s => s.slug === slug);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Keyboard nav for lightbox
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (lightbox === null || !s) return;
    if (e.key === 'ArrowRight') setLightbox(i => i !== null ? Math.min(i + 1, s.photos.length - 1) : null);
    if (e.key === 'ArrowLeft')  setLightbox(i => i !== null ? Math.max(i - 1, 0) : null);
    if (e.key === 'Escape') setLightbox(null);
  }, [lightbox, s]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Lock scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightbox]);

  if (!s) return (
    <main className="min-h-screen bg-brand-dark flex items-center justify-center">
      <div className="text-center">
        <p className="text-white/40 mb-4">Series not found</p>
        <Link to="/work" className="text-brand-yellow underline">← Back to Work</Link>
      </div>
    </main>
  );

  // Build masonry columns (3 on desktop, 2 on tablet, 1 on mobile)
  const cols = buildColumns(s.photos, 3);

  return (
    <main className="min-h-screen bg-brand-dark">
      {/* Header */}
      <div className="pt-28 pb-12 px-6 md:px-16 max-w-7xl mx-auto">
        <Link to="/work" className="text-white/30 text-xs tracking-[0.2em] uppercase hover:text-brand-yellow transition-colors mb-6 inline-block">
          ← Work
        </Link>
        <h1 className="text-4xl md:text-6xl font-bold text-white">{s.title}</h1>
        <p className="mt-4 text-white/50 text-base md:text-lg max-w-2xl leading-relaxed">{s.description}</p>
        {s.quote && (
          <blockquote className="mt-6 border-l-2 border-brand-yellow pl-4">
            <p className="text-white/30 text-sm italic">"{s.quote.text}"</p>
            <p className="text-white/20 text-xs mt-1">— {s.quote.author}</p>
          </blockquote>
        )}
        <p className="mt-6 text-white/20 text-xs tracking-widest uppercase">{s.photos.length} photographs · {s.year}</p>
      </div>

      {/* Masonry grid */}
      <div className="px-6 md:px-16 pb-24 max-w-7xl mx-auto">
        {/* Desktop: 3 cols */}
        <div className="hidden lg:grid grid-cols-3 gap-3">
          {cols.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-3">
              {col.map(photo => (
                <MasonryPhoto key={photo.id} photo={photo} onClick={() => setLightbox(s.photos.indexOf(photo))} />
              ))}
            </div>
          ))}
        </div>
        {/* Tablet: 2 cols */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-3">
          {buildColumns(s.photos, 2).map((col, ci) => (
            <div key={ci} className="flex flex-col gap-3">
              {col.map(photo => (
                <MasonryPhoto key={photo.id} photo={photo} onClick={() => setLightbox(s.photos.indexOf(photo))} />
              ))}
            </div>
          ))}
        </div>
        {/* Mobile: 1 col */}
        <div className="md:hidden flex flex-col gap-3">
          {s.photos.map(photo => (
            <MasonryPhoto key={photo.id} photo={photo} onClick={() => setLightbox(s.photos.indexOf(photo))} />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button className="absolute top-6 right-6 text-white/40 hover:text-white text-sm tracking-widest uppercase z-10" onClick={() => setLightbox(null)}>
            Close
          </button>

          {/* Prev */}
          {lightbox > 0 && (
            <button
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/30 hover:text-white z-10 text-3xl px-4 py-8"
              onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}
            >
              ←
            </button>
          )}

          {/* Image */}
          <img
            src={s.photos[lightbox].src}
            alt={s.photos[lightbox].title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={e => e.stopPropagation()}
          />

          {/* Next */}
          {lightbox < s.photos.length - 1 && (
            <button
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/30 hover:text-white z-10 text-3xl px-4 py-8"
              onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}
            >
              →
            </button>
          )}

          {/* Caption */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <p className="text-white/60 text-sm font-medium">{s.photos[lightbox].title}</p>
            <p className="text-white/20 text-xs mt-1">{lightbox + 1} / {s.photos.length}</p>
          </div>
        </div>
      )}
    </main>
  );
}

function MasonryPhoto({ photo, onClick }: { photo: { id: string; title: string; src: string; width: number; height: number }; onClick: () => void }) {
  const aspectRatio = photo.height / photo.width;
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      {/* Photo */}
      <div
        className="relative overflow-hidden bg-zinc-900"
        style={{ paddingBottom: `${aspectRatio * 100}%` }}
      >
        <img
          src={photo.src}
          alt={photo.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-[1.02]"
        />
      </div>
      {/* Title always visible below photo */}
      <p className="mt-2 text-white/40 text-xs tracking-wide group-hover:text-white/70 transition-colors duration-300">
        {photo.title}
      </p>
    </div>
  );
}

function buildColumns<T extends { width: number; height: number }>(photos: T[], numCols: number): T[][] {
  const cols: T[][] = Array.from({ length: numCols }, () => []);
  const heights = new Array(numCols).fill(0);
  for (const photo of photos) {
    const shortest = heights.indexOf(Math.min(...heights));
    cols[shortest].push(photo);
    heights[shortest] += photo.height / photo.width;
  }
  return cols;
}

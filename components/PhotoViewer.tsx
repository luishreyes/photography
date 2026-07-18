import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export interface ViewerPhoto {
  id: string;
  title: string;
  src: string;
  thumb?: string; // small square webp for the grid; lightbox always loads src
  width?: number;
  height?: number;
}

export interface PhotoViewerProps {
  backHref: string;
  backLabel: string;
  title: string;
  description?: string;
  quote?: { text: string; author: string };
  metaSuffix?: string; // appended after "n / total", e.g. "· 2026"
  photos: ViewerPhoto[];
  resetKey?: string; // resets/closes the viewer when this changes
}

// Clean gallery used on every breakpoint: compact header + a grid of square
// thumbnails (2 columns on phones, 3 on tablet/desktop) that fade in softly as
// they scroll into view. Tapping a photo opens it full-screen at full size; a
// tap anywhere (no close button) dismisses it, swipe/arrows navigate.
export default function PhotoViewer({
  backHref, backLabel, title, description, quote, metaSuffix, photos, resetKey,
}: PhotoViewerProps) {
  const [open, setOpen] = useState<number | null>(null);
  const [dir, setDir] = useState(1); // 1 = next, -1 = prev
  const touchStartX = useRef<number | null>(null);
  const swiped = useRef(false);

  const total = photos.length;

  const go = useCallback((next: number) => {
    if (next < 0 || next >= total) return;
    setOpen(prev => {
      if (prev === null) return prev;
      setDir(next >= prev ? 1 : -1);
      return next;
    });
  }, [total]);

  // Reset to a closed gallery when the series/study changes.
  useEffect(() => { setOpen(null); }, [resetKey]);

  // Lock body scroll + wire keyboard while the full-screen view is open.
  useEffect(() => {
    if (open === null) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') go(open + 1);
      if (e.key === 'ArrowLeft') go(open - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, go]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    swiped.current = false;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || open === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      swiped.current = true; // a swipe should navigate, not close
      go(delta < 0 ? open + 1 : open - 1);
    }
    touchStartX.current = null;
  };

  const photo = open !== null ? photos[open] : null;

  return (
    <main className="min-h-screen bg-brand-dark">
      {/* Editorial header */}
      <div className="max-w-screen-xl mx-auto pt-28 pb-6 px-5 md:px-6">
        <Link
          to={backHref}
          className="u-label text-white/40 text-[11px] hover:text-brand-yellow transition-colors mb-3 inline-block"
        >
          {backLabel}
        </Link>
        <h1 className="font-disp font-light uppercase tracking-[0.01em] leading-[0.86] text-brand-yellow text-[clamp(2.6rem,10vw,7rem)]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-brand-cream/70 text-sm md:text-base leading-relaxed max-w-2xl">{description}</p>
        )}
        {quote && (
          <figure className="mt-5 max-w-2xl border-l-2 border-brand-yellow/60 pl-4">
            <blockquote className="text-brand-cream/50 text-sm md:text-[15px] leading-relaxed italic">
              “{quote.text}”
            </blockquote>
            <figcaption className="u-label text-brand-yellow/80 text-[10px] mt-2">{quote.author}</figcaption>
          </figure>
        )}
      </div>

      {/* Grid of square thumbnails — 2 cols (phone) / 3 cols (tablet, desktop) */}
      <div className="max-w-screen-xl mx-auto px-2.5 md:px-6 pb-16 grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
        {photos.map((p, i) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => { setOpen(i); }}
            aria-label={p.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="relative aspect-square block w-full overflow-hidden bg-zinc-900 group"
          >
            <img
              src={p.thumb ?? p.src}
              alt={p.title}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="h-full w-full object-cover md:grayscale md:group-hover:grayscale-0 md:transition-all md:duration-500"
            />
            {/* Editorial caption — fotolibro language, revealed on hover (md+) */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden md:flex items-end justify-between gap-3 px-4 pb-3 pt-14 bg-gradient-to-t from-black/75 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="font-disp font-light uppercase text-brand-cream text-xl leading-none tracking-[0.03em] text-left">
                {p.title}
              </span>
              <span className="u-label text-brand-yellow text-[10px] leading-none mb-[3px]">
                {String(i + 1).padStart(2, '0')}
              </span>
            </span>
          </motion.button>
        ))}
      </div>

      {/* Full-screen view — tap anywhere to close, swipe/arrows to navigate */}
      <AnimatePresence>
        {photo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
            onClick={() => { if (swiped.current) { swiped.current = false; return; } setOpen(null); }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.img
                key={photo.id}
                src={photo.src}
                alt={photo.title}
                custom={dir}
                initial={{ opacity: 0, x: dir * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -30 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="max-h-[88vh] max-w-[92vw] object-contain"
                draggable={false}
              />
            </AnimatePresence>

            {/* Desktop/iPad navigation arrows (click elsewhere still closes) */}
            {open! > 0 && (
              <button
                aria-label="Previous"
                onClick={e => { e.stopPropagation(); go(open! - 1); }}
                className="hidden md:flex absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 text-white/30 hover:text-brand-yellow text-4xl px-4 py-8 transition-colors"
              >
                ←
              </button>
            )}
            {open! < total - 1 && (
              <button
                aria-label="Next"
                onClick={e => { e.stopPropagation(); go(open! + 1); }}
                className="hidden md:flex absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 text-white/30 hover:text-brand-yellow text-4xl px-4 py-8 transition-colors"
              >
                →
              </button>
            )}

            {/* Editorial caption — fotolibro language: citron index + Big Shoulders title */}
            <div className="absolute inset-x-0 bottom-0 pointer-events-none bg-gradient-to-t from-black/70 via-black/25 to-transparent px-5 pb-5 pt-16 md:px-10 md:pb-7">
              <p className="u-label text-brand-yellow text-[10px] mb-1.5">
                {String(open! + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}{metaSuffix ? ` ${metaSuffix}` : ''}
              </p>
              <p className="font-disp font-light uppercase text-brand-cream leading-[0.95] tracking-[0.02em] text-[clamp(1.6rem,4.5vw,2.8rem)]">
                {photo.title}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

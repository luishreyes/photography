import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '../context/i18n';
import type { PhotoViewerProps } from './PhotoViewer';

// Mobile gallery: compact header + a clean 2-column grid that scrolls
// vertically, photos fading in softly as they enter the viewport. Tapping a
// photo opens it full-screen; a tap anywhere (no close button) dismisses it.
export default function MobileGallery({
  backHref, backLabel, title, description, metaSuffix, photos, resetKey,
}: PhotoViewerProps) {
  const { t } = useI18n();
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
      {/* Compact header */}
      <div className="pt-24 pb-5 px-5">
        <Link
          to={backHref}
          className="text-white/30 text-[11px] tracking-[0.25em] uppercase hover:text-brand-yellow transition-colors mb-3 inline-block"
        >
          {backLabel}
        </Link>
        <h1 className="text-xl font-bold uppercase tracking-tight leading-none text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-2.5 text-white/40 text-xs leading-relaxed">{description}</p>
        )}
      </div>

      {/* 2-column masonry grid */}
      <div className="px-2.5 pb-16 columns-2 gap-2.5 [column-fill:_balance]">
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
            className="mb-2.5 block w-full break-inside-avoid overflow-hidden bg-zinc-900"
            style={p.width && p.height ? { aspectRatio: `${p.width} / ${p.height}` } : undefined}
          >
            <img
              src={p.src}
              alt={p.title}
              loading="lazy"
              draggable={false}
              className="h-full w-full object-cover"
            />
          </motion.button>
        ))}
      </div>

      {/* Full-screen view — tap anywhere to close, swipe to navigate */}
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

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <p className="text-white/50 text-xs font-medium">{photo.title}</p>
              <p className="text-white/20 text-[10px] mt-1 tracking-widest">
                {open! + 1} / {total}{metaSuffix ? ` ${metaSuffix}` : ''}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

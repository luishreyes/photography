import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '../context/i18n';

interface ViewerPhoto {
  id: string;
  title: string;
  src: string;
}

interface PhotoViewerProps {
  backHref: string;
  backLabel: string;
  title: string;
  description?: string;
  quote?: { text: string; author: string };
  metaSuffix?: string; // appended after "n / total", e.g. "· 2026"
  photos: ViewerPhoto[];
  resetKey?: string; // resets to first photo when this changes
}

export default function PhotoViewer({
  backHref, backLabel, title, description, quote, metaSuffix, photos, resetKey,
}: PhotoViewerProps) {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1); // 1 = next, -1 = prev
  const [zoom, setZoom] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const total = photos.length;

  const go = useCallback((next: number) => {
    if (!total) return;
    const clamped = Math.max(0, Math.min(next, total - 1));
    setDir(clamped >= active ? 1 : -1);
    setActive(clamped);
  }, [active, total]);

  useEffect(() => { setActive(0); setDir(1); }, [resetKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(active + 1);
      if (e.key === 'ArrowLeft') go(active - 1);
      if (e.key === 'Escape') setZoom(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, active]);

  useEffect(() => {
    document.body.style.overflow = zoom ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [zoom]);

  useEffect(() => {
    thumbRefs.current[active]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [active]);

  const photo = photos[active];

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) go(delta < 0 ? active + 1 : active - 1);
    touchStartX.current = null;
  };

  return (
    <main className="h-screen overflow-hidden bg-brand-dark flex flex-col">
      {/* Header */}
      <div className="pt-24 pb-4 px-6 md:px-16 max-w-5xl mx-auto w-full">
        <Link to={backHref} className="text-white/30 text-xs tracking-[0.2em] uppercase hover:text-brand-yellow transition-colors mb-5 inline-block">
          {backLabel}
        </Link>
        <h1 className="text-3xl md:text-5xl font-bold text-white">{title}</h1>
        {description && <p className="mt-3 text-white/50 text-sm md:text-base max-w-2xl leading-relaxed">{description}</p>}
        {quote && (
          <blockquote className="mt-4 border-l-2 border-brand-yellow pl-4">
            <p className="text-white/30 text-sm italic">"{quote.text}"</p>
            <p className="text-white/20 text-xs mt-1">— {quote.author}</p>
          </blockquote>
        )}
      </div>

      {/* Cinematic viewer */}
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center select-none overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img
            key={photo.id}
            src={photo.src}
            alt={photo.title}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={() => setZoom(true)}
            className="max-h-full max-w-[90vw] object-contain cursor-zoom-in"
            draggable={false}
          />
        </AnimatePresence>

        {active > 0 && (
          <button
            aria-label="Previous"
            onClick={() => go(active - 1)}
            className="hidden md:flex absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 text-white/30 hover:text-brand-yellow text-4xl px-4 py-8 transition-colors"
          >
            ←
          </button>
        )}
        {active < total - 1 && (
          <button
            aria-label="Next"
            onClick={() => go(active + 1)}
            className="hidden md:flex absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 text-white/30 hover:text-brand-yellow text-4xl px-4 py-8 transition-colors"
          >
            →
          </button>
        )}
      </div>

      {/* Caption */}
      <div className="text-center px-6 pt-4">
        <p className="text-white/60 text-sm font-medium">{photo.title}</p>
        <p className="text-white/20 text-xs mt-1 tracking-widest">{active + 1} / {total}{metaSuffix ? ` ${metaSuffix}` : ''}</p>
      </div>

      {/* Thumbnail strip */}
      <div className="px-4 md:px-10 pb-8 pt-4">
        <div className="flex gap-2 overflow-x-auto justify-start md:justify-center no-scrollbar">
          {photos.map((p, i) => (
            <button
              key={p.id}
              ref={el => { thumbRefs.current[i] = el; }}
              onClick={() => go(i)}
              aria-label={p.title}
              className="relative shrink-0 h-14 w-14 md:h-16 md:w-16 overflow-hidden bg-zinc-900 transition-all duration-300"
            >
              <img
                src={p.src}
                alt={p.title}
                loading="lazy"
                className={`h-full w-full object-cover transition-all duration-300 ${
                  i === active ? 'grayscale-0 opacity-100' : 'grayscale opacity-50 hover:opacity-80'
                }`}
              />
              {i === active && <span className="absolute inset-0 ring-2 ring-brand-yellow ring-inset" />}
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen viewer */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-zoom-out"
            onClick={() => setZoom(false)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <button
              aria-label={t('lightbox.close')}
              onClick={() => setZoom(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white text-xs tracking-widest uppercase z-10"
            >
              {t('lightbox.close')}
            </button>

            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.img
                key={photo.id}
                src={photo.src}
                alt={photo.title}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                onClick={() => setZoom(false)}
                className="max-h-[92vh] max-w-[94vw] object-contain cursor-zoom-out"
                draggable={false}
              />
            </AnimatePresence>

            {active > 0 && (
              <button
                aria-label="Previous"
                onClick={e => { e.stopPropagation(); go(active - 1); }}
                className="hidden md:flex absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 text-white/30 hover:text-brand-yellow text-4xl px-4 py-8 transition-colors z-10"
              >
                ←
              </button>
            )}
            {active < total - 1 && (
              <button
                aria-label="Next"
                onClick={e => { e.stopPropagation(); go(active + 1); }}
                className="hidden md:flex absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 text-white/30 hover:text-brand-yellow text-4xl px-4 py-8 transition-colors z-10"
              >
                →
              </button>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <p className="text-white/60 text-sm font-medium">{photo.title}</p>
              <p className="text-white/20 text-xs mt-1 tracking-widest">{active + 1} / {total}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

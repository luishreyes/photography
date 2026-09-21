import { useState, useEffect, useRef, useCallback, type TouchEvent } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import SmartImg from './SmartImg';
import { EASE } from './Reveal';

export interface ViewerPhoto {
  id: string;
  title: string;
  src: string;
  thumb?: string;
  ar?: number;       // ancho/alto del master; reserva el alto de la celda
  width?: number;
  height?: number;
}

export interface PhotoViewerProps {
  backHref: string;
  backLabel: string;
  kicker?: string;
  title: string;
  description?: string;
  quote?: { text: string; author: string };
  metaSuffix?: string; // "· 2026"
  photos: ViewerPhoto[];
  resetKey?: string;
}

// ── Maqueta editorial asimétrica ─────────────────────────────────────────
// Doce columnas. Las fotos van de a dos por fila y el reparto depende de la
// orientación: la apaisada se lleva la columna ancha, la vertical la angosta;
// dos del mismo corte parten la fila en mitades. Tres ritmos se alternan
// (7/5, 4/8, 6/6) y la segunda celda de cada fila baja un poco, como en el
// template. Cada celda hace un parallax leve y contrario a su vecina.
interface Cell { photo: ViewerPhoto; span: number; offset: boolean; parallax: number; index: number; }

function ratio(p: ViewerPhoto) {
  if (p.ar) return p.ar;
  if (p.width && p.height) return p.width / p.height;
  return 1.5;
}

export function layoutCells(photos: ViewerPhoto[]): Cell[] {
  const cells: Cell[] = [];
  for (let i = 0, k = 0; i < photos.length; i += 2, k++) {
    const a = photos[i], b = photos[i + 1];
    if (!b) { cells.push({ photo: a, span: ratio(a) >= 1 ? 8 : 5, offset: false, parallax: 24, index: i }); break; }
    const ra = ratio(a), rb = ratio(b);
    const rhythm = k % 3; // 0: 7/5 · 1: 4/8 · 2: 6/6
    let sa: number, sb: number;
    if (rhythm === 2 || Math.abs(ra - rb) < 0.15) { sa = 6; sb = 6; }
    else if (rhythm === 0) { sa = ra >= rb ? 7 : 5; sb = 12 - sa; }
    else { sa = ra >= rb ? 8 : 4; sb = 12 - sa; }
    const amt = 20 + (k % 3) * 6;
    cells.push({ photo: a, span: sa, offset: false, parallax: amt, index: i });
    cells.push({ photo: b, span: sb, offset: true, parallax: -amt, index: i + 1 });
  }
  return cells;
}

export default function PhotoViewer({
  backHref, backLabel, kicker, title, description, quote, metaSuffix, photos, resetKey,
}: PhotoViewerProps) {
  const [open, setOpen] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
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

  useEffect(() => { setOpen(null); }, [resetKey]);

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

  const onTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; swiped.current = false; };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null || open === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) { swiped.current = true; go(delta < 0 ? open + 1 : open - 1); }
    touchStartX.current = null;
  };

  // ── Pista horizontal fija ──────────────────────────────────────────────
  // El tramo mide (alto de pantalla + recorrido de la pista), así que un
  // píxel de scroll vertical mueve la pista un píxel: no hay bulto vertical.
  // El scroll lateral del trackpad también la empuja (se traduce a vertical).
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const { scrollYProgress: p } = useScroll({ target: stage, offset: ['start start', 'end end'] });
  const x = useTransform(p, [0, 1], [0, -dist]);
  const bar = useTransform(p, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [photos]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      const r = el.getBoundingClientRect();
      if (r.top > 0 || r.bottom < window.innerHeight) return; // sólo mientras está fija
      e.preventDefault();
      window.scrollBy({ top: e.deltaX, behavior: 'instant' });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const photo = open !== null ? photos[open] : null;

  const intro = (
    <div className="flex-none flex flex-col justify-center w-[78vw] md:w-[36vw] md:pl-[var(--pad)]">
      <Link to={backHref} className="eyebrow hover:text-ink transition-colors">{backLabel}</Link>
      {kicker && <p className="eyebrow mt-8">{kicker}</p>}
      <h1 className="display text-[clamp(38px,5vw,84px)] mt-4">{title}</h1>
      <p className="font-mono text-[12px] text-muted mt-5">001 — {String(total).padStart(3, '0')}{metaSuffix ? ` ${metaSuffix}` : ''}</p>
      {description && (
        <p className="mt-6 text-ink-soft text-[14px] md:text-[15px] leading-[1.6] max-w-[40ch] max-h-[26vh] overflow-y-auto no-scrollbar">{description}</p>
      )}
      {quote && (
        <figure className="mt-5 max-w-[40ch]">
          <blockquote className="font-serif italic text-[15px] leading-[1.4] text-ink-soft">“{quote.text}”</blockquote>
          <figcaption className="eyebrow mt-2">{quote.author}</figcaption>
        </figure>
      )}
    </div>
  );

  const slides = photos.map((ph, i) => (
    <button key={ph.id} type="button" onClick={() => setOpen(i)} aria-label={ph.title}
      className="flex-none relative h-[52vh] md:h-[64vh] text-left group">
      <span className="block h-full overflow-hidden bg-paper-2" style={{ aspectRatio: String(ratio(ph)) }}>
        <SmartImg src={ph.src} alt={ph.title} loading="lazy" draggable={false}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]" />
      </span>
      <span className="flex justify-between gap-4 mt-3 font-mono text-[11px] tracking-[0.06em] text-muted">
        <span className="truncate">{ph.title}</span>
        <span>{String(i + 1).padStart(2, '0')}</span>
      </span>
    </button>
  ));

  return (
    <main className="bg-paper">
      {/* Pantallas medianas y grandes: la pista avanza con el scroll */}
      <div ref={stage} className="hidden md:block relative" style={{ height: `calc(100vh + ${dist}px)` }}>
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">
          <motion.div ref={track} style={{ x }} className="flex items-center gap-[clamp(20px,3vw,56px)] pr-[var(--pad)] will-change-transform">
            {intro}
            {slides}
          </motion.div>
          <div className="absolute left-[var(--pad)] right-[var(--pad)] bottom-[42px] h-px bg-[var(--hair)]">
            <motion.div style={{ width: bar }} className="h-px bg-ink" />
          </div>
        </div>
      </div>

      {/* Celular: tira que se desliza con el dedo */}
      <div className="md:hidden min-h-screen pt-[14vh] pb-16">
        <div className="pad-x">{intro}</div>
        <div className="flex gap-5 overflow-x-auto no-scrollbar px-[var(--pad)] mt-10 snap-x snap-mandatory">
          {slides.map((s, i) => <div key={i} className="snap-start">{s}</div>)}
        </div>
      </div>

      {/* Pantalla completa: la foto sobre tinta. Toque en cualquier lado cierra. */}
      <AnimatePresence>
        {photo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-ink flex items-center justify-center"
            onClick={() => { if (swiped.current) { swiped.current = false; return; } setOpen(null); }}
            onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
          >
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.img key={photo.id} src={photo.src} alt={photo.title} custom={dir}
                initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -30 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="max-h-[86vh] max-w-[92vw] object-contain" draggable={false} />
            </AnimatePresence>

            {open! > 0 && (
              <button aria-label="Previous" onClick={e => { e.stopPropagation(); go(open! - 1); }}
                className="hidden md:flex absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-3xl px-4 py-8 transition-colors">←</button>
            )}
            {open! < total - 1 && (
              <button aria-label="Next" onClick={e => { e.stopPropagation(); go(open! + 1); }}
                className="hidden md:flex absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-3xl px-4 py-8 transition-colors">→</button>
            )}

            <div className="absolute inset-x-0 bottom-0 pointer-events-none flex justify-between items-end gap-4 pad-x pb-6 text-white">
              <p className="font-serif italic text-[clamp(18px,2.2vw,28px)] leading-none">{photo.title}</p>
              <p className="font-mono text-[11px] tracking-[0.2em] text-white/60">
                {String(open! + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}{metaSuffix ? ` ${metaSuffix}` : ''}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

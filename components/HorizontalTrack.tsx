import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Pista horizontal fija, la del template. En pantallas medianas y grandes el
// tramo mide (alto de pantalla + recorrido de la pista): un píxel de scroll
// vertical mueve la pista un píxel, sin bulto vertical. El scroll lateral del
// trackpad también la empuja (se traduce a vertical mientras está fija). En
// celular es una tira que se desliza con el dedo, con snap.
export default function HorizontalTrack({ intro, slides, id, className = '' }: {
  intro: ReactNode; slides: ReactNode[]; id?: string; className?: string;
}) {
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
  }, [slides.length]);

  // Tabular hasta una foto que aún no está a la vista: el navegador no puede
  // traerla solo (la pista se mueve con el scroll de la página, no con el
  // scroll del contenedor), así que lo hacemos nosotros. Solo con foco de
  // teclado: un clic del ratón también enfoca, y ahí un salto sería molesto.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !track.current) return;
      if (typeof target.matches === 'function' && !target.matches(':focus-visible')) return;
      const pad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad')) || 24;
      const offset = target.getBoundingClientRect().left - track.current.getBoundingClientRect().left;
      const top = el.offsetTop + Math.max(0, Math.min(dist, offset - pad));
      window.scrollTo({ top, behavior: 'instant' });
    };
    el.addEventListener('focusin', onFocusIn);
    return () => el.removeEventListener('focusin', onFocusIn);
  }, [dist]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      const r = el.getBoundingClientRect();
      if (r.top > 0 || r.bottom < window.innerHeight) return; // sólo mientras está fija
      e.preventDefault();
      // `instant` explícito: con scroll-behavior smooth en el html cada delta
      // del trackpad reiniciaba la animación anterior y la pista se atascaba.
      window.scrollBy({ top: e.deltaX, behavior: 'instant' });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <>
      <section id={id} ref={stage} className={`hidden md:block relative ${className}`} style={{ height: `calc(100vh + ${dist}px)` }}>
        <div className="sticky top-0 h-screen overflow-clip flex items-center">
          <motion.div ref={track} style={{ x }} className="flex items-center gap-[clamp(20px,3vw,56px)] pr-[var(--pad)] will-change-transform">
            {intro}
            {slides}
          </motion.div>
          <div className="absolute left-[var(--pad)] right-[var(--pad)] bottom-[42px] h-px bg-[var(--hair)]">
            <motion.div style={{ width: bar }} className="h-px bg-ink" />
          </div>
        </div>
      </section>

      <section className={`md:hidden py-[clamp(60px,9vh,120px)] ${className}`}>
        <div className="pad-x">{intro}</div>
        <div className="flex gap-5 overflow-x-auto no-scrollbar px-[var(--pad)] mt-10 snap-x snap-mandatory">
          {slides.map((s, i) => <div key={i} className="snap-start flex-none flex">{s}</div>)}
        </div>
      </section>
    </>
  );
}

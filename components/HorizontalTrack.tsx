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

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      const r = el.getBoundingClientRect();
      if (r.top > 0 || r.bottom < window.innerHeight) return; // sólo mientras está fija
      e.preventDefault();
      // `instant`, no `auto`: el html tiene scroll-behavior smooth y con `auto`
      // cada delta del trackpad reiniciaba la animación anterior.
      window.scrollBy({ top: e.deltaX, behavior: 'instant' });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <>
      <section id={id} ref={stage} className={`hidden md:block relative ${className}`} style={{ height: `calc(100vh + ${dist}px)` }}>
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">
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

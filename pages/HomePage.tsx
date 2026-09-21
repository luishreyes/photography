import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { series, studies, looseYears } from '../data/catalog-data';
import { useI18n } from '../context/i18n';
import Footer from '../components/Footer';
import SmartImg from '../components/SmartImg';
import IndexRows from '../components/IndexRows';
import { Reveal, Clip, EASE } from '../components/Reveal';
import { colophon } from '../components/IndexColophon';
import { layoutCells } from '../components/PhotoViewer';

const HERO_IMAGE = '/hero.webp';

export default function HomePage() {
  const { t, lang } = useI18n();

  const looseTotal = looseYears.reduce((n, g) => n + g.photos.length, 0);
  const workTotal = series.reduce((n, s) => n + s.photos.length, 0);
  const studiesTotal = studies.reduce((n, s) => n + s.photos.length, 0);
  const { range } = colophon([...series, ...studies, ...looseYears]);

  const doors = [
    { to: '/work',    name: t('work.title'),    meta: `${series.length} ${t('unit.collections')} · ${workTotal}` },
    { to: '/studies', name: t('studies.title'), meta: `${studies.length} ${t('unit.studies')} · ${studiesTotal}` },
    { to: '/loose',   name: t('loose.title'),   meta: `${looseYears.length} ${t('unit.volumes')} · ${looseTotal}` },
  ];

  return (
    <main className="bg-paper">
      {/* ── Hero · Índice (magazine) ── */}
      <header className="min-h-screen grid lg:grid-cols-2 gap-[var(--pad)] pad-x pt-[16vh] pb-[var(--pad)]">
        <div>
          <Reveal><p className="eyebrow">{t('hero.kicker')}</p></Reveal>
          <Reveal delay={1}>
            <h1 className="display text-[clamp(54px,9vw,150px)] mt-6">
              Luis <span className="serif-italic">H.</span><br />Reyes
            </h1>
          </Reveal>
          <Reveal delay={2}>
            <p className="mt-[4vh] max-w-[40ch] text-ink-soft text-[clamp(15px,1.2vw,18px)] leading-[1.6]">
              {t('hero.title')} <span className="font-serif italic">{t('hero.sub')}</span>
            </p>
          </Reveal>
        </div>
        <div className="self-end">
          <Clip delay={2}>
            <Link to="/work" className="block w-full aspect-[16/10] overflow-hidden bg-paper-2 mb-7">
              <motion.div initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 5, ease: [0.3, 0, 0.2, 1] }} className="w-full h-full">
                <SmartImg src={HERO_IMAGE} alt="Luis H. Reyes" className="w-full h-full object-cover grayscale contrast-[1.08]" />
              </motion.div>
            </Link>
          </Clip>
          <Reveal delay={3}>
            <IndexRows items={doors} />
          </Reveal>
        </div>
        <div className="lg:col-span-2 flex justify-between gap-4 pt-[18px] mt-[2vh] border-t border-hair">
          <span className="eyebrow">{t('home.selection')} {range}</span>
          <span className="eyebrow hidden sm:inline">{t('contact.based').replace(/^(Based in|En) /, '')}</span>
          <span className="eyebrow">{t('home.scroll')}</span>
        </div>
      </header>

      {/* ── Selección: una foto por colección, maqueta editorial ── */}
      <Selection lang={lang} />

      {/* ── Colección destacada: zoom fijo a pantalla completa ── */}
      <Feature lang={lang} />

      {/* ── Último tomo: galería horizontal que avanza con el scroll ── */}
      <Horizontal lang={lang} />

      {/* ── Una frase, en serif ── */}
      <section className="section-pad">
        <Reveal>
          <p className="font-serif text-[clamp(30px,4vw,58px)] leading-[1.05] max-w-[22ch]">
            {lang === 'es'
              ? 'Ver con mi propio ojo un mundo que ya tiene demasiados ojos encima.'
              : 'Seeing with my own eye a world that already has too many eyes on it.'}
          </p>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}

// ── Selección ─────────────────────────────────────────────────────────────
function Selection({ lang }: { lang: 'en' | 'es' }) {
  const { t } = useI18n();
  // La portada de cada colección de Obra, con su título y el nombre de la colección.
  const picks = series.map(s => {
    const cover = s.photos.find(p => p.src === s.coverPhoto) ?? s.photos[0];
    return { photo: cover, slug: s.slug, name: s.names ? s.names[lang] : s.title };
  });
  const cells = layoutCells(picks.map(p => p.photo));
  const bySlug = new Map(picks.map(p => [p.photo.id, p]));
  const SPAN: Record<number, string> = { 4: 'md:col-span-4', 5: 'md:col-span-5', 6: 'md:col-span-6', 7: 'md:col-span-7', 8: 'md:col-span-8' };
  return (
    <section id="seleccion" className="section-pad">
      <Reveal className="grid grid-cols-[auto_1fr_auto] gap-6 items-end">
        <h2 className="font-serif font-medium text-[clamp(34px,5vw,72px)] leading-[0.95]">{t('work.title')}</h2>
        <div className="rule mb-3.5" />
        <span className="font-mono text-[12px] text-muted whitespace-nowrap">001 — {String(series.length).padStart(3, '0')}</span>
      </Reveal>
      <div className="grid grid-cols-12 gap-x-[clamp(16px,2vw,34px)] gap-y-[clamp(28px,4vh,56px)] mt-[clamp(40px,7vh,90px)]">
        {cells.map(c => {
          const pick = bySlug.get(c.photo.id)!;
          return (
            <Parallax key={c.photo.id} amount={c.parallax}
              className={`col-span-12 ${SPAN[c.span]} ${c.offset ? 'md:mt-[clamp(40px,9vh,120px)]' : ''}`}>
              <Reveal delay={c.offset ? 1 : 0}>
                <Link to={`/work/${pick.slug}`} className="block group">
                  <span className="block w-full overflow-hidden bg-paper-2" style={{ aspectRatio: String(c.photo.ar ?? 1.5) }}>
                    <SmartImg src={c.photo.src} alt={c.photo.title} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]" />
                  </span>
                  <span className="flex justify-between gap-4 mt-3 font-mono text-[11px] tracking-[0.06em] text-muted">
                    <span className="group-hover:text-ink transition-colors">{pick.name} / {String(c.index + 1).padStart(2, '0')}</span>
                    <span className="truncate">{c.photo.title}</span>
                  </span>
                </Link>
              </Reveal>
            </Parallax>
          );
        })}
      </div>
      <Reveal className="mt-[clamp(40px,7vh,90px)]">
        <Link to="/work" className="inline-flex items-baseline gap-3 font-serif text-[clamp(20px,2vw,28px)] hover:italic transition-all">
          {t('home.enter')} <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted">{t('work.title')} →</span>
        </Link>
      </Reveal>
    </section>
  );
}

function Parallax({ amount, className, children }: { amount: number; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [amount / 2, -amount / 2]);
  return <div ref={ref} className={className}><motion.div style={{ y }}>{children}</motion.div></div>;
}

// ── Destacada ──────────────────────────────────────────────────────────────
// Un estudio abierto, a pantalla completa y fijo mientras se recorre el tramo:
// la imagen crece, el título flota y se apaga al salir.
function Feature({ lang }: { lang: 'en' | 'es' }) {
  const { t } = useI18n();
  const study = studies.find(s => s.photos.length >= 12) ?? studies[0];
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const scale = useTransform(p, [0, 1], [1.12, 1.34]);
  const layerY = useTransform(p, [0, 1], [0, -30]);
  const copyY = useTransform(p, [0, 1], [60, -60]);
  const copyOpacity = useTransform(p, [0, 0.5, 1], [0.1, 1, 0.1]);
  if (!study) return null;
  const cover = study.photos.find(p => p.src === study.coverPhoto) ?? study.photos[0];
  return (
    <section ref={ref} className="relative h-[160vh] md:h-[230vh] bg-ink">
      <div className="sticky top-0 h-screen overflow-hidden grid place-items-center">
        <motion.div style={{ scale, y: layerY }} className="absolute inset-[-8%]">
          <SmartImg src={cover.src} alt={study.title} className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 z-[2] bg-[radial-gradient(120%_90%_at_50%_50%,transparent_40%,rgba(0,0,0,.55))]" />
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="relative z-[3] text-center text-white blend-diff max-w-[26ch] px-6">
          <p className="eyebrow !text-white/70">{t('home.feature')}</p>
          <h3 className="font-serif font-medium text-[clamp(40px,8vw,120px)] leading-[0.95] mt-4">
            {study.names ? study.names[lang] : study.title}
          </h3>
          <p className="font-mono text-[12px] tracking-[0.2em] uppercase mt-[18px]">
            {study.photos.length} {t('unit.images')} · {study.status === 'ongoing' ? t('studies.ongoing') : study.year}
          </p>
        </motion.div>
        <Link to={`/studies/${study.slug}`} className="absolute inset-0 z-[4]" aria-label={study.title} />
      </div>
    </section>
  );
}

// ── Horizontal ────────────────────────────────────────────────────────────
// El último tomo de Sueltas. En pantallas grandes la pista se desplaza con el
// scroll vertical, con una barra de progreso; en el celular es una tira que se
// desliza con el dedo.
function Horizontal({ lang }: { lang: 'en' | 'es' }) {
  const { t } = useI18n();
  const tomo = looseYears[0];
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
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
  }, [tomo]);

  if (!tomo) return null;
  const photos = tomo.photos.slice(0, 8);
  const label = tomo.label ? tomo.label[lang] : tomo.year;

  const intro = (
    <div className="flex-none flex flex-col justify-center md:pl-[var(--pad)] w-[78vw] md:w-[36vw]">
      <p className="eyebrow">{t('home.latest')} · {photos.length} / {tomo.photos.length}</p>
      <h2 className="font-serif font-medium text-[clamp(34px,5vw,72px)] leading-[0.95] mt-4">{label}</h2>
      <Link to={`/loose/${tomo.year}`} className="mt-6 font-mono text-[11px] tracking-[0.2em] uppercase text-muted hover:text-ink transition-colors">
        {t('home.seeAll')} →
      </Link>
    </div>
  );

  const slides = photos.map((ph, i) => (
    <Link key={ph.id} to={`/loose/${tomo.year}`} className="flex-none relative h-[52vh] md:h-[64vh] group">
      <span className="block h-full overflow-hidden bg-paper-2" style={{ aspectRatio: String(ph.ar ?? 1.5) }}>
        <SmartImg src={ph.src} alt={ph.title} loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]" />
      </span>
      <span className="block mt-3 font-mono text-[11px] tracking-[0.06em] text-muted">{ph.title} / {String(i + 1).padStart(2, '0')}</span>
    </Link>
  ));

  return (
    <>
      {/* Pantallas grandes: pista fija */}
      <section ref={ref} className="hidden md:block relative h-[320vh]">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">
          <motion.div ref={track} style={{ x }} className="flex gap-[clamp(20px,3vw,56px)] pr-[var(--pad)] will-change-transform">
            {intro}
            {slides}
          </motion.div>
          <div className="absolute left-[var(--pad)] right-[var(--pad)] bottom-[42px] h-px bg-[var(--hair)]">
            <motion.div style={{ width: bar }} className="h-px bg-ink" />
          </div>
        </div>
      </section>
      {/* Celular: tira deslizable */}
      <section className="md:hidden py-[clamp(60px,9vh,120px)]">
        <div className="flex gap-6 overflow-x-auto no-scrollbar px-[var(--pad)] snap-x snap-mandatory">
          <div className="snap-start">{intro}</div>
          {slides.map((s, i) => <div key={i} className="snap-start">{s}</div>)}
        </div>
      </section>
    </>
  );
}

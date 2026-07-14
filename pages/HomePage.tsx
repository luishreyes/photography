import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { series } from '../data/series';
import { studies } from '../data/studies';
import { useI18n, type Lang } from '../context/i18n';
import Footer from '../components/Footer';

const HERO_IMAGE = '/hero.webp';

const EASE = [0.16, 0.9, 0.24, 1] as const;

// Line-mask rise: wrap in an overflow-hidden span, animate the inner up from below.
const rise: Variants = {
  hidden: { y: '116%' },
  show: (i: number) => ({ y: 0, transition: { duration: 0.95, ease: EASE, delay: 0.15 + i * 0.1 } }),
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: 0.15 + i * 0.1 } }),
};

export default function HomePage() {
  const { t, lang } = useI18n();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  // Apple-style scroll-out: photo drifts + scales, the text block rises out and fades.
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.09]);
  const inY = useTransform(scrollYProgress, [0, 1], ['0px', '-150px']);
  const inOpacity = useTransform(scrollYProgress, [0, 0.78], [1, 0]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  return (
    <main className="bg-brand-dark">
      {/* ── Hero: wordmark alive ── */}
      <section ref={heroRef} className="relative h-screen overflow-hidden bg-black">
        {/* Parallax B/N photo */}
        <motion.div className="absolute inset-0" style={{ y: photoY, scale: photoScale }}>
          <motion.img
            src={HERO_IMAGE}
            alt="Luis H. Reyes"
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ opacity: { duration: 1, ease: 'easeOut' }, scale: { duration: 5, ease: [0.3, 0, 0.2, 1] } }}
            className="w-full h-full object-cover grayscale contrast-[1.14] brightness-[0.82]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_92%_at_50%_40%,rgba(5,5,5,0.12)_38%,rgba(5,5,5,0.66)_100%)]" />
        </motion.div>

        {/* Camera-flash entrance */}
        <motion.div
          className="absolute inset-0 bg-white pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.5, ease: 'easeOut', times: [0, 0.12, 1] }}
        />

        {/* Hero text — settles in, scrolls out */}
        <motion.div
          style={{ y: inY, opacity: inOpacity }}
          className="relative z-10 h-full flex flex-col justify-end pb-[clamp(38px,7vh,88px)] px-6 md:px-16 max-w-7xl mx-auto"
        >
          <div className="overflow-hidden mb-3 md:mb-5">
            <motion.p variants={fadeUp} custom={0} initial="hidden" animate="show"
              className="u-label text-brand-yellow text-[9.5px] md:text-[11px] tracking-[0.28em] md:tracking-[0.34em]">
              {t('hero.kicker')}
            </motion.p>
          </div>

          <h1 className="font-disp font-light uppercase text-brand-yellow leading-[0.82] tracking-[0.005em] text-[clamp(3.4rem,19vw,15rem)]">
            <span className="block overflow-hidden">
              <motion.span variants={rise} custom={0} initial="hidden" animate="show" className="block pt-[0.1em] -mt-[0.1em]">
                Luis H.
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span variants={rise} custom={1} initial="hidden" animate="show" className="block pt-[0.1em] -mt-[0.1em]">
                Reyes
              </motion.span>
            </span>
          </h1>

          <div className="overflow-hidden mt-5 md:mt-8">
            <motion.p variants={fadeUp} custom={3} initial="hidden" animate="show"
              className="text-brand-cream/90 text-base md:text-xl max-w-[40ch] leading-snug">
              {t('hero.title')} <span className="text-brand-yellow">{t('hero.sub')}</span>
            </motion.p>
          </div>

          {/* Index indicator */}
          <motion.div style={{ opacity: scrollOpacity }}
            className="hidden md:flex absolute right-16 bottom-[clamp(38px,7vh,88px)] flex-col items-end gap-2">
            <span className="u-label text-white/40 text-[11px]">{lang === 'es' ? 'Índice' : 'Index'}</span>
            <span className="w-px h-12 bg-gradient-to-b from-brand-yellow to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Index: three monumental doors ── */}
      <section className="py-[clamp(64px,9vh,140px)] px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between gap-5 border-t border-white/15 pt-4 mb-[clamp(20px,4vw,44px)]">
            <h2 className="font-disp font-normal uppercase tracking-[0.02em] text-white text-[clamp(1.5rem,3.4vw,2.4rem)]">
              {lang === 'es' ? 'Índice' : 'Index'}
            </h2>
            <span className="u-label text-white/40 text-[10px] md:text-[11px] text-right">
              {lang === 'es' ? 'Pasa el cursor o toca para abrir' : 'Hover or tap to open'}
            </span>
          </div>
          <IndexDoors />
        </div>
      </section>

      <Footer />
    </main>
  );
}

// ── Three-door index (Work / Studies / Loose) ──
interface Door {
  n: string;
  title: string;
  to: string;
  cover?: string;
  meta: { en: string; es: string };
  subs: { label: string; to: string; meta?: string }[];
}

function IndexDoors() {
  const { t, lang } = useI18n();
  const doors: Door[] = [
    {
      n: '01', title: t('work.title'), to: '/work', cover: series[0]?.coverPhoto,
      meta: { en: `6 collections · 72 images`, es: `6 colecciones · 72 imágenes` },
      subs: series.map(s => ({ label: s.title, to: `/work/${s.slug}`, meta: String(s.photos.length) })),
    },
    {
      n: '02', title: t('studies.title'), to: '/studies', cover: studies.find(s => s.coverPhoto)?.coverPhoto,
      meta: { en: `${studies.length} series · open`, es: `${studies.length} series · abiertas` },
      subs: studies.map(s => ({ label: s.title, to: `/studies/${s.slug}`, meta: s.photos.length ? String(s.photos.length) : '—' })),
    },
    {
      n: '03', title: t('loose.title'), to: '/loose', cover: series[2]?.coverPhoto,
      meta: { en: `loose work · by year`, es: `trabajo suelto · por año` },
      subs: [
        { label: '2012–2015', to: '/loose' },
        { label: '2016–2017', to: '/loose' },
        { label: '2018–2026', to: '/loose' },
      ],
    },
  ];

  return (
    <div className="border-t border-white/15">
      {doors.map((d, i) => (
        <motion.div
          key={d.title}
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }}
        >
          <DoorRow door={d} lang={lang} />
        </motion.div>
      ))}
    </div>
  );
}

function DoorRow({ door: d, lang }: { door: Door; lang: Lang }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group border-b border-white/15">
      {/* Header row */}
      <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-8 py-[clamp(20px,3.4vw,44px)] overflow-hidden">
        {/* hover cover reveal */}
        {d.cover && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[min(46%,520px)] opacity-0 group-hover:opacity-50 transition-opacity duration-500"
            style={{ WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 55%)', maskImage: 'linear-gradient(90deg,transparent,#000 55%)' }}
          >
            <img src={d.cover} alt="" className="w-full h-full object-cover grayscale contrast-[1.1] brightness-[0.7]"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
        <span className="relative z-10 u-label text-white/35 text-[12px] self-start pt-[0.4em]">{d.n}</span>
        <Link to={d.to} className="relative z-10 justify-self-start">
          <span className="font-disp font-light uppercase tracking-[0.01em] leading-[0.86] text-[clamp(2.7rem,10vw,7.4rem)] text-white group-hover:text-brand-yellow transition-colors duration-300">
            {d.title}
          </span>
        </Link>
        <div className="relative z-10 flex items-center gap-4 justify-self-end">
          <span className="u-label text-white/45 text-[11px] whitespace-nowrap hidden sm:inline">{d.meta[lang]}</span>
          <button
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle"
            className={`text-brand-yellow text-lg leading-none transition-transform duration-500 ${open ? 'rotate-90' : ''} md:group-hover:rotate-90`}
          >
            →
          </button>
        </div>
      </div>
      {/* Sub-items — hover (desktop) or tap (all) */}
      <div className={`overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] md:group-hover:max-h-[820px] ${open ? 'max-h-[820px]' : 'max-h-0'}`}>
        <div className="pb-[clamp(14px,2.2vw,28px)]">
          {d.subs.map((s, i) => (
            <Link key={s.label + i} to={s.to}
              className="group/sub grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-6 py-[clamp(10px,1.35vw,15px)] border-t border-white/5">
              <span className="u-label text-white/30 text-[11px] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-disp font-normal uppercase tracking-[0.02em] text-[clamp(1.25rem,2.4vw,1.9rem)] leading-none text-brand-cream group-hover/sub:text-brand-yellow group-hover/sub:translate-x-3 transition-all duration-300">
                {s.label}
              </span>
              {s.meta && <span className="u-label text-white/40 text-[10px] text-right hidden sm:inline">{s.meta}</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

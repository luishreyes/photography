import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { series } from '../data/series';
import { useI18n } from '../context/i18n';

const HERO_IMAGE = '/hero.webp';

export default function HomePage() {
  const { t, lang } = useI18n();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <main>
      {/* ── Hero ── */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Parallax photo */}
        <motion.div className="absolute inset-0" style={{ scale: heroScale }}>
          <img
            src={HERO_IMAGE}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/60 via-transparent to-brand-dark" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/40 to-transparent" />
        </motion.div>

        {/* Hero text */}
        <motion.div
          style={{ y: textY, opacity: heroOpacity }}
          className="relative z-10 h-full flex flex-col justify-end pb-20 px-8 md:px-16 max-w-7xl mx-auto"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-white/50 text-sm tracking-[0.25em] uppercase mb-4 font-medium"
          >
            {t('hero.kicker')}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight max-w-3xl"
          >
            {t('hero.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-4 text-white/60 text-lg font-medium"
          >
            {t('hero.sub')}
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="absolute bottom-8 right-8 md:right-16 flex flex-col items-center gap-2"
          >
            <span className="text-white/30 text-xs tracking-[0.2em] uppercase rotate-90 origin-center mb-4">{t('hero.scroll')}</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Series Grid ── */}
      <section className="bg-brand-dark py-24 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-white/30 text-xs tracking-[0.25em] uppercase mb-3">{t('work.kicker')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t('work.title')}
            </h2>
            <p className="mt-3 text-white/40 max-w-md">
              {t('work.intro')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {series.map((s, i) => (
              <SeriesCard key={s.slug} series={s} index={i} lang={lang} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function SeriesCard({ series: s, index, lang }: { series: typeof series[0]; index: number; lang: 'en' | 'es' }) {
  return (
    <div>
      <Link
        to={`/work/${s.slug}`}
        className="group relative block aspect-[4/5] overflow-hidden bg-zinc-900"
      >
        {/* Cover photo */}
        <img
          src={s.coverPhoto}
          alt={s.title}
          className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />

        {/* Gradient base para título siempre legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        {/* Overlay oscuro en hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-400" />

        {/* Yellow accent line */}
        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand-yellow transition-all duration-500 group-hover:w-full" />

        {/* Text */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-white/50 text-xs tracking-[0.2em] uppercase mb-1">{s.year}</p>
          <h3 className="text-white font-bold text-xl group-hover:text-brand-yellow transition-colors duration-300">
            {s.title}
          </h3>
          <p className="text-white/0 group-hover:text-white text-sm mt-2 transition-all duration-400 translate-y-2 group-hover:translate-y-0 leading-snug">
            {s.description[lang]}
          </p>
        </div>

        {/* Index number */}
        <div className="absolute top-5 right-5 text-white/10 text-5xl font-bold leading-none group-hover:text-brand-yellow/20 transition-colors duration-300">
          {String(index + 1).padStart(2, '0')}
        </div>
      </Link>
    </div>
  );
}

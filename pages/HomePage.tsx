import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { series, studies, looseYears } from '../data/catalog-data';
import { useI18n } from '../context/i18n';
import Footer from '../components/Footer';
import SmartImg from '../components/SmartImg';
import IndexRows from '../components/IndexRows';
import { Reveal, Clip } from '../components/Reveal';
import HorizontalTrack from '../components/HorizontalTrack';
import { colophon } from '../components/IndexColophon';

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
// La portada de cada colección de Obra, en pista horizontal. Cada foto lleva al
// interior de su colección.
function Selection({ lang }: { lang: 'en' | 'es' }) {
  const { t } = useI18n();
  const picks = series.map(s => {
    const cover = s.photos.find(p => p.src === s.coverPhoto) ?? s.photos[0];
    return { photo: cover, slug: s.slug, name: s.names ? s.names[lang] : s.title };
  });
  const intro = (
    <div className="flex-none flex flex-col justify-center w-[78vw] md:w-[36vw] md:pl-[var(--pad)]">
      <p className="eyebrow">{t('work.kicker')} · 001 — {String(series.length).padStart(3, '0')}</p>
      <h2 className="font-serif font-medium text-[clamp(34px,5vw,72px)] leading-[0.95] mt-4">{t('work.title')}</h2>
      <p className="mt-6 text-ink-soft text-[14px] md:text-[15px] leading-[1.6] max-w-[36ch]">{t('work.introShort')}</p>
      <Link to="/work" className="mt-6 font-mono text-[11px] tracking-[0.2em] uppercase text-muted hover:text-ink transition-colors">
        {t('home.enter')} →
      </Link>
    </div>
  );
  // Todas del mismo tamaño: cuadrado de 64vh, recorte centrado del webp
  // grande (1600 px), no del thumb de 640, para que aguante pantallas 2x.
  const slides = picks.map((pick, i) => (
    <Link key={pick.photo.id} to={`/work/${pick.slug}`} className="flex-none relative h-[52vh] md:h-[64vh] group">
      <span className="block h-full aspect-square overflow-hidden bg-paper-2">
        <SmartImg src={pick.photo.src} alt={pick.photo.title} loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]" />
      </span>
      <span className="flex justify-between gap-4 mt-3 font-mono text-[11px] tracking-[0.06em] text-muted">
        <span className="group-hover:text-ink transition-colors">{pick.name} / {String(i + 1).padStart(2, '0')}</span>
        <span className="truncate">{pick.photo.title}</span>
      </span>
    </Link>
  ));
  return <HorizontalTrack id="seleccion" intro={intro} slides={slides} />;
}

// ── Destacada ──────────────────────────────────────────────────────────────
// Chicago, con Filo. La foto va entera, contenida a 78vh sobre tinta (no a
// sangre: es vertical y a pantalla completa se comía la imagen), con un zoom
// leve mientras el tramo está fijo; el título flota encima y se apaga al salir.
const FEATURE = { slug: 'chicago', photoId: '20260824_filo' };

function Feature({ lang }: { lang: 'en' | 'es' }) {
  const { t } = useI18n();
  const study = studies.find(s => s.slug === FEATURE.slug) ?? studies[0];
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const scale = useTransform(p, [0, 1], [1, 1.08]);
  const copyY = useTransform(p, [0, 1], [24, -24]);
  const copyOpacity = useTransform(p, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);
  if (!study) return null;
  const photo = study.photos.find(ph => ph.id === FEATURE.photoId) ?? study.photos[0];
  return (
    <section ref={ref} className="relative h-[160vh] md:h-[200vh] bg-ink">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center gap-7 md:gap-9 px-6">
        <Link to={`/studies/${study.slug}`} aria-label={study.title} className="relative block h-[56vh] md:h-[62vh] overflow-hidden"
          style={{ aspectRatio: String(photo.ar ?? 0.6667) }}>
          <motion.div style={{ scale }} className="w-full h-full">
            <SmartImg src={photo.src} alt={photo.title} className="w-full h-full object-cover" />
          </motion.div>
        </Link>
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="text-center text-white">
          <p className="eyebrow !text-white/60">{t('home.feature')}</p>
          <Link to={`/studies/${study.slug}`} className="block font-serif font-medium text-[clamp(34px,6vw,84px)] leading-[0.95] mt-3 hover:italic transition-all">
            {study.names ? study.names[lang] : study.title}
          </Link>
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase mt-4 text-white/70">
            {photo.title} · {study.photos.length} {t('unit.images')} · {study.status === 'ongoing' ? t('studies.ongoing') : (study.span?.to ?? study.year)}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ── Último tomo ───────────────────────────────────────────────────────────
function Horizontal({ lang }: { lang: 'en' | 'es' }) {
  const { t } = useI18n();
  const tomo = looseYears[0];
  if (!tomo) return null;
  const photos = tomo.photos.slice(0, 8);
  const label = tomo.label ? tomo.label[lang] : tomo.year;
  const intro = (
    <div className="flex-none flex flex-col justify-center w-[78vw] md:w-[36vw] md:pl-[var(--pad)]">
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
  return <HorizontalTrack intro={intro} slides={slides} />;
}

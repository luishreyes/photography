import { Link } from 'react-router-dom';
import { series } from '../data/catalog-data';
import { useI18n } from '../context/i18n';
import Footer from '../components/Footer';
import SmartImg from '../components/SmartImg';

export default function WorkPage() {
  const { t, lang } = useI18n();
  return (
    <main className="min-h-screen bg-brand-dark pt-28 pb-16 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Colofón editorial: título a la izquierda, texto a la derecha; la grilla
            queda a ancho completo debajo (la obra nunca cede ancho al texto).
            El ancho de la columna del título escala con el mismo vw que la fuente
            (ver u-headcol en index.css) para que "Los Estudios", el título más
            largo del sitio, quepa en una línea en todo el rango lg+.
            self-start + self-end: el texto se posa en la base del título cuando
            es más bajo, y se alinea arriba cuando lo supera. Lo resuelve el flex
            (mide max(alturas) en cada ancho), sin media query ni JS. Mismo patrón
            en StudiesPage y LoosePage. */}
        <div className="border-t border-white/15 pt-4 mb-12 md:mb-16 lg:flex lg:gap-x-16">
          <div className="u-headcol lg:self-start">
            <p className="u-label text-white/40 text-[11px] mb-3">{t('work.kicker')}</p>
            <h1 className="font-disp font-light uppercase tracking-[0.01em] text-brand-yellow leading-[0.86] text-[clamp(3rem,11vw,8rem)]">{t('work.title')}</h1>
          </div>
          <div className="mt-5 lg:mt-0 lg:flex-1 lg:self-end max-w-2xl space-y-3">
            {t('work.intro').split('\n\n').map((para, i) => (
              <p key={i} className="text-brand-cream/70 leading-relaxed text-[15px] md:text-base">{para}</p>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
          {series.map((s, i) => (
            <Link
              key={s.slug}
              to={`/work/${s.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-zinc-900"
            >
              <SmartImg
                src={s.coverPhoto}
                alt={s.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
              />
              {/* Gradient base: año + título siempre legibles */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              {/* Overlay oscuro en hover para que el texto largo sea legible */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-400" />
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand-yellow transition-all duration-500 group-hover:w-full" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="u-label text-white/55 text-[10px] mb-1">{s.year}</p>
                {s.eye && (
                  <p className="u-label text-brand-yellow/70 text-[10px] mb-1.5">{s.eye[lang]}</p>
                )}
                <h3 className="font-disp font-normal uppercase tracking-[0.02em] text-white text-2xl md:text-3xl leading-none group-hover:text-brand-yellow transition-colors duration-300">{s.names ? s.names[lang] : s.title}</h3>
                <p className="text-white/0 group-hover:text-white text-sm mt-2 transition-all duration-400 translate-y-2 group-hover:translate-y-0 leading-snug">{s.description[lang]}</p>
              </div>
              <div className="absolute top-4 right-5 font-disp font-light text-white/15 text-6xl leading-none group-hover:text-brand-yellow/25 transition-colors duration-300">
                {String(i + 1).padStart(2, '0')}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-24"><Footer /></div>
    </main>
  );
}

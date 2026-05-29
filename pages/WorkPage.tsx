import { Link } from 'react-router-dom';
import { series } from '../data/series';
import { useI18n } from '../context/i18n';

export default function WorkPage() {
  const { t, lang } = useI18n();
  return (
    <main className="min-h-screen bg-brand-dark pt-24 pb-16 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-white/30 text-xs tracking-[0.25em] uppercase mb-3">{t('work.kicker')}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">{t('work.title')}</h1>
          <p className="mt-3 text-white/40 max-w-md">
            {t('work.introShort')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
          {series.map((s, i) => (
            <Link
              key={s.slug}
              to={`/work/${s.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-zinc-900"
            >
              <img
                src={s.coverPhoto}
                alt={s.title}
                className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {/* Gradient base: año + título siempre legibles */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              {/* Overlay oscuro en hover para que el texto largo sea legible */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-400" />
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand-yellow transition-all duration-500 group-hover:w-full" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/50 text-xs tracking-[0.2em] uppercase mb-1">{s.year}</p>
                <h3 className="text-white font-bold text-xl group-hover:text-brand-yellow transition-colors duration-300">{s.title}</h3>
                <p className="text-white/0 group-hover:text-white text-sm mt-2 transition-all duration-400 translate-y-2 group-hover:translate-y-0 leading-snug">{s.description[lang]}</p>
              </div>
              <div className="absolute top-5 right-5 text-white/10 text-5xl font-bold leading-none group-hover:text-brand-yellow/20 transition-colors duration-300">
                {String(i + 1).padStart(2, '0')}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

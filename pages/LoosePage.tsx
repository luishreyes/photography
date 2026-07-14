import { Link } from 'react-router-dom';
import { looseYears } from '../data/loose';
import { useI18n } from '../context/i18n';
import Footer from '../components/Footer';

export default function LoosePage() {
  const { t, lang } = useI18n();
  return (
    <main className="min-h-screen bg-brand-dark pt-28 pb-16 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="border-t border-white/15 pt-4 mb-12 md:mb-16">
          <p className="u-label text-white/40 text-[11px] mb-3">{t('loose.kicker')}</p>
          <h1 className="font-disp font-light uppercase tracking-[0.01em] text-brand-yellow leading-[0.86] text-[clamp(3rem,11vw,8rem)]">{t('loose.title')}</h1>
          <p className="mt-4 text-brand-cream/70 max-w-lg leading-relaxed">{t('loose.intro')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/5">
          {looseYears.map((y, i) => (
            <Link
              key={y.year}
              to={`/loose/${y.year}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-zinc-900"
            >
              <img
                src={y.coverPhoto}
                alt={y.year}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand-yellow transition-all duration-500 group-hover:w-full" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="u-label text-white/55 text-[10px] mb-1">
                  {y.photos.length} {y.photos.length === 1 ? (lang === 'es' ? 'imagen' : 'image') : (lang === 'es' ? 'imágenes' : 'images')}
                </p>
                <h3 className="font-disp font-normal uppercase tracking-[0.02em] text-white text-4xl md:text-5xl leading-none group-hover:text-brand-yellow transition-colors duration-300 tabular-nums">
                  {y.year}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-24"><Footer /></div>
    </main>
  );
}

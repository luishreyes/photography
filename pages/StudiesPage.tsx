import { Link } from 'react-router-dom';
import { studies } from '../data/studies';
import { useI18n } from '../context/i18n';
import Footer from '../components/Footer';

export default function StudiesPage() {
  const { t, lang } = useI18n();
  return (
    <main className="min-h-screen bg-brand-dark pt-28 pb-16 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="border-t border-white/15 pt-4 mb-12 md:mb-16">
          <p className="u-label text-white/40 text-[11px] mb-3">{t('studies.kicker')}</p>
          <h1 className="font-disp font-light uppercase tracking-[0.01em] text-brand-yellow leading-[0.86] text-[clamp(3rem,11vw,8rem)]">{t('studies.title')}</h1>
          <p className="mt-4 text-brand-cream/70 max-w-xl leading-relaxed">{t('studies.intro')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
          {studies.map(study => (
            <Link
              key={study.slug}
              to={`/studies/${study.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-zinc-900"
            >
              {study.coverPhoto && (
                <img
                  src={study.coverPhoto}
                  alt={study.title}
                  className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-400" />
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand-yellow transition-all duration-500 group-hover:w-full" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="u-label text-white/55 text-[10px] mb-1">
                  {study.status === 'ongoing' ? t('studies.ongoing') : study.year}
                </p>
                <h3 className="font-disp font-normal uppercase tracking-[0.02em] text-white text-2xl md:text-3xl leading-none group-hover:text-brand-yellow transition-colors duration-300">{study.title}</h3>
                <p className="text-white/0 group-hover:text-white text-sm mt-2 transition-all duration-400 translate-y-2 group-hover:translate-y-0 leading-snug">{study.description[lang]}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-24"><Footer /></div>
    </main>
  );
}

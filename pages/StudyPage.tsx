import { useParams, Link } from 'react-router-dom';
import { studies } from '../data/studies';
import { useI18n } from '../context/i18n';
import PhotoViewer from '../components/PhotoViewer';

export default function StudyPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useI18n();
  const study = studies.find(s => s.slug === slug);

  if (!study) return (
    <main className="min-h-screen bg-brand-dark flex items-center justify-center">
      <div className="text-center">
        <p className="text-white/40 mb-4">Study not found</p>
        <Link to="/studies" className="text-brand-yellow underline">{t('study.back')}</Link>
      </div>
    </main>
  );

  // Ongoing study with no photos yet: show the statement only.
  if (study.photos.length === 0) return (
    <main className="min-h-screen bg-brand-dark pt-28 pb-16 px-6 md:px-16">
      <div className="max-w-2xl mx-auto">
        <Link to="/studies" className="u-label text-white/40 text-[11px] hover:text-brand-yellow transition-colors mb-6 inline-block">
          {t('study.back')}
        </Link>
        <h1 className="font-disp font-light uppercase tracking-[0.01em] leading-[0.86] text-brand-yellow text-[clamp(3rem,12vw,8rem)]">{study.title}</h1>
        <p className="mt-4 text-brand-cream/70 text-base leading-relaxed">{study.description[lang]}</p>
        <p className="mt-10 u-label text-brand-yellow/70 text-[11px]">{t('studies.empty')}</p>
      </div>
    </main>
  );

  return (
    <PhotoViewer
      backHref="/studies"
      backLabel={t('study.back')}
      title={study.title}
      description={study.description[lang]}
      metaSuffix={study.year ? `· ${study.year}` : undefined}
      photos={study.photos}
      resetKey={study.slug}
    />
  );
}

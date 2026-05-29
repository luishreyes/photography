import { useParams, Link } from 'react-router-dom';
import { series } from '../data/series';
import { useI18n } from '../context/i18n';
import PhotoViewer from '../components/PhotoViewer';

export default function SeriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useI18n();
  const s = series.find(s => s.slug === slug);

  if (!s) return (
    <main className="min-h-screen bg-brand-dark flex items-center justify-center">
      <div className="text-center">
        <p className="text-white/40 mb-4">Series not found</p>
        <Link to="/work" className="text-brand-yellow underline">{t('series.back')}</Link>
      </div>
    </main>
  );

  return (
    <PhotoViewer
      backHref="/work"
      backLabel={t('series.back')}
      title={s.title}
      description={s.description[lang]}
      quote={s.quote}
      metaSuffix={`· ${s.year}`}
      photos={s.photos}
      resetKey={s.slug}
    />
  );
}

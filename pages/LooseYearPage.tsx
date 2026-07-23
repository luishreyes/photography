import { useParams, Link } from 'react-router-dom';
import { looseYears } from '../data/catalog-data';
import { useI18n } from '../context/i18n';
import PhotoViewer from '../components/PhotoViewer';

export default function LooseYearPage() {
  const { year } = useParams<{ year: string }>();
  const { t } = useI18n();
  const y = looseYears.find(y => y.year === year);

  if (!y) return (
    <main className="min-h-screen bg-brand-dark flex items-center justify-center">
      <div className="text-center">
        <p className="text-white/40 mb-4">Year not found</p>
        <Link to="/loose" className="text-brand-yellow underline">{t('loose.back')}</Link>
      </div>
    </main>
  );

  return (
    <PhotoViewer
      backHref="/loose"
      backLabel={t('loose.back')}
      title={y.year}
      photos={y.photos}
      resetKey={y.year}
    />
  );
}

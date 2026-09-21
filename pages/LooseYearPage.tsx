import { useParams, Link } from 'react-router-dom';
import { looseYears } from '../data/catalog-data';
import { useI18n } from '../context/i18n';
import PhotoViewer from '../components/PhotoViewer';

export default function LooseYearPage() {
  const { year } = useParams<{ year: string }>();
  const { t, lang } = useI18n();
  const y = looseYears.find(y => y.year === year);

  if (!y) return (
    <main className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center">
        <p className="eyebrow mb-4">{t('nf.volume')}</p>
        <Link to="/loose" className="font-serif italic text-xl hover:text-accent transition-colors">{t('loose.back')}</Link>
      </div>
    </main>
  );

  return (
    <PhotoViewer
      backHref="/loose"
      backLabel={t('loose.back')}
      title={y.label ? y.label[lang] : y.year}
      photos={y.photos}
      resetKey={y.year}
    />
  );
}

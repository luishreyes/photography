import { useParams, Link } from 'react-router-dom';
import { studies } from '../data/catalog-data';
import { useI18n } from '../context/i18n';
import PhotoViewer from '../components/PhotoViewer';

export default function StudyPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useI18n();
  const study = studies.find(s => s.slug === slug);

  if (!study) return (
    <main className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center">
        <p className="eyebrow mb-4">{t('nf.study')}</p>
        <Link to="/studies" className="font-serif italic text-xl hover:text-accent transition-colors">{t('study.back')}</Link>
      </div>
    </main>
  );

  // Ongoing study with no photos yet: show the statement only.
  if (study.photos.length === 0) return (
    <main className="min-h-screen bg-paper pad-x pt-[16vh] pb-24">
      <div className="max-w-[54ch]">
        <Link to="/studies" className="eyebrow hover:text-ink transition-colors mb-8 inline-block">
          {t('study.back')}
        </Link>
        <h1 className="display text-[clamp(38px,6.5vw,96px)]">{(study.names ? study.names[lang] : study.title)}</h1>
        <p className="mt-6 text-ink-soft text-[clamp(15px,1.15vw,18px)] leading-[1.7]">{study.description[lang]}</p>
        <p className="mt-10 eyebrow">{t('studies.empty')}</p>
      </div>
    </main>
  );

  return (
    <PhotoViewer
      backHref="/studies"
      backLabel={t('study.back')}
      title={(study.names ? study.names[lang] : study.title)}
      description={study.description[lang]}
      quote={study.quote}
      metaSuffix={study.year ? `· ${study.year}` : undefined}
      photos={study.photos}
      resetKey={study.slug}
    />
  );
}

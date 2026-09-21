import { studies } from '../data/catalog-data';
import { useI18n } from '../context/i18n';
import Footer from '../components/Footer';
import IndexColophon from '../components/IndexColophon';
import IndexRows from '../components/IndexRows';
import { Reveal } from '../components/Reveal';

export default function StudiesPage() {
  const { t, lang } = useI18n();
  const items = studies.map(s => ({
    to: `/studies/${s.slug}`,
    name: s.names ? s.names[lang] : s.title,
    meta: `${s.photos.length} · ${s.status === 'ongoing' ? t('studies.ongoing') : (s.span?.to ?? s.year ?? '')}`,
    cover: s.coverPhoto,
  }));
  return (
    <main className="min-h-screen bg-paper">
      <div className="pad-x pt-[16vh] pb-[clamp(60px,9vh,120px)]">
        <div className="lg:grid lg:grid-cols-2 lg:gap-[var(--pad)] lg:items-end">
          <Reveal>
            <h1 className="display text-[clamp(54px,9vw,150px)]">{t('studies.title')}</h1>
            <IndexColophon groups={studies} unit="unit.studies" />
          </Reveal>
          <Reveal delay={2} className="mt-8 lg:mt-0 max-w-[54ch]">
            <p className="text-ink-soft text-[clamp(15px,1.15vw,18px)] leading-[1.7]">{t('studies.intro')}</p>
          </Reveal>
        </div>
        <Reveal delay={1} className="mt-[clamp(48px,8vh,110px)]">
          <IndexRows items={items} preview />
        </Reveal>
      </div>
      <Footer />
    </main>
  );
}

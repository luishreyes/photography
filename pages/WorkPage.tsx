import { series } from '../data/catalog-data';
import { useI18n } from '../context/i18n';
import Footer from '../components/Footer';
import IndexColophon from '../components/IndexColophon';
import IndexRows from '../components/IndexRows';
import { Reveal } from '../components/Reveal';

export default function WorkPage() {
  const { t, lang } = useI18n();
  const items = series.map(s => ({
    to: `/work/${s.slug}`,
    name: s.names ? s.names[lang] : s.title,
    meta: s.span ? (s.span.from === s.span.to ? s.span.from : `${s.span.from} — ${s.span.to}`) : String(s.year ?? ''),
    cover: s.coverPhoto,
  }));
  return (
    <main className="min-h-screen bg-paper">
      <div className="pad-x pt-[16vh] pb-[clamp(60px,9vh,120px)]">
        <div className="lg:grid lg:grid-cols-2 lg:gap-[var(--pad)] lg:items-end">
          <Reveal>
            <p className="eyebrow mb-5">{t('work.kicker')}</p>
            <h1 className="display text-[clamp(54px,9vw,150px)]">{t('work.title')}</h1>
            <IndexColophon groups={series} unit="unit.collections" />
          </Reveal>
          <Reveal delay={2} className="mt-8 lg:mt-0 space-y-4 max-w-[54ch]">
            {t('work.intro').split('\n\n').map((para, i) => (
              <p key={i} className="text-ink-soft text-[clamp(15px,1.15vw,18px)] leading-[1.7]">{para}</p>
            ))}
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

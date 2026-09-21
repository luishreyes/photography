import { series } from '../data/catalog-data';
import { useI18n } from '../context/i18n';
import Footer from '../components/Footer';
import IndexColophon from '../components/IndexColophon';
import IndexRows from '../components/IndexRows';
import { Reveal } from '../components/Reveal';

export default function WorkPage() {
  const { t, lang } = useI18n();
  // El enunciado dice que las colecciones se nombran con un verbo ("el ojo que
  // organiza"), así que el índice muestra eso como título; el nombre corto
  // (Geometrías) y los años van a la derecha, en mono. Decisión de Luis, 2026-09-21.
  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
  const items = series.map(s => {
    const name = s.names ? s.names[lang] : s.title;
    const years = s.span ? (s.span.from === s.span.to ? s.span.from : `${s.span.from} — ${s.span.to}`) : String(s.year ?? '');
    return {
      to: `/work/${s.slug}`,
      name: s.eye ? cap(s.eye[lang]) : name,
      meta: s.eye ? `${name} · ${years}` : years,
      cover: s.coverPhoto,
    };
  });
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

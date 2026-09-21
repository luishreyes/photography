import { Link } from 'react-router-dom';
import { useI18n, type UIKey } from '../context/i18n';
import Footer from '../components/Footer';
import IndexRows from '../components/IndexRows';
import { Reveal } from '../components/Reveal';

const DESTINOS: { key: UIKey; to: string }[] = [
  { key: 'work.title', to: '/work' },
  { key: 'studies.title', to: '/studies' },
  { key: 'loose.title', to: '/loose' },
  { key: 'contact.title', to: '/contact' },
];

// Cualquier dirección que no sea una ruta del sitio. Antes no existía y una
// URL vieja o mal escrita dejaba la página en blanco, con la barra sola.
export default function NotFoundPage() {
  const { t } = useI18n();
  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <div className="pad-x pt-[16vh] pb-[clamp(60px,9vh,120px)] flex-1">
        <Reveal>
          <p className="eyebrow mb-5">404</p>
          <h1 className="display text-[clamp(44px,8vw,120px)]">{t('nf.title')}</h1>
          <p className="mt-6 text-ink-soft text-[clamp(15px,1.15vw,18px)] leading-[1.7] max-w-[46ch]">{t('nf.intro')}</p>
        </Reveal>
        <Reveal delay={1} className="mt-[clamp(40px,7vh,90px)] max-w-3xl">
          <IndexRows items={DESTINOS.map(d => ({ to: d.to, name: t(d.key) }))} />
        </Reveal>
        <Reveal delay={2} className="mt-10">
          <Link to="/" className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted hover:text-ink transition-colors">
            {t('nf.home')} →
          </Link>
        </Reveal>
      </div>
      <Footer />
    </main>
  );
}

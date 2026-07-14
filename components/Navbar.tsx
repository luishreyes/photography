import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n, type UIKey } from '../context/i18n';

const links: { key: UIKey; href: string }[] = [
  { key: 'nav.work',    href: '/work' },
  { key: 'nav.studies', href: '/studies' },
  { key: 'nav.loose',   href: '/loose' },
  { key: 'nav.contact', href: '/contact' },
];

function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`flex items-center gap-1.5 text-xs font-semibold tracking-[0.16em] ${className}`}>
      <button
        onClick={() => setLang('es')}
        className={lang === 'es' ? 'text-brand-yellow' : 'text-white/40 hover:text-white transition-colors'}
        aria-label="Español"
      >
        ES
      </button>
      <span className="text-white/20">/</span>
      <button
        onClick={() => setLang('en')}
        className={lang === 'en' ? 'text-brand-yellow' : 'text-white/40 hover:text-white transition-colors'}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}

function Wordmark() {
  const { lang } = useI18n();
  return (
    <Link to="/" className="flex items-center gap-2.5 group" aria-label="Luis H. Reyes">
      <span className="font-disp font-normal uppercase tracking-[0.06em] text-xl leading-none text-white group-hover:text-brand-yellow transition-colors">
        Luis H. Reyes
      </span>
      <span className="u-label text-[8.5px] text-brand-cream/70 hidden sm:inline">
        {lang === 'es' ? 'Fotografía' : 'Photography'}
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-brand-dark/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Wordmark />

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {links.map(({ key, href }) => (
                <li key={href}>
                  <Link
                    to={href}
                    className={`u-label text-[11px] transition-colors ${
                      location.pathname.startsWith(href)
                        ? 'text-brand-yellow'
                        : 'text-white/55 hover:text-white'
                    }`}
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
            <span className="w-px h-4 bg-white/15" />
            <LangToggle />
          </div>

          {/* Mobile: toggle de idioma + hamburguesa */}
          <div className="lg:hidden flex items-center gap-4">
            <LangToggle />
            <button
              className="flex flex-col gap-1.5 p-1"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
            >
              <span className={`block w-5 h-px bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-px bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-px bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-brand-dark flex flex-col items-center justify-center gap-10"
          >
            {links.map(({ key, href }) => (
              <Link
                key={href}
                to={href}
                className="font-disp font-light uppercase tracking-wide text-5xl text-white hover:text-brand-yellow transition-colors"
              >
                {t(key)}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

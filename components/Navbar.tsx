import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n, type UIKey } from '../context/i18n';
import { EASE } from './Reveal';

const links: { key: UIKey; href: string }[] = [
  { key: 'nav.work',    href: '/work' },
  { key: 'nav.studies', href: '/studies' },
  { key: 'nav.loose',   href: '/loose' },
  { key: 'nav.contact', href: '/contact' },
];

function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`flex items-center gap-1.5 font-mono text-[11px] tracking-[0.18em] ${className}`}>
      <button onClick={() => setLang('es')} aria-label="Español"
        className={lang === 'es' ? 'opacity-100' : 'opacity-45 hover:opacity-100 transition-opacity'}>ES</button>
      <span className="opacity-30">/</span>
      <button onClick={() => setLang('en')} aria-label="English"
        className={lang === 'en' ? 'opacity-100' : 'opacity-45 hover:opacity-100 transition-opacity'}>EN</button>
    </div>
  );
}

// Barra fija en `mix-blend-mode: difference`: blanca sobre el papel se ve
// negra, y sobre una foto en B&N invierte lo que tenga debajo, así que
// siempre se lee. Los enlaces en mono con subrayado que crece.
export default function Navbar() {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[80] blend-diff text-white pointer-events-none">
        <nav className="flex items-center justify-between py-5 pad-x pointer-events-auto">
          <Link to="/" className="font-serif font-semibold text-[19px] tracking-[-0.01em] leading-none" aria-label="Luis H. Reyes">
            Luis H. Reyes
          </Link>

          <div className="hidden md:flex items-center gap-[clamp(14px,2.4vw,40px)]">
            {links.map(({ key, href }) => (
              <Link key={href} to={href}
                className={`u-grow font-mono text-[11px] tracking-[0.18em] uppercase py-1 ${
                  location.pathname.startsWith(href) ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                }`}>
                {t(key)}
              </Link>
            ))}
            <span className="w-px h-3.5 bg-white/40" />
            <LangToggle />
          </div>

          <div className="md:hidden flex items-center gap-5">
            <LangToggle />
            <button className="flex flex-col gap-1.5 p-1" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              <span className={`block w-5 h-px bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
              <span className={`block w-5 h-px bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-0 z-[70] bg-paper flex flex-col justify-end pad-x pb-[14vh]"
          >
            <ul className="border-t border-hair">
              {links.map(({ key, href }, i) => (
                <motion.li key={href}
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.08 + i * 0.06 }}
                  className="border-b border-hair">
                  <Link to={href} className="flex items-baseline justify-between py-5">
                    <span className="display text-[clamp(38px,11vw,64px)]">{t(key)}</span>
                    <span className="eyebrow">0{i + 1}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

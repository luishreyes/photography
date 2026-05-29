import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { label: 'Work', href: '/work' },
  { label: 'Studies', href: '/studies' },
  { label: 'Loose', href: '/loose' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
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
          <Link to="/" className="font-bold text-lg tracking-tight text-white hover:text-brand-yellow transition-colors">
            LHR
          </Link>

          {/* Desktop */}
          <ul className="hidden lg:flex items-center gap-8">
            {links.map(({ label, href }) => (
              <li key={href}>
                <Link
                  to={href}
                  className={`text-sm font-medium tracking-wide transition-colors ${
                    location.pathname.startsWith(href)
                      ? 'text-brand-yellow'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile toggle */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-1"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span className={`block w-5 h-px bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-px bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
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
            {links.map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                className="text-3xl font-bold text-white hover:text-brand-yellow transition-colors"
              >
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

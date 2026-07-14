import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Lang = 'en' | 'es';

// ── UI strings ──────────────────────────────────────────────
const ui = {
  // Nav
  'nav.work':     { en: 'Work',        es: 'Obra' },
  'nav.studies':  { en: 'Studies',     es: 'Estudios' },
  'nav.loose':    { en: 'Loose',       es: 'Sueltas' },
  'nav.contact':  { en: 'Contact',     es: 'Contacto' },

  // Hero
  'hero.kicker':  { en: 'Luis H. Reyes — Black & White Fine Art Photography', es: 'Luis H. Reyes — Fotografía Artística en Blanco y Negro' },
  'hero.title':   { en: "There's a version of every scene that only shows up when you strip the color away.", es: 'Hay una versión de cada escena que solo aparece cuando le quitas el color.' },
  'hero.sub':     { en: "That's the one I'm after.", es: 'Esa es la que busco.' },
  'hero.scroll':  { en: 'Scroll', es: 'Scroll' },

  // Collections / Work
  'work.kicker':  { en: 'Collections', es: 'Colecciones' },
  'work.title':   { en: 'The Work', es: 'La Obra' },
  'work.intro':   { en: "Six series. They follow an order, but you don't have to. Pick whatever catches your eye, or start at the top and let the sequence do its thing.", es: 'Seis series. Siguen un orden, pero no tienes que seguirlo. Elige la que te llame la atención, o empieza por arriba y deja que la secuencia haga lo suyo.' },
  'work.introShort': { en: "Six series. They follow an order, but you don't have to.", es: 'Seis series. Siguen un orden, pero no tienes que seguirlo.' },

  // Series page
  'series.back':  { en: '← Work', es: '← Obra' },
  'series.count': { en: 'photographs', es: 'fotografías' },
  'lightbox.close': { en: 'Close', es: 'Cerrar' },

  // Loose
  'loose.title':  { en: 'The Loose', es: 'Las Sueltas' },
  'loose.kicker': { en: 'Loose', es: 'Sueltas' },
  'loose.intro':  { en: "Photographs that don't belong to any series. Kept loose, ordered by year.", es: 'Fotografías que no pertenecen a ninguna serie. Sueltas, ordenadas por año.' },
  'loose.back':   { en: '← Loose', es: '← Sueltas' },
  'loose.year':   { en: 'Year', es: 'Año' },

  // Studies
  'studies.kicker': { en: 'Studies', es: 'Estudios' },
  'studies.title':  { en: 'The Studies', es: 'Los Estudios' },
  'studies.intro':  { en: "Collections have rules. Studies work differently. One subject, one inquiry, as many images as the subject demands. The only rule is that each photograph has to say something the others don't.", es: 'Las colecciones tienen reglas. Los estudios funcionan distinto. Un sujeto, una indagación, tantas imágenes como el sujeto demande. La única regla es que cada fotografía diga algo que las demás no dicen.' },
  'studies.ongoing': { en: 'Ongoing', es: 'En progreso' },
  'studies.empty':   { en: 'Coming soon', es: 'Próximamente' },
  'study.back':      { en: '← Studies', es: '← Estudios' },

  // Placeholders
  'soon': { en: 'coming soon', es: 'próximamente' },
} as const;

export type UIKey = keyof typeof ui;

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: UIKey) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

const STORAGE_KEY = 'lhr-photo-lang';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved === 'en' || saved === 'es') return saved;
    // Default to Spanish if the browser is Spanish, else English
    return navigator.language.startsWith('es') ? 'es' : 'en';
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const toggle = () => setLangState(l => (l === 'en' ? 'es' : 'en'));
  const t = (key: UIKey) => ui[key][lang];

  return (
    <I18nContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

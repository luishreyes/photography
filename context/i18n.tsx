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
  'hero.kicker':  { en: 'Black & White Photography', es: 'Fotografía en Blanco y Negro' },
  'hero.title':   { en: "There's a version of every scene that only shows up when you strip the color away.", es: 'Hay una versión de cada escena que solo aparece cuando le quitas el color.' },
  'hero.sub':     { en: "That's the one I'm after.", es: 'Esa es la que busco.' },
  'hero.scroll':  { en: 'Scroll', es: 'Scroll' },

  // Collections / Work
  'work.kicker':  { en: 'Collections', es: 'Colecciones' },
  'work.title':   { en: 'The Work', es: 'La Obra' },
  'work.intro':   { en: "Each collection is a way of looking, not a subject. That's why I named them with a verb: the eye that organizes, that dissolves, that finds, that remembers, that contemplates, that loves.\n\nI left them in that order because it's the path they took. I start far away, imposing geometry on the world, until that geometry dissolves. Then the eye stops ordering and starts finding, and what it finds stays with it as memory. Near the end it slows down enough to contemplate, and it finishes close, among the people I love. The distance keeps closing until there's none left.\n\nStart wherever you like. You can break the order. That doesn't mean it isn't there.", es: "Cada colección es una manera de mirar, no un tema. Por eso las nombré con un verbo: el ojo que organiza, el que disuelve, el que encuentra, el que recuerda, el que contempla, el que ama.\n\nLas dejé en ese orden porque es el camino que hicieron. Empiezo lejos, imponiéndole geometría al mundo, hasta que esa geometría se disuelve. Entonces el ojo deja de ordenar y empieza a encontrar, y lo que encuentra se le queda como memoria. Al final se detiene lo suficiente para contemplar, y termina cerca, entre la gente que quiero. La distancia se va cerrando hasta que no queda ninguna.\n\nEntra por donde quieras. Que puedas romper el orden no significa que no esté." },
  'work.introShort': { en: "Six ways of looking. There's an order, even if you break it.", es: 'Seis maneras de mirar. Hay un orden, aunque puedas romperlo.' },

  // Series page
  'series.back':  { en: '← Work', es: '← Obra' },
  'series.count': { en: 'photographs', es: 'fotografías' },
  'lightbox.close': { en: 'Close', es: 'Cerrar' },

  // Loose
  'loose.title':  { en: 'The Loose', es: 'Las Sueltas' },
  'loose.intro':  { en: "Photographs that don't belong to any series. Kept loose, ordered by year.", es: 'Fotografías que no pertenecen a ninguna serie. Sueltas, ordenadas por año.' },
  'loose.back':   { en: '← Loose', es: '← Sueltas' },
  'loose.year':   { en: 'Year', es: 'Año' },

  // Studies
  'studies.title':  { en: 'The Studies', es: 'Los Estudios' },
  'studies.intro':  { en: "Collections have rules. Studies work differently. One subject, one inquiry, as many images as the subject demands. The only rule is that each photograph has to say something the others don't.", es: 'Las colecciones tienen reglas. Los estudios funcionan distinto. Un sujeto, una indagación, tantas imágenes como el sujeto demande. La única regla es que cada fotografía diga algo que las demás no dicen.' },
  'studies.ongoing': { en: 'Ongoing', es: 'En progreso' },
  'studies.empty':   { en: 'Coming soon', es: 'Próximamente' },
  'study.back':      { en: '← Studies', es: '← Estudios' },

  // Contact
  'contact.kicker': { en: 'Get in touch', es: 'Hablemos' },
  'contact.title':  { en: 'Contact', es: 'Contacto' },
  'contact.intro':  { en: 'For commissions, prints, or just to say hello — write me. I read everything.', es: 'Para comisiones, impresiones o simplemente para saludar, escríbeme. Leo todo.' },
  'contact.cta':    { en: 'Write me', es: 'Escríbeme' },
  'contact.based':  { en: 'Based in Bogotá, Colombia', es: 'En Bogotá, Colombia' },
  'contact.back':   { en: '← Home', es: '← Inicio' },

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

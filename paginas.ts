/**
 * Las páginas del sitio que tienen HTML propio: dirección, título, descripción
 * y foto para las vistas previas de enlaces. `scripts/prerender.mjs` escribe con
 * esto un HTML por página después de `vite build`, para que cada dirección
 * responda 200 con su título y su contenido sin ejecutar JavaScript;
 * `components/Metadatos.tsx` pone el mismo título y la misma dirección canónica
 * al navegar dentro de la app.
 *
 * Las colecciones, los estudios y los tomos salen solos de `data/catalog-data.ts`.
 * Una ruta nueva en App.tsx necesita aquí su página (el prerender avisa si falta).
 */
import { series, studies, looseYears } from './data/catalog-data';
import { ui, type Lang, type UIKey } from './context/i18n';

/** El dominio de `public/CNAME`. */
export const SITIO = 'https://photography.luishreyes.com';

type Bilingue = { en: string; es: string };

export interface Pagina {
  /** Sin barra final, salvo la portada. */
  ruta: string;
  /** Título completo de la pestaña. */
  titulo: Bilingue;
  descripcion: Bilingue;
  /** Foto para las vistas previas de enlaces. */
  imagen: string;
}

const texto = (clave: UIKey): Bilingue => ({ en: ui[clave].en, es: ui[clave].es });

/** «Geometrías · Fotografía de Luis H. Reyes». */
const titulo = (nombre: Bilingue): Bilingue => ({
  en: `${nombre.en} · Photography by Luis H. Reyes`,
  es: `${nombre.es} · Fotografía de Luis H. Reyes`,
});

const PORTADA: Pagina = {
  ruta: '/',
  titulo: { en: 'Luis H. Reyes · Black & white photography', es: 'Luis H. Reyes · Fotografía en blanco y negro' },
  descripcion: {
    en: 'Black & white photography by Luis H. Reyes, in Bogotá: the work, the studies and the loose photographs.',
    es: 'Fotografía en blanco y negro de Luis H. Reyes, en Bogotá: la obra, los estudios y las fotos sueltas.',
  },
  imagen: '/hero.webp',
};

/**
 * Direcciones viejas: `/study/<slug>` salió en leyendas de Instagram (ver
 * LegacyStudy en App.tsx). El build les deja una página que redirige.
 */
export const REDIRECCIONES: { desde: string; hacia: string }[] = [
  { desde: '/study', hacia: '/studies' },
  ...studies.map((s) => ({ desde: `/study/${s.slug}`, hacia: `/studies/${s.slug}` })),
];

let cache: Pagina[] | null = null;

/** Todas las páginas con HTML propio, en el orden del menú. */
export function paginas(): Pagina[] {
  cache ??= [
    PORTADA,
    { ruta: '/work', titulo: titulo(texto('work.title')), descripcion: texto('work.introShort'), imagen: series[0].coverPhoto },
    ...series.map((s): Pagina => ({
      ruta: `/work/${s.slug}`,
      titulo: titulo(s.names ?? { en: s.title, es: s.title }),
      descripcion: s.description,
      imagen: s.coverPhoto,
    })),
    { ruta: '/studies', titulo: titulo(texto('studies.title')), descripcion: texto('studies.intro'), imagen: studies[0].coverPhoto ?? PORTADA.imagen },
    ...studies.map((s): Pagina => ({
      ruta: `/studies/${s.slug}`,
      titulo: titulo(s.names ?? { en: s.title, es: s.title }),
      descripcion: s.description,
      imagen: s.coverPhoto ?? PORTADA.imagen,
    })),
    { ruta: '/loose', titulo: titulo(texto('loose.title')), descripcion: texto('loose.intro'), imagen: looseYears[0].coverPhoto },
    ...looseYears.map((g): Pagina => {
      const tomo = g.label ?? { en: g.year, es: g.year };
      return {
        ruta: `/loose/${g.year}`,
        titulo: titulo({ en: `${ui['loose.title'].en}, ${tomo.en}`, es: `${ui['loose.title'].es}, ${tomo.es}` }),
        descripcion: { en: `${tomo.en}. ${ui['loose.intro'].en}`, es: `${tomo.es}. ${ui['loose.intro'].es}` },
        imagen: g.coverPhoto,
      };
    }),
    { ruta: '/contact', titulo: titulo(texto('contact.title')), descripcion: texto('contact.intro'), imagen: PORTADA.imagen },
  ];
  return cache;
}

const sinBarra = (ruta: string): string => (ruta.length > 1 ? ruta.replace(/\/+$/, '') : ruta);

let porRuta: Map<string, Pagina> | null = null;

/** La página de una dirección (con o sin barra final), si tiene HTML propio. */
export function paginaDe(pathname: string): Pagina | undefined {
  porRuta ??= new Map(paginas().map((p) => [p.ruta, p]));
  return porRuta.get(sinBarra(pathname));
}

/**
 * Si la dirección tiene páginas debajo (/work tiene /work/geometries). Esas
 * páginas se escriben como work.html y también como work/index.html: GitHub
 * Pages sirve work.html para /work aunque exista la carpeta, y el index.html
 * responde a quien llega con barra final.
 */
export function tieneHijas(ruta: string): boolean {
  if (ruta === '/') return false;
  const prefijo = `${ruta}/`;
  return paginas().some((p) => p.ruta.startsWith(prefijo)) || REDIRECCIONES.some((r) => r.desde.startsWith(prefijo));
}

/** La dirección completa que se declara como canónica y va en el sitemap. */
export const canonica = (ruta: string): string => `${SITIO}${ruta}`;

/** El título de la pestaña; lo que no tiene página (una dirección inventada) lleva el de la portada. */
export const tituloDe = (p: Pagina | undefined, lang: Lang): string => (p ?? PORTADA).titulo[lang];

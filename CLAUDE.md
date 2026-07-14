# Portafolio Fotográfico — Luis H. Reyes

> **Leer este archivo al inicio de cada sesión de trabajo.**

## Proyecto

Portafolio de fotografía artística en blanco y negro, hospedado en GitHub Pages.

- **Repo:** `luishreyes/photography` (público)
- **URL live:** https://photography.luishreyes.com — ✓ EN PRODUCCIÓN (HTTPS forzado)
- **Stack:** React 19 + TypeScript + Vite + React Router 7 + Tailwind CSS + Framer Motion
- **Deploy:** ✓ Automático al pushear a `main` (`.github/workflows/deploy.yml` → GitHub Pages)
  - `public/CNAME` = `photography.luishreyes.com` (custom domain también seteado vía API)
  - `public/404.html` = redirect SPA (rafgraph/spa-github-pages) para rutas directas
  - El workflow fuerza Node 24 en las JS actions (`FORCE_JAVASCRIPT_ACTIONS_TO_NODE24`)
- **Imágenes:** WebP optimizados servidos **localmente** desde `public/photography/{serie}/` (NO Supabase). Los originales hi-res viven en `originals/{serie}/` y NO se versionan en git.

## Estructura del proyecto

```
data/
  series.ts         ← Definición de todas las series y fotos (FUENTE DE VERDAD)
context/
  i18n.tsx          ← Sistema de idiomas EN/ES (provider + hook + strings de UI)
components/
  Navbar.tsx        ← Navegación fija + mobile menu + toggle EN/ES
pages/
  HomePage.tsx      ← Landing: hero a pantalla completa + grid de series
  WorkPage.tsx      ← Índice de todas las series (✓ construida)
  SeriesPage.tsx    ← Galería masonry con lightbox (✓ construida)
App.tsx             ← <I18nProvider> + Router. Studies/Loose/Contact son placeholders inline
originals/          ← Originales hi-res por serie (NO versionado — ver .gitignore)
  {serie}/
public/
  hero.webp         ← Foto hero de la landing (DEBE estar en public/, no en raíz)
  photography/      ← WebP optimizados servidos en producción
    {serie}/
      cover.webp
      01-titulo.webp ... 12-titulo.webp
  CNAME             ← photography.luishreyes.com
  404.html          ← redirect SPA para rutas directas
```

## Colores del sistema (Tailwind)

Dirección **editorial** (amarillo ácido sobre negro):
- `brand-dark`: #0A0A0A — fondo principal
- `brand-yellow`: #C9C41C — acento (amarillo ácido)
- `brand-yellow-dark`: #A8A417 — hover de acento
- `brand-cream`: #EDEBE4 — texto principal
- `brand-gray`: #8C887D — texto secundario

## Tipografía

- **Big Shoulders Display Variable** (`font-disp`) — display monumental, condensado, alto contraste. Titulares en `uppercase font-light` (peso ~300). Autoalojada vía `@fontsource-variable/big-shoulders-display`.
- **Archivo Variable** (`font-sans`, body) — texto y etiquetas. Etiquetas con tracking ancho vía `.u-label`. Autoalojada vía `@fontsource-variable/archivo`.
- Helpers en `index.css`: `.u-label` (Archivo 700 uppercase tracking .32em) y `.u-disp` (Big Shoulders 300 uppercase).
- No usar Google Fonts CDN.

## Animación del hero (home)

El hero **es** el landing (sin splash aparte). Entrada con framer-motion: flash de cámara → foto B/N con leve Ken Burns → nombre sube con máscara de línea. Al hacer scroll (`useScroll`/`useTransform`) el bloque sale del frame y la foto hace parallax, estilo Apple. El índice de la home son **tres puertas monumentales** (Work/Studies/Loose) que despliegan sub-ítems en hover (desktop) o tap (móvil).

## Idiomas (i18n) — EN / ES

El sitio es **bilingüe** con toggle EN/ES en el navbar. Implementado en `context/i18n.tsx`.

- **`useI18n()`** expone `{ lang, setLang, toggle, t }`. `lang` es `'en' | 'es'`.
- **Persistencia:** `localStorage` key `lhr-photo-lang`. Por defecto detecta el idioma del navegador.
- **Strings de UI:** objeto `ui` en `i18n.tsx`, tipado por `UIKey`. Se accede con `t('clave')`.
  - **Al agregar texto nuevo de interfaz:** añadir la clave en `ui` con `{ en, es }` y usar `t('...')`. NUNCA hardcodear texto visible en los componentes.

### Qué se traduce y qué NO
| Contenido | ¿Traducido? | Dónde |
|---|---|---|
| Menú, etiquetas, hero, botones, lightbox | ✓ EN/ES | `ui` en `i18n.tsx` |
| **Statements** de cada serie (`description`) | ✓ EN/ES | `description: { en, es }` en `series.ts` |
| **Citas** de fotógrafos (`quote`) | ✗ solo inglés (original) | `series.ts` |
| **Títulos de fotos** y de series | ✗ solo inglés (original) | `series.ts` |

⚠️ Al **agregar una serie nueva**, `description` DEBE ser `{ en: '...', es: '...' }`. Si solo tienes el inglés, traduce el statement al español manteniendo el tono personal y en primera persona (la revisa el usuario).

## Imágenes

**IMPORTANTE:** Las fotos se sirven **localmente** desde `public/photography/`, NO desde Supabase. `sips` no soporta WebP en esta máquina; se usa **ImageMagick (`magick`)**. `ffmpeg` tiene una dependencia rota (libx265) — no usar.

### Flujo para procesar una serie nueva
Cuando el usuario sube los originales a la raíz de `Photography/`:

1. **Consultar orden y títulos** en el sitio actual: `https://luishreyes.myportfolio.com/{slug}` (WebFetch). El orden de visualización lo manda Adobe Portfolio, NO el número en el nombre del archivo.
2. **Mover originales** a `originals/{serie}/` (preservar nombres `fecha-NN-titulo`).
3. **Copiar + renombrar limpio** a `public/photography/{serie}/` como `01-titulo.jpg`, `02-titulo.jpg`, ... + `cover.jpg` (= primera foto). Slugs en kebab-case minúscula.
4. **Convertir a WebP** (máx 2000px, calidad 85):
   ```bash
   for f in 0*.jpg 1*.jpg cover.jpg; do
     magick "$f" -resize "2000x2000>" -quality 85 "${f%.jpg}.webp"
   done
   ```
5. **Obtener dimensiones** de cada WebP con `sips -g pixelWidth -g pixelHeight` (necesarias para el masonry).
6. **Registrar en `data/series.ts`**: `coverPhoto` → `.webp`, y poblar `photos[]` con `id`, `title`, `src` (ruta `/photography/...`), `width`, `height`.

Resultado típico: 6.7MB JPG → ~250KB WebP.

## Series

Definidas en `data/series.ts`. Cada serie tiene:
- `slug` — URL friendly (`in-passing`, no `in passing`)
- `title` — nombre visible
- `year`
- `description` — `{ en, es }` párrafo intro (EN verbatim de Adobe Portfolio; ES traducido)
- `quote?` — `{ text, author }` cita de fotógrafo (solo inglés, de Adobe Portfolio)
- `coverPhoto` — ruta local `.webp` de la portada
- `photos[]` — array con `id`, `title`, `src`, `width`, `height` (en orden de Adobe Portfolio)

### Estado de las series

| Slug | Título | Estado |
|---|---|---|
| `geometries` | Geometries | ✓ 12 fotos + texto + quote |
| `abstractions` | Abstractions | ✓ 12 fotos + texto + quote |
| `in-passing` | In Passing | ✓ 12 fotos + texto + quote |
| `elsewhere` | Elsewhere | ✓ 12 fotos + texto + quote |
| `organic` | Organic | ✓ 12 fotos + texto + quote |
| `close` | Close | ✓ 12 fotos + texto + quote |

## Páginas

### SeriesPage (`/work/:slug`) — ✓ construida (galería limpia responsive, inspirada en franklinyeep.com)
`SeriesPage` (y `StudyPage`) renderizan `<PhotoViewer>` (`components/PhotoViewer.tsx`), un **único componente responsive** para todos los breakpoints (ya NO hay visor cinematográfico ni switch por hook). Página con scroll vertical normal (`min-h-screen`).

- **Encabezado editorial**: back link (`.u-label`) + título monumental (`font-disp font-light uppercase` en `brand-yellow`, `clamp(2.6rem,10vw,7rem)`) + descripción (`text-brand-cream/70`, `max-w-2xl`). Sin quote. Centrado en `max-w-screen-xl`.
- **Grid de thumbnails cuadrados** (`aspect-square` + `object-cover`): **2 columnas en celular, 3 en iPad/desktop** (`grid-cols-2 md:grid-cols-3`). En `md+` los thumbnails van en grayscale y revelan color al hover (`md:grayscale md:group-hover:grayscale-0`). Aparecen suavemente al hacer scroll (`whileInView`, `once`, fade + `y`).
- **Tap/click en una foto → pantalla completa**: `object-contain` (foto entera, sin recorte), fondo negro, fade suave (no aparece "de golpe"). Cerrar con **tap/click en cualquier lado** (sin botón X). Navegación: swipe ←/→ (umbral 50px; un swipe no cierra), teclado ←/→/Escape, y flechas ←/→ visibles en `md+` (`stopPropagation`, no cierran). Bloquea el scroll del body mientras está abierta. Caption discreto abajo.

### WorkPage (`/work`) — ✓ construida
- Grid de las 6 series. Hover: overlay `bg-black/60` + descripción en blanco (legibilidad)

### Pendientes (placeholders inline en App.tsx)
- **StudiesPage, LoosePage, ContactPage** — aún por construir
- Contact: email + LinkedIn + Instagram (replicar de Adobe Portfolio)

## Convenciones

### Idioma
- Sitio **bilingüe EN/ES** — ver sección "Idiomas (i18n)". Todo texto visible nuevo va por `t()` o como `{ en, es }`.

### Tono
- Personal, directo, primera persona
- No académico, no corporativo
- Los statements de serie tienen voz propia; la traducción ES debe preservar ese tono (no traducción literal robótica)

### Git
- Commits descriptivos
- Push frecuente
- Deploy automático al pushear a `main`

### Mobile first
- Navbar colapsa a menú fullscreen en móvil
- Grid de series: 1 col móvil → 2 col tablet → 3 col desktop

## Pendiente (próximos pasos)

1. **Construir páginas restantes** — Studies, Loose, Contact (hoy son placeholders inline en `App.tsx`)

### Hecho
- Proyecto scaffoldeado (mismo stack que portafolio académico)
- HomePage (hero parallax + grid), WorkPage, SeriesPage (masonry + lightbox)
- 6/6 series con fotos: geometries, abstractions, in-passing, elsewhere, organic, close
- Repo GitHub `luishreyes/photography` creado (público)
- **Deploy en producción**: https://photography.luishreyes.com con HTTPS forzado y deploy automático

## Principios

### #1: La foto manda
El UI existe para servir la imagen, no al revés. Nada de bordes decorativos, sombras innecesarias, ni elementos que compitan con las fotos.

### #2: Transiciones con propósito
Animaciones sutiles y rápidas (200-400ms). Nada que haga al usuario esperar.

### #3: Blanco y negro en thumbnails
Las fotos cover de las series se muestran en grayscale por defecto; al hover revelan el tono original (si aplica). Así se mantiene coherencia visual en el grid.

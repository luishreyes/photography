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
  catalog-data.ts   ← AUTO-GENERADO desde catalog.json (NO editar). Exporta series/studies/looseYears.
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

El hero **es** el landing (sin splash aparte). Entrada con framer-motion: flash de cámara → foto B/N con leve Ken Burns → nombre sube con máscara de línea. Al hacer scroll (`useScroll`/`useTransform`) el bloque sale del frame y la foto hace parallax, estilo Apple. El índice de la home son **tres puertas monumentales** (Work/Studies/Loose): la fila entera es un link a la categoría — **solo clic, sin desplegar** sub-ítems (hay demasiados trabajos/años). El listado completo vive dentro de cada página de categoría.

## Fuente única: `catalog.json` → sitio

**Toda** la data del portafolio (colecciones, fotos, orden, statements, quotes, covers, títulos ES/EN) vive en **`catalog.json`** en la raíz del archivo maestro (`~/Desktop/Portafolio Fotográfico/catalog.json`, NO versionado en git). El sitio, los fotolibros y la rutina de Instagram leen de ahí. Las transformaciones puras están en `_scripts/catalog/catalog_lib.py`.

- **`./build.sh`** (raíz del maestro → `_scripts/catalog/build_all.py`): valida el catálogo, materializa los `site_webp`/`site_thumb` faltantes desde `files.portfolio` (1600px q80; thumb cuadrado 640 q78) en `public/photography/...`, genera los `cover.webp` faltantes, y **emite `data/catalog-data.ts`** (exporta `series`, `studies`, `looseYears`). Correr después de cualquier cambio al catálogo.
- Las imágenes se derivan de la copia **`Portfolio/`** del archivo (aspecto nativo, sin marco). NUNCA `Web/` (cuadrada + marco = redes).
- `data/catalog-data.ts` es **auto-generado — NO editar a mano**. Para cambiar un statement, título, orden o cover: editar `catalog.json` y correr `./build.sh`.
- Loose: `/loose` = `LoosePage` (grid de **tomos** de 24, más reciente primero); `/loose/:year` = `LooseYearPage` (galería vía `PhotoViewer`). Los tomos salen de las colecciones `loose-tomo-N` del catálogo, orden `date_captured` desc. La ruta usa el sufijo del slug (`tomo-5`), no un año.

### Campos derivados que emite `site_data`

Dos campos del TS **no existen en `catalog.json`** o no se ven ahí igual. Si los tocas, se tocan en `catalog_lib.site_data`, nunca en el `.ts`:

- **`span: { from, to }`** por colección y por tomo. Lo calcula `_span()` con el **año mínimo y máximo de `date_captured`**, es decir el EXIF que guardó la Fase A. Nadie lo escribe a mano. Colecciones sin fotos (ground, chicago) no traen span y por eso no estiran el rango.
- **`eye: { en, es }`** pasa tal cual desde `collections[].eye`. Solo lo tienen las 6 de Work.

### Colofón de las páginas índice

`components/IndexColophon.tsx` es **un solo componente** para Obra, Estudios y Sueltas. Recibe `groups` (el array de series/studies/looseYears) y `unit` (una `UIKey`, tipada, así que un sustantivo inválido no compila). Suma las fotos, une los `span` y pinta `N unidades · M fotografías · AAAA–AAAA`. **Los números no se escriben en ninguna parte**: al ingresar una foto y correr `./build.sh` suben solos. Las etiquetas son solo plurales a propósito, porque la página más pequeña tiene 5 grupos y 72 fotos y ningún conteo puede llegar a 1.

### Encabezado de las páginas índice

Las tres comparten una regla en `index.css`:

- **`.u-headcol`** fija el ancho de la columna del título en `min(40vw, 470px)` desde `lg`. Escala con el mismo vw que la fuente (`clamp(3rem,11vw,8rem)`) porque el título más largo del sitio, "Los Estudios", mide **3.48 veces su font-size**. Si algún día entra una colección con nombre más largo, ese 3.48 es el número a recalcular.
- La alineación del texto la resuelve el flex, sin media query ni JS: **`lg:self-start` en el título y `lg:self-end` en el texto**. El contenedor mide `max(alturas)`, así que un intro corto se posa en la base del título y uno alto se alinea arriba. Estudios cruza ese umbral solo entre 1440 y 1024.

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
| **Statements** de cada serie (`description`) | ✓ EN/ES | `statement: { en, es }` en `catalog.json` |
| **Citas** de fotógrafos (`quote`) | ✗ solo inglés (original) | `quote` en `catalog.json` |
| **Nombres de serie y estudio** | ✓ EN/ES | `names: { en, es }` en `catalog.json` (el campo `title` queda como identidad estable; el render usa `names[lang]`) |
| **Títulos de fotos** | ✗ **SIEMPRE español** (no conmuta) | `title.es` en `catalog.json` es el título mostrado; `title.en` queda como referencia/legado |

⚠️ Los cambios se hacen en `catalog.json` (no en `data/`) y se propagan con `./build.sh`. Al **agregar una colección nueva**, `statement` DEBE ser `{ en, es }` (tono personal, primera persona; la revisa el usuario).

## Imágenes

**IMPORTANTE:** Las fotos se sirven **localmente** desde `public/photography/`, NO desde Supabase. `build_all.py` genera los WebP con **PIL/Pillow** (no ImageMagick ni `sips`). `ffmpeg` tiene una dependencia rota (libx265) — no usar.

### Flujo para procesar una foto/colección nueva
El pipeline vive en el archivo maestro (`_scripts/`), no en el repo del sitio:

1. **`make_copies.py <HD> "<Título>" <carpeta>`** → crea las 3 copias (`HD/`, `Portfolio/`, `Web/`) con marco auto.
2. **`_scripts/catalog/ingest_collection.py <slug>`** → Fase A: agrega la foto al `catalog.json` (EXIF, archivos, memo del log, web_frame).
3. **`_scripts/catalog/enrich_collection.py <slug>`** → Fase B: punctum, dimensiones, keywords, título ES, etc. (curaduría a mano, persona Alfred).
4. **`./build.sh`** → materializa webp/thumbs, regenera `data/catalog-data.ts`. Deploy con push a `main`.

## Colecciones (en `catalog.json`)

Definidas en `catalog.json` (`collections[]`). Cada colección tiene: `slug`, `kind` (work/study/loose), `names {en,es}`, `year`, `statement {en,es}`, `quote?`, `cover_photo_id`/`cover_file`, `order` (ids en secuencia curada), `status`. Cada foto (`photos[]`) tiene `title {en,es}`, `position`, `files {hd,portfolio,web,site_webp,site_thumb}`, `dimensions`, `alfred {punctum,dimensions_eval,arc_role,...}`, `keywords`, `subjects`, etc.

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

### Construidas
- **StudiesPage** (`/studies`, `/studies/:slug`) y **LoosePage** (`/loose`, `/loose/:year`) ✓

### Pendientes (placeholder inline en App.tsx)
- **ContactPage** — email + LinkedIn + Instagram (replicar de Adobe Portfolio)

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

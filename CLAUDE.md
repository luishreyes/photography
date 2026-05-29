# Portafolio Fotográfico — Luis H. Reyes

> **Leer este archivo al inicio de cada sesión de trabajo.**

## Proyecto

Portafolio de fotografía artística en blanco y negro, hospedado en GitHub Pages.

- **Repo:** `luishreyes/photography` *(por crear — ver sección Pendiente)*
- **URL live:** https://photography.luishreyes.com
- **Stack:** React 19 + TypeScript + Vite + React Router 7 + Tailwind CSS + Framer Motion
- **Deploy:** GitHub Actions → GitHub Pages (workflow por crear)
- **Imágenes:** WebP optimizados servidos **localmente** desde `public/photography/{serie}/` (NO Supabase). Los originales hi-res viven en `originals/{serie}/` y NO se versionan en git.

## Estructura del proyecto

```
data/
  series.ts         ← Definición de todas las series y fotos (FUENTE DE VERDAD)
components/
  Navbar.tsx        ← Navegación fija con mobile menu
pages/
  HomePage.tsx      ← Landing: hero a pantalla completa + grid de series
  WorkPage.tsx      ← Índice de todas las series (✓ construida)
  SeriesPage.tsx    ← Galería masonry con lightbox (✓ construida)
App.tsx             ← Router. Studies/Loose/Contact aún son placeholders inline
originals/          ← Originales hi-res por serie (NO versionado — ver .gitignore)
  {serie}/
public/
  DSCF2737 2.JPG    ← Foto hero de la landing
  photography/      ← WebP optimizados servidos en producción
    {serie}/
      cover.webp
      01-titulo.webp ... 12-titulo.webp
CNAME               ← photography.luishreyes.com (por crear al deployar)
```

## Colores del sistema (Tailwind)

Idénticos al portafolio académico:
- `brand-dark`: #1A1A1A — fondo principal
- `brand-yellow`: #FFBF00 — acento principal
- `brand-yellow-dark`: #E6AC00 — hover de acento
- `brand-gray`: #555555 — texto secundario

## Tipografía

- **Manrope Variable** (sans) — autoalojada vía `@fontsource-variable/manrope`
- No usar Google Fonts CDN

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
- `description` — párrafo intro completo (copiado verbatim de Adobe Portfolio)
- `quote?` — `{ text, author }` cita de fotógrafo (de Adobe Portfolio)
- `coverPhoto` — ruta local `.webp` de la portada
- `photos[]` — array con `id`, `title`, `src`, `width`, `height` (en orden de Adobe Portfolio)

### Estado de las series

| Slug | Título | Estado |
|---|---|---|
| `geometries` | Geometries | ✓ 12 fotos + texto + quote |
| `abstractions` | Abstractions | ✓ 12 fotos + texto + quote |
| `in-passing` | In Passing | ✓ 12 fotos + texto + quote |
| `elsewhere` | Elsewhere | ✓ 12 fotos + texto + quote |
| `organic` | Organic | Texto + quote listos; **fotos pendientes** |
| `close` | Close | Texto + quote listos; **fotos pendientes** |

## Páginas

### SeriesPage (`/work/:slug`) — ✓ construida
- Encabezado: título + intro completo + quote (línea amarilla) + conteo de fotos
- Masonry: 3 col desktop / 2 col tablet / 1 col móvil (columnas balanceadas por altura, ver `buildColumns`)
- Título de cada foto **siempre visible debajo** (no en hover) — réplica de Adobe Portfolio
- Lightbox a pantalla completa: navegación ←/→ teclado, Escape para cerrar, contador `n / total`

### WorkPage (`/work`) — ✓ construida
- Grid de las 6 series. Hover: overlay `bg-black/60` + descripción en blanco (legibilidad)

### Pendientes (placeholders inline en App.tsx)
- **StudiesPage, LoosePage, ContactPage** — aún por construir
- Contact: email + LinkedIn + Instagram (replicar de Adobe Portfolio)

## Convenciones

### Idioma
- Todo el sitio en **inglés**

### Tono
- Personal, directo, primera persona
- No académico, no corporativo
- Las descripciones de series son frases cortas con voz propia

### Git
- Commits descriptivos
- Push frecuente
- Deploy automático al pushear a `main`

### Mobile first
- Navbar colapsa a menú fullscreen en móvil
- Grid de series: 1 col móvil → 2 col tablet → 3 col desktop

## Pendiente (próximos pasos)

1. **Procesar fotos de `organic` y `close`** — flujo en sección Imágenes
2. **Construir páginas restantes** — Studies, Loose, Contact
3. **Configurar GitHub Actions** — deploy automático a GitHub Pages
4. **Agregar CNAME** — `photography.luishreyes.com` + custom domain en repo settings + HTTPS

### Hecho
- Proyecto scaffoldeado (mismo stack que portafolio académico)
- HomePage (hero parallax + grid), WorkPage, SeriesPage (masonry + lightbox)
- 4/6 series con fotos: geometries, abstractions, in-passing, elsewhere
- Repo GitHub `luishreyes/photography` creado

## Principios

### #1: La foto manda
El UI existe para servir la imagen, no al revés. Nada de bordes decorativos, sombras innecesarias, ni elementos que compitan con las fotos.

### #2: Transiciones con propósito
Animaciones sutiles y rápidas (200-400ms). Nada que haga al usuario esperar.

### #3: Blanco y negro en thumbnails
Las fotos cover de las series se muestran en grayscale por defecto; al hover revelan el tono original (si aplica). Así se mantiene coherencia visual en el grid.

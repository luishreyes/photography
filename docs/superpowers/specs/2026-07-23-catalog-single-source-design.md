# Catálogo como fuente única — Diseño

Fecha: 2026-07-23
Autor: Luis H. Reyes (con Claude)
Estado: aprobado, pendiente de plan de implementación

## Problema

`catalog.json` (259 fotos, 17 colecciones) ya es el modelo completo del portafolio:
a nivel colección tiene `names{en,es}`, `statement{en,es}`, `quote`, `cover_*`,
`order` curado; a nivel foto `title.{en,es}`, `position`, `keywords`, `subjects`,
`files{hd,portfolio,web,site_webp,site_thumb}`, punctum y demás. Pero los tres
consumidores mantienen copias paralelas de esos datos:

- **Sitio**: `generated.ts` (glob de carpetas) + `series.ts`/`studies.ts`/`loose.ts`
  (títulos en inglés + statements a mano) fusionados por `merge.ts`.
- **Libros**: `export-books-manifest.ts` lee el sitio → `books-manifest.json` →
  `make-photobooks.py` renderiza PDF.
- **Instagram**: `instagram_daily.py` globa `Web/`, saca el título del nombre de
  archivo (inglés), genera hashtags con `claude` visión.

Consecuencia: para cambiar un statement, orden, cover o título hay que editar
varios lugares, y los títulos de foto del sitio están en inglés cuando la regla
del proyecto es que los títulos de foto van SIEMPRE en español (`title.es`).

## Meta

Editar un solo documento (`catalog.json`) y que un solo build propague el cambio
a sitio y libros; Instagram lo toma en su próxima corrida. Lo más limpio posible:
eliminar las fuentes paralelas, no auto-generarlas.

## Reglas de dominio que gobiernan el diseño

- **Títulos de foto SIEMPRE en español** (`title.es`). `title.en` queda como
  referencia/legado. Los NOMBRES de colección/estudio sí conmutan EN/ES.
- `catalog.json` vive en la raíz del archivo maestro (NO en git). El sitio
  (`_webpage/site`) sí es git. El patrón existente ya es "un script en el repo
  sube al maestro y jala datos"; se conserva.
- Nunca borrar masters (TIF/DNG/RAW). Este trabajo no toca masters.
- No dejar archivos temporales en las carpetas del maestro.

## Arquitectura

```
catalog.json  (maestro, sin git)  ← única fuente de verdad
     │
     ▼
_scripts/catalog/build_all.py      ← UN comando; ./build.sh en la raíz lo llama
     ├─ (a) Assets:  genera site_webp + site_thumb faltantes desde files.portfolio → repo public/
     ├─ (b) Sitio:   emite _webpage/site/data/catalog-data.ts
     └─ (c) Libros:  (make-photobooks.py lee catalog.json directo)
     
Instagram: instagram_daily.py lee catalog.json en cada corrida (runtime, fuera del build)
```

Flujos:
- **Foto nueva**: `make_copies.py` → `ingest_collection.py <slug>` → `enrich_collection.py <slug>` → `./build.sh`.
- **Editar metadato** (statement, retítulo, orden, cover): editar `catalog.json` → `./build.sh`.

`build_all.py` valida el catálogo antes de emitir nada (0 sin `title.es`/punctum,
0 títulos duplicados ES/EN, 0 huecos de derivados). Si hay huecos, aborta con el
detalle y no escribe.

## Componente (a): Assets

Reutiliza la lógica de `sync-photos.py` (1600 px WEBP q80 method6; thumb cuadrado
640 center-crop q78). Para cada foto del catálogo:
- Si `files.site_webp` / `files.site_thumb` no existen en disco, generarlos desde
  `files.portfolio` a la ruta que el catálogo ya declara.
- Cover por colección: copiar el webp de `cover_photo_id` a `cover.webp` de la
  colección (respetar cover curado; regenerar solo si falta o si cambió el
  `cover_photo_id`).
- Podar webp huérfanos en `public/` que ya no correspondan a ninguna foto del
  catálogo de esa colección (mismo criterio conservador que hoy: no tocar
  `cover.webp` ni archivos ajenos).

Rutas de salida (ya usadas por el catálogo):
`public/photography/<slug>/NN-<slug-foto>.webp` (Works),
`public/photography/studies/<slug>/...` (Studies),
`public/photography/loose/<AAAA-AAAA>/...` (Loose), más `thumbs/`.

## Componente (b): Sitio — `data/catalog-data.ts`

Archivo TS generado (encabezado "AUTO-GENERADO, no editar a mano") que exporta
los MISMOS nombres y formas que hoy consumen los componentes, para que el cambio
en los componentes sea solo el path de import:

- `export const series: Series[]`   (Works)
- `export const studies: Study[]`
- `export const looseYears: LooseGroup[]`

Mapeo catálogo → tipos del sitio:
- `Series.title` / `Study.title`: identidad estable = `names.en` (o slug titulado).
- `Series.names` / `Study` display: `{en: names.en, es: names.es}`.
- `description` = `statement{en,es}`; `quote` = `quote`; `year` = `year`;
  `coverPhoto` = ruta pública derivada de `cover_file`/cover.webp.
- `photos[]`: ordenadas por `order` de la colección (o `position`), cada una:
  `{ id, title: title.es, src: <site_webp público>, thumb: <site_thumb público>, width, height, year }`.
  `title` es **siempre `title.es`**.
- Loose: agrupado por bin (`2012-2016`, `2017-2021`, `2022-2026`), orden
  `date_captured` desc dentro del bin; `LooseGroup.coverPhoto` = foto más reciente
  del bin (o cover si se define).

Se ELIMINAN (con respaldo temporal en `data/_backup_precatalog/`):
`generated.ts`, `series.ts`, `studies.ts`, `loose.ts`, `merge.ts`.
Se actualizan los 8 imports de componentes/páginas a `../data/catalog-data`:
`pages/{SeriesPage,WorkPage,HomePage,StudyPage,StudiesPage,LoosePage,LooseYearPage}.tsx`.
El respaldo se borra al final si toda la verificación pasa.

Nota de idioma: el toggle de idioma del sitio sigue cambiando nombres de colección,
statements y quotes; los títulos de foto NO cambian (quedan en español).

## Componente (c): Libros

`make-photobooks.py` lee `catalog.json` directo en vez de `books-manifest.json`:
- Colecciones a imprimir: las mismas de hoy = Works + Studies (no hay fotolibro
  de Loose hoy y no se agrega en este alcance). Orden = `order` del catálogo.
- Statement por idioma = `statement.{en|es}`; título de placa = `title.es` en ambas
  ediciones (regla de títulos en español); nombre de colección + subtítulos por
  edición de idioma.
- Imágenes = `files.portfolio` (alta) de cada foto.

Se eliminan `export-books-manifest.ts`, `_export-books.mjs`, `books-manifest.json`
y el paso esbuild. `make-books.sh` queda: `python3 scripts/make-photobooks.py "$@"`.
Filtro por slug/título se conserva.

## Componente (d): Instagram (híbrido)

`instagram_daily.py`:
- **Cola** desde `catalog.json`: fotos con `files.web` presente, ordenadas por
  `date_captured` asc (desempate por `title.es`). Ruta de imagen = `files.web`.
- **Caption** línea 1 = `title.es`. (Cuerpo/punctum opcional, apagado por defecto;
  se puede activar luego sin recompilar nada.)
- **Hashtags**: base derivada de `keywords`/`subjects` del catálogo mapeados a tags
  + `COLLECTION_TAGS` de la colección + `FIXED_TAGS`; `claude` visión afina/añade
  (se mantiene la dependencia de visión, modo híbrido).
- **Dedup seguro (migración)**: los posts históricos usan el título en inglés en la
  primera línea del caption. `published_titles` (de la API de IG) se compara contra
  la unión `{title.es, title.en}` normalizados de cada foto, de modo que lo ya
  publicado en inglés cuente como hecho y no se repita al cambiar a español.
- Modos `--prepare` (sin publicar) y corrida completa se conservan. La rutina
  launchd (9am) sigue llamando el mismo script.

Nota: el campo `published` del catálogo hoy es `true` para las 259 (significa "en
el portafolio público", no "posteado en IG"); NO se usa como estado de IG. La API
de Instagram sigue siendo la autoridad de qué está publicado.

## Manejo de errores

- `build_all.py` aborta si la validación del catálogo falla (imprime qué falta).
- Assets: si falta el `files.portfolio` de una foto, error nombrando la foto; no
  se emite data a medias.
- Sitio: el TS generado debe compilar (`tsc`/build de vite) sin romper tipos.
- Instagram: si `claude` visión falla, cae al caption determinista del catálogo
  (título + hashtags base). Si el token está vencido, reporta y sale (como hoy).

## Verificación (criterios de aceptación)

1. **Sitio**: `./build.sh` corre limpio; `npm run build` (o dev server) sin errores
   de tipo ni de consola; una página de colección (p.ej. Geometrías) muestra los
   títulos de foto en español y ninguna imagen rota; el toggle de idioma cambia
   nombre/statement pero no los títulos de foto.
2. **Libros**: `./scripts/make-books.sh elsewhere` regenera el PDF EN+ES; abrir el
   PDF confirma orden curado, statement correcto por idioma y placas con título en
   español.
3. **Instagram**: `python3 _scripts/instagram_daily.py --prepare` elige la siguiente
   foto cronológica correcta, con `title.es` como línea 1, hashtags sanos, y salta
   las ya publicadas (incluidas las históricas en inglés). No publica.
4. **Limpieza**: tras verificar 1-3, se borra `data/_backup_precatalog/` y los
   archivos muertos (`generated.ts`, `merge.ts`, `series.ts`, `studies.ts`,
   `loose.ts`, `export-books-manifest.ts`, `_export-books.mjs`, `books-manifest.json`,
   y `sync-photos.py`/`sync-loose.py` si `build_all.py` los reemplaza por completo).

## Fuera de alcance (YAGNI)

- No se exhibe punctum/dimensiones en el sitio (el UX actual se conserva).
- No se cambia el diseño visual del sitio ni la plantilla de libros.
- No se migra el estado de IG a un campo del catálogo (la API sigue siendo autoridad).

## Orden de implementación sugerido

1. `build_all.py` (validación + assets + emisión de `catalog-data.ts`), y repuntar
   imports del sitio; verificar sitio.
2. `make-photobooks.py` desde catálogo; simplificar `make-books.sh`; verificar 1 libro.
3. `instagram_daily.py` desde catálogo (cola + caption + dedup unión); verificar `--prepare`.
4. Limpieza de archivos muertos y respaldo.

# Catálogo como fuente única — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer que sitio, libros e Instagram lean todo de `catalog.json`, eliminando las fuentes paralelas, de modo que editar el catálogo + un build propague todo.

**Architecture:** Un módulo de transformaciones puras (`catalog_lib.py`) que los tres consumidores comparten. `build_all.py` valida el catálogo, materializa los webp/thumb faltantes y emite un único `data/catalog-data.ts` para el sitio. `make-photobooks.py` e `instagram_daily.py` leen el catálogo directo vía `catalog_lib`.

**Tech Stack:** Python 3 (stdlib + PIL + numpy, ya instalados), TypeScript/Vite (sitio), Chrome headless (PDF). Tests con `unittest` de la stdlib (pytest NO está disponible).

## Global Constraints

- Títulos de foto SIEMPRE `title.es`; NOMBRES de colección conmutan EN/ES.
- `catalog.json` vive en la raíz del maestro (NO git). El sitio (`_webpage/site`) SÍ es git.
- Rutas públicas del sitio = `files.site_webp`/`files.site_thumb` con el prefijo hasta `/public/` removido (`.../public/photography/x` → `/photography/x`).
- Imágenes de libros = `files.portfolio` resuelto contra `MASTER` (nunca por match de nombre de archivo).
- Nunca borrar masters (TIF/DNG/RAW). No dejar temporales en carpetas del maestro.
- Tests con `python3 -m unittest`, NO pytest.
- Commits frecuentes. Los scripts del maestro (`_scripts/`, `catalog.json`) no se commitean (sin git); solo se commitea lo de `_webpage/site`.

---

### Task 1: `catalog_lib.py` — transformaciones puras compartidas

**Files:**
- Create: `_scripts/catalog/catalog_lib.py`
- Test: `_scripts/catalog/test_catalog_lib.py`

**Interfaces:**
- Consumes: nada (stdlib).
- Produces:
  - `load_catalog(path='catalog.json') -> dict`
  - `public_path(file_rel: str) -> str` — `.../public/photography/x` → `/photography/x`
  - `validate(cat: dict) -> list[str]` — lista de problemas (vacía = OK)
  - `site_data(cat: dict, dims) -> dict` con claves `'series'`, `'studies'`, `'loose'`; `dims(site_webp_rel) -> (w,h)` inyectado
  - `books_from_catalog(cat: dict) -> list[dict]` — Book dicts (works+studies), cada foto `{'title','portfolio','date'}`
  - `ig_queue(cat: dict) -> list[dict]` — fotos con `files.web`, orden `date_captured` asc, cada una `{'date','title_es','title_en','coll','path','id'}`
  - `dedup_keys(photo_row: dict) -> set[str]` — `{norm(title_es), norm(title_en)}`

- [ ] **Step 1: Write the failing test**

```python
# _scripts/catalog/test_catalog_lib.py
import unittest
import catalog_lib as cl

CAT = {
    "meta": {"schema_version": 1},
    "collections": [
        {"slug": "geometries", "kind": "work", "names": {"en": "Geometries", "es": "Geometrías"},
         "year": 2026, "statement": {"en": "EN stmt", "es": "ES stmt"},
         "quote": {"text": "Q", "author": "A"},
         "cover_photo_id": "d1_atrium", "cover_file": "_webpage/site/public/photography/geometries/cover.webp",
         "status": "closed", "cap": 12, "order": ["d1_atrium", "d2_divide"]},
        {"slug": "villeta", "kind": "study", "names": {"en": "Villeta", "es": "Villeta"},
         "year": 2025, "statement": {"en": "V EN", "es": "V ES"},
         "cover_file": "_webpage/site/public/photography/studies/villeta/cover.webp",
         "status": "finished", "order": ["v1_abund"]},
        {"slug": "loose-2022-2026", "kind": "loose", "names": {"en": "Loose 2022-2026", "es": "Sueltas 2022-2026"},
         "status": "rolling", "order": []},
    ],
    "photos": [
        {"id": "d1_atrium", "collection": "geometries", "position": 1,
         "title": {"en": "Atrium Vortex", "es": "Vórtice de Atrio"},
         "date_captured": "2015-03-07",
         "files": {"portfolio": "Works/Geometries/Portfolio/20150307_Atrium_Vortex_portfolio.jpg",
                   "web": "Works/Geometries/Web/20150307_Atrium_Vortex_web.jpg",
                   "site_webp": "_webpage/site/public/photography/geometries/04-atrium-vortex.webp",
                   "site_thumb": "_webpage/site/public/photography/geometries/thumbs/04-atrium-vortex.webp"},
         "alfred": {"punctum": "p"}},
        {"id": "d2_divide", "collection": "geometries", "position": 2,
         "title": {"en": "Divide", "es": "Divisoria"},
         "date_captured": "2020-12-06",
         "files": {"portfolio": "Works/Geometries/Portfolio/20201206_Divide_portfolio.jpg",
                   "web": "Works/Geometries/Web/20201206_Divide_web.jpg",
                   "site_webp": "_webpage/site/public/photography/geometries/09-divide.webp",
                   "site_thumb": "_webpage/site/public/photography/geometries/thumbs/09-divide.webp"},
         "alfred": {"punctum": "p"}},
        {"id": "v1_abund", "collection": "villeta", "position": 1,
         "title": {"en": "Abundance", "es": "Abundancia"},
         "date_captured": "2025-01-02",
         "files": {"portfolio": "Studies/Villeta/Portfolio/20250102_Abundance_portfolio.jpg",
                   "web": "Studies/Villeta/Web/20250102_Abundance_web.jpg",
                   "site_webp": "_webpage/site/public/photography/studies/villeta/01-abundance.webp",
                   "site_thumb": "_webpage/site/public/photography/studies/villeta/thumbs/01-abundance.webp"},
         "alfred": {"punctum": "p"}},
        {"id": "l1_luceros", "collection": "loose-2022-2026", "position": 1,
         "title": {"en": "Luceros", "es": "Luceros"},
         "date_captured": "2026-07-19",
         "files": {"portfolio": "Loose/2022-2026/Portfolio/20260719_Luceros_portfolio.jpg",
                   "web": "Loose/2022-2026/Web/20260719_Luceros_web.jpg",
                   "site_webp": "_webpage/site/public/photography/loose/2022-2026/01-luceros.webp",
                   "site_thumb": "_webpage/site/public/photography/loose/2022-2026/thumbs/01-luceros.webp"},
         "alfred": {"punctum": "p"}},
    ],
}

def fake_dims(_rel):
    return (1600, 1067)

class TestPublicPath(unittest.TestCase):
    def test_strips_public_prefix(self):
        self.assertEqual(
            cl.public_path("_webpage/site/public/photography/geometries/04-atrium-vortex.webp"),
            "/photography/geometries/04-atrium-vortex.webp")

class TestSiteData(unittest.TestCase):
    def setUp(self):
        self.d = cl.site_data(CAT, fake_dims)

    def test_series_uses_spanish_titles(self):
        geo = self.d["series"][0]
        self.assertEqual(geo["slug"], "geometries")
        self.assertEqual([p["title"] for p in geo["photos"]], ["Vórtice de Atrio", "Divisoria"])

    def test_series_photo_src_is_public_webp(self):
        p0 = self.d["series"][0]["photos"][0]
        self.assertEqual(p0["src"], "/photography/geometries/04-atrium-vortex.webp")
        self.assertEqual(p0["thumb"], "/photography/geometries/thumbs/04-atrium-vortex.webp")
        self.assertEqual((p0["width"], p0["height"]), (1600, 1067))

    def test_series_order_follows_catalog_order(self):
        ids = [p["id"] for p in self.d["series"][0]["photos"]]
        self.assertEqual(ids, ["d1_atrium", "d2_divide"])

    def test_series_names_and_statement(self):
        geo = self.d["series"][0]
        self.assertEqual(geo["names"], {"en": "Geometries", "es": "Geometrías"})
        self.assertEqual(geo["description"], {"en": "EN stmt", "es": "ES stmt"})
        self.assertEqual(geo["coverPhoto"], "/photography/geometries/cover.webp")

    def test_study_status_passthrough(self):
        v = self.d["studies"][0]
        self.assertEqual(v["status"], "finished")
        self.assertEqual(v["photos"][0]["title"], "Abundancia")

    def test_loose_grouped_and_dated_desc(self):
        g = self.d["loose"][0]
        self.assertEqual(g["year"], "2022-2026")
        self.assertEqual(g["photos"][0]["title"], "Luceros")
        self.assertTrue(g["coverPhoto"].endswith("01-luceros.webp"))

class TestBooks(unittest.TestCase):
    def test_books_are_works_and_studies_only(self):
        books = cl.books_from_catalog(CAT)
        kinds = sorted(b["kind"] for b in books)
        self.assertEqual(kinds, ["study", "work"])

    def test_book_photo_has_portfolio_and_spanish_title(self):
        book = [b for b in cl.books_from_catalog(CAT) if b["slug"] == "geometries"][0]
        ph = book["photos"][0]
        self.assertEqual(ph["title"], "Vórtice de Atrio")
        self.assertTrue(ph["portfolio"].endswith("20150307_Atrium_Vortex_portfolio.jpg"))
        self.assertEqual(ph["date"], "2015-03-07")

class TestIG(unittest.TestCase):
    def test_queue_sorted_ascending_with_web_paths(self):
        q = cl.ig_queue(CAT)
        self.assertEqual(q[0]["title_es"], "Vórtice de Atrio")
        self.assertEqual([r["date"] for r in q], sorted(r["date"] for r in q))
        self.assertTrue(q[0]["path"].endswith("_web.jpg"))

    def test_dedup_keys_union_es_en(self):
        row = cl.ig_queue(CAT)[0]
        self.assertEqual(cl.dedup_keys(row), {"vórtice de atrio", "atrium vortex"})

class TestValidate(unittest.TestCase):
    def test_clean_catalog_has_no_problems(self):
        self.assertEqual(cl.validate(CAT), [])

    def test_missing_title_es_flagged(self):
        import copy
        bad = copy.deepcopy(CAT)
        bad["photos"][0]["title"]["es"] = ""
        probs = cl.validate(bad)
        self.assertTrue(any("title.es" in p for p in probs))

if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico/_scripts/catalog" && python3 -m unittest test_catalog_lib -v`
Expected: FAIL con `ModuleNotFoundError: No module named 'catalog_lib'`.

- [ ] **Step 3: Write minimal implementation**

```python
# _scripts/catalog/catalog_lib.py
"""Transformaciones puras de catalog.json a las formas que consumen el sitio,
los libros e Instagram. Sin efectos de IO (dims se inyecta). Compartido por
build_all.py, make-photobooks.py e instagram_daily.py."""
import json, os


def load_catalog(path="catalog.json"):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def public_path(file_rel):
    """'_webpage/site/public/photography/x' -> '/photography/x'."""
    marker = "/public/"
    i = file_rel.find(marker)
    if i == -1:
        raise ValueError(f"ruta sin /public/: {file_rel}")
    return "/" + file_rel[i + len(marker):]


def _norm(s):
    return (s or "").replace("_", " ").strip().lower()


def _photos_in_order(cat, col):
    """Fotos de la colección en el orden de col['order']; las que no estén en
    order se anexan por position/date."""
    by_id = {p["id"]: p for p in cat["photos"] if p["collection"] == col["slug"]}
    ordered = [by_id[i] for i in col.get("order", []) if i in by_id]
    used = {p["id"] for p in ordered}
    rest = sorted((p for p in by_id.values() if p["id"] not in used),
                  key=lambda p: (p.get("position") or 0, p.get("date_captured") or ""))
    return ordered + rest


def site_data(cat, dims):
    """dims(site_webp_rel) -> (w, h). Devuelve {'series','studies','loose'}."""
    series, studies, loose = [], [], []
    for col in cat["collections"]:
        kind = col["kind"]
        if kind == "loose":
            continue
        photos = []
        for p in _photos_in_order(cat, col):
            webp = p["files"]["site_webp"]
            w, h = dims(webp)
            row = {"id": p["id"], "title": p["title"]["es"],
                   "src": public_path(webp),
                   "thumb": public_path(p["files"]["site_thumb"]),
                   "width": w, "height": h}
            photos.append(row)
        cover = public_path(col["cover_file"]) if col.get("cover_file") else (photos[0]["src"] if photos else "")
        base = {"slug": col["slug"], "title": col["names"]["en"],
                "names": col["names"], "year": col.get("year"),
                "description": col["statement"],
                "coverPhoto": cover, "photos": photos}
        if col.get("quote"):
            base["quote"] = col["quote"]
        if kind == "work":
            series.append(base)
        else:
            base["status"] = "finished" if col.get("status") in ("finished", "closed") else "ongoing"
            # StudyPhoto = {id,title,src}
            base["photos"] = [{"id": r["id"], "title": r["title"], "src": r["src"]} for r in photos]
            studies.append(base)

    # Loose agrupado por bin, orden date desc
    for col in cat["collections"]:
        if col["kind"] != "loose":
            continue
        year = col["slug"].replace("loose-", "")
        ph = [p for p in cat["photos"] if p["collection"] == col["slug"]]
        ph.sort(key=lambda p: p.get("date_captured") or "", reverse=True)
        photos = [{"id": p["id"], "title": p["title"]["es"],
                   "src": public_path(p["files"]["site_webp"]),
                   "thumb": public_path(p["files"]["site_thumb"])} for p in ph]
        cover = public_path(col["cover_file"]) if col.get("cover_file") else (photos[0]["src"] if photos else "")
        loose.append({"year": year, "coverPhoto": cover, "photos": photos})
    loose.sort(key=lambda g: g["year"], reverse=True)
    return {"series": series, "studies": studies, "loose": loose}


def books_from_catalog(cat):
    """Book dicts para make-photobooks.py: Works + Studies. Imagen = files.portfolio."""
    books = []
    for col in cat["collections"]:
        kind = col["kind"]
        if kind not in ("work", "study"):
            continue
        photos = []
        for p in _photos_in_order(cat, col):
            photos.append({"title": p["title"]["es"],
                           "portfolio": p["files"]["portfolio"],
                           "date": p.get("date_captured") or ""})
        if not photos:
            continue
        folder = f"{'Works' if kind == 'work' else 'Studies'}/{col['names']['en']}"
        books.append({"kind": kind, "slug": col["slug"], "title": col["names"]["en"],
                      "names": col["names"], "folder": folder,
                      "yearLabel": str(col.get("year") or ""),
                      "statement": col["statement"], "quote": col.get("quote"),
                      "photos": photos})
    return books


def ig_queue(cat):
    """Fotos con files.web, orden date_captured asc (desempate title.es)."""
    rows = []
    for p in cat["photos"]:
        web = p.get("files", {}).get("web")
        if not web:
            continue
        rows.append({"date": p.get("date_captured") or "",
                     "title_es": p["title"]["es"], "title_en": p["title"].get("en") or p["title"]["es"],
                     "coll": p["collection"], "path": web, "id": p["id"]})
    rows.sort(key=lambda r: (r["date"], r["title_es"]))
    return rows


def dedup_keys(photo_row):
    return {_norm(photo_row["title_es"]), _norm(photo_row["title_en"])}


def validate(cat):
    probs = []
    seen_es, seen_en = {}, {}
    for p in cat["photos"]:
        t = p.get("title", {})
        if not t.get("es"):
            probs.append(f"{p['id']}: sin title.es")
        if not (p.get("alfred") or {}).get("punctum"):
            probs.append(f"{p['id']}: sin punctum")
        for k in ("portfolio", "web", "site_webp", "site_thumb"):
            if not p.get("files", {}).get(k):
                probs.append(f"{p['id']}: sin files.{k}")
        es, en = t.get("es"), t.get("en")
        if es:
            if es in seen_es:
                probs.append(f"title.es duplicado '{es}' ({seen_es[es]} y {p['id']})")
            seen_es[es] = p["id"]
        if en:
            if en in seen_en:
                probs.append(f"title.en duplicado '{en}' ({seen_en[en]} y {p['id']})")
            seen_en[en] = p["id"]
    return probs
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico/_scripts/catalog" && python3 -m unittest test_catalog_lib -v`
Expected: PASS (todos los tests OK).

- [ ] **Step 5: Commit (solo repo git; los scripts del maestro no se versionan)**

No hay commit aquí: `_scripts/catalog/` vive en el maestro sin git. Dejar el archivo en disco y continuar.

---

### Task 2: `build_all.py` + `build.sh` — assets + emisión del sitio, repuntar imports

**Files:**
- Create: `_scripts/catalog/build_all.py`
- Create: `build.sh` (raíz del maestro)
- Create: `_webpage/site/data/catalog-data.ts` (lo emite build_all)
- Modify: `_webpage/site/pages/SeriesPage.tsx:2`, `WorkPage.tsx:2`, `HomePage.tsx:4-6`, `StudyPage.tsx:2`, `StudiesPage.tsx:2`, `LoosePage.tsx:2`, `LooseYearPage.tsx:2` (imports → `../data/catalog-data`)
- Move (backup): `_webpage/site/data/{generated,merge,series,studies,loose}.ts` → `_webpage/site/data/_backup_precatalog/`

**Interfaces:**
- Consumes: `catalog_lib` (Task 1) — `load_catalog`, `validate`, `site_data`, `public_path`.
- Produces: `data/catalog-data.ts` exportando `series`, `studies`, `looseYears` y las interfaces `Series`, `Study`, `Photo`, `StudyPhoto`, `LooseGroup`, `LoosePhoto`.

- [ ] **Step 1: Escribir `build_all.py`**

```python
#!/usr/bin/env python3
"""Propaga catalog.json al sitio: valida, materializa webp/thumb faltantes y
emite _webpage/site/data/catalog-data.ts. Correr desde la raíz del maestro."""
import os, sys, json
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
MASTER = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
import catalog_lib as cl

REPO = os.path.join(MASTER, "_webpage", "site")
PUB = os.path.join(REPO, "public")
MAXEDGE, Q = 1600, 80
THUMB, TQ = 640, 78


def abspath(rel):
    return os.path.join(MASTER, rel)


def ensure_assets(cat):
    """Genera site_webp/site_thumb faltantes desde files.portfolio."""
    made = 0
    for p in cat["photos"]:
        f = p["files"]
        webp, thumb, port = abspath(f["site_webp"]), abspath(f["site_thumb"]), abspath(f["portfolio"])
        if os.path.exists(webp) and os.path.exists(thumb):
            continue
        if not os.path.exists(port):
            raise SystemExit(f"FALTA portfolio de {p['id']}: {port}")
        im = Image.open(port).convert("RGB")
        w, h = im.size
        s = min(1.0, MAXEDGE / max(w, h))
        big = im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1.0 else im
        os.makedirs(os.path.dirname(webp), exist_ok=True)
        big.save(webp, "WEBP", quality=Q, method=6)
        side = min(big.size)
        tim = big.crop(((big.width - side) // 2, (big.height - side) // 2,
                        (big.width + side) // 2, (big.height + side) // 2))
        if side > THUMB:
            tim = tim.resize((THUMB, THUMB), Image.LANCZOS)
        os.makedirs(os.path.dirname(thumb), exist_ok=True)
        tim.save(thumb, "WEBP", quality=TQ, method=6)
        made += 1
    return made


def ensure_covers(cat):
    """cover.webp por colección: si falta, copiar el site_webp de cover_photo_id."""
    import shutil
    made = 0
    by_id = {p["id"]: p for p in cat["photos"]}
    for col in cat["collections"]:
        cf = col.get("cover_file")
        cpid = col.get("cover_photo_id")
        if not cf or not cpid or cpid not in by_id:
            continue
        dst = abspath(cf)
        if os.path.exists(dst):
            continue
        src = abspath(by_id[cpid]["files"]["site_webp"])
        if os.path.exists(src):
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy(src, dst)
            made += 1
    return made


_DIMS = {}
def dims(site_webp_rel):
    if site_webp_rel not in _DIMS:
        with Image.open(abspath(site_webp_rel)) as im:
            _DIMS[site_webp_rel] = im.size
    return _DIMS[site_webp_rel]


TS_INTERFACES = """// AUTO-GENERADO por _scripts/catalog/build_all.py — NO editar a mano.
// Fuente única: catalog.json (raíz del maestro). Re-generar con ./build.sh.

export interface Photo { id: string; title: string; src: string; thumb?: string; width?: number; height?: number; year?: number; }
export interface StudyPhoto { id: string; title: string; src: string; }
export interface LoosePhoto { id: string; title: string; src: string; thumb?: string; }
export interface Series { slug: string; title: string; names?: { en: string; es: string }; year?: number; description: { en: string; es: string }; quote?: { text: string; author: string }; coverPhoto: string; photos: Photo[]; }
export interface Study { slug: string; title: string; names?: { en: string; es: string }; year?: number; status: 'finished' | 'ongoing'; description: { en: string; es: string }; quote?: { text: string; author: string }; coverPhoto?: string; photos: StudyPhoto[]; }
export interface LooseGroup { year: string; coverPhoto: string; photos: LoosePhoto[]; }
"""


def emit_ts(data):
    def j(v):
        return json.dumps(v, ensure_ascii=False)
    out = [TS_INTERFACES]
    out.append("export const series: Series[] = " + j(data["series"]) + ";\n")
    out.append("export const studies: Study[] = " + j(data["studies"]) + ";\n")
    out.append("export const looseYears: LooseGroup[] = " + j(data["loose"]) + ";\n")
    dest = os.path.join(REPO, "data", "catalog-data.ts")
    with open(dest, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    return dest


def main():
    cat = cl.load_catalog(os.path.join(MASTER, "catalog.json"))
    probs = cl.validate(cat)
    if probs:
        print("VALIDACIÓN FALLÓ:")
        for p in probs[:40]:
            print("  -", p)
        raise SystemExit(1)
    made = ensure_assets(cat)
    covers = ensure_covers(cat)
    data = cl.site_data(cat, dims)
    dest = emit_ts(data)
    print(f"OK  assets nuevos: {made} | covers nuevos: {covers} | series {len(data['series'])} | studies {len(data['studies'])} | loose {len(data['loose'])}")
    print(f"    -> {os.path.relpath(dest, MASTER)}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Escribir `build.sh` en la raíz del maestro**

```bash
# build.sh
#!/usr/bin/env bash
# Propaga catalog.json al sitio (valida + assets + data/catalog-data.ts).
set -e
cd "$(dirname "$0")"
python3 _scripts/catalog/build_all.py
echo "Sitio actualizado desde catalog.json."
```

Run: `cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico" && chmod +x build.sh`

- [ ] **Step 3: Respaldar los .ts viejos antes de reemplazar**

```bash
cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico/_webpage/site/data"
mkdir -p _backup_precatalog
git mv generated.ts _backup_precatalog/ 2>/dev/null || mv generated.ts _backup_precatalog/
git mv merge.ts _backup_precatalog/ 2>/dev/null || mv merge.ts _backup_precatalog/
git mv series.ts _backup_precatalog/ 2>/dev/null || mv series.ts _backup_precatalog/
git mv studies.ts _backup_precatalog/ 2>/dev/null || mv studies.ts _backup_precatalog/
git mv loose.ts _backup_precatalog/ 2>/dev/null || mv loose.ts _backup_precatalog/
```

- [ ] **Step 4: Generar `catalog-data.ts`**

Run: `cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico" && ./build.sh`
Expected: `OK  assets nuevos: 0 | series 6 | studies ... | loose 3` y el archivo `data/catalog-data.ts` creado. (0 assets nuevos porque ya existen todos.)

- [ ] **Step 5: Repuntar imports de componentes**

Buscar todos los imports viejos y repuntarlos. Editar cada archivo cambiando la fuente a `../data/catalog-data`:

```bash
cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico/_webpage/site"
grep -rln "from '../data/series'\|from '../data/studies'\|from '../data/loose'" pages components context 2>/dev/null
```

En cada `.tsx` resultante, reemplazar las líneas de import. Ejemplo `pages/HomePage.tsx`:

```tsx
// ANTES
import { series } from '../data/series';
import { studies } from '../data/studies';
import { looseYears } from '../data/loose';
// DESPUÉS
import { series, studies, looseYears } from '../data/catalog-data';
```

Archivos a editar (import → `../data/catalog-data`): `pages/SeriesPage.tsx`, `pages/WorkPage.tsx`, `pages/HomePage.tsx`, `pages/StudyPage.tsx`, `pages/StudiesPage.tsx`, `pages/LoosePage.tsx`, `pages/LooseYearPage.tsx`.

- [ ] **Step 6: Repuntar imports de TIPOS (si los hay)**

```bash
cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico/_webpage/site"
grep -rln "import type.*from '../data/\(series\|studies\|loose\)'\|import {.*type.*} from '../data/\(series\|studies\|loose\)'" pages components context 2>/dev/null
grep -rln "from '../data/series'\|from '../data/studies'\|from '../data/loose'\|from '../data/generated'\|from '../data/merge'" pages components context App.tsx index.tsx 2>/dev/null
```

Cualquier archivo que aún importe de los módulos movidos: repuntar a `../data/catalog-data` (que re-exporta las mismas interfaces). Si algún archivo importa `MPhoto`/`mergePhotos`/`GEN`/`GenPhoto` (de merge/generated), esos ya no existen: reemplazar el uso por los tipos de `catalog-data` (`Photo`, etc.). No debería haber ninguno fuera de los .ts movidos.

- [ ] **Step 7: Verificar que el sitio compila**

Run: `cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico/_webpage/site" && npx tsc --noEmit`
Expected: sin errores. Si hay errores de tipo, corregir el import o el uso señalado y re-correr.

- [ ] **Step 8: Verificar en el navegador (dev server)**

Usar preview_start `{name}` del dev server (crear `.claude/launch.json` si falta, con `npm run dev` y su puerto). Navegar a una colección (p.ej. `/work/geometries`). Con read_page / read_console_messages confirmar: títulos de foto en español (Vórtice de Atrio, etc.), sin imágenes rotas (read_network_requests sin 404 de webp), consola sin errores. Alternar idioma: nombres/statement cambian, títulos de foto NO.

- [ ] **Step 9: Commit (repo git)**

```bash
cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico/_webpage/site"
git add data/catalog-data.ts data/_backup_precatalog pages
git commit -m "feat(site): leer fotos y metadata desde catalog.json (catalog-data.ts)

Reemplaza generated/merge/series/studies/loose.ts (respaldados en _backup_precatalog).
Títulos de foto ahora en español (title.es). Imports repuntados.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Libros desde el catálogo

**Files:**
- Modify: `_webpage/site/scripts/make-photobooks.py` (fuente = catálogo vía `catalog_lib`; imagen = `files.portfolio`)
- Modify: `_webpage/site/scripts/make-books.sh` (una línea python)
- Move (backup): `_webpage/site/scripts/{export-books-manifest.ts,_export-books.mjs,books-manifest.json}` → `_webpage/site/scripts/_backup_precatalog/`

**Interfaces:**
- Consumes: `catalog_lib.books_from_catalog(cat)` — cada foto `{'title','portfolio','date'}`.
- Produces: PDFs EN+ES por colección en la carpeta del maestro (igual que hoy).

- [ ] **Step 1: Reemplazar la fuente en `make-photobooks.py`**

Añadir el import de `catalog_lib` (usando MASTER que el script ya calcula) y reemplazar la carga del manifest y la resolución por nombre. Cambios concretos:

En la cabecera, tras `MASTER = ...`:

```python
import sys as _sys
_sys.path.insert(0, os.path.join(MASTER, '_scripts', 'catalog'))
import catalog_lib as _cl
```

Borrar la función `portfolio_index(...)` (ya no se usa) y en `main()` reemplazar:

```python
# ANTES
books = json.load(open(MANIFEST, encoding='utf-8'))
# DESPUÉS
books = _cl.books_from_catalog(_cl.load_catalog(os.path.join(MASTER, 'catalog.json')))
```

Reemplazar el bucle de resolución de fotos (el que usa `pidx`/`portfolio_index`/`hit`/webp fallback) por resolución directa vía `files.portfolio`. El bloque vive en `build_html(book, lang, fonts)` (línea ~173, `resolved = []  # (title, date, uri, size)`):

```python
# dentro de build_html(book, lang, fonts) — reemplazar el bloque que arma `resolved`
resolved = []  # (title, date, uri, size)
missing = []
for ph in book['photos']:
    port_abs = os.path.join(MASTER, ph['portfolio'])
    if not os.path.exists(port_abs):
        missing.append(ph['title'] + ' (FALTA portfolio)')
        continue
    uri, size = img_data_uri(port_abs)
    ymd = ph['date'].replace('-', '')  # 'YYYY-MM-DD' -> 'YYYYMMDD'
    resolved.append((ph['title'], ymd, uri, size))
```

(El resto de `render_book` —`page_cover`, `page_title`, `page_photo`, índice— queda igual; ya usa `book['title']`, `book['statement'][lang]`, `book.get('quote')`, y `title` por placa.)

- [ ] **Step 2: Simplificar `make-books.sh`**

```bash
#!/usr/bin/env bash
# Regenera los fotolibros PDF (EN+ES) desde catalog.json.
#   ./scripts/make-books.sh            # todos
#   ./scripts/make-books.sh elsewhere  # filtra por slug/título
set -e
cd "$(dirname "$0")/.."
python3 scripts/make-photobooks.py "$@"
```

- [ ] **Step 3: Respaldar la cadena TS de libros**

```bash
cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico/_webpage/site/scripts"
mkdir -p _backup_precatalog
for f in export-books-manifest.ts _export-books.mjs books-manifest.json; do
  git mv "$f" _backup_precatalog/ 2>/dev/null || mv "$f" _backup_precatalog/ 2>/dev/null || true
done
```

- [ ] **Step 4: Regenerar un libro y verificar**

Run: `cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico/_webpage/site" && ./scripts/make-books.sh elsewhere`
Expected: genera `Works/Elsewhere/Fotolibro Elsewhere (EN).pdf` y `(ES).pdf` sin error, sin fotos FALTA.

- [ ] **Step 5: Inspeccionar el PDF**

Leer el PDF ES con la herramienta Read (`Works/Elsewhere/Fotolibro Elsewhere (ES).pdf`, primeras páginas). Confirmar: orden curado, statement en español, placas con título en español (p.ej. la portada/placas de Elsewhere), sin páginas en blanco por imagen faltante.

- [ ] **Step 6: Commit (repo git)**

```bash
cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico/_webpage/site"
git add scripts/make-photobooks.py scripts/make-books.sh scripts/_backup_precatalog
git commit -m "feat(books): renderizar fotolibros desde catalog.json

Imagen por files.portfolio (no por match de nombre); placas en title.es.
Elimina la cadena export-books-manifest.ts (respaldada).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Instagram desde el catálogo (híbrido)

**Files:**
- Modify: `_scripts/catalog/` no cambia; editar `_scripts/instagram_daily.py` (cola + caption + dedup desde `catalog_lib`)

**Interfaces:**
- Consumes: `catalog_lib.ig_queue(cat)`, `catalog_lib.dedup_keys(row)`, `catalog_lib.load_catalog`.
- Produces: misma conducta de publicación; título línea 1 = `title.es`; dedup contra `{title.es, title.en}`.

- [ ] **Step 1: Importar catalog_lib y reemplazar `build_queue`**

En `instagram_daily.py`, tras `ROOT = ...` (que es el maestro):

```python
sys.path.insert(0, os.path.join(ROOT, '_scripts', 'catalog'))
import catalog_lib as cl
```

Reemplazar `build_queue()` por lectura del catálogo (rutas web absolutas contra ROOT):

```python
def build_queue():
    """Cola cronológica asc desde catalog.json; ruta web absoluta."""
    cat = cl.load_catalog(os.path.join(ROOT, 'catalog.json'))
    rows = cl.ig_queue(cat)
    for r in rows:
        r['path'] = os.path.join(ROOT, r['path'])
        r['title'] = r['title_es']            # título mostrado = español
    return rows
```

- [ ] **Step 2: Dedup contra la unión ES∪EN**

Localizar donde se filtra la cola contra `published_titles(token)` (el set de títulos ya publicados). Reemplazar la comprobación por-foto para que use la unión de claves:

```python
# ANTES (aprox): if norm(row['title']) in published: skip
# DESPUÉS:
pub = published_titles(token)  # set de títulos normalizados de captions publicados
def already_posted(row):
    return bool(cl.dedup_keys(row) & pub)
# la primera sin publicar:
nxt = next((r for r in queue if not already_posted(r)), None)
```

(Asegurar que `published_titles` normaliza igual que `catalog_lib._norm`: minúsculas, sin guiones bajos, strip. Ya hace `lower()`+strip; añadir `.replace('_',' ')` si hiciera falta para igualar.)

- [ ] **Step 3: Caption híbrido con base del catálogo**

Donde se arma el caption, línea 1 = `row['title']` (ya es title.es). Mantener la llamada a `claude` visión para hashtags. El fallback determinista indexa `COLLECTION_TAGS` por nombre de colección EN, pero `row['coll']` ahora es el slug del catálogo (p.ej. `loose-2022-2026`); mapear slug → etiqueta con:

```python
def coll_label(row, cat_cols):
    slug = row['coll']
    col = next((c for c in cat_cols if c['slug'] == slug), None)
    if not col:
        return 'Loose'
    return 'Loose' if col['kind'] == 'loose' else col['names']['en']
```

Usar `coll_label(...)` para indexar `COLLECTION_TAGS` (que está llaveado por nombre EN: 'Geometries', 'Loose', etc.). Pasar `cat['collections']` a esa función (cargar el catálogo una vez al inicio de la corrida y reutilizarlo).

- [ ] **Step 4: Verificar en modo `--prepare` (NO publica)**

Run: `cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico" && python3 _scripts/instagram_daily.py --prepare`
Expected: imprime el plan — elige la foto más antigua NO publicada, con `title.es` como línea 1, hashtags sanos (base + fijos, y visión si `claude` responde), y salta las ya publicadas (incluidas históricas en inglés). No publica nada. Si el token está vencido, reporta y sale (aceptable para la verificación de la cola: comprobar que la cola y el título salen bien antes del punto de token).

- [ ] **Step 5: Commit — NO aplica**

`_scripts/instagram_daily.py` vive en el maestro (sin git). Dejar en disco. Registrar el cambio en la memoria del proyecto en la Task 5.

---

### Task 5: Limpieza y cierre

**Files:**
- Delete (tras verificación OK): `_webpage/site/data/_backup_precatalog/`, `_webpage/site/scripts/_backup_precatalog/`
- Delete: `_webpage/site/scripts/sync-photos.py`, `_webpage/site/scripts/sync-loose.py` (reemplazados por build_all.py)
- Modify: memoria del proyecto (`project_catalog.md`)

- [ ] **Step 1: Confirmar que las 3 verificaciones pasaron**

Revisar checklist: sitio compila + navegador OK (Task 2 Step 7-8), libro EN+ES OK (Task 3 Step 4-5), IG `--prepare` OK (Task 4 Step 4). Si alguna falló, NO borrar respaldos; volver a la tarea correspondiente.

- [ ] **Step 2: Borrar respaldos y scripts muertos**

```bash
cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico/_webpage/site"
git rm -r data/_backup_precatalog scripts/_backup_precatalog
git rm scripts/sync-photos.py scripts/sync-loose.py
```

- [ ] **Step 3: Verificar que nada referencia lo borrado**

```bash
cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico/_webpage/site"
grep -rn "sync-photos\|sync-loose\|books-manifest\|export-books-manifest\|data/generated\|data/merge\|data/series\|data/studies\|data/loose" --include="*.ts" --include="*.tsx" --include="*.py" --include="*.sh" --include="*.json" . | grep -v node_modules | grep -v _backup
```
Expected: sin resultados (salvo, quizá, comentarios en CLAUDE.md que se actualizan si aparecen).

- [ ] **Step 4: `npx tsc --noEmit` final + build de producción**

Run: `cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico/_webpage/site" && npx tsc --noEmit && npm run build`
Expected: compila y `dist/` se genera sin error.

- [ ] **Step 5: Commit final (repo git)**

```bash
cd "/Users/luish.reyes/Desktop/Portafolio Fotográfico/_webpage/site"
git commit -m "chore: eliminar fuentes paralelas (sync-photos/loose, backups) — catalog.json es la única fuente

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 6: Actualizar la memoria del proyecto**

Editar `/Users/luish.reyes/.claude/projects/-Users-luish-reyes-Desktop-Portafolio-Fotogr-fico/memory/project_catalog.md`: añadir que sitio, libros e Instagram leen de `catalog.json` vía `_scripts/catalog/catalog_lib.py`; que `./build.sh` propaga al sitio; que `make-books.sh` y `instagram_daily.py` leen el catálogo directo; y que `sync-photos.py`/`merge.ts`/`series.ts`/`studies.ts`/`loose.ts`/`export-books-manifest.ts` fueron eliminados.

---

## Notas de verificación cruzada (para quien ejecute)

- **Cover de Loose**: antes el sitio usaba una foto fija (Cerrazón) como portada del bin; ahora es la más reciente del bin (orden date desc). Es un cambio visual esperado; confirmarlo con Luis si le importa. Si quiere fija, se agrega `cover_photo_id` al objeto de colección loose en el catálogo y `site_data` ya lo respeta vía `cover_file`.
- **IDs de foto**: `catalog-data.ts` usa el `id` del catálogo (p.ej. `20150307_atrium-vortex`) en vez de `geometries-01`. Verificar que ninguna ruta/lightbox dependa del formato viejo (la búsqueda del Task 2 Step 6 lo cubre).

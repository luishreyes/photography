import { GEN, type GenPhoto } from './generated';

// A photo shape compatible with both Series.photos and Study.photos.
export interface MPhoto {
  id: string;
  title: string;
  src: string;
  thumb?: string;
  width?: number;
  height?: number;
  year?: number;
}

const genToPhoto = (g: GenPhoto): MPhoto => ({
  id: g.id, title: g.title, src: g.src, thumb: g.thumb, width: g.width, height: g.height,
});

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Merge folder-synced photos (GEN[slug], the real frameless files) over a
 * hand-authored fallback list, so metadata/order intent lives in code and the
 * actual images come from the archive.
 *
 * - `keep`      → follow the fallback order (Adobe/curated); swap each entry's
 *                 src to the real file when the folder has it; append
 *                 folder-only photos (by date, oldest→newest); keep repo-only
 *                 photos untouched (Luis still has to locate them).
 * - `date-desc` → order purely by capture date, newest first; append any
 *                 repo-only fallback photos after.
 *
 * If the folder has nothing for this slug, the fallback is returned as-is.
 */
export function mergePhotos(slug: string, fallback: MPhoto[], mode: 'keep' | 'date-desc' | 'curated' = 'keep'): MPhoto[] {
  const gen = GEN[slug] || [];
  if (gen.length === 0) return fallback;

  const genByTitle = new Map(gen.map(g => [norm(g.title), g]));
  const out: MPhoto[] = [];
  const used = new Set<string>();

  if (mode === 'curated') {
    // Order the REAL folder photos by the fallback title sequence (a curatorial
    // hint). Fallback titles with no folder file are skipped (no broken images);
    // folder photos not in the hint are appended by date.
    for (const f of fallback) {
      const g = genByTitle.get(norm(f.title));
      if (g && !used.has(norm(g.title))) { used.add(norm(g.title)); out.push(genToPhoto(g)); }
    }
    for (const g of [...gen].sort((a, b) => a.date.localeCompare(b.date))) {
      if (!used.has(norm(g.title))) out.push(genToPhoto(g));
    }
    return out;
  }

  if (mode === 'date-desc') {
    for (const g of [...gen].sort((a, b) => b.date.localeCompare(a.date))) {
      used.add(norm(g.title));
      out.push(genToPhoto(g));
    }
    for (const f of fallback) if (!used.has(norm(f.title))) out.push(f);
    return out;
  }

  // mode 'keep'
  for (const f of fallback) {
    const g = genByTitle.get(norm(f.title));
    if (g) { used.add(norm(g.title)); out.push({ ...f, src: g.src, thumb: g.thumb, width: g.width, height: g.height }); }
    else out.push(f); // repo-only, kept
  }
  for (const g of [...gen].sort((a, b) => a.date.localeCompare(b.date))) {
    if (!used.has(norm(g.title))) out.push(genToPhoto(g));
  }
  return out;
}

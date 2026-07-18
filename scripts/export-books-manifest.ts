// Exporta el orden curado + statements EN/ES de cada colección a books-manifest.json.
// Única fuente de verdad: series.ts / studies.ts / loose.ts (mismo orden que el sitio).
// El renderer (make-photobooks.py) resuelve foto y fecha desde los Portfolio/ del archivo.
// Correr: esbuild bundle -> node (ver make-books wrapper).
import { series } from '../data/series';
import { studies } from '../data/studies';
import { looseYears } from '../data/loose';
import { writeFileSync } from 'node:fs';

const LOOSE_STATEMENT = {
  en: "Photographs that don't belong to any series. Kept loose, ordered by year.",
  es: 'Fotografías que no pertenecen a ninguna serie. Sueltas, ordenadas por año.',
};

interface Book {
  kind: 'work' | 'study' | 'loose';
  slug: string;
  title: string;
  folder: string; // relativo al master
  yearLabel: string;
  statement: { en: string; es: string };
  quote?: { text: string; author: string };
  photos: { title: string; webp: string }[]; // en orden; webp = fallback si falta el Portfolio jpg
}

const books: Book[] = [];

for (const s of series) {
  if (!s.photos.length) continue;
  books.push({
    kind: 'work', slug: s.slug, title: s.title,
    folder: `Works/${s.title}`,
    yearLabel: s.year ? String(s.year) : '',
    statement: s.description,
    quote: s.quote,
    photos: s.photos.map(p => ({ title: p.title, webp: p.src })),
  });
}

for (const s of studies) {
  if (!s.photos.length) continue;
  books.push({
    kind: 'study', slug: s.slug, title: s.title,
    folder: `Studies/${s.title}`,
    yearLabel: s.year ? String(s.year) : '',
    statement: s.description,
    quote: s.quote,
    photos: s.photos.map(p => ({ title: p.title, webp: p.src })),
  });
}

for (const g of looseYears) {
  if (!g.photos.length) continue;
  books.push({
    kind: 'loose', slug: `loose-${g.year}`, title: g.year,
    folder: `Loose/${g.year}`,
    yearLabel: g.year.replace('-', '–'),
    statement: LOOSE_STATEMENT,
    photos: g.photos.map(p => ({ title: p.title, webp: p.src })),
  });
}

const out = new URL('./books-manifest.json', import.meta.url);
writeFileSync(out, JSON.stringify(books, null, 2));
console.log(`books: ${books.length}  (works+studies+loose)`);
for (const b of books) console.log(`  ${b.kind.padEnd(5)} ${b.title.padEnd(16)} ${b.photos.length} fotos -> ${b.folder}`);

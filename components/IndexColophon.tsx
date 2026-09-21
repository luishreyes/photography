import { useI18n } from '../context/i18n';
import type { UIKey } from '../context/i18n';
import type { Span } from '../data/catalog-data';

interface Group {
  photos: unknown[];
  span?: Span;
}

/** Colofón de las páginas índice: cuántos grupos, cuántas fotografías y en qué
 *  rango de años. Todo se deriva de catalog.json — el span viene del EXIF
 *  (date_captured) que guarda la Fase A, así que al ingresar una foto los
 *  números suben solos con el siguiente ./build.sh. */
export function colophon(groups: Group[]) {
  const photos = groups.reduce((n, g) => n + g.photos.length, 0);
  const spans = groups.map(g => g.span).filter((s): s is Span => Boolean(s));
  const from = spans.length ? spans.reduce((a, s) => (s.from < a ? s.from : a), spans[0].from) : null;
  const to = spans.length ? spans.reduce((a, s) => (s.to > a ? s.to : a), spans[0].to) : null;
  const range = from ? (from === to ? from : `${from} — ${to}`) : null;
  return { photos, range };
}

export default function IndexColophon({ groups, unit }: { groups: Group[]; unit: UIKey }) {
  const { t } = useI18n();
  const { photos, range } = colophon(groups);
  return (
    <p className="eyebrow mt-6 pt-3 border-t border-hair">
      {groups.length} {t(unit)} · {photos} {t('colophon.photographs')}{range && ` · ${range}`}
    </p>
  );
}

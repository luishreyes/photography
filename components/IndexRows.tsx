import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SmartImg from './SmartImg';
import { EASE } from './Reveal';

export interface RowItem {
  to: string;
  name: string;
  meta?: string;      // año, conteo… a la derecha, en mono
  cover?: string;
}

// El índice del template: número / nombre serif / año en mono, una regla
// entre filas. Al pasar el cursor la fila se corre 14px, el nombre pasa a
// itálica y el número toma el acento. Con `preview`, una columna pegajosa a la
// derecha muestra la portada de la fila activa (en pantallas grandes); en
// pantallas chicas cada fila lleva su miniatura.
export default function IndexRows({ items, preview = false, className = '' }: { items: RowItem[]; preview?: boolean; className?: string }) {
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];

  const rows = (
    <div>
      {items.map((it, i) => (
        <Link key={it.to} to={it.to}
          onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}
          className={`group grid ${preview ? 'grid-cols-[56px_1fr_auto] lg:grid-cols-[28px_1fr_auto]' : 'grid-cols-[28px_1fr_auto]'} gap-[18px] items-center lg:items-baseline py-[18px] border-t border-hair last:border-b transition-all duration-[400ms] ease-out hover:pl-[14px]`}>
          {preview && it.cover ? (
            <>
              <span className="lg:hidden block w-14 aspect-[4/5] overflow-hidden bg-paper-2">
                <SmartImg src={it.cover} alt="" loading="lazy" className="w-full h-full object-cover grayscale" />
              </span>
              <span className="hidden lg:block font-mono text-[11px] text-muted transition-colors duration-300 group-hover:text-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
            </>
          ) : (
            <span className="font-mono text-[11px] text-muted transition-colors duration-300 group-hover:text-accent">
              {String(i + 1).padStart(2, '0')}
            </span>
          )}
          <span className="font-serif text-[clamp(22px,2.4vw,34px)] leading-[1.05] group-hover:italic">{it.name}</span>
          {it.meta && <span className="font-mono text-[11px] text-muted text-right whitespace-nowrap">{it.meta}</span>}
        </Link>
      ))}
    </div>
  );

  if (!preview) return <div className={className}>{rows}</div>;

  return (
    <div className={`lg:grid lg:grid-cols-[1fr_minmax(280px,36%)] lg:gap-[var(--pad)] lg:items-start ${className}`}>
      {rows}
      <div className="hidden lg:block sticky top-28">
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-paper-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {current?.cover && (
              <motion.div key={current.to}
                initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="absolute inset-0">
                <SmartImg src={current.cover} alt="" className="w-full h-full object-cover grayscale" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex justify-between mt-3 font-mono text-[11px] tracking-[0.06em] text-muted">
          <span>{String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
          <span>{current?.name}</span>
        </div>
      </div>
    </div>
  );
}

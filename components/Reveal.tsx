import { motion, type HTMLMotionProps } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1] as const;

// Aparece subiendo 34px al entrar en pantalla, una vez. `delay` en pasos de 80 ms,
// como los .d1/.d2/.d3 del template.
export function Reveal({ delay = 0, children, ...rest }: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 1, ease: EASE, delay: delay * 0.08 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// Cortina: la imagen se descubre de arriba hacia abajo. El observador va en
// un envoltorio SIN recorte: Chrome calcula la intersección sobre el área ya
// recortada por clip-path, así que un elemento recortado al 100% nunca "entra
// en pantalla" y la cortina no abría (hero en blanco, 2026-09-21). Las
// variantes se propagan al hijo, que es el que lleva el clip-path.
const curtain = {
  hidden: { clipPath: 'inset(0% 0% 100% 0%)' },
  show: { clipPath: 'inset(0% 0% 0% 0%)' },
};

export function Clip({ delay = 0, children, className, ...rest }: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.16 }}
      className={className}
      {...rest}
    >
      <motion.div variants={curtain} transition={{ duration: 1.2, ease: EASE, delay: delay * 0.08 }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

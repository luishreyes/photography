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

// Cortina: la imagen se descubre de arriba hacia abajo.
export function Clip({ delay = 0, children, ...rest }: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 1.2, ease: EASE, delay: delay * 0.08 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

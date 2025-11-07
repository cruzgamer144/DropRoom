import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: 'left' | 'center';
}

export function SectionHeading({ eyebrow, title, description, align = 'left' }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={align === 'center' ? 'text-center' : 'text-left'}
    >
      {eyebrow && <p className="text-xs uppercase tracking-[0.25em] text-ink/50">{eyebrow}</p>}
      <h2 className="mt-3 text-2xl font-semibold text-ink md:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-base text-ink/60">{description}</p>}
    </motion.div>
  );
}

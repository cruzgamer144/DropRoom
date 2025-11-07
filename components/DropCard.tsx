import Image from 'next/image';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Button } from './Button';

interface DropCardProps {
  title: string;
  price: string;
  status?: 'Autenticado' | 'Exclusivo' | 'Em Breve';
  imageUrl: string;
  onAction?: () => void;
  actionLabel?: string;
  disabled?: boolean;
  description?: string;
  subtle?: boolean;
}

export function DropCard({
  title,
  price,
  status = 'Autenticado',
  imageUrl,
  onAction,
  actionLabel = 'Reservar Agora',
  disabled,
  description,
  subtle
}: DropCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={clsx(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink/5 bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-glow',
        subtle ? 'bg-white/60' : 'bg-white'
      )}
    >
      <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl sheen">
        <Image
          src={imageUrl}
          alt={`Drop ${title}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">{title}</h3>
            {description && <p className="mt-1 text-sm text-ink/60">{description}</p>}
          </div>
          <span className="rounded-full border border-champagne/50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-ink/80">
            {status}
          </span>
        </div>
        <p className="text-xl font-semibold text-ink">{price}</p>
        {onAction && (
          <Button onClick={onAction} disabled={disabled} className="mt-auto">
            {disabled ? 'Limite Atingido' : actionLabel}
          </Button>
        )}
      </div>
    </motion.article>
  );
}

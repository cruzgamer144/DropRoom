import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  loading?: boolean;
}

export function Button({ children, className, variant = 'primary', loading, disabled, ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <motion.button
      whileHover={!isDisabled ? { y: -2 } : undefined}
      whileTap={!isDisabled ? { y: 0 } : undefined}
      className={clsx(
        'relative inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary'
          ? 'bg-ink text-white hover:bg-ink/90'
          : 'border border-ink/10 bg-white text-ink hover:border-champagne hover:text-ink',
        className
      )}
      disabled={isDisabled}
      {...rest}
    >
      <span className="flex items-center gap-2">
        {loading && <span className="h-2 w-2 animate-ping rounded-full bg-champagne" aria-hidden="true" />}
        {children}
      </span>
    </motion.button>
  );
}

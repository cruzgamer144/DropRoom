import clsx from 'clsx';

interface ProgressBarProps {
  value: number;
  max: number;
}

export function ProgressBar({ value, max }: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));

  return (
    <div className="relative h-3 w-full overflow-hidden rounded-full bg-ink/10">
      <div
        className={clsx('h-full rounded-full bg-champagne transition-all duration-500')}
        style={{ width: `${percentage}%` }}
        aria-hidden="true"
      />
      <span className="sr-only">
        {value} de {max} reservas utilizadas
      </span>
    </div>
  );
}

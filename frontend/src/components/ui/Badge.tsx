/**
 * @file Badge.tsx
 * @description Versatile badge/chip for sizes, language tags, status labels.
 */

import clsx from 'clsx';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'ghost' | 'outline';
type BadgeSize    = 'xs' | 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default:  'bg-white/10 text-white/80 border border-white/10',
  primary:  'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  success:  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  warning:  'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  ghost:    'bg-transparent text-white/60 border border-white/10',
  outline:  'bg-transparent text-indigo-400 border border-indigo-500/50',
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px] rounded',
  sm: 'px-2 py-0.5 text-xs rounded-md',
  md: 'px-2.5 py-1 text-sm rounded-lg',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium leading-none',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
    >
      {children}
    </span>
  );
}

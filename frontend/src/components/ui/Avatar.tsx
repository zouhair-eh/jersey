/**
 * @file Avatar.tsx
 * @description Round avatar with fallback initials and optional online indicator.
 */

import Image from 'next/image';
import clsx from 'clsx';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

const SIZE_MAP: Record<AvatarSize, { wrapper: string; text: string; dot: string }> = {
  sm:  { wrapper: 'w-8 h-8',   text: 'text-xs',   dot: 'w-2 h-2'   },
  md:  { wrapper: 'w-10 h-10', text: 'text-sm',   dot: 'w-2.5 h-2.5' },
  lg:  { wrapper: 'w-14 h-14', text: 'text-lg',   dot: 'w-3 h-3'   },
  xl:  { wrapper: 'w-20 h-20', text: 'text-2xl',  dot: 'w-3.5 h-3.5' },
  '2xl': { wrapper: 'w-28 h-28', text: 'text-4xl', dot: 'w-4 h-4'  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Avatar({
  src,
  name,
  size = 'md',
  online,
  className,
}: AvatarProps) {
  const { wrapper, text, dot } = SIZE_MAP[size];

  return (
    <div className={clsx('relative inline-flex flex-shrink-0', className)}>
      <div
        className={clsx(
          wrapper,
          'rounded-full overflow-hidden ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-brand-dark'
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 128px"
            className="object-cover"
          />
        ) : (
          <div
            className={clsx(
              'w-full h-full flex items-center justify-center font-bold',
              'bg-gradient-to-br from-indigo-600 to-purple-700 text-white',
              text
            )}
            aria-label={name}
          >
            {getInitials(name)}
          </div>
        )}
      </div>

      {/* Online indicator dot */}
      {online !== undefined && (
        <span
          className={clsx(
            dot,
            'absolute bottom-0 end-0 rounded-full border-2 border-brand-dark',
            online ? 'bg-emerald-400' : 'bg-white/30'
          )}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}

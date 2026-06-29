'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export type BadgeType = 'HOT' | 'NEW' | 'LIMITED' | null;

const BADGE_STYLES: Record<NonNullable<BadgeType>, { bg: string; text: string; glow: string }> = {
  HOT:     { bg: '#FF3D3D', text: '#fff',    glow: '0 0 12px rgba(255,61,61,0.6)' },
  NEW:     { bg: '#00FF87', text: '#0A0A0F', glow: '0 0 12px rgba(0,255,135,0.6)' },
  LIMITED: { bg: '#C8A84B', text: '#0A0A0F', glow: '0 0 12px rgba(200,168,75,0.6)' },
};

export interface ProductCardProps {
  name:      string;
  club:      string;
  price:     number;
  badge?:    BadgeType;
  image?:    string;
  gradient?: string;
  onAdd?:    () => void;
  onClick?:  () => void;
}

export default function ProductCard({
  name,
  club,
  price,
  badge,
  image,
  gradient = 'from-[#1A1A40] to-[#0d0d20]',
  onAdd,
  onClick,
}: ProductCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-[#1A1A26] border border-white/[0.08] cursor-pointer transition-all duration-300 hover:border-[#00FF87]/50 hover:-translate-y-1.5"
      style={{ '--tw-shadow': '' } as React.CSSProperties}
      whileHover={{ boxShadow: '0 0 24px rgba(0,255,135,0.25)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Badge */}
      {badge && (
        <div
          className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider animate-badge-pulse"
          style={{
            backgroundColor: BADGE_STYLES[badge].bg,
            color:           BADGE_STYLES[badge].text,
            boxShadow:       BADGE_STYLES[badge].glow,
          }}
        >
          {badge}
        </div>
      )}

      {/* Image */}
      <div className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-br ${gradient}`}>
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-7xl opacity-30">👕</span>
          </div>
        )}
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#1A1A26] to-transparent" />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 sm:gap-1.5 p-3 sm:p-4 flex-1">
        <p className="text-[#A0A0B0] text-[10px] sm:text-xs font-medium tracking-wide uppercase">
          {club}
        </p>
        <h3 className="text-white font-semibold text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
          {name}
        </h3>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span
            className="text-[#00FF87] font-bold text-lg sm:text-xl"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
          >
            {price} MAD
          </span>

          <button
            onClick={(e) => { e.stopPropagation(); onAdd?.(); }}
            className="flex items-center justify-center p-2 sm:px-4 sm:py-2 rounded-lg border border-[#00FF87]/40 text-[#00FF87] hover:bg-[#00FF87] hover:text-[#0A0A0F] hover:border-[#00FF87] hover:shadow-[0_0_14px_rgba(0,255,135,0.5)] transition-all duration-200"
          >
            <Plus size={14} />
            <span className="hidden sm:inline text-xs font-bold tracking-wide ml-1.5">Ajouter</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

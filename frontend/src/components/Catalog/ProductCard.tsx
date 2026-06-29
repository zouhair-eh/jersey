/**
 * @file ProductCard.tsx
 * @description Single product (Tenue) card for jersey_marocco.
 *
 * Features:
 *  - Responsive image with hover zoom + gradient overlay
 *  - Multi-language title (resolved via `locale` prop)
 *  - Price display with MAD currency
 *  - Size badges (available / out-of-stock)
 *  - Rating stars
 *  - Wishlist heart toggle
 *  - "Add to cart" CTA with loading state
 */

'use client';

import RippleImage from '@/components/ui/RippleImage';
import { useState } from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import clsx from 'clsx';
import Badge      from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';

// ... (skip unchanged types)

export interface ProductLocaleString {
  ar: string;
  fr: string;
  en: string;
}

export interface ProductSize {
  label: string;
  stock: number;
}

export interface ProductCardProps {
  id:           string;
  title:        ProductLocaleString;
  images:       { url: string; altText?: string }[];
  price:        { amount: number; currency?: string };
  sizes:        ProductSize[];
  averageRating: number;
  totalReviews:  number;
  isNew?:        boolean;
  locale?:       'ar' | 'fr' | 'en';
  onAddToCart:   (id: string) => Promise<void> | void;
  onViewDetail:  (id: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveTitle(title: ProductLocaleString, locale: 'ar' | 'fr' | 'en'): string {
  return title[locale] || title.fr || title.en || title.ar;
}

function formatPrice(amount: number, currency = 'MAD'): string {
  return new Intl.NumberFormat('fr-MA', {
    style:    'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProductCard({
  id,
  title,
  images,
  price,
  sizes,
  averageRating,
  totalReviews,
  isNew = false,
  locale = 'fr',
  onAddToCart,
  onViewDetail,
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [loading,    setLoading]    = useState(false);

  const coverImage   = images[0];
  const displayTitle = resolveTitle(title, locale);
  const totalStock   = sizes.reduce((s, sz) => s + sz.stock, 0);
  const inStock      = totalStock > 0;

  async function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    if (!inStock || loading) return;
    setLoading(true);
    try {
      await onAddToCart(id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <article
      className={clsx(
        'group relative flex flex-col rounded-xl overflow-hidden',
        'bg-[#0A0A0A] border border-white/10',
        'hover:border-white/30 hover:bg-[#111111]',
        'transition-all duration-300 cursor-pointer animate-fade-up'
      )}
      onClick={() => onViewDetail(id)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onViewDetail(id)}
      aria-label={displayTitle}
    >
      {/* ── Image Container ──────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
        {coverImage ? (
          <RippleImage
            src={coverImage.url}
            alt={coverImage.altText ?? displayTitle}
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          /* Placeholder when image fails or is missing */
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">⚽</span>
          </div>
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />

        {/* ── Top badges ──────────────────────────────────────────── */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5">
          {isNew && (
            <Badge variant="primary" size="sm">
              Nouveau
            </Badge>
          )}
          {!inStock && (
            <Badge variant="warning" size="sm">
              Rupture
            </Badge>
          )}
        </div>

        {/* ── Wishlist button ──────────────────────────────────────── */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setWishlisted((v) => !v);
          }}
          className={clsx(
            'absolute top-3 end-3 p-2 rounded',
            'bg-black/60 backdrop-blur-sm border border-white/10',
            'hover:scale-105 active:scale-95 transition-transform',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-white'
          )}
          aria-label={wishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={wishlisted}
        >
          <Heart
            className={clsx(
              'w-4 h-4 transition-colors',
              wishlisted
                ? 'fill-white text-white'
                : 'text-white/70 hover:text-white'
            )}
          />
        </button>

        {/* ── Quick view on hover ──────────────────────────────────── */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetail(id); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white hover:bg-white/20 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Aperçu rapide
          </button>
        </div>
      </div>

      {/* ── Card Body ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Title */}
        <h3 className="font-bold text-[#FAFAFA] text-base leading-snug line-clamp-2 min-h-[2.5rem]">
          {displayTitle}
        </h3>

        {/* Rating */}
        <StarRating rating={averageRating} reviewCount={totalReviews} size="sm" />

        {/* Sizes */}
        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label="Tailles disponibles">
            {sizes.map((sz) => (
              <Badge
                key={sz.label}
                variant={sz.stock > 0 ? 'ghost' : 'default'}
                size="xs"
                className={sz.stock === 0 ? 'opacity-40 line-through' : ''}
              >
                {sz.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Price + CTA row */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-4 border-t border-white/10">
          <span className="text-lg font-bold text-[#FAFAFA]">
            {formatPrice(price.amount, price.currency)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={!inStock || loading}
            className={clsx(
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-bold',
              'transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white',
              inStock && !loading
                ? 'bg-[#FAFAFA] text-[#000000] hover:bg-[#E4E4E7] active:scale-95'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            )}
            aria-label={inStock ? 'Ajouter au panier' : 'Rupture de stock'}
          >
            {loading ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5" />
            )}
            {loading ? 'Ajout...' : inStock ? 'Ajouter' : 'Indisponible'}
          </button>
        </div>
      </div>
    </article>
  );
}

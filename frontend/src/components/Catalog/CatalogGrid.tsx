/**
 * @file CatalogGrid.tsx
 * @description Responsive product catalog grid with client-side filtering,
 *              sorting, and a search bar for jersey_marocco.
 *
 * Features:
 *  - Search by title (across all 3 locales)
 *  - Filter by size
 *  - Sort by: newest, price asc/desc, rating
 *  - Result count display
 *  - Empty state
 *  - Loading skeleton grid
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import ProductCard, { type ProductCardProps } from './ProductCard';

// ── Types ─────────────────────────────────────────────────────────────────────

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'rating';

interface CatalogProduct extends Omit<ProductCardProps, 'onAddToCart' | 'onViewDetail'> {
  createdAt: string; // ISO date string for sorting
}

interface CatalogGridProps {
  products:     CatalogProduct[];
  locale?:      'ar' | 'fr' | 'en';
  isLoading?:   boolean;
  onAddToCart:  (id: string) => Promise<void> | void;
  onViewDetail: (id: string) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SORT_LABELS: Record<SortOption, string> = {
  newest:     'Plus récents',
  price_asc:  'Prix croissant',
  price_desc: 'Prix décroissant',
  rating:     'Mieux notés',
};

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44'] as const;

// ── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-[#13132b] border border-white/[0.06] animate-pulse">
      <div
        className="aspect-[4/3] w-full"
        style={{
          background: 'linear-gradient(90deg, #1a1a35 25%, #1e1e40 50%, #1a1a35 75%)',
          backgroundSize: '400px 100%',
          animation: 'shimmer 1.6s linear infinite',
        }}
      />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/5 rounded-lg w-3/4" />
        <div className="h-3 bg-white/5 rounded-lg w-1/2" />
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 w-7 bg-white/5 rounded" />
          ))}
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
          <div className="h-5 bg-white/5 rounded-lg w-20" />
          <div className="h-8 bg-white/5 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}

// ── Filter Bar ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  search:       string;
  onSearch:     (v: string) => void;
  selectedSize: string;
  onSizeChange: (v: string) => void;
  sort:         SortOption;
  onSortChange: (v: SortOption) => void;
  resultCount:  number;
  totalCount:   number;
}

function FilterBar({
  search, onSearch,
  selectedSize, onSizeChange,
  sort, onSortChange,
  resultCount, totalCount,
}: FilterBarProps) {
  const [sizeOpen, setSizeOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="space-y-4 mb-8">
      {/* Top row: search + controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Rechercher un maillot..."
            className={clsx(
              'w-full ps-10 pe-4 py-2.5 rounded-xl text-sm',
              'bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-white/30',
              'focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30',
              'transition-colors'
            )}
          />
          {search && (
            <button
              onClick={() => onSearch('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              aria-label="Effacer la recherche"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Size filter */}
        <div className="relative">
          <button
            onClick={() => { setSizeOpen((v) => !v); setSortOpen(false); }}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium',
              'bg-white/[0.06] border border-white/[0.08] text-white/80',
              'hover:bg-white/[0.09] transition-colors whitespace-nowrap',
              selectedSize && 'border-indigo-500/40 text-indigo-300'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {selectedSize ? `Taille: ${selectedSize}` : 'Toutes tailles'}
            <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', sizeOpen && 'rotate-180')} />
          </button>
          {sizeOpen && (
            <div className="absolute top-full start-0 mt-2 z-30 p-2 rounded-xl bg-[#0f0f23] border border-white/10 shadow-2xl shadow-black/50 min-w-[180px]">
              <button
                onClick={() => { onSizeChange(''); setSizeOpen(false); }}
                className={clsx(
                  'w-full text-start px-3 py-1.5 rounded-lg text-sm transition-colors',
                  !selectedSize ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/70 hover:bg-white/5'
                )}
              >
                Toutes les tailles
              </button>
              <div className="grid grid-cols-5 gap-1 mt-1">
                {ALL_SIZES.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => { onSizeChange(sz); setSizeOpen(false); }}
                    className={clsx(
                      'px-1.5 py-1.5 rounded-lg text-xs font-medium text-center transition-colors',
                      selectedSize === sz
                        ? 'bg-indigo-600 text-white'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => { setSortOpen((v) => !v); setSizeOpen(false); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/[0.06] border border-white/[0.08] text-white/80 hover:bg-white/[0.09] transition-colors whitespace-nowrap"
          >
            {SORT_LABELS[sort]}
            <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', sortOpen && 'rotate-180')} />
          </button>
          {sortOpen && (
            <div className="absolute top-full end-0 mt-2 z-30 p-1 rounded-xl bg-[#0f0f23] border border-white/10 shadow-2xl shadow-black/50 min-w-[180px]">
              {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { onSortChange(key); setSortOpen(false); }}
                  className={clsx(
                    'w-full text-start px-3 py-2 rounded-lg text-sm transition-colors',
                    sort === key
                      ? 'bg-indigo-500/20 text-indigo-300 font-medium'
                      : 'text-white/70 hover:bg-white/5'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Result count + active filter chips */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm text-white/40">
          <span className="text-white font-medium">{resultCount}</span>
          {' '}résultat{resultCount !== 1 ? 's' : ''}
          {totalCount !== resultCount && (
            <span> sur {totalCount}</span>
          )}
        </p>
        {selectedSize && (
          <button
            onClick={() => onSizeChange('')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/25 transition-colors"
          >
            Taille: {selectedSize}
            <X className="w-3 h-3" />
          </button>
        )}
        {search && (
          <button
            onClick={() => onSearch('')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-colors"
          >
            &ldquo;{search}&rdquo;
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Grid Component ───────────────────────────────────────────────────────

export default function CatalogGrid({
  products,
  locale = 'fr',
  isLoading = false,
  onAddToCart,
  onViewDetail,
}: CatalogGridProps) {
  const [search,       setSearch]       = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [sort,         setSort]         = useState<SortOption>('newest');

  // ── Filtered + sorted products ────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...products];

    // 1. Text search across all locales
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((p) =>
        p.title.ar.toLowerCase().includes(q) ||
        p.title.fr.toLowerCase().includes(q) ||
        p.title.en.toLowerCase().includes(q)
      );
    }

    // 2. Size filter
    if (selectedSize) {
      result = result.filter((p) =>
        p.sizes.some((sz) => sz.label === selectedSize && sz.stock > 0)
      );
    }

    // 3. Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'price_asc':  return a.price.amount - b.price.amount;
        case 'price_desc': return b.price.amount - a.price.amount;
        case 'rating':     return b.averageRating - a.averageRating;
        case 'newest':
        default:           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [products, search, selectedSize, sort]);

  const handleSearch      = useCallback((v: string) => setSearch(v), []);
  const handleSizeChange  = useCallback((v: string) => setSelectedSize(v), []);
  const handleSortChange  = useCallback((v: SortOption) => setSort(v), []);

  return (
    <section aria-labelledby="catalog-heading" className="py-8">
      {/* Section heading */}
      <div className="mb-6">
        <h1 id="catalog-heading" className="text-3xl font-bold text-white mb-1">
          Catalogue
        </h1>
        <p className="text-white/50 text-sm">
          Découvrez notre collection exclusive de maillots authentiques.
        </p>
      </div>

      {/* Filter bar */}
      <FilterBar
        search={search}
        onSearch={handleSearch}
        selectedSize={selectedSize}
        onSizeChange={handleSizeChange}
        sort={sort}
        onSortChange={handleSortChange}
        resultCount={filtered.length}
        totalCount={products.length}
      />

      {/* Grid */}
      {isLoading ? (
        /* Loading skeleton */
        <div className="grid grid-cols-catalog gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-catalog gap-5">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              locale={locale}
              onAddToCart={onAddToCart}
              onViewDetail={onViewDetail}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center px-4">
          <span className="text-6xl mb-4">🔍</span>
          <h3 className="text-lg font-semibold text-white mb-2">
            Aucun maillot trouvé
          </h3>
          <p className="text-white/50 text-sm max-w-xs">
            Essayez de modifier votre recherche ou vos filtres.
          </p>
          <button
            onClick={() => { setSearch(''); setSelectedSize(''); }}
            className="mt-5 px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            Effacer les filtres
          </button>
        </div>
      )}
    </section>
  );
}

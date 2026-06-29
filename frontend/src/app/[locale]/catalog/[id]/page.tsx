/**
 * @file page.tsx (Product Detail)
 * @description Single product detail page with image, sizes, reviews.
 *
 * Route: /[locale]/catalog/[id]
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams }           from 'next/navigation';
import { useTranslations }     from 'next-intl';
import { Link }                from '@/i18n/routing';
import Image                   from 'next/image';
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Star,
  Loader2,
  Check,
  User,
} from 'lucide-react';
import {
  apiGetProduct,
  apiGetReviews,
  type ApiProduct,
  type ApiReview,
} from '@/lib/api';
import { useCart } from '@/lib/cart-context';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getJerseyBackStyle(product: ApiProduct) {
  const tagsStr = (product.tags || []).join(' ').toLowerCase();
  const titleStr = JSON.stringify(product.title).toLowerCase();
  
  if (tagsStr.includes('morocco') || tagsStr.includes('maroc') || titleStr.includes('maroc') || titleStr.includes('morocco')) {
    return {
      bg: 'linear-gradient(135deg, #c2410c 0%, #dc2626 50%, #991b1b 100%)', // red
      fontColor: '#00FF87', // neon green
      accentColor: '#15803d',
      borderColor: 'border-red-500',
    };
  }
  if (tagsStr.includes('real-madrid') || titleStr.includes('real madrid')) {
    return {
      bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', // white
      fontColor: '#1e1b4b', // deep blue
      accentColor: '#e2e8f0',
      borderColor: 'border-slate-200',
    };
  }
  if (tagsStr.includes('barcelona') || tagsStr.includes('barcelone') || titleStr.includes('barca') || titleStr.includes('barcelone')) {
    return {
      bg: 'repeating-linear-gradient(90deg, #7f1d1d, #7f1d1d 30px, #1e3a8a 30px, #1e3a8a 60px)', // stripes
      fontColor: '#fbbf24', // yellow gold
      accentColor: '#d97706',
      borderColor: 'border-blue-900',
    };
  }
  if (tagsStr.includes('psg') || titleStr.includes('psg') || titleStr.includes('paris')) {
    return {
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', // dark blue
      fontColor: '#ffffff',
      accentColor: '#dc2626',
      borderColor: 'border-slate-900',
    };
  }
  if (tagsStr.includes('manchester-city') || titleStr.includes('city') || titleStr.includes('manchester')) {
    return {
      bg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', // sky blue
      fontColor: '#ffffff',
      accentColor: '#0369a1',
      borderColor: 'border-sky-400',
    };
  }
  return {
    bg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', // default slate dark
    fontColor: '#ffffff',
    accentColor: '#38bdf8',
    borderColor: 'border-slate-700',
  };
}

function formatPrice(amount: number, currency = 'MAD') {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function resolveText(obj: { ar: string; fr: string; en: string }, locale = 'fr') {
  return obj[locale as keyof typeof obj] || obj.fr || obj.en;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "Aujourd'hui";
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { addToCart } = useCart();
  const [product,      setProduct]      = useState<ApiProduct | null>(null);
  const [reviews,      setReviews]      = useState<ApiReview[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [addedToCart,   setAddedToCart]  = useState(false);
  const [wishlisted,   setWishlisted]   = useState(false);
  const [imgError,     setImgError]     = useState(false);

  // Customization state
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');

  useEffect(() => {
    if (!id) return;

    Promise.all([
      apiGetProduct(id).catch(() => null),
      apiGetReviews(id).catch(() => ({ data: [] })),
    ]).then(([prodRes, revRes]) => {
      if (prodRes?.data) setProduct(prodRes.data);
      if (revRes?.data) setReviews(revRes.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <span className="text-6xl">😕</span>
        <h1 className="text-xl font-bold text-white">Produit introuvable</h1>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au catalogue
        </Link>
      </main>
    );
  }

  const title       = resolveText(product.title);
  const description = resolveText(product.description);
  const coverImage  = product.images[0];
  const totalStock  = product.sizes.reduce((s, sz) => s + sz.stock, 0);
  const inStock     = totalStock > 0;

  async function handleAddToCart() {
    if (!product || !inStock || !selectedSize) return;
    
    addToCart({
      productId: product._id,
      title: product.title,
      price: product.price.amount,
      currency: product.price.currency || 'MAD',
      imageUrl: coverImage?.url || '',
      size: selectedSize,
      customName: customName.trim() || undefined,
      customNumber: customNumber.trim() || undefined,
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/catalog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* ── Image ──────────────────────────────────────────────────── */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
            {viewMode === 'front' ? (
              coverImage && !imgError ? (
                <Image
                  src={coverImage.url}
                  alt={coverImage.altText || title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:1024px) 100vw, 50vw"
                  priority
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-7xl">
                  ⚽
                </div>
              )
            ) : (
              /* simulated back */
              (() => {
                const jerseyStyle = getJerseyBackStyle(product);
                return (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none"
                    style={{
                      background: jerseyStyle.bg,
                    }}
                  >
                    {/* Collar decoration */}
                    <div className="absolute top-0 w-24 h-8 bg-[#0A0A0F] rounded-b-full border-b border-white/10" />

                    {/* Name */}
                    <div
                      className="text-2xl md:text-3xl font-black tracking-widest uppercase mt-6 max-w-full truncate px-4"
                      style={{
                        color: jerseyStyle.fontColor,
                        textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
                      }}
                    >
                      {customName ? customName.trim().toUpperCase() : 'VOTRE NOM'}
                    </div>

                    {/* Number */}
                    <div
                      className="text-7xl md:text-8xl font-black tracking-tighter leading-none mt-4"
                      style={{
                        color: jerseyStyle.fontColor,
                        textShadow: '4px 4px 0px rgba(0,0,0,0.6)',
                      }}
                    >
                      {customNumber ? customNumber.trim() : '10'}
                    </div>

                    {/* Subtitle */}
                    <div className="absolute bottom-6 flex flex-col items-center gap-1">
                      <div className="text-[9px] uppercase tracking-[0.25em] text-white/40">
                        Jersey Marocco Authentic
                      </div>
                      <div
                        className="w-8 h-0.5 rounded-full"
                        style={{ backgroundColor: jerseyStyle.fontColor }}
                      />
                    </div>
                  </div>
                );
              })()
            )}

            {/* Toggle view buttons */}
            <div className="absolute bottom-4 start-4 flex gap-1.5 z-10">
              <button
                type="button"
                onClick={() => setViewMode('front')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'front'
                    ? 'bg-white text-black shadow-md'
                    : 'bg-black/60 text-white hover:bg-black/80'
                }`}
              >
                Face
              </button>
              <button
                type="button"
                onClick={() => setViewMode('back')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'back'
                    ? 'bg-white text-black shadow-md'
                    : 'bg-black/60 text-white hover:bg-black/80'
                }`}
              >
                Dos (Personnalisé)
              </button>
            </div>

            {/* Wishlist */}
            <button
              onClick={() => setWishlisted((v) => !v)}
              className="absolute top-4 end-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10 transition-transform hover:scale-110 active:scale-95"
            >
              <Heart className={`h-5 w-5 ${wishlisted ? 'fill-rose-500 text-rose-500' : 'text-white/60'}`} />
            </button>
          </div>

          {/* ── Details ────────────────────────────────────────────────── */}
          <div className="flex flex-col">
            {/* Category badge */}
            <span className="mb-3 inline-flex self-start rounded-full bg-white/[0.06] border border-white/[0.08] px-3 py-1 text-xs font-medium text-white/50 uppercase tracking-wider">
              {product.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white lg:text-4xl">
              {title}
            </h1>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-4 w-4 ${n <= Math.round(product.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-white/15'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-white/40">
                {product.averageRating.toFixed(1)} ({product.totalReviews} avis)
              </span>
            </div>

            {/* Price */}
            <div className="mt-6 text-3xl font-bold text-white">
              {formatPrice(product.price.amount, product.price.currency)}
            </div>

            {/* Description */}
            <p className="mt-5 text-sm leading-relaxed text-white/45">
              {description}
            </p>

            {/* Sizes */}
            <div className="mt-8">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                Taille
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz.label}
                    onClick={() => sz.stock > 0 && setSelectedSize(sz.label)}
                    disabled={sz.stock === 0}
                    className={`flex h-11 w-14 items-center justify-center rounded-xl text-sm font-medium transition-all ${
                      selectedSize === sz.label
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40 border border-indigo-500'
                        : sz.stock > 0
                        ? 'border border-white/[0.08] bg-white/[0.04] text-white/70 hover:border-white/[0.2] hover:bg-white/[0.08]'
                        : 'border border-white/[0.04] bg-transparent text-white/20 line-through cursor-not-allowed'
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personalization Section */}
            <div className="mt-6 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                Personnalisation (Gratuit 🎁)
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] text-white/40 uppercase mb-1">Nom sur le maillot</label>
                  <input
                    type="text"
                    placeholder="EX: HACHIMI"
                    maxLength={12}
                    value={customName}
                    onChange={(e) => {
                      setCustomName(e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, ''));
                      setViewMode('back');
                    }}
                    className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] text-white/40 uppercase mb-1">Numéro</label>
                  <input
                    type="text"
                    placeholder="10"
                    maxLength={2}
                    value={customNumber}
                    onChange={(e) => {
                      setCustomNumber(e.target.value.replace(/[^0-9]/g, ''));
                      setViewMode('back');
                    }}
                    className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-sm text-center text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>
              
              <p className="text-[10px] text-white/30 mt-2">
                * Facultatif. Laissez vide si vous ne souhaitez pas de marquage.
              </p>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock || !selectedSize}
              className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition-all hover:shadow-xl hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {addedToCart ? (
                <>
                  <Check className="h-4 w-4" />
                  Ajouté au panier !
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  {!inStock ? 'Rupture de stock' : !selectedSize ? 'Sélectionnez une taille' : 'Ajouter au panier'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Reviews Section ──────────────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-white mb-8">
            Avis clients ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
              <span className="text-4xl mb-3 block">💬</span>
              <p className="text-sm text-white/40">
                Aucun avis pour le moment. Soyez le premier !
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-bold">
                      {review.author_id?.name?.[0] || <User className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {review.author_id?.name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-white/30">{timeAgo(review.createdAt)}</p>
                    </div>
                    <div className="ms-auto flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-3 w-3 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/15'}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-white/50 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

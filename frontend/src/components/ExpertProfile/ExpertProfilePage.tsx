/**
 * @file ExpertProfilePage.tsx
 * @description Full Expert Profile page component for jersey_marocco.
 *
 * Props-driven and ready for server-side data fetching.
 * Sections:
 *   1. Hero band   – Avatar, name, title, online badge, star rating, CTA
 *   2. Bio card    – Multi-paragraph bio text
 *   3. Languages   – Spoken language badges with flag emoji
 *   4. Stats row   – Total reviews, years active, projects done
 *   5. Portfolio   – Responsive masonry-style grid of past jersey work
 *   6. Reviews     – List of client reviews with avatar + rating
 *   7. Sticky CTA  – Floating "Contacter l'expert" button on mobile
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  MessageCircle,
  Globe,
  Briefcase,
  Star,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import clsx from 'clsx';
import Avatar    from '@/components/ui/Avatar';
import Badge     from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PortfolioItem {
  id:        string;
  imageUrl:  string;
  title:     string;
  projectUrl?: string;
}

export interface ReviewItem {
  id:          string;
  authorName:  string;
  authorAvatar?: string;
  rating:      number;
  comment:     string;
  createdAt:   string; // ISO date string
}

export interface ExpertProfileProps {
  /** Expert's display name */
  name:          string;
  /** Short professional title, e.g. "Designer de maillots | Expert Football" */
  title:         string;
  avatar?:       string;
  bio:           string;
  /** ISO 639-1 codes with optional human-readable label, e.g. [{ code: 'ar', label: 'العربية' }] */
  languages:     { code: string; label: string; flag: string }[];
  rating:        number;
  reviewCount:   number;
  yearsActive:   number;
  projectsDone:  number;
  isOnline?:     boolean;
  portfolio:     PortfolioItem[];
  reviews:       ReviewItem[];
  /** Callback when the CTA button is pressed */
  onContact:     () => void;
}

// ── Language flag mapping ─────────────────────────────────────────────────────
const LANG_COLORS: Record<string, string> = {
  ar: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  fr: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  en: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-6 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-colors">
      <div className="text-indigo-400">{icon}</div>
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-xs text-white/50 text-center leading-tight">{label}</span>
    </div>
  );
}

// ── Portfolio Item ────────────────────────────────────────────────────────────
function PortfolioCard({ item }: { item: PortfolioItem }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl aspect-square bg-white/5 border border-white/[0.06]">
      <Image
        src={item.imageUrl}
        alt={item.title}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 gap-2">
        <p className="text-sm font-semibold text-white line-clamp-1">{item.title}</p>
        {item.projectUrl && (
          <a
            href={item.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-white transition-colors"
          >
            Voir le projet <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Review Item ───────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: ReviewItem }) {
  const date = new Date(review.createdAt).toLocaleDateString('fr-MA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="flex gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
      <Avatar name={review.authorName} src={review.authorAvatar} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="font-semibold text-white text-sm">{review.authorName}</span>
          <span className="text-xs text-white/40">{date}</span>
        </div>
        <StarRating rating={review.rating} size="sm" showValue={false} className="mb-2" />
        <p className="text-sm text-white/70 leading-relaxed">{review.comment}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ExpertProfilePage({
  name,
  title,
  avatar,
  bio,
  languages,
  rating,
  reviewCount,
  yearsActive,
  projectsDone,
  isOnline = false,
  portfolio,
  reviews,
  onContact,
}: ExpertProfileProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      {/* ── Hero Banner ────────────────────────────────────────────── */}
      <div
        className="relative h-52 md:h-64 w-full"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
        }}
      >
        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a855f7 0%, transparent 50%)',
          }}
        />
      </div>

      {/* ── Profile Container ───────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Avatar + Name row — overlaps the hero */}
        <div className="-mt-16 md:-mt-20 mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Avatar with ring */}
          <div className="ring-4 ring-brand-dark rounded-full w-fit">
            <Avatar
              src={avatar}
              name={name}
              size="2xl"
              online={isOnline}
            />
          </div>

          {/* Name + title + rating */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{name}</h1>
              {isOnline && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En ligne
                </span>
              )}
            </div>
            <p className="text-white/60 text-sm mb-2">{title}</p>
            <StarRating rating={rating} reviewCount={reviewCount} size="md" />
          </div>

          {/* Desktop CTA */}
          <button
            onClick={onContact}
            className={clsx(
              'hidden sm:inline-flex items-center gap-2.5 self-center',
              'px-6 py-3 rounded-xl font-semibold text-sm text-white',
              'bg-gradient-to-r from-indigo-600 to-purple-600',
              'hover:from-indigo-500 hover:to-purple-500 active:scale-95',
              'shadow-lg shadow-indigo-900/40 transition-all duration-200',
              'ring-1 ring-inset ring-white/10'
            )}
          >
            <MessageCircle className="w-4 h-4" />
            Contacter l&apos;expert
          </button>
        </div>

        {/* ── Stats Row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard
            icon={<Star className="w-5 h-5" />}
            value={rating.toFixed(1)}
            label="Note moyenne"
          />
          <StatCard
            icon={<Briefcase className="w-5 h-5" />}
            value={`${projectsDone}+`}
            label="Projets réalisés"
          />
          <StatCard
            icon={<Calendar className="w-5 h-5" />}
            value={`${yearsActive} ans`}
            label="D'expérience"
          />
        </div>

        {/* ── Two-column layout (bio + sidebar on desktop) ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left column — Bio */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <section
              className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6"
              aria-labelledby="bio-heading"
            >
              <h2 id="bio-heading" className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                À propos
              </h2>
              <p className="text-white/70 leading-relaxed text-sm">{bio}</p>
            </section>

            {/* Portfolio Grid */}
            <section aria-labelledby="portfolio-heading">
              <h2
                id="portfolio-heading"
                className="text-lg font-semibold text-white mb-4 flex items-center gap-2"
              >
                <span className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                Portfolio
                <Badge variant="primary" size="xs">{portfolio.length} designs</Badge>
              </h2>
              {portfolio.length > 0 ? (
                <div className="grid grid-cols-portfolio gap-3">
                  {portfolio.map((item) => (
                    <PortfolioCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-white/[0.03] border border-dashed border-white/10 text-white/40">
                  <Briefcase className="w-8 h-8 mb-2" />
                  <p className="text-sm">Aucun projet dans le portfolio</p>
                </div>
              )}
            </section>
          </div>

          {/* Right column — Languages sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                Langues parlées
              </h3>
              <ul className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <li key={lang.code}>
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border',
                        LANG_COLORS[lang.code] ?? 'bg-white/10 text-white/70 border-white/10'
                      )}
                    >
                      <span className="text-base leading-none">{lang.flag}</span>
                      {lang.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile CTA (inside sidebar on sm+, sticky at bottom on xs) */}
            <button
              onClick={onContact}
              className={clsx(
                'sm:flex hidden w-full items-center justify-center gap-2.5',
                'px-6 py-3.5 rounded-xl font-semibold text-sm text-white',
                'bg-gradient-to-r from-indigo-600 to-purple-600',
                'hover:from-indigo-500 hover:to-purple-500 active:scale-95',
                'shadow-lg shadow-indigo-900/40 transition-all duration-200'
              )}
            >
              <MessageCircle className="w-4 h-4" />
              Contacter l&apos;expert
            </button>
          </aside>
        </div>

        {/* ── Reviews Section ─────────────────────────────────────────── */}
        <section className="mb-24 lg:mb-12" aria-labelledby="reviews-heading">
          <div className="flex items-center justify-between mb-5">
            <h2
              id="reviews-heading"
              className="text-lg font-semibold text-white flex items-center gap-2"
            >
              <span className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
              Avis clients
              <Badge variant="warning" size="xs">{reviewCount}</Badge>
            </h2>
            {reviews.length > 3 && (
              <button
                onClick={() => setShowAllReviews((v) => !v)}
                className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {showAllReviews ? (
                  <> Voir moins <ChevronUp className="w-4 h-4" /> </>
                ) : (
                  <> Voir tout <ChevronDown className="w-4 h-4" /> </>
                )}
              </button>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-3">
              {visibleReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-white/[0.03] border border-dashed border-white/10 text-white/40">
              <Star className="w-8 h-8 mb-2" />
              <p className="text-sm">Aucun avis pour le moment</p>
            </div>
          )}
        </section>
      </div>

      {/* ── Sticky Mobile CTA ────────────────────────────────────────── */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 p-4 bg-brand-dark/90 backdrop-blur-glass border-t border-white/[0.06]">
        <button
          onClick={onContact}
          className={clsx(
            'w-full flex items-center justify-center gap-2.5',
            'py-4 rounded-xl font-bold text-base text-white',
            'bg-gradient-to-r from-indigo-600 to-purple-600',
            'hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98]',
            'shadow-xl shadow-indigo-900/50 transition-all duration-200'
          )}
        >
          <MessageCircle className="w-5 h-5" />
          Contacter l&apos;expert
        </button>
      </div>
    </div>
  );
}

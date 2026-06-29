/**
 * @file page.tsx  (demo)
 * @description Demo page showing CatalogGrid and ExpertProfilePage with mock data.
 *              Replace with real API calls in production.
 *
 * Route: /[locale]/demo
 */

'use client';

import { useState } from 'react';
import CatalogGrid        from '@/components/Catalog/CatalogGrid';
import ExpertProfilePage  from '@/components/ExpertProfile/ExpertProfilePage';
import type { ExpertProfileProps } from '@/components/ExpertProfile';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS = [
  {
    id: '1',
    title: { ar: 'قميص المغرب 2024', fr: 'Maillot Maroc 2024', en: 'Morocco Jersey 2024' },
    images: [{ url: 'https://via.placeholder.com/400x300/6366f1/fff?text=Maroc+2024' }],
    price: { amount: 450, currency: 'MAD' },
    sizes: [
      { label: 'S', stock: 3 },
      { label: 'M', stock: 5 },
      { label: 'L', stock: 0 },
      { label: 'XL', stock: 2 },
    ],
    averageRating: 4.7,
    totalReviews:  84,
    isNew: true,
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: '2',
    title: { ar: 'قميص ريال مدريد', fr: 'Maillot Real Madrid', en: 'Real Madrid Jersey' },
    images: [{ url: 'https://via.placeholder.com/400x300/a855f7/fff?text=Real+Madrid' }],
    price: { amount: 590, currency: 'MAD' },
    sizes: [
      { label: 'M', stock: 2 },
      { label: 'L', stock: 4 },
      { label: 'XL', stock: 1 },
    ],
    averageRating: 4.9,
    totalReviews: 210,
    createdAt: '2024-05-15T00:00:00Z',
  },
  {
    id: '3',
    title: { ar: 'قميص برشلونة', fr: 'Maillot Barcelone', en: 'Barcelona Jersey' },
    images: [{ url: 'https://via.placeholder.com/400x300/ec4899/fff?text=Barcelone' }],
    price: { amount: 520, currency: 'MAD' },
    sizes: [
      { label: 'S', stock: 0 },
      { label: 'M', stock: 0 },
    ],
    averageRating: 4.3,
    totalReviews:  56,
    createdAt: '2024-04-10T00:00:00Z',
  },
  {
    id: '4',
    title: { ar: 'قميص باريس سان جيرمان', fr: 'Maillot PSG', en: 'PSG Jersey' },
    images: [{ url: 'https://via.placeholder.com/400x300/0ea5e9/fff?text=PSG' }],
    price: { amount: 480, currency: 'MAD' },
    sizes: [
      { label: 'S', stock: 8 },
      { label: 'M', stock: 3 },
      { label: 'XL', stock: 5 },
    ],
    averageRating: 4.1,
    totalReviews:  33,
    createdAt: '2024-06-10T00:00:00Z',
  },
];

const MOCK_EXPERT: ExpertProfileProps = {
  name:         'Youssef El Mansouri',
  title:        'Designer de maillots | Expert Football Maroc',
  avatar:       undefined,
  bio:          `Passionné de football depuis l'enfance, je me spécialise dans la personnalisation et l'authentification de maillots officiels depuis plus de 8 ans. J'ai travaillé avec des clubs amateurs et semi-professionnels à travers le Maroc et la France, livrant plus de 300 designs uniques.\n\nMon expertise couvre les maillots des grands clubs européens, les équipes nationales africaines, et la création de kits sur-mesure. Chaque projet est traité avec passion et souci du détail.`,
  languages: [
    { code: 'ar', label: 'العربية', flag: '🇲🇦' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English',  flag: '🇬🇧' },
  ],
  rating:       4.8,
  reviewCount:  127,
  yearsActive:  8,
  projectsDone: 300,
  isOnline:     true,
  portfolio: [
    { id: 'p1', imageUrl: 'https://via.placeholder.com/300x300/6366f1/fff?text=Design+1', title: 'Kit Maroc 2024' },
    { id: 'p2', imageUrl: 'https://via.placeholder.com/300x300/a855f7/fff?text=Design+2', title: 'Maillot Custom FUS' },
    { id: 'p3', imageUrl: 'https://via.placeholder.com/300x300/ec4899/fff?text=Design+3', title: 'Kit Away 2023' },
    { id: 'p4', imageUrl: 'https://via.placeholder.com/300x300/0ea5e9/fff?text=Design+4', title: 'Collection Spéciale' },
    { id: 'p5', imageUrl: 'https://via.placeholder.com/300x300/10b981/fff?text=Design+5', title: 'Maillot Junior' },
    { id: 'p6', imageUrl: 'https://via.placeholder.com/300x300/f59e0b/fff?text=Design+6', title: 'Edition Limitée' },
  ],
  reviews: [
    {
      id: 'r1',
      authorName:  'Khalid Benali',
      rating:       5,
      comment:     'Youssef est un expert incroyable ! Il m\'a aidé à trouver le maillot parfait pour mon fils. Service rapide et professionnel.',
      createdAt:   '2024-05-20T00:00:00Z',
    },
    {
      id: 'r2',
      authorName:  'Sara Amrani',
      rating:       4,
      comment:     'Très bonne expérience. Youssef connaît parfaitement son domaine et répond rapidement aux messages.',
      createdAt:   '2024-04-15T00:00:00Z',
    },
    {
      id: 'r3',
      authorName:  'Mohammed Tazi',
      rating:       5,
      comment:     'Je recommande vivement ! Les conseils de Youssef m\'ont permis d\'éviter un faux maillot. Merci !',
      createdAt:   '2024-03-08T00:00:00Z',
    },
  ],
  onContact: () => alert('Ouverture du chat avec Youssef...'),
};

// ── Page ──────────────────────────────────────────────────────────────────────

type View = 'catalog' | 'expert';

export default function DemoPage() {
  const [view, setView] = useState<View>('catalog');

  return (
    <main className="min-h-screen bg-brand-dark">
      {/* View switcher */}
      <div className="sticky top-0 z-40 bg-brand-dark/90 backdrop-blur-glass border-b border-white/[0.06] px-6 py-3 flex items-center gap-3">
        <span className="text-white/50 text-sm me-2">Démo →</span>
        <button
          onClick={() => setView('catalog')}
          className={clsx(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
            view === 'catalog'
              ? 'bg-indigo-600 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          )}
        >
          Catalogue
        </button>
        <button
          onClick={() => setView('expert')}
          className={clsx(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
            view === 'expert'
              ? 'bg-indigo-600 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          )}
        >
          Profil Expert
        </button>
      </div>

      {/* Content */}
      {view === 'catalog' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CatalogGrid
            products={MOCK_PRODUCTS}
            locale="fr"
            onAddToCart={async (id) => {
              await new Promise((r) => setTimeout(r, 1000));
              console.log('Added to cart:', id);
            }}
            onViewDetail={(id) => console.log('View detail:', id)}
          />
        </div>
      ) : (
        <ExpertProfilePage {...MOCK_EXPERT} />
      )}
    </main>
  );
}

// clsx needed inline on DemoPage
function clsx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

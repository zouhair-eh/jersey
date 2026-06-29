'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard, { type BadgeType } from './ProductCard';
import FilterBar from './FilterBar';

interface Product {
  id:       string;
  name:     string;
  club:     string;
  price:    number;
  badge:    BadgeType;
  image:    string;
  category: string;
  gradient: string;
}

const PRODUCTS: Product[] = [
  {
    id: '1', name: 'Bellingham #5 — Home 24/25', club: 'Real Madrid',   price: 349,
    badge: 'HOT',     category: 'la-liga',
    image: 'https://images.unsplash.com/photo-1760551732733-9ac6be2c0e39?w=480&h=600&fit=crop',
    gradient: 'from-[#1A1A26] to-[#0d0d1a]',
  },
  {
    id: '2', name: 'Yamal #19 — Home 24/25',    club: 'Barcelone',      price: 329,
    badge: 'NEW',     category: 'la-liga',
    image: 'https://images.unsplash.com/photo-1764116679116-759d9e02c88d?w=480&h=600&fit=crop',
    gradient: 'from-[#12143a] to-[#0a0a1a]',
  },
  {
    id: '3', name: 'Mbappé #7 — Home 24/25',    club: 'PSG',            price: 299,
    badge: 'LIMITED', category: 'ligue-1',
    image: 'https://images.unsplash.com/photo-1699302929981-ee2bd9fa6bb0?w=480&h=600&fit=crop',
    gradient: 'from-[#1a1226] to-[#0d0a1a]',
  },
  {
    id: '4', name: 'Hakimi #2 — AFCON 2025',    club: 'Maroc 🇲🇦',      price: 279,
    badge: null,      category: 'maroc',
    image: 'https://images.unsplash.com/photo-1771041564650-55f067de005d?w=480&h=600&fit=crop',
    gradient: 'from-[#1a1200] to-[#0d0c00]',
  },
  {
    id: '5', name: 'Haaland #9 — Home 24/25',   club: 'Man City',       price: 319,
    badge: 'HOT',     category: 'premier-league',
    image: 'https://images.unsplash.com/photo-1612387050703-685c779375d4?w=480&h=600&fit=crop',
    gradient: 'from-[#0e1f2e] to-[#081219]',
  },
  {
    id: '6', name: 'Salah #11 — Home 24/25',    club: 'Liverpool',      price: 299,
    badge: 'NEW',     category: 'premier-league',
    image: 'https://images.unsplash.com/photo-1651010295683-c53fc07affd1?w=480&h=600&fit=crop',
    gradient: 'from-[#2e0a0a] to-[#1a0606]',
  },
  {
    id: '7', name: 'Kane #9 — Home 24/25',      club: 'Bayern Munich',  price: 289,
    badge: 'LIMITED', category: 'serie-a',
    image: 'https://images.unsplash.com/photo-1577212017184-80cc0da11082?w=480&h=600&fit=crop',
    gradient: 'from-[#2e1a00] to-[#1a0f00]',
  },
  {
    id: '8', name: 'Vlahović #9 — Home 24/25',  club: 'Juventus',       price: 269,
    badge: 'NEW',     category: 'serie-a',
    image: 'https://images.unsplash.com/photo-1745944756454-938dcb6e62ea?w=480&h=600&fit=crop',
    gradient: 'from-[#1a1a1a] to-[#0d0d0d]',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

export default function TrendingSection() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = activeFilter === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeFilter);

  return (
    <section id="shop" className="bg-[#0A0A0F]">
      {/* Filter bar */}
      <FilterBar active={activeFilter} onChange={setActiveFilter} />

      <div className="container mx-auto px-4 py-14 lg:py-20">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-[#00FF87] text-xs font-semibold tracking-[0.2em] uppercase mb-2">
              🔥 En ce moment
            </p>
            <h2
              className="text-4xl lg:text-6xl text-white leading-tight"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              MAILLOTS TENDANCE
            </h2>
          </div>
          <button
            onClick={() => setActiveFilter('all')}
            className="hidden sm:flex items-center gap-1.5 text-[#A0A0B0] hover:text-[#00FF87] text-sm font-medium transition-colors flex-shrink-0"
          >
            Voir Tout
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Grid */}
        <motion.div
          key={activeFilter}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              club={product.club}
              price={product.price}
              badge={product.badge}
              image={product.image}
              gradient={product.gradient}
            />
          ))}
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#A0A0B0] text-lg">
              Aucun maillot dans cette catégorie pour l'instant.
            </p>
          </div>
        )}

        {/* Mobile "voir tout" */}
        <div className="flex justify-center mt-10 sm:hidden">
          <button
            onClick={() => setActiveFilter('all')}
            className="flex items-center gap-2 px-6 py-3 border border-[#00FF87]/40 text-[#00FF87] text-sm font-medium rounded-lg hover:bg-[#00FF87]/10 transition-colors"
          >
            Voir Tout <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

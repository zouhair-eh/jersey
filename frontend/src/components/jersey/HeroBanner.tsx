'use client';

import { motion } from 'framer-motion';
import { MessageCircle, ShoppingBag, Package, Truck, Star } from 'lucide-react';

const WA_URL = 'https://wa.me/212600000000?text=Bonjour%2C%20je%20veux%20commander%20un%20maillot';

const STATS = [
  { icon: Package, value: '2 000+', label: 'livraisons' },
  { icon: Truck,   value: '48h',    label: 'express' },
  { icon: Star,    value: '4.9★',   label: 'satisfaction' },
];

export default function HeroBanner() {
  const scrollToShop = () => {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0A0A0F]">
      {/* ── Background glows ─────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 70% 50%, rgba(0,255,135,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-80"
        style={{
          background:
            'radial-gradient(ellipse at bottom, rgba(0,255,135,0.12) 0%, transparent 70%)',
        }}
      />
      {/* Subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(#00FF87 1px, transparent 1px), linear-gradient(90deg, #00FF87 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 pt-24 pb-16 lg:pt-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <div className="text-center lg:text-left">
            {/* Animated badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1A26] border border-[#00FF87]/40 mb-6 shadow-[0_0_20px_rgba(0,255,135,0.25)]"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse" />
              <span className="text-white text-sm font-medium tracking-wide">
                ⚡ ARRIVAGE CETTE SEMAINE
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-[clamp(3rem,8vw,6rem)] leading-[1.0] text-white mb-4"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              WEAR THE{' '}
              <span
                className="text-[#00FF87]"
                style={{ textShadow: '0 0 40px rgba(0,255,135,0.5)' }}
              >
                GAME.
              </span>
              <br />
              OWN THE STREET.
            </motion.h1>

            {/* Sub */}
            <motion.p
              className="text-[#A0A0B0] text-lg lg:text-xl mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              Les meilleurs maillots livrés partout au Maroc 🇲🇦
              <br />
              <span className="text-white font-medium">Paiement à la livraison • Retour 7 jours</span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button
                onClick={scrollToShop}
                className="sweep-shine flex items-center justify-center gap-2 px-8 py-4 bg-[#00FF87] hover:bg-[#00DD75] text-[#0A0A0F] font-bold rounded-lg text-base transition-all duration-200 shadow-[0_0_20px_rgba(0,255,135,0.4)] hover:shadow-[0_0_30px_rgba(0,255,135,0.6)] hover:-translate-y-0.5"
              >
                <ShoppingBag size={18} />
                SHOP NOW
              </button>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/20 hover:border-[#00FF87]/50 text-white hover:text-[#00FF87] font-semibold rounded-lg text-base transition-all duration-200 backdrop-blur-sm hover:-translate-y-0.5"
              >
                <MessageCircle size={18} />
                Commander WhatsApp
              </a>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-6 sm:justify-start justify-center mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {STATS.map(({ icon: Icon, value, label }, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 justify-center sm:justify-start text-center sm:text-left">
                  <Icon size={16} className="text-[#00FF87] flex-shrink-0" />
                  <div className="flex flex-col sm:block">
                    <span className="text-white font-bold text-xs sm:text-base whitespace-nowrap">{value}</span>
                    <span className="text-[#A0A0B0] text-[9px] sm:text-xs sm:ml-1 block sm:inline whitespace-nowrap uppercase tracking-wider sm:normal-case sm:tracking-normal">{label}</span>
                  </div>
                  {i < STATS.length - 1 && (
                    <div className="hidden sm:block w-px h-8 bg-white/[0.12] ml-4" />
                  )}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — jersey visual */}
          <motion.div
            className="hidden lg:flex items-center justify-center relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {/* Glow orb behind */}
            <div
              className="absolute w-96 h-96 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(0,255,135,0.15) 0%, transparent 70%)' }}
            />
            {/* Jersey placeholder card */}
            <div className="relative w-80 h-96 rounded-2xl overflow-hidden border border-[#00FF87]/20 bg-[#1A1A26] shadow-[0_0_60px_rgba(0,255,135,0.15)]">
              <img
                src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=640&h=800&fit=crop"
                alt="Football jersey"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-[#00FF87] text-xs font-semibold tracking-widest mb-1">
                  TENDANCE
                </p>
                <p className="text-white font-bold text-xl">
                  Real Madrid 24/25
                </p>
                <p className="text-[#A0A0B0] text-sm">Bellingham #5</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-6 h-10 border-2 border-[#00FF87]/40 rounded-full flex items-start justify-center p-1.5">
          <motion.div
            className="w-1.5 h-1.5 bg-[#00FF87] rounded-full"
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// ─── Card Data ───────────────────────────────────────────────────────────────
const CARDS: CardItem[] = [
  {
    id:          1,
    tag:         '01 — QUALITÉ PREMIUM',
    headline:    'Des maillots officiels en version Premium.',
    description: 'Tissus respirants de haute technologie, logos brodés avec précision, et finitions identiques aux maillots portés par les joueurs professionnels sur le terrain.',
    cta:         'Découvrir la Qualité',
    accent:      '#00FF87',
    imageTint:   'from-emerald-950/60 to-zinc-950',
  },
  {
    id:          2,
    tag:         '02 — SUPPORT WhatsApp',
    headline:    'Commandez en direct avec nos conseillers.',
    description: 'Pas de formulaires complexes. Discutez en direct avec nous sur WhatsApp pour valider votre taille, vérifier le stock, et suivre votre commande en temps réel.',
    cta:         'Discuter sur WhatsApp',
    accent:      '#FF3D3D',
    imageTint:   'from-red-950/60 to-zinc-950',
  },
  {
    id:          3,
    tag:         '03 — LIVRAISON RAPIDE',
    headline:    'Livraison Express 24h/48h partout au Maroc.',
    description: 'Recevez votre colis directement chez vous ou f point relais en un temps record dans toutes les villes du Maroc (Casablanca, Rabat, Marrakech, Tanger...).',
    cta:         'Zones de Livraison',
    accent:      '#C8A84B',
    imageTint:   'from-amber-950/60 to-zinc-950',
  },
  {
    id:          4,
    tag:         '04 — CONFIANCE GARANTIE',
    headline:    'Paiement à la livraison après inspection.',
    description: 'Achetez l\'esprit tranquille. Vous ne payez qu\'au moment de la réception, après avoir inspecté et validé la qualité de votre nouveau maillot de football.',
    cta:         'Nos Engagements',
    accent:      '#818CF8',
    imageTint:   'from-violet-950/60 to-zinc-950',
  },
];

interface CardItem {
  id:          number;
  tag:         string;
  headline:    string;
  description: string;
  cta:         string;
  accent:      string;
  imageTint:   string;
}

// ─── Single Card ─────────────────────────────────────────────────────────────
function StickyCard({
  card,
  index,
  total,
  containerRef,
}: {
  card:         CardItem;
  index:        number;
  total:        number;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Each card tracks its own scroll progress within the container
  const { scrollYProgress } = useScroll({
    target:  containerRef,
    offset:  ['start start', 'end end'],
  });

  // Scale down slightly as the next card slides over this one
  const segmentSize = 1 / total;
  const start       = index * segmentSize;
  const end         = start + segmentSize;

  const scale = useTransform(
    scrollYProgress,
    [start, end],
    [1, index === total - 1 ? 1 : 0.92],
  );

  const opacity = useTransform(
    scrollYProgress,
    [start, end],
    [1, index === total - 1 ? 1 : 0.6],
  );

  // How far down each card sticks (offset so they form a visible deck)
  const TOP_OFFSET  = 80;   // px from viewport top
  const CARD_INDENT = 14;   // px shift per card in the stack

  const stickyStyles = isMobile
    ? {
        position: 'relative' as const,
        top: '0px',
        scale: 1,
        opacity: 1,
      }
    : {
        scale,
        opacity,
        top:      `${TOP_OFFSET + index * CARD_INDENT}px`,
        position: 'sticky' as const,
      };

  return (
    <div
      style={{ height: isMobile ? 'auto' : '100vh' }}
      className={isMobile ? 'py-4' : 'sticky'}
      ref={cardRef}
    >
      <motion.div
        style={stickyStyles}
        className="
          mx-auto w-full max-w-5xl
          rounded-2xl overflow-hidden
          border border-white/10
          bg-[rgba(255,255,255,0.03)]
          backdrop-blur-md
          shadow-[0_8px_60px_rgba(0,0,0,0.6)]
        "
      >
        {/* Inner grid: text left, image right */}
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[420px]">

          {/* ── Text pane ─────────────────────────────────────────────── */}
          <div className="flex flex-col justify-between p-8 md:p-10">

            {/* Tag */}
            <span
              className="text-xs font-mono tracking-widest uppercase mb-6"
              style={{ color: card.accent }}
            >
              {card.tag}
            </span>

            {/* Body */}
            <div className="flex-1 flex flex-col justify-center gap-5">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight text-white">
                {card.headline}
              </h2>
              <p className="text-sm leading-relaxed text-white/50">
                {card.description}
              </p>
            </div>

            {/* CTA */}
            <button
              className="
                mt-8 self-start flex items-center gap-2
                text-sm font-medium tracking-wide
                border rounded-full px-5 py-2.5
                transition-all duration-300
                hover:bg-white/5
              "
              style={{
                color:       card.accent,
                borderColor: `${card.accent}33`,
              }}
            >
              {card.cta}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* ── Image placeholder pane ────────────────────────────────── */}
          <div
            className={`
              relative flex items-center justify-center
              bg-zinc-900/50
              bg-gradient-to-br ${card.imageTint}
              border-l border-white/5
              min-h-[220px]
            `}
          >
            {/* Subtle dashed placeholder indicator */}
            <div className="
              absolute inset-6 rounded-xl
              border border-dashed border-white/10
              flex items-center justify-center
            ">
              <span className="text-xs font-mono text-white/20 tracking-widest uppercase">
                Maillot
              </span>
            </div>

            {/* Decorative glow dot */}
            <div
              className="absolute bottom-6 right-6 w-2 h-2 rounded-full opacity-60"
              style={{ background: card.accent, boxShadow: `0 0 12px 4px ${card.accent}55` }}
            />
          </div>

        </div>

        {/* Bottom strip with card number indicator */}
        <div className="
          flex items-center justify-between
          px-8 md:px-10 py-3
          border-t border-white/5
          bg-white/[0.015]
        ">
          <div className="flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="h-0.5 rounded-full transition-all duration-300"
                style={{
                  width:      i === index ? '20px' : '6px',
                  background: i === index ? card.accent : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-white/20">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function StackedCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="relative bg-[#0A0A0F] px-4 md:px-8">

      {/* Section header */}
      <div className="mx-auto max-w-5xl py-16 md:py-32">
        <p className="text-xs font-mono tracking-widest uppercase text-white/30 mb-4">
          Nos points forts
        </p>
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight max-w-xl">
          Le maillot parfait,
          <br />
          <span className="text-white/30">sans compromis.</span>
        </h1>
      </div>

      {/* Sticky scroll container — height drives the scroll distance */}
      <div
        ref={containerRef}
        style={{ height: isMobile ? 'auto' : `${CARDS.length * 100}vh` }}
        className="relative flex flex-col gap-6 md:block"
      >
        {CARDS.map((card, i) => (
          <StickyCard
            key={card.id}
            card={card}
            index={i}
            total={CARDS.length}
            containerRef={containerRef}
          />
        ))}
      </div>

      {/* Spacer after stack */}
      <div className={isMobile ? 'h-16' : 'h-32 md:h-48'} />
    </section>
  );
}

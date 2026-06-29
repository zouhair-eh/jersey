'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// ─── Card Data ───────────────────────────────────────────────────────────────
// Customize this array to change card content, tags, and image placeholder tint
const CARDS: CardItem[] = [
  {
    id:          1,
    tag:         '01 — Design',
    headline:    'Precision-crafted for the obsessive.',
    description: 'Every pixel deliberate. Every detail a decision. We build digital products that feel as sharp as they look — built on systems, not accidents.',
    cta:         'Explore Design',
    accent:      '#00FF87',
    imageTint:   'from-emerald-950/60 to-zinc-950',
  },
  {
    id:          2,
    tag:         '02 — Motion',
    headline:    'Interfaces that breathe and respond.',
    description: 'Animation isn\'t decoration — it\'s communication. We choreograph every transition so users feel the product before they understand it.',
    cta:         'See Motion Work',
    accent:      '#FF3D3D',
    imageTint:   'from-red-950/60 to-zinc-950',
  },
  {
    id:          3,
    tag:         '03 — Engineering',
    headline:    'Performance with no excuses.',
    description: 'Sub-100ms interactions. Zero layout shift. Code that ships fast and stays maintainable. Beautiful products shouldn\'t cost you speed.',
    cta:         'View Engineering',
    accent:      '#C8A84B',
    imageTint:   'from-amber-950/60 to-zinc-950',
  },
  {
    id:          4,
    tag:         '04 — Strategy',
    headline:    'Vision aligned with execution.',
    description: 'Great products begin with ruthless clarity. We map user goals to business outcomes, then build the shortest path between them.',
    cta:         'Learn Strategy',
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

  return (
    <div
      style={{ height: '100vh' }}
      className="sticky"
      // Each card's sticky top is staggered so the stack peeks through
      ref={cardRef}
    >
      <motion.div
        style={{
          scale,
          opacity,
          top:      `${TOP_OFFSET + index * CARD_INDENT}px`,
          position: 'sticky',
        }}
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
          {/*
            DROP YOUR ASSET HERE:
            Replace this div with <Image src="..." /> or <video /> etc.
            The gradient tint is set per-card via `card.imageTint`.
          */}
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
                Asset
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

  return (
    <section className="relative bg-[#0A0A0F] px-4 md:px-8">

      {/* Section header */}
      <div className="mx-auto max-w-5xl py-24 md:py-32">
        <p className="text-xs font-mono tracking-widest uppercase text-white/30 mb-4">
          What we do
        </p>
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight max-w-xl">
          Built for those
          <br />
          <span className="text-white/30">who notice everything.</span>
        </h1>
      </div>

      {/* Sticky scroll container — height drives the scroll distance */}
      <div
        ref={containerRef}
        style={{ height: `${CARDS.length * 100}vh` }}
        className="relative"
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
      <div className="h-32 md:h-48" />
    </section>
  );
}

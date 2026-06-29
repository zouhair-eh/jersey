'use client';

const ITEMS = [
  '🔥 +2 000 maillots livrés',
  '⭐ 4.9/5 satisfaction',
  '🚚 Livraison 48h express',
  '✅ Paiement à la livraison (COD)',
  '↩️ Retour gratuit 7 jours',
  '🇲🇦 Livraison partout au Maroc',
  '🔒 Commande 100% sécurisée',
  '📦 Emballage premium',
];

/* We duplicate the list so the seamless loop works */
const TRACK = [...ITEMS, ...ITEMS];

export default function SocialProofStrip() {
  return (
    <div
      className="relative overflow-hidden py-3.5 border-y border-white/[0.07]"
      style={{
        background:
          'linear-gradient(90deg, rgba(0,255,135,0.04) 0%, rgba(0,255,135,0.08) 50%, rgba(0,255,135,0.04) 100%)',
      }}
    >
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-[#0A0A0F] to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-[#0A0A0F] to-transparent" />

      <div className="animate-scroll-x flex whitespace-nowrap will-change-transform">
        {TRACK.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 mx-6 text-sm font-medium text-white/80"
          >
            {item}
            <span className="ml-6 text-[#00FF87]/40">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

'use client';

import HeroBanner          from '@/components/jersey/HeroBanner';
import SocialProofStrip    from '@/components/jersey/SocialProofStrip';
import TrendingSection     from '@/components/jersey/TrendingSection';
import TestimonialsSection from '@/components/jersey/TestimonialsSection';
import WhatsAppFAB         from '@/components/jersey/WhatsAppFAB';
import ExpandingOptions    from '@/components/jersey/ExpandingOptions';
import StackedCards        from '@/components/StackedCards/StackedCards';
import { motion }          from 'framer-motion';
import { MessageCircle }   from 'lucide-react';

const WA_URL =
  'https://wa.me/212600000000?text=Bonjour%2C%20je%20veux%20commander%20un%20maillot%20de%20football%20%F0%9F%91%8A';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      {/* 1 — Hero */}
      <HeroBanner />

      {/* 2 — Social proof marquee */}
      <SocialProofStrip />

      {/* 3 — Expanding option cards */}
      <section className="flex justify-center items-center py-16 px-4 bg-[#0A0A0F]">
        <ExpandingOptions />
      </section>

      {/* 4 — Filter bar + product grid */}
      <TrendingSection />

      {/* 5 — Stacked scroll cards */}
      <StackedCards />

      {/* 6 — Testimonials */}
      <TestimonialsSection />

      {/* 5 — Final CTA band */}
      <section id="contact" className="py-16 lg:py-24 bg-[#0A0A0F]">
        <div className="container mx-auto px-4">
          <motion.div
            className="relative overflow-hidden rounded-2xl p-10 lg:p-16 text-center"
            style={{
              background: 'linear-gradient(135deg, #00FF87 0%, #00CC6A 100%)',
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            {/* bg decoration */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%)',
              }}
            />

            <p className="text-[#064a2a] text-xs font-bold uppercase tracking-[0.2em] mb-3">
              Commande rapide
            </p>
            <h2
              className="text-4xl lg:text-6xl text-[#0A0A0F] mb-4 leading-tight"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              PRÊT À COMMANDER ?
            </h2>
            <p className="text-[#064a2a] text-base lg:text-lg mb-8 max-w-xl mx-auto">
              Contactez-nous directement sur WhatsApp — réponse en moins de 5 minutes,
              paiement à la livraison, livraison partout au Maroc 🇲🇦
            </p>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="sweep-shine inline-flex items-center gap-3 px-8 py-4 bg-[#0A0A0F] hover:bg-[#12121A] text-white font-bold text-base rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.6)] hover:-translate-y-0.5"
            >
              <MessageCircle size={20} />
              Commander Maintenant
            </a>
          </motion.div>
        </div>
      </section>

      {/* WhatsApp floating button */}
      <WhatsAppFAB />
    </main>
  );
}

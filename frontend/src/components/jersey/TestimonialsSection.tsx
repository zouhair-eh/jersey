'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Testimonial {
  id:      string;
  name:    string;
  city:    string;
  rating:  number;
  comment: string;
  initials: string;
  color:   string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1', name: 'Youssef M.', city: 'Casablanca', rating: 5,
    comment: 'Qualité premium, livraison rapide en 24h. Le maillot est exactement comme les photos. Je recommande à 100% ! 🔥',
    initials: 'YM', color: '#00FF87',
  },
  {
    id: '2', name: 'Salma K.', city: 'Rabat', rating: 5,
    comment: 'Maillot parfait, taille conforme au guide. Service client réactif sur WhatsApp. Expérience top du début à la fin ⭐',
    initials: 'SK', color: '#C8A84B',
  },
  {
    id: '3', name: 'Mehdi A.', city: 'Marrakech', rating: 5,
    comment: 'Original et bien emballé. J\'ai commandé 3 maillots, tous parfaits. Livraison en 48h comme promis. Merci !',
    initials: 'MA', color: '#FF3D3D',
  },
  {
    id: '4', name: 'Fatima Z.', city: 'Fès', rating: 5,
    comment: 'Super surprise pour mon frère ! Le maillot du Maroc était magnifique et le paiement à la livraison c\'est top 🇲🇦',
    initials: 'FZ', color: '#00FF87',
  },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'fill-[#C8A84B] text-[#C8A84B]' : 'text-[#3a3a3a]'}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <motion.div
      className="flex-shrink-0 w-[300px] sm:w-[320px] p-5 rounded-xl bg-[#1A1A26] border border-white/[0.08] hover:border-[#C8A84B]/30 transition-colors"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Stars */}
      <StarRow rating={testimonial.rating} />

      {/* Comment */}
      <p className="text-[#A0A0B0] text-sm leading-relaxed mt-3 mb-4">
        "{testimonial.comment}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#0A0A0F] font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: testimonial.color }}
        >
          {testimonial.initials}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{testimonial.name}</p>
          <p className="text-[#A0A0B0] text-xs">{testimonial.city}</p>
        </div>
        <div className="ml-auto">
          <span className="text-[#00FF87] text-xs font-medium">✓ Achat vérifié</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="avis" className="py-16 lg:py-24 bg-[#12121A]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[#C8A84B] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            ⭐ Avis clients
          </p>
          <h2
            className="text-4xl lg:text-6xl text-white leading-tight"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            ILS NOUS FONT CONFIANCE
          </h2>
          <p className="text-[#A0A0B0] mt-3 text-base">
            Des milliers de clients satisfaits à travers tout le Maroc
          </p>

          {/* Rating summary */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} className="fill-[#C8A84B] text-[#C8A84B]" />
              ))}
            </div>
            <span className="text-white font-bold text-xl">4.9</span>
            <span className="text-[#A0A0B0] text-sm">/ 5 · +800 avis</span>
          </div>
        </motion.div>

        {/* Scrollable row */}
        <div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
          <div className="flex gap-4 min-w-max">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

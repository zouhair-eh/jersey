'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const WA_URL =
  'https://wa.me/212600209000?text=Bonjour%2C%20je%20veux%20commander%20un%20maillot%20de%20football%20%F0%9F%91%8A';

export default function WhatsAppFAB() {
  return (
    <div className="fixed bottom-6 right-5 lg:bottom-8 lg:right-8 z-50">
      {/* Pulse ring */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring"
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring"
        style={{ animationDelay: '0.4s' }}
      />

      <motion.a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Commander sur WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-[#25D366] text-white shadow-[0_0_28px_rgba(37,211,102,0.55)] hover:shadow-[0_0_40px_rgba(37,211,102,0.7)] transition-shadow"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.93 }}
        animate={{ y: [0, -8, 0] }}
        transition={{
          y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <MessageCircle size={28} fill="white" strokeWidth={0} />
      </motion.a>

      {/* Tooltip */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="bg-[#1A1A26] border border-[#25D366]/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none">
          Commander maintenant
        </div>
      </div>
    </div>
  );
}

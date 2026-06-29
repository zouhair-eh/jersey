'use client';

import { Zap, Instagram, Twitter, Facebook, MessageCircle } from 'lucide-react';

const SHOP_LINKS    = ['Tous les maillots', 'Premier League', 'Liga', 'Ligue 1', 'Maroc 🇲🇦', 'Serie A'];
const INFO_LINKS    = ['À propos', 'Livraison & retours', 'FAQ', 'Contact'];
const SOCIAL_LINKS  = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Twitter,   label: 'Twitter',   href: '#' },
  { icon: Facebook,  label: 'Facebook',  href: '#' },
];

const WA_URL = 'https://wa.me/212600000000?text=Bonjour%2C%20je%20veux%20commander%20un%20maillot';

export default function Footer() {
  return (
    <footer className="bg-[#060609] border-t border-white/[0.07]">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand col */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <a href="#" className="inline-flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00FF87] to-[#00DD75] flex items-center justify-center">
                <Zap size={18} className="text-[#0A0A0F]" fill="currentColor" />
              </div>
              <span
                className="text-white text-lg tracking-widest group-hover:text-[#00FF87] transition-colors"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                JERSEY MAROC
              </span>
            </a>
            <p className="text-sm text-[#A0A0B0] leading-relaxed max-w-[240px]">
              Votre destination premium pour les maillots de football authentiques, livrés partout au Maroc 🇲🇦
            </p>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-sm font-medium rounded-lg transition-colors"
            >
              <MessageCircle size={16} />
              WhatsApp: +212 6 00 00 00 00
            </a>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-[0.15em] mb-5">
              Boutique
            </h4>
            <ul className="space-y-3">
              {SHOP_LINKS.map((label) => (
                <li key={label}>
                  <a href="#shop" className="text-sm text-[#A0A0B0] hover:text-[#00FF87] transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-[0.15em] mb-5">
              Infos
            </h4>
            <ul className="space-y-3">
              {INFO_LINKS.map((label) => (
                <li key={label}>
                  <a href="#" className="text-sm text-[#A0A0B0] hover:text-[#00FF87] transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social + trust */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-[0.15em] mb-5">
              Suivez-nous
            </h4>
            <div className="flex gap-3 mb-6">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.1] text-[#A0A0B0] hover:text-[#00FF87] hover:border-[#00FF87]/40 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#A0A0B0]">
                <span className="text-[#00FF87]">✓</span> Paiement à la livraison (COD)
              </div>
              <div className="flex items-center gap-2 text-xs text-[#A0A0B0]">
                <span className="text-[#00FF87]">✓</span> Retour sous 7 jours
              </div>
              <div className="flex items-center gap-2 text-xs text-[#A0A0B0]">
                <span className="text-[#00FF87]">✓</span> Livraison 48h express
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#A0A0B0]">
            © {new Date().getFullYear()} Jersey Maroc. Tous droits réservés. Livraison partout au Maroc 🇲🇦
          </p>
          <div className="flex gap-5">
            {['Confidentialité', 'CGV', 'Cookies'].map((l) => (
              <a key={l} href="#" className="text-xs text-[#A0A0B0] hover:text-white transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

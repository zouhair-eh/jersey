'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, MessageCircle, Menu, X, Zap } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

const NAV_LINKS = [
  { href: '#shop',  label: 'Boutique' },
  { href: '#trending', label: 'Tendances' },
  { href: '#avis',  label: 'Avis' },
  { href: '#contact', label: 'Contact' },
] as const;

const WA_URL = 'https://wa.me/212600000000?text=Bonjour%2C%20je%20veux%20commander%20un%20maillot';

export default function Navbar() {
  const { setIsOpen, itemCount } = useCart();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route/hash change
  useEffect(() => {
    const close = () => setMobileOpen(false);
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, []);

  return (
    <header
      className={`
        fixed top-0 inset-x-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-[#0A0A0F]/95 backdrop-blur-lg border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.6)]'
          : 'bg-transparent'}
      `}
    >
      <nav className="container mx-auto px-4 h-16 lg:h-20 flex items-center justify-between gap-4">

        {/* ── Logo ────────────────────────────────────────────────────────── */}
        <a href="#" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-[#00FF87] to-[#00DD75] flex items-center justify-center shadow-[0_0_16px_rgba(0,255,135,0.4)] group-hover:shadow-[0_0_24px_rgba(0,255,135,0.6)] transition-shadow">
            <Zap size={20} className="text-[#0A0A0F]" fill="currentColor" />
          </div>
          <span
            className="text-white text-lg lg:text-xl tracking-widest group-hover:text-[#00FF87] transition-colors"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            JERSEY MAROC
          </span>
        </a>

        {/* ── Desktop nav links ────────────────────────────────────────────── */}
        <ul className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="text-[#A0A0B0] hover:text-white text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#00FF87] after:transition-all hover:after:w-full"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* ── Right actions ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Cart button */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Panier"
            className="relative p-2 text-[#A0A0B0] hover:text-white transition-colors flex"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-[#0A0A0F] bg-[#00FF87] rounded-full transform translate-x-1/3 -translate-y-1/3">
                {itemCount}
              </span>
            )}
          </button>

          {/* WhatsApp CTA */}
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-[0_0_16px_rgba(37,211,102,0.3)] hover:shadow-[0_0_24px_rgba(37,211,102,0.5)]"
          >
            <MessageCircle size={16} />
            <span>Commander</span>
          </a>

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            className="lg:hidden p-2 text-[#A0A0B0] hover:text-white transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <div
        className={`
          lg:hidden overflow-hidden transition-all duration-300 ease-in-out
          bg-[#12121A] border-b border-white/[0.08]
          ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-[#A0A0B0] hover:text-white hover:bg-white/[0.05] font-medium transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold rounded-lg transition-colors"
          >
            <MessageCircle size={18} />
            Commander via WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}

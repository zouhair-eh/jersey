/**
 * @file CartDrawer.tsx
 * @description Sliding shopping cart drawer component.
 *              Displays cart items, customizable options, order subtotal,
 *              Moroccan delivery checkout details (city select, shipping cost calculation),
 *              and compiles a structured WhatsApp order link.
 */

'use client';

import { useState } from 'react';
import { useCart, type CartItem } from '@/lib/cart-context';
import { X, Trash2, Plus, Minus, ShoppingBag, MessageCircle, Truck } from 'lucide-react';
import Image from 'next/image';

const MOROCCAN_CITIES = [
  { name: 'Casablanca', shipping: 20 },
  { name: 'Rabat', shipping: 25 },
  { name: 'Salé', shipping: 25 },
  { name: 'Témara', shipping: 25 },
  { name: 'Marrakech', shipping: 35 },
  { name: 'Tanger', shipping: 35 },
  { name: 'Fès', shipping: 35 },
  { name: 'Meknès', shipping: 35 },
  { name: 'Agadir', shipping: 35 },
  { name: 'Oujda', shipping: 40 },
  { name: 'Kénitra', shipping: 30 },
  { name: 'Tétouan', shipping: 35 },
  { name: 'Safi', shipping: 35 },
  { name: 'El Jadida', shipping: 30 },
  { name: 'Nador', shipping: 40 },
  { name: 'Mohammedia', shipping: 20 },
  { name: 'Autre Ville', shipping: 40 },
] as const;

export default function CartDrawer() {
  const {
    cartItems,
    isOpen,
    setIsOpen,
    removeFromCart,
    updateQuantity,
    totalAmount,
    clearCart,
  } = useCart();

  // Checkout states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone]       = useState('');
  const [address, setAddress]   = useState('');
  const [selectedCity, setSelectedCity] = useState<string>(MOROCCAN_CITIES[0].name);
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isOpen) return null;

  // Resolve shipping cost
  const cityInfo = MOROCCAN_CITIES.find((c) => c.name === selectedCity) || MOROCCAN_CITIES[0];
  // Free shipping above 600 MAD
  const shippingCost = totalAmount >= 600 ? 0 : cityInfo.shipping;
  const finalTotal   = totalAmount + shippingCost;

  function handleSendWhatsApp(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      alert('Veuillez remplir tous les champs de livraison.');
      return;
    }

    // WhatsApp Number (change to actual Moroccan shop number as needed, default to placeholder)
    const SHOP_NUMBER = '212600000000'; 

    // Build the order list text
    let orderDetails = '';
    cartItems.forEach((item, index) => {
      const customText =
        item.customName || item.customNumber
          ? ` (Personnalisé: ${item.customName || 'SANS NOM'} - n°${item.customNumber || '10'})`
          : '';
      orderDetails += `${index + 1}. ${item.title.fr || item.title.en} - Taille: ${item.size}${customText} x${item.quantity} - ${item.price * item.quantity} MAD\n`;
    });

    const message = [
      "⚽ *NOUVELLE COMMANDE - JERSEY MAROC* 🇲🇦",
      "----------------------------------------",
      `*Client :* ${fullName.trim()}`,
      `*Téléphone :* ${phone.trim()}`,
      `*Ville :* ${selectedCity}`,
      `*Adresse :* ${address.trim()}`,
      "----------------------------------------",
      "*Articles commandés :*",
      orderDetails.trim(),
      `*Sous-total :* ${totalAmount} MAD`,
      `*Livraison :* ${shippingCost === 0 ? 'GRATUITE' : `${shippingCost} MAD`}`,
      `*TOTAL À PAYER :* *${finalTotal} MAD* (Paiement à la livraison 🤝)`,
      "----------------------------------------",
      "Merci de valider ma commande !"
    ].join('\n');

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${SHOP_NUMBER}?text=${encodedText}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Clear and close
    clearCart();
    setIsOpen(false);
    setShowCheckout(false);
    setFullName('');
    setPhone('');
    setAddress('');
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Drawer Panel */}
      <div className="relative z-10 flex flex-col w-full max-w-md h-full bg-[#0A0A0F] border-s border-white/10 shadow-2xl animate-fade-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#00FF87]" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Mon Panier</h2>
            <span className="bg-white/10 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cartItems.length}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-white/40 gap-3">
              <ShoppingBag className="w-12 h-12 text-white/10" />
              <p className="text-sm">Votre panier est vide.</p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-2 text-xs font-bold text-[#00FF87] hover:underline"
              >
                Continuer mes achats
              </button>
            </div>
          ) : !showCheckout ? (
            /* Cart Items List */
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.cartId}
                  className="flex gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                >
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title.fr}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">
                        ⚽
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white truncate">
                        {item.title.fr || item.title.en}
                      </h4>
                      <p className="text-xs text-white/50 mt-0.5">
                        Taille : <span className="text-white font-semibold">{item.size}</span>
                      </p>
                      {(item.customName || item.customNumber) && (
                        <p className="text-[10px] text-[#00FF87] font-medium mt-1 truncate">
                          Custom : {item.customName || 'SANS NOM'} · n°{item.customNumber || '10'}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-black">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                          className="p-1 px-2 hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="p-1 px-2 hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price / Delete */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white">
                          {item.price * item.quantity} MAD
                        </span>
                        <button
                          onClick={() => removeFromCart(item.cartId)}
                          className="text-white/30 hover:text-rose-400 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Moroccan Shipping Form */
            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Informations de Livraison
              </h3>

              <div>
                <label className="block text-xs text-white/50 mb-1">Nom Complet</label>
                <input
                  type="text"
                  required
                  placeholder="EX: AHMED BENALI"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1">Téléphone portable</label>
                <input
                  type="tel"
                  required
                  placeholder="EX: 0612345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1">Ville de destination</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full h-11 bg-[#0A0A0F] border border-white/[0.08] rounded-xl px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                >
                  {MOROCCAN_CITIES.map((c) => (
                    <option key={c.name} value={c.name} className="bg-[#0A0A0F]">
                      {c.name} ({c.shipping} MAD)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1">Adresse de livraison complète</label>
                <textarea
                  required
                  placeholder="EX: N° 12, RUE DES FLEURS, MAARIF"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                ></textarea>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#00FF87] mt-0.5" />
                <p className="text-[10px] text-white/40 leading-normal">
                  Paiement à la livraison. Livraison sécurisée par nos partenaires de transport express partout au Maroc sous 24h à 48h.
                </p>
              </div>
            </form>
          )
        }
      </div>

        {/* Footer Pricing & CTA */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-white/[0.01] space-y-4">
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm text-white/60">
                <span>Sous-total</span>
                <span>{totalAmount} MAD</span>
              </div>
              <div className="flex justify-between text-sm text-white/60">
                <span>Frais de livraison</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-[#00FF87] font-medium">Gratuit</span>
                  ) : (
                    `${shippingCost} MAD`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                <span>Total à payer</span>
                <span className="text-[#00FF87]">{finalTotal} MAD</span>
              </div>
            </div>

            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm bg-white text-black hover:bg-neutral-200 transition-colors"
              >
                Passer la commande
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="px-4 py-4 rounded-xl text-xs font-bold border border-white/10 text-white hover:bg-white/5 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleSendWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20BD5A] text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Commander sur WhatsApp
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * @file page.tsx (Catalog)
 * @description Full catalog page using CatalogGrid component.
 *              Fetches from API with fallback to mock data.
 *
 * Route: /[locale]/catalog
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslations }     from 'next-intl';
import { useRouter }           from '@/i18n/routing';
import CatalogGrid             from '@/components/Catalog/CatalogGrid';
import { apiGetProducts, type ApiProduct } from '@/lib/api';
import { useCart } from '@/lib/cart-context';

// ── Mock fallback ─────────────────────────────────────────────────────────────

const MOCK_PRODUCTS = [
  {
    id: '1',
    title: { ar: 'قميص المغرب 2026', fr: 'Maillot Maroc Domicile 2026', en: 'Morocco Home Jersey 2026' },
    images: [{ url: 'https://via.placeholder.com/400x300/166534/fff?text=Maroc+2026' }],
    price: { amount: 450, currency: 'MAD' },
    sizes: [{ label: 'S', stock: 5 }, { label: 'M', stock: 10 }, { label: 'L', stock: 8 }, { label: 'XL', stock: 3 }],
    averageRating: 4.7, totalReviews: 84, isNew: true, createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: '2',
    title: { ar: 'قميص ريال مدريد', fr: 'Maillot Real Madrid 2025', en: 'Real Madrid Jersey 2025' },
    images: [{ url: 'https://via.placeholder.com/400x300/1e1b4b/fff?text=Real+Madrid' }],
    price: { amount: 590, currency: 'MAD' },
    sizes: [{ label: 'M', stock: 7 }, { label: 'L', stock: 4 }, { label: 'XL', stock: 2 }],
    averageRating: 4.9, totalReviews: 210, createdAt: '2026-05-15T00:00:00Z',
  },
  {
    id: '3',
    title: { ar: 'قميص برشلونة', fr: 'Maillot FC Barcelone 2025', en: 'FC Barcelona Jersey 2025' },
    images: [{ url: 'https://via.placeholder.com/400x300/7f1d1d/fff?text=Barcelona' }],
    price: { amount: 520, currency: 'MAD' },
    sizes: [{ label: 'S', stock: 3 }, { label: 'M', stock: 6 }, { label: 'L', stock: 0 }],
    averageRating: 4.3, totalReviews: 56, createdAt: '2026-04-10T00:00:00Z',
  },
  {
    id: '4',
    title: { ar: 'قميص باريس سان جيرمان', fr: 'Maillot PSG 2025', en: 'PSG Jersey 2025' },
    images: [{ url: 'https://via.placeholder.com/400x300/172554/fff?text=PSG' }],
    price: { amount: 480, currency: 'MAD' },
    sizes: [{ label: 'S', stock: 8 }, { label: 'M', stock: 3 }, { label: 'XL', stock: 5 }],
    averageRating: 4.1, totalReviews: 33, createdAt: '2026-06-10T00:00:00Z',
  },
  {
    id: '5',
    title: { ar: 'قميص مانشستر سيتي', fr: 'Maillot Manchester City 2025', en: 'Manchester City Jersey 2025' },
    images: [{ url: 'https://via.placeholder.com/400x300/164e63/fff?text=Man+City' }],
    price: { amount: 550, currency: 'MAD' },
    sizes: [{ label: 'M', stock: 4 }, { label: 'L', stock: 6 }, { label: 'XL', stock: 2 }],
    averageRating: 4.6, totalReviews: 95, createdAt: '2026-05-20T00:00:00Z',
  },
  {
    id: '6',
    title: { ar: 'قميص المغرب الاحتياطي', fr: 'Maillot Maroc Extérieur 2026', en: 'Morocco Away Jersey 2026' },
    images: [{ url: 'https://via.placeholder.com/400x300/f5f5f4/333?text=Maroc+Away' }],
    price: { amount: 420, currency: 'MAD' },
    sizes: [{ label: 'S', stock: 2 }, { label: 'M', stock: 5 }, { label: 'L', stock: 3 }, { label: 'XL', stock: 1 }],
    averageRating: 4.5, totalReviews: 42, createdAt: '2026-06-05T00:00:00Z',
  },
];

// ── Helper: transform API product to CatalogGrid format ──────────────────────

function apiToGridProduct(p: ApiProduct) {
  return {
    id: p._id,
    title: p.title,
    images: p.images,
    price: p.price,
    sizes: p.sizes,
    averageRating: p.averageRating,
    totalReviews: p.totalReviews,
    isNew: (Date.now() - new Date(p.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000,
    createdAt: p.createdAt,
  };
}

// ── Page Component ────────────────────────────────────────────────────────────

export default function CatalogPage() {
  const t = useTranslations('catalog');
  const router = useRouter();
  const { addToCart } = useCart();

  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    apiGetProducts({ limit: '50' })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setProducts(res.data.map(apiToGridProduct));
        }
      })
      .catch(() => {
        // Keep mock data on API failure
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CatalogGrid
          products={products}
          locale="fr"
          isLoading={loading}
          onAddToCart={(id) => {
            const product = products.find((p) => p.id === id);
            if (!product) return;
            // Find first size in stock
            const sizeInStock = product.sizes.find((sz) => sz.stock > 0);
            const sizeLabel = sizeInStock ? sizeInStock.label : 'M';
            
            addToCart({
              productId: product.id,
              title: product.title,
              price: product.price.amount,
              currency: product.price.currency || 'MAD',
              imageUrl: product.images[0]?.url || '',
              size: sizeLabel,
            });
          }}
          onViewDetail={(id) => {
            router.push(`/catalog/${id}` as any);
          }}
        />
      </div>
    </main>
  );
}

/**
 * @file server.js
 * @description Express + Socket.io entry point for jersey_marocco.
 *              Boots HTTP server, attaches Socket.io, and registers all
 *              Socket namespaces/events.
 */

require('dotenv').config();
const http      = require('http');
const express   = require('express');
const cors      = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const { initChatSocket } = require('./src/socket/chat.socket');
const authRoutes    = require('./src/routes/auth.routes');
const productRoutes = require('./src/routes/product.routes');

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();

app.use(cors({
  origin:      process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── REST routes ──────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Seed endpoint (development only) ─────────────────────────────────────────
app.post('/api/seed', async (_req, res) => {
  try {
    const User    = require('./src/models/User.model');
    const Product = require('./src/models/Product.model');

    // Create demo expert if not exists
    let expert = await User.findOne({ email: 'expert@jerseymarocco.ma' });
    if (!expert) {
      expert = await User.create({
        name: 'Youssef El Mansouri',
        email: 'expert@jerseymarocco.ma',
        password: 'expert1234',
        roles: ['expert'],
        bio: 'Expert en maillots de football depuis plus de 8 ans.',
        languagesSpoken: ['ar', 'fr', 'en'],
      });
    }

    // Seed products if collection is empty
    const count = await Product.countDocuments();
    if (count === 0) {
      const jerseys = [
        {
          title: { ar: 'قميص المغرب 2026', fr: 'Maillot Maroc Domicile 2026', en: 'Morocco Home Jersey 2026' },
          description: { ar: 'قميص المنتخب المغربي الرسمي', fr: 'Maillot officiel de l\'équipe nationale du Maroc', en: 'Official Morocco national team jersey' },
          price: { amount: 450, currency: 'MAD' },
          images: [{ url: 'https://via.placeholder.com/600x450/166534/fff?text=Maroc+2026', altText: 'Morocco 2026' }],
          sizes: [{ label: 'S', stock: 5 }, { label: 'M', stock: 10 }, { label: 'L', stock: 8 }, { label: 'XL', stock: 3 }],
          category: 'national', tags: ['morocco', '2026', 'home'], owner_id: expert._id, isPublished: true,
        },
        {
          title: { ar: 'قميص ريال مدريد', fr: 'Maillot Real Madrid 2025', en: 'Real Madrid Jersey 2025' },
          description: { ar: 'قميص ريال مدريد الموسم الجديد', fr: 'Maillot du Real Madrid nouvelle saison', en: 'Real Madrid new season jersey' },
          price: { amount: 590, currency: 'MAD' },
          images: [{ url: 'https://via.placeholder.com/600x450/1e1b4b/fff?text=Real+Madrid', altText: 'Real Madrid' }],
          sizes: [{ label: 'M', stock: 7 }, { label: 'L', stock: 4 }, { label: 'XL', stock: 2 }],
          category: 'club', tags: ['real-madrid', 'la-liga'], owner_id: expert._id, isPublished: true,
        },
        {
          title: { ar: 'قميص برشلونة', fr: 'Maillot FC Barcelone 2025', en: 'FC Barcelona Jersey 2025' },
          description: { ar: 'قميص برشلونة الجديد', fr: 'Maillot officiel du FC Barcelone', en: 'Official FC Barcelona jersey' },
          price: { amount: 520, currency: 'MAD' },
          images: [{ url: 'https://via.placeholder.com/600x450/7f1d1d/fff?text=Barcelona', altText: 'Barcelona' }],
          sizes: [{ label: 'S', stock: 3 }, { label: 'M', stock: 6 }, { label: 'L', stock: 0 }],
          category: 'club', tags: ['barcelona', 'la-liga'], owner_id: expert._id, isPublished: true,
        },
        {
          title: { ar: 'قميص باريس سان جيرمان', fr: 'Maillot PSG 2025', en: 'PSG Jersey 2025' },
          description: { ar: 'قميص باريس سان جيرمان', fr: 'Maillot officiel du Paris Saint-Germain', en: 'Official Paris Saint-Germain jersey' },
          price: { amount: 480, currency: 'MAD' },
          images: [{ url: 'https://via.placeholder.com/600x450/172554/fff?text=PSG', altText: 'PSG' }],
          sizes: [{ label: 'S', stock: 8 }, { label: 'M', stock: 3 }, { label: 'XL', stock: 5 }],
          category: 'club', tags: ['psg', 'ligue-1'], owner_id: expert._id, isPublished: true,
        },
        {
          title: { ar: 'قميص مانشستر سيتي', fr: 'Maillot Manchester City 2025', en: 'Manchester City Jersey 2025' },
          description: { ar: 'قميص مانشستر سيتي', fr: 'Maillot officiel de Manchester City', en: 'Official Manchester City jersey' },
          price: { amount: 550, currency: 'MAD' },
          images: [{ url: 'https://via.placeholder.com/600x450/164e63/fff?text=Man+City', altText: 'Man City' }],
          sizes: [{ label: 'M', stock: 4 }, { label: 'L', stock: 6 }, { label: 'XL', stock: 2 }],
          category: 'club', tags: ['manchester-city', 'premier-league'], owner_id: expert._id, isPublished: true,
        },
        {
          title: { ar: 'قميص المغرب الاحتياطي', fr: 'Maillot Maroc Extérieur 2026', en: 'Morocco Away Jersey 2026' },
          description: { ar: 'قميص المنتخب المغربي الاحتياطي', fr: 'Maillot extérieur du Maroc', en: 'Morocco away jersey' },
          price: { amount: 420, currency: 'MAD' },
          images: [{ url: 'https://via.placeholder.com/600x450/f5f5f4/333?text=Maroc+Away', altText: 'Morocco Away' }],
          sizes: [{ label: 'S', stock: 2 }, { label: 'M', stock: 5 }, { label: 'L', stock: 3 }, { label: 'XL', stock: 1 }],
          category: 'national', tags: ['morocco', '2026', 'away'], owner_id: expert._id, isPublished: true,
        },
      ];
      await Product.insertMany(jerseys);
    }

    res.json({ success: true, message: 'Seed data loaded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── HTTP server ───────────────────────────────────────────────────────────────
const httpServer = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
initChatSocket(httpServer);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${PORT}`);
  });
});

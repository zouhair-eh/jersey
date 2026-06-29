/**
 * @file Product.model.js
 * @description Product (Tenue) schema for jersey_marocco.
 *              Supports trilingual content (AR / FR / EN),
 *              a flexible sizes array, and a reference to the owning Expert.
 */

const mongoose = require('mongoose');

const { Schema, model, Types } = mongoose;

// ---------------------------------------------------------------------------
// Sub-schema: Localised string (AR / FR / EN)
// ---------------------------------------------------------------------------
const LocalisedStringSchema = new Schema(
  {
    ar: { type: String, trim: true, default: '' }, // Arabic
    fr: { type: String, trim: true, default: '' }, // French
    en: { type: String, trim: true, default: '' }, // English
  },
  { _id: false }
);

// ---------------------------------------------------------------------------
// Sub-schema: Product image
// ---------------------------------------------------------------------------
const ProductImageSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    altText: {
      type: String,
      trim: true,
      default: '',
    },
    /** 0 = primary / cover image */
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

// ---------------------------------------------------------------------------
// Sub-schema: Available size with stock count
// ---------------------------------------------------------------------------
const SizeSchema = new Schema(
  {
    /**
     * Size label – supports numeric (e.g. "S", "M", "L", "XL", "XXL")
     * and jersey-specific (e.g. "38", "40", "42")
     */
    label: {
      type: String,
      required: [true, 'Size label is required'],
      trim: true,
      uppercase: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
  },
  { _id: false }
);

// ---------------------------------------------------------------------------
// Main Product Schema
// ---------------------------------------------------------------------------
const ProductSchema = new Schema(
  {
    // ── Trilingual content ────────────────────────────────────────────────
    title: {
      type: LocalisedStringSchema,
      required: true,
    },
    description: {
      type: LocalisedStringSchema,
      required: true,
    },

    // ── Pricing ───────────────────────────────────────────────────────────
    price: {
      amount: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
      },
      /** ISO 4217 currency code, default MAD (Moroccan Dirham) */
      currency: {
        type: String,
        uppercase: true,
        trim: true,
        default: 'MAD',
        maxlength: 3,
      },
    },

    // ── Media ─────────────────────────────────────────────────────────────
    images: {
      type: [ProductImageSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'A product can have at most 10 images',
      },
    },

    // ── Inventory ─────────────────────────────────────────────────────────
    sizes: {
      type: [SizeSchema],
      default: [],
    },

    // ── Categorisation ────────────────────────────────────────────────────
    category: {
      type: String,
      trim: true,
      default: 'jersey',
    },
    tags: {
      type: [String],
      default: [],
    },

    // ── Ownership (Expert) ────────────────────────────────────────────────
    owner_id: {
      type: Types.ObjectId,
      ref: 'User',
      required: [true, 'Product must belong to an expert (owner_id)'],
    },

    // ── Metrics (denormalised) ────────────────────────────────────────────
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },

    // ── Status ────────────────────────────────────────────────────────────
    isPublished: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
ProductSchema.index({ owner_id: 1 });
ProductSchema.index({ isPublished: 1, isActive: 1 });
ProductSchema.index({ 'price.amount': 1 });
ProductSchema.index({ averageRating: -1 });
ProductSchema.index({ tags: 1 });
/** Text index for multilingual full-text search */
ProductSchema.index(
  {
    'title.ar': 'text',
    'title.fr': 'text',
    'title.en': 'text',
    'description.ar': 'text',
    'description.fr': 'text',
    'description.en': 'text',
  },
  { name: 'product_text_search' }
);

// ---------------------------------------------------------------------------
// Virtual – total stock across all sizes
// ---------------------------------------------------------------------------
ProductSchema.virtual('totalStock').get(function () {
  return this.sizes.reduce((sum, s) => sum + s.stock, 0);
});

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
module.exports = model('Product', ProductSchema);

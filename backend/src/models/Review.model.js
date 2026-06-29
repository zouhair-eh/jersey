/**
 * @file Review.model.js
 * @description Review schema for jersey_marocco.
 *              A client can leave a review for an Expert (User) OR a specific Product.
 *              Exactly one of { expert_id, product_id } must be provided per review.
 */

const mongoose = require('mongoose');

const { Schema, model, Types } = mongoose;

// ---------------------------------------------------------------------------
// Review Schema
// ---------------------------------------------------------------------------
const ReviewSchema = new Schema(
  {
    // ── Author ────────────────────────────────────────────────────────────
    author_id: {
      type: Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must have an author (author_id)'],
    },

    // ── Review Target (polymorphic – one of the two must be set) ──────────
    /**
     * If reviewing an Expert:
     */
    expert_id: {
      type: Types.ObjectId,
      ref: 'User',
      default: null,
    },
    /**
     * If reviewing a specific Product:
     */
    product_id: {
      type: Types.ObjectId,
      ref: 'Product',
      default: null,
    },

    // ── Content ───────────────────────────────────────────────────────────
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review comment must be 1000 characters or less'],
      default: '',
    },

    // ── Moderation ────────────────────────────────────────────────────────
    isApproved: {
      type: Boolean,
      default: true, // Set to false if you add moderation workflow
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Validation: exactly one target must be supplied
// ---------------------------------------------------------------------------
ReviewSchema.pre('validate', function (next) {
  const hasExpert  = Boolean(this.expert_id);
  const hasProduct = Boolean(this.product_id);

  if (hasExpert === hasProduct) {
    // Both set, or neither set
    return next(
      new Error(
        'A review must target exactly one of: expert_id OR product_id'
      )
    );
  }
  next();
});

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
/** Fetch all reviews for a given expert */
ReviewSchema.index({ expert_id: 1, createdAt: -1 });

/** Fetch all reviews for a given product */
ReviewSchema.index({ product_id: 1, createdAt: -1 });

/** Fetch all reviews written by a given client */
ReviewSchema.index({ author_id: 1, createdAt: -1 });

/**
 * Prevent a client from leaving more than one review per expert/product.
 * Partial unique indexes: only enforce uniqueness where the field is not null.
 */
ReviewSchema.index(
  { author_id: 1, expert_id: 1 },
  {
    unique: true,
    partialFilterExpression: { expert_id: { $type: 'objectId' } },
    name: 'unique_review_per_expert',
  }
);
ReviewSchema.index(
  { author_id: 1, product_id: 1 },
  {
    unique: true,
    partialFilterExpression: { product_id: { $type: 'objectId' } },
    name: 'unique_review_per_product',
  }
);

// ---------------------------------------------------------------------------
// Post-save hook – update denormalised averageRating & totalReviews
// ---------------------------------------------------------------------------
async function updateAverageRating(reviewDoc) {
  const Review = reviewDoc.constructor;

  if (reviewDoc.expert_id) {
    const User = mongoose.model('User');
    const stats = await Review.aggregate([
      { $match: { expert_id: reviewDoc.expert_id, isActive: true, isApproved: true } },
      { $group: { _id: '$expert_id', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const avg   = stats.length ? Math.round(stats[0].avg * 10) / 10 : 0;
    const count = stats.length ? stats[0].count : 0;
    await User.findByIdAndUpdate(reviewDoc.expert_id, {
      averageRating: avg,
      totalReviews: count,
    });
  }

  if (reviewDoc.product_id) {
    const Product = mongoose.model('Product');
    const stats = await Review.aggregate([
      { $match: { product_id: reviewDoc.product_id, isActive: true, isApproved: true } },
      { $group: { _id: '$product_id', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const avg   = stats.length ? Math.round(stats[0].avg * 10) / 10 : 0;
    const count = stats.length ? stats[0].count : 0;
    await Product.findByIdAndUpdate(reviewDoc.product_id, {
      averageRating: avg,
      totalReviews: count,
    });
  }
}

ReviewSchema.post('save', updateAverageRating);
ReviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) await updateAverageRating(doc);
});

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
module.exports = model('Review', ReviewSchema);

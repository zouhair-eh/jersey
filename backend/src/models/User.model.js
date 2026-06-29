/**
 * @file User.model.js
 * @description User schema for jersey_marocco platform.
 *              Handles both 'client' and 'expert' roles in a single collection.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const { Schema, model } = mongoose;

// ---------------------------------------------------------------------------
// Sub-schema: Portfolio item (for Expert role)
// ---------------------------------------------------------------------------
const PortfolioItemSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [120, 'Portfolio title must be 120 characters or less'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Portfolio description must be 500 characters or less'],
    },
    /** Public URL of an image (e.g., Cloudinary / S3 link) */
    imageUrl: {
      type: String,
      trim: true,
    },
    /** Optional external project link */
    projectUrl: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// ---------------------------------------------------------------------------
// Main User Schema
// ---------------------------------------------------------------------------
const UserSchema = new Schema(
  {
    // ── Authentication ────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name must be 100 characters or less'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries by default
    },
    avatar: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // ── Dynamic Role ──────────────────────────────────────────────────────
    /**
     * A user can be a 'client', an 'expert', or both.
     * Storing as an array allows a future upgrade path (e.g., admin).
     */
    roles: {
      type: [String],
      enum: {
        values: ['client', 'expert', 'admin'],
        message: '{VALUE} is not a supported role',
      },
      default: ['client'],
    },

    // ── Expert-specific Fields ────────────────────────────────────────────
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio must be 1000 characters or less'],
    },
    /** ISO 639-1 language codes, e.g. ['ar', 'fr', 'en'] */
    languagesSpoken: {
      type: [String],
      default: [],
    },
    portfolio: {
      type: [PortfolioItemSchema],
      default: [],
    },
    /** Average rating computed from Review documents (denormalized for speed) */
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

    // ── Status / Soft delete ──────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ roles: 1 });
UserSchema.index({ averageRating: -1 }); // For sorting experts by rating
UserSchema.index({ isActive: 1, roles: 1 }); // Compound: active experts listing

// ---------------------------------------------------------------------------
// Pre-save hook – hash password
// ---------------------------------------------------------------------------
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt   = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---------------------------------------------------------------------------
// Instance method – verify password
// ---------------------------------------------------------------------------
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ---------------------------------------------------------------------------
// Virtual – isExpert helper
// ---------------------------------------------------------------------------
UserSchema.virtual('isExpert').get(function () {
  return this.roles.includes('expert');
});

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
module.exports = model('User', UserSchema);

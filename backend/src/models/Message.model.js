/**
 * @file Message.model.js
 * @description Message schema for jersey_marocco chat system.
 *              Each document represents a single message within a Conversation.
 */

const mongoose = require('mongoose');

const { Schema, model, Types } = mongoose;

// ---------------------------------------------------------------------------
// Message Schema
// ---------------------------------------------------------------------------
const MessageSchema = new Schema(
  {
    // ── Thread context ────────────────────────────────────────────────────
    conversation_id: {
      type: Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Message must belong to a conversation'],
    },

    // ── Participants ──────────────────────────────────────────────────────
    sender_id: {
      type: Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    receiver_id: {
      type: Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
    },

    // ── Content ───────────────────────────────────────────────────────────
    text: {
      type: String,
      trim: true,
      maxlength: [2000, 'Message text must be 2000 characters or less'],
    },

    /**
     * Optional media attachments (images, files).
     * For the MVP, store public URLs (e.g., Cloudinary).
     */
    attachments: {
      type: [
        {
          url:      { type: String, required: true, trim: true },
          mimeType: { type: String, trim: true },
          filename: { type: String, trim: true },
        },
      ],
      default: [],
    },

    // ── Message type ──────────────────────────────────────────────────────
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },

    // ── Read status ───────────────────────────────────────────────────────
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },

    // ── Soft delete ───────────────────────────────────────────────────────
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt = message sent time
  }
);

// ---------------------------------------------------------------------------
// Validation: at least text OR an attachment must be present
// ---------------------------------------------------------------------------
MessageSchema.pre('validate', function (next) {
  if (!this.text && (!this.attachments || this.attachments.length === 0)) {
    return next(new Error('A message must have either text content or at least one attachment'));
  }
  next();
});

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
/** Primary access pattern: list all messages in a conversation, ordered by time */
MessageSchema.index({ conversation_id: 1, createdAt: 1 });

/** Find all unread messages received by a specific user */
MessageSchema.index({ receiver_id: 1, isRead: 1 });

/** Support per-user sent-messages history */
MessageSchema.index({ sender_id: 1, createdAt: -1 });

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
module.exports = model('Message', MessageSchema);

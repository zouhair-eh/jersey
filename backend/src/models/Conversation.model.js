/**
 * @file Conversation.model.js
 * @description Conversation schema for jersey_marocco chat system.
 *              A Conversation is a thread between exactly two participants
 *              (Client ↔ Expert). Messages are stored in a separate collection
 *              for scalability.
 */

const mongoose = require('mongoose');

const { Schema, model, Types } = mongoose;

// ---------------------------------------------------------------------------
// Conversation Schema
// ---------------------------------------------------------------------------
const ConversationSchema = new Schema(
  {
    /**
     * Exactly two participants: [clientId, expertId].
     * Using a fixed-size, sorted pair makes deduplication easy.
     */
    participants: {
      type: [
        {
          type: Types.ObjectId,
          ref: 'User',
          required: true,
        },
      ],
      validate: {
        validator: (arr) => arr.length === 2,
        message: 'A conversation must have exactly 2 participants',
      },
    },

    /** Reference to the most recent message for preview / sorting */
    lastMessage: {
      type: Types.ObjectId,
      ref: 'Message',
      default: null,
    },

    /** Timestamp of the last activity (denormalised for efficient inbox queries) */
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },

    /** Soft delete */
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
// Indexes
// ---------------------------------------------------------------------------
/**
 * Unique compound index on sorted participants ensures only ONE conversation
 * exists between any two users (no duplicates).
 */
ConversationSchema.index({ participants: 1 }, { unique: true });
ConversationSchema.index({ lastActivityAt: -1 }); // Sort inbox by latest activity

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
module.exports = model('Conversation', ConversationSchema);

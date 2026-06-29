/**
 * @file chat.service.js
 * @description Pure database service layer for chat operations.
 *              Called by socket event handlers. Isolated from Socket.io so
 *              it can also be reused in REST endpoints (e.g., message history).
 */

const Conversation = require('../models/Conversation.model');
const Message      = require('../models/Message.model');
const mongoose     = require('mongoose');

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Sort two user IDs consistently so that findOne({ participants: [a,b] })
 * and findOne({ participants: [b,a] }) always match the same document.
 * @param {string} a
 * @param {string} b
 * @returns {[string, string]}
 */
function sortedPair(a, b) {
  return a < b ? [a, b] : [b, a];
}

// ── Service methods ───────────────────────────────────────────────────────────

/**
 * Find an existing conversation between two users, or create a new one.
 * Safe against race conditions due to the unique index on participants.
 *
 * @param {string} userIdA
 * @param {string} userIdB
 * @returns {Promise<import('../models/Conversation.model').default>}
 */
async function findOrCreateConversation(userIdA, userIdB) {
  const pair = sortedPair(userIdA, userIdB);

  // Try to find existing
  let conversation = await Conversation.findOne({
    participants: { $all: pair },
    isActive:     true,
  });

  if (!conversation) {
    // Create atomically — if a duplicate race occurs the unique index
    // will throw, so we retry the findOne.
    try {
      conversation = await Conversation.create({ participants: pair });
    } catch (err) {
      if (err.code === 11000) {
        conversation = await Conversation.findOne({
          participants: { $all: pair },
        });
      } else {
        throw err;
      }
    }
  }

  return conversation;
}

/**
 * Persist a new message and update the parent conversation's
 * lastMessage + lastActivityAt in a single atomic operation.
 *
 * @param {{
 *   conversationId: string,
 *   senderId:       string,
 *   receiverId:     string,
 *   text:           string,
 *   attachments?:   { url: string, mimeType?: string, filename?: string }[],
 *   messageType?:   'text' | 'image' | 'file'
 * }} payload
 * @returns {Promise<import('../models/Message.model').default>}
 */
async function saveMessage({ conversationId, senderId, receiverId, text, attachments = [], messageType = 'text' }) {
  const session = await mongoose.startSession();

  let savedMessage;

  await session.withTransaction(async () => {
    // 1. Create message
    [savedMessage] = await Message.create(
      [
        {
          conversation_id: conversationId,
          sender_id:       senderId,
          receiver_id:     receiverId,
          text,
          attachments,
          messageType,
        },
      ],
      { session }
    );

    // 2. Update conversation pointer
    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage:    savedMessage._id,
        lastActivityAt: new Date(),
      },
      { session }
    );
  });

  session.endSession();
  return savedMessage;
}

/**
 * Mark all unread messages sent TO a user in a conversation as read.
 * Returns the number of documents updated.
 *
 * @param {string} conversationId
 * @param {string} readerUserId   — the user who just read the messages
 * @returns {Promise<number>}
 */
async function markMessagesRead(conversationId, readerUserId) {
  const result = await Message.updateMany(
    {
      conversation_id: conversationId,
      receiver_id:     readerUserId,
      isRead:          false,
      isDeleted:       false,
    },
    {
      $set: { isRead: true, readAt: new Date() },
    }
  );

  return result.modifiedCount;
}

/**
 * Retrieve paginated message history for a conversation.
 *
 * @param {string}  conversationId
 * @param {object}  opts
 * @param {number}  opts.limit    — messages per page (default 30)
 * @param {string?} opts.before   — ISO timestamp; fetch messages older than this
 * @returns {Promise<import('../models/Message.model').default[]>}
 */
async function getMessageHistory(conversationId, { limit = 30, before } = {}) {
  const query = {
    conversation_id: conversationId,
    isDeleted:       false,
  };

  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  return Message
    .find(query)
    .sort({ createdAt: -1 })        // newest first for pagination
    .limit(limit)
    .populate('sender_id',   'name avatar')
    .populate('receiver_id', 'name avatar')
    .lean();
}

/**
 * Soft-delete a message (sender can only delete their own messages).
 *
 * @param {string} messageId
 * @param {string} requestingUserId
 * @returns {Promise<boolean>} true if deleted, false if not found / not authorized
 */
async function deleteMessage(messageId, requestingUserId) {
  const result = await Message.findOneAndUpdate(
    { _id: messageId, sender_id: requestingUserId, isDeleted: false },
    { $set: { isDeleted: true, text: '' } }
  );
  return Boolean(result);
}

module.exports = {
  findOrCreateConversation,
  saveMessage,
  markMessagesRead,
  getMessageHistory,
  deleteMessage,
};

/**
 * @file chat.socket.js
 * @description Socket.io chat namespace for jersey_marocco.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  EVENT CONTRACT  (Client → Server)
 * ─────────────────────────────────────────────────────────────────────────────
 *  join_conversation   { receiverId }            → join/create room, ack history
 *  send_message        { conversationId, text, attachments? }
 *  mark_read           { conversationId }
 *  typing              { conversationId, isTyping: boolean }
 *  delete_message      { messageId, conversationId }
 *  load_more           { conversationId, before }  → paginated history
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  EVENT CONTRACT  (Server → Client)
 * ─────────────────────────────────────────────────────────────────────────────
 *  conversation_ready  { conversation, messages: [] }
 *  new_message         { message }
 *  messages_read       { conversationId, readerId, count }
 *  user_typing         { conversationId, userId, isTyping }
 *  message_deleted     { messageId, conversationId }
 *  history_page        { messages: [], hasMore: boolean }
 *  chat_error          { event, message }
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { Server }             = require('socket.io');
const { socketAuthMiddleware } = require('./socket.auth');
const chatService            = require('./chat.service');

// ── Typing debounce store: prevent DB/broadcast storms ────────────────────────
// Map<conversationId, Map<userId, NodeJS.Timeout>>
const typingTimers = new Map();

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Initialise Socket.io on the given HTTP server.
 * @param {import('http').Server} httpServer
 */
function initChatSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin:      process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
      credentials: true,
    },
    // Prefer WebSocket; fall back to polling
    transports: ['websocket', 'polling'],
  });

  // ── Auth middleware (runs before every connection) ─────────────────────────
  io.use(socketAuthMiddleware);

  // ── Connection handler ─────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const { userId } = socket.data;
    console.log(`[chat] 🔌 Connected  user=${userId}  socket=${socket.id}`);

    // Each user joins a personal room so we can push targeted events
    // (e.g., new_message notifications) even when they are not in the chat room.
    socket.join(`user:${userId}`);

    // ── join_conversation ────────────────────────────────────────────────────
    /**
     * Payload: { receiverId: string }
     * Ack:     { ok: true, conversation, messages } | { ok: false, error }
     */
    socket.on('join_conversation', async ({ receiverId }, ack) => {
      try {
        if (!receiverId) throw new Error('receiverId is required');

        // 1. Find or create the conversation document
        const conversation = await chatService.findOrCreateConversation(
          userId,
          receiverId
        );

        const conversationId = conversation._id.toString();

        // 2. Join the Socket.io room keyed by conversationId
        await socket.join(`conv:${conversationId}`);

        // 3. Load the latest 30 messages for initial render
        const rawMessages = await chatService.getMessageHistory(conversationId, { limit: 30 });
        // History comes back newest-first; reverse for chronological display
        const messages = rawMessages.reverse();

        console.log(`[chat] ✅ join_conversation  convId=${conversationId}  user=${userId}`);

        if (typeof ack === 'function') {
          ack({ ok: true, conversation, messages });
        }
      } catch (err) {
        console.error('[chat] join_conversation error:', err.message);
        if (typeof ack === 'function') {
          ack({ ok: false, error: err.message });
        }
        socket.emit('chat_error', { event: 'join_conversation', message: err.message });
      }
    });

    // ── send_message ─────────────────────────────────────────────────────────
    /**
     * Payload: { conversationId, text, attachments?: [], messageType?: string }
     * Ack:     { ok: true, message } | { ok: false, error }
     */
    socket.on('send_message', async (payload, ack) => {
      try {
        const { conversationId, text, attachments, messageType } = payload ?? {};

        if (!conversationId) throw new Error('conversationId is required');
        if (!text && (!attachments || attachments.length === 0)) {
          throw new Error('Message must have text or at least one attachment');
        }

        // Determine receiverId from conversation participants
        const Conversation = require('../models/Conversation.model');
        const conv = await Conversation.findById(conversationId).lean();
        if (!conv) throw new Error('Conversation not found');

        const receiverId = conv.participants
          .map((p) => p.toString())
          .find((p) => p !== userId);

        if (!receiverId) throw new Error('Could not determine receiver');

        // Persist to MongoDB
        const message = await chatService.saveMessage({
          conversationId,
          senderId:   userId,
          receiverId,
          text,
          attachments,
          messageType,
        });

        // Serialize for the wire (lean Mongoose doc)
        const wireMessage = message.toObject();

        // Broadcast to everyone in the conversation room (including sender)
        io.to(`conv:${conversationId}`).emit('new_message', { message: wireMessage });

        // Also notify the receiver's personal room if they are not in the conv room
        // (e.g., they are on a different page — for inbox badge counts)
        io.to(`user:${receiverId}`).emit('new_message', { message: wireMessage });

        console.log(`[chat] 📨 send_message  convId=${conversationId}  from=${userId}  len=${(text ?? '').length}`);

        if (typeof ack === 'function') {
          ack({ ok: true, message: wireMessage });
        }
      } catch (err) {
        console.error('[chat] send_message error:', err.message);
        if (typeof ack === 'function') {
          ack({ ok: false, error: err.message });
        }
        socket.emit('chat_error', { event: 'send_message', message: err.message });
      }
    });

    // ── mark_read ────────────────────────────────────────────────────────────
    /**
     * Payload: { conversationId }
     * Broadcasts messages_read to the other participant so they see "✓✓".
     */
    socket.on('mark_read', async ({ conversationId }) => {
      try {
        if (!conversationId) return;

        const count = await chatService.markMessagesRead(conversationId, userId);

        if (count > 0) {
          // Notify the whole room so the sender updates their tick icons
          io.to(`conv:${conversationId}`).emit('messages_read', {
            conversationId,
            readerId: userId,
            count,
          });
        }
      } catch (err) {
        console.error('[chat] mark_read error:', err.message);
      }
    });

    // ── typing ───────────────────────────────────────────────────────────────
    /**
     * Payload: { conversationId, isTyping: boolean }
     * Auto-stops typing indicator after 4 s of inactivity.
     */
    socket.on('typing', ({ conversationId, isTyping }) => {
      if (!conversationId) return;

      // Clear previous timer for this user in this conversation
      const convTimers = typingTimers.get(conversationId) ?? new Map();
      if (convTimers.has(userId)) {
        clearTimeout(convTimers.get(userId));
      }

      // Broadcast to everyone in the room EXCEPT the sender
      socket.to(`conv:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        isTyping,
      });

      if (isTyping) {
        // Auto-stop after 4 s (handles tab close / network drops)
        const timer = setTimeout(() => {
          socket.to(`conv:${conversationId}`).emit('user_typing', {
            conversationId,
            userId,
            isTyping: false,
          });
          convTimers.delete(userId);
          typingTimers.set(conversationId, convTimers);
        }, 4000);

        convTimers.set(userId, timer);
        typingTimers.set(conversationId, convTimers);
      } else {
        convTimers.delete(userId);
        typingTimers.set(conversationId, convTimers);
      }
    });

    // ── delete_message ───────────────────────────────────────────────────────
    /**
     * Payload: { messageId, conversationId }
     */
    socket.on('delete_message', async ({ messageId, conversationId }, ack) => {
      try {
        const deleted = await chatService.deleteMessage(messageId, userId);

        if (deleted) {
          io.to(`conv:${conversationId}`).emit('message_deleted', {
            messageId,
            conversationId,
          });
        }

        if (typeof ack === 'function') {
          ack({ ok: deleted, error: deleted ? null : 'Not found or unauthorized' });
        }
      } catch (err) {
        console.error('[chat] delete_message error:', err.message);
        if (typeof ack === 'function') {
          ack({ ok: false, error: err.message });
        }
      }
    });

    // ── load_more ────────────────────────────────────────────────────────────
    /**
     * Payload: { conversationId, before: ISOString }
     * Ack:     { messages: [], hasMore: boolean }
     */
    socket.on('load_more', async ({ conversationId, before }, ack) => {
      try {
        const PAGE_SIZE = 30;
        const rawMessages = await chatService.getMessageHistory(conversationId, {
          limit:  PAGE_SIZE + 1, // fetch one extra to detect hasMore
          before,
        });

        const hasMore  = rawMessages.length > PAGE_SIZE;
        const messages = rawMessages.slice(0, PAGE_SIZE).reverse(); // chronological

        if (typeof ack === 'function') {
          ack({ messages, hasMore });
        }
      } catch (err) {
        console.error('[chat] load_more error:', err.message);
        if (typeof ack === 'function') {
          ack({ messages: [], hasMore: false, error: err.message });
        }
      }
    });

    // ── disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`[chat] 🔌 Disconnected  user=${userId}  reason=${reason}`);
    });
  });

  return io;
}

module.exports = { initChatSocket };

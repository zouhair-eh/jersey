/**
 * @file useChat.ts
 * @description Primary React hook for the jersey_marocco chat feature.
 *
 * Responsibilities:
 *  - Connect to Socket.io with the user's JWT
 *  - Join a private conversation room
 *  - Maintain local message list state
 *  - Expose send / delete / markRead / loadMore / setTyping actions
 *  - Surface connection + loading status to the UI
 *
 * Usage:
 *   const chat = useChat({ token, currentUserId, receiverId });
 */

'use client';

import { useEffect, useRef, useCallback, useReducer } from 'react';
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  type WireMessage,
  type WireConversation,
} from '@/lib/socket.client';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface UseChatOptions {
  /** JWT access token for the authenticated user */
  token:         string | null;
  /** MongoDB ObjectId of the currently logged-in user */
  currentUserId: string;
  /** MongoDB ObjectId of the other participant */
  receiverId:    string;
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected';

export interface ChatState {
  status:         ConnectionStatus;
  conversation:   WireConversation | null;
  messages:       WireMessage[];
  /** IDs of messages being optimistically rendered (not yet acked by server) */
  pendingIds:     Set<string>;
  isTyping:       boolean;   // is the OTHER user typing?
  hasMore:        boolean;   // more pages of history available
  isLoadingMore:  boolean;
  error:          string | null;
}

// ── Reducer ───────────────────────────────────────────────────────────────────

type Action =
  | { type: 'CONNECTING' }
  | { type: 'CONNECTED'; conversation: WireConversation; messages: WireMessage[] }
  | { type: 'NEW_MESSAGE'; message: WireMessage }
  | { type: 'OPTIMISTIC_MESSAGE'; message: WireMessage }
  | { type: 'CONFIRM_MESSAGE'; tempId: string; message: WireMessage }
  | { type: 'FAIL_MESSAGE'; tempId: string }
  | { type: 'MESSAGES_READ'; conversationId: string; readerId: string }
  | { type: 'USER_TYPING'; isTyping: boolean }
  | { type: 'MESSAGE_DELETED'; messageId: string }
  | { type: 'HISTORY_PAGE'; messages: WireMessage[]; hasMore: boolean }
  | { type: 'LOADING_MORE' }
  | { type: 'ERROR'; message: string }
  | { type: 'DISCONNECTED' };

const initialState: ChatState = {
  status:        'idle',
  conversation:  null,
  messages:      [],
  pendingIds:    new Set(),
  isTyping:      false,
  hasMore:       false,
  isLoadingMore: false,
  error:         null,
};

function chatReducer(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    case 'CONNECTING':
      return { ...state, status: 'connecting', error: null };

    case 'CONNECTED':
      return {
        ...state,
        status:       'connected',
        conversation: action.conversation,
        messages:     action.messages,
        hasMore:      action.messages.length >= 30,
        error:        null,
      };

    case 'NEW_MESSAGE': {
      // Deduplicate — ignore if already in the list (e.g., own message confirmed)
      const exists = state.messages.some((m) => m._id === action.message._id);
      if (exists) return state;
      return { ...state, messages: [...state.messages, action.message] };
    }

    case 'OPTIMISTIC_MESSAGE': {
      const next = new Set(state.pendingIds);
      next.add(action.message._id);
      return {
        ...state,
        messages:   [...state.messages, action.message],
        pendingIds: next,
      };
    }

    case 'CONFIRM_MESSAGE': {
      const next = new Set(state.pendingIds);
      next.delete(action.tempId);
      return {
        ...state,
        // Replace the temp message with the server-confirmed one
        messages:   state.messages.map((m) =>
          m._id === action.tempId ? action.message : m
        ),
        pendingIds: next,
      };
    }

    case 'FAIL_MESSAGE': {
      const next = new Set(state.pendingIds);
      next.delete(action.tempId);
      return {
        ...state,
        messages:   state.messages.filter((m) => m._id !== action.tempId),
        pendingIds: next,
      };
    }

    case 'MESSAGES_READ':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.receiver_id === action.readerId && !m.isRead
            ? { ...m, isRead: true, readAt: new Date().toISOString() }
            : m
        ),
      };

    case 'USER_TYPING':
      return { ...state, isTyping: action.isTyping };

    case 'MESSAGE_DELETED':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m._id === action.messageId
            ? { ...m, isDeleted: true, text: '' }
            : m
        ),
      };

    case 'LOADING_MORE':
      return { ...state, isLoadingMore: true };

    case 'HISTORY_PAGE':
      return {
        ...state,
        isLoadingMore: false,
        hasMore:       action.hasMore,
        // Prepend older messages — deduplicate by id
        messages: [
          ...action.messages.filter(
            (m) => !state.messages.some((existing) => existing._id === m._id)
          ),
          ...state.messages,
        ],
      };

    case 'ERROR':
      return { ...state, status: 'error', error: action.message };

    case 'DISCONNECTED':
      return { ...state, status: 'disconnected' };

    default:
      return state;
  }
}

// ── Typing debounce ───────────────────────────────────────────────────────────

function useTypingEmitter(conversationId: string | undefined) {
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCurrentlyTyping = useRef(false);

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      const socket = getSocket();
      if (!socket || !conversationId) return;

      if (isTyping && !isCurrentlyTyping.current) {
        isCurrentlyTyping.current = true;
        socket.emit('typing', { conversationId, isTyping: true });
      }

      // Debounce the stop signal — emit false 2 s after last keystroke
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        if (isCurrentlyTyping.current) {
          isCurrentlyTyping.current = false;
          socket.emit('typing', { conversationId, isTyping: false });
        }
      }, 2000);
    },
    [conversationId]
  );

  // Clean up on unmount
  useEffect(() => () => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
  }, []);

  return emitTyping;
}

// ── Main hook ─────────────────────────────────────────────────────────────────

export function useChat({ token, currentUserId, receiverId }: UseChatOptions) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const conversationId    = state.conversation?._id;
  const emitTyping        = useTypingEmitter(conversationId);

  // ── Connect + join conversation ──────────────────────────────────────────
  useEffect(() => {
    if (!token || !receiverId) return;

    dispatch({ type: 'CONNECTING' });
    const socket = connectSocket(token);

    // ── Outgoing: join the conversation room ─────────────────────────────
    socket.emit(
      'join_conversation',
      { receiverId },
      (ack: { ok: boolean; conversation?: WireConversation; messages?: WireMessage[]; error?: string }) => {
        if (ack.ok && ack.conversation && ack.messages) {
          dispatch({ type: 'CONNECTED', conversation: ack.conversation, messages: ack.messages });

          // Immediately mark incoming messages as read
          socket.emit('mark_read', { conversationId: ack.conversation._id });
        } else {
          dispatch({ type: 'ERROR', message: ack.error ?? 'Failed to join conversation' });
        }
      }
    );

    // ── Incoming: new message ────────────────────────────────────────────
    socket.on('new_message', ({ message }: { message: WireMessage }) => {
      dispatch({ type: 'NEW_MESSAGE', message });

      // Auto-mark as read if the window is focused and message is for current user
      const receiverObj = message.receiver_id as { _id: string } | string;
      const receiverIdStr = typeof receiverObj === 'string' ? receiverObj : receiverObj._id;

      if (receiverIdStr === currentUserId && document.hasFocus()) {
        socket.emit('mark_read', { conversationId: message.conversation_id });
      }
    });

    // ── Incoming: read receipts ──────────────────────────────────────────
    socket.on(
      'messages_read',
      ({ conversationId: cid, readerId }: { conversationId: string; readerId: string; count: number }) => {
        dispatch({ type: 'MESSAGES_READ', conversationId: cid, readerId });
      }
    );

    // ── Incoming: typing ─────────────────────────────────────────────────
    socket.on(
      'user_typing',
      ({ userId, isTyping }: { conversationId: string; userId: string; isTyping: boolean }) => {
        if (userId !== currentUserId) {
          dispatch({ type: 'USER_TYPING', isTyping });
        }
      }
    );

    // ── Incoming: message deleted ────────────────────────────────────────
    socket.on('message_deleted', ({ messageId }: { messageId: string; conversationId: string }) => {
      dispatch({ type: 'MESSAGE_DELETED', messageId });
    });

    // ── Incoming: server errors ──────────────────────────────────────────
    socket.on('chat_error', ({ message }: { event: string; message: string }) => {
      dispatch({ type: 'ERROR', message });
    });

    socket.on('disconnect', () => dispatch({ type: 'DISCONNECTED' }));

    // ── Cleanup: leave listeners (NOT disconnect — socket is a singleton) ─
    return () => {
      socket.off('new_message');
      socket.off('messages_read');
      socket.off('user_typing');
      socket.off('message_deleted');
      socket.off('chat_error');
      socket.off('disconnect');
    };
  }, [token, receiverId, currentUserId]);

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Send a message with optimistic UI update. */
  const sendMessage = useCallback(
    (text: string, attachments?: WireMessage['attachments']) => {
      const socket = getSocket();
      if (!socket || !conversationId) return;

      // Build a temporary id for optimistic rendering
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const optimistic: WireMessage = {
        _id:             tempId,
        conversation_id: conversationId,
        sender_id:       currentUserId,
        receiver_id:     receiverId,
        text:            text ?? '',
        attachments:     attachments ?? [],
        messageType:     'text',
        isRead:          false,
        readAt:          null,
        isDeleted:       false,
        createdAt:       new Date().toISOString(),
      };

      // Immediately show the message in the UI
      dispatch({ type: 'OPTIMISTIC_MESSAGE', message: optimistic });

      socket.emit(
        'send_message',
        { conversationId, text, attachments },
        (ack: { ok: boolean; message?: WireMessage; error?: string }) => {
          if (ack.ok && ack.message) {
            dispatch({ type: 'CONFIRM_MESSAGE', tempId, message: ack.message });
          } else {
            dispatch({ type: 'FAIL_MESSAGE', tempId });
            console.error('[useChat] send_message failed:', ack.error);
          }
        }
      );
    },
    [conversationId, currentUserId, receiverId]
  );

  /** Notify server that the current user is typing. Call on every keystroke. */
  const setTyping = useCallback(
    (isTyping: boolean) => emitTyping(isTyping),
    [emitTyping]
  );

  /** Mark all incoming messages in the current conversation as read. */
  const markRead = useCallback(() => {
    const socket = getSocket();
    if (!socket || !conversationId) return;
    socket.emit('mark_read', { conversationId });
  }, [conversationId]);

  /** Delete a message (own messages only). */
  const deleteMessage = useCallback(
    (messageId: string) => {
      const socket = getSocket();
      if (!socket || !conversationId) return;
      socket.emit('delete_message', { messageId, conversationId });
    },
    [conversationId]
  );

  /** Load older messages (cursor-based pagination). */
  const loadMore = useCallback(() => {
    const socket = getSocket();
    if (!socket || !conversationId || state.isLoadingMore || !state.hasMore) return;

    const oldest = state.messages[0];
    if (!oldest) return;

    dispatch({ type: 'LOADING_MORE' });
    socket.emit(
      'load_more',
      { conversationId, before: oldest.createdAt },
      (ack: { messages: WireMessage[]; hasMore: boolean }) => {
        dispatch({ type: 'HISTORY_PAGE', messages: ack.messages, hasMore: ack.hasMore });
      }
    );
  }, [conversationId, state.isLoadingMore, state.hasMore, state.messages]);

  return {
    // State
    ...state,
    // Actions
    sendMessage,
    setTyping,
    markRead,
    deleteMessage,
    loadMore,
  };
}

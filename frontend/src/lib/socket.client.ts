/**
 * @file socket.client.ts
 * @description Singleton Socket.io client for jersey_marocco.
 *
 * Usage:
 *   import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket.client';
 *
 * getSocket() always returns the SAME instance — no duplicate connections.
 * The socket is lazy-initialised (not created until connectSocket() is called).
 */

import { io, Socket } from 'socket.io-client';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WireMessage {
  _id:             string;
  conversation_id: string;
  sender_id:       { _id: string; name: string; avatar?: string } | string;
  receiver_id:     { _id: string; name: string; avatar?: string } | string;
  text:            string;
  attachments:     { url: string; mimeType?: string; filename?: string }[];
  messageType:     'text' | 'image' | 'file' | 'system';
  isRead:          boolean;
  readAt?:         string | null;
  isDeleted:       boolean;
  createdAt:       string;
}

export interface WireConversation {
  _id:            string;
  participants:   string[];
  lastMessage?:   string | null;
  lastActivityAt: string;
}

// ── Singleton ──────────────────────────────────────────────────────────────────

let socket: Socket | null = null;

const SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:5000';

/**
 * Initialise (or re-use) the socket with a fresh JWT.
 * Safe to call multiple times — returns the existing connected socket if alive.
 */
export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  // Disconnect stale socket if token changed
  if (socket) socket.disconnect();

  socket = io(SERVER_URL, {
    auth:        { token },
    transports:  ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay:    1500,
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('[socket] ✅ Connected', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[socket] ❌ Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[socket] Connection error:', err.message);
  });

  return socket;
}

/** Returns the current socket instance (may be null if never connected). */
export function getSocket(): Socket | null {
  return socket;
}

/** Cleanly disconnect and nullify the singleton. */
export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

/**
 * @file ChatWindow.tsx
 * @description Fully functional chat UI component consuming useChat.
 *
 * Features:
 *  - Chronological message list with auto-scroll
 *  - Optimistic messages shown with muted style until confirmed
 *  - Typing indicator (animated dots)
 *  - "Load more" button for history pagination
 *  - Read receipt ticks (✓ / ✓✓)
 *  - Soft-deleted messages shown as "[message supprimé]"
 *  - Send on Enter (Shift+Enter for newline)
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Send, Loader2, Trash2, ChevronUp, Check, CheckCheck } from 'lucide-react';
import clsx from 'clsx';
import { useChat, type UseChatOptions } from '@/hooks/useChat';
import type { WireMessage } from '@/lib/socket.client';
import Avatar from '@/components/ui/Avatar';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatWindowProps extends UseChatOptions {
  /** Name of the other participant (for display) */
  receiverName:   string;
  receiverAvatar?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSenderId(msg: WireMessage): string {
  return typeof msg.sender_id === 'string' ? msg.sender_id : msg.sender_id._id;
}

function getSenderName(msg: WireMessage): string {
  if (typeof msg.sender_id === 'string') return '';
  return msg.sender_id.name;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' });
}

// ── Typing Indicator ──────────────────────────────────────────────────────────

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-end gap-2 px-4 py-1">
      <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-white/[0.07] border border-white/[0.06]">
        <span className="text-xs text-white/50 me-1">{name} écrit</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isMine,
  isPending,
  onDelete,
}: {
  message:   WireMessage;
  isMine:    boolean;
  isPending: boolean;
  onDelete:  (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={clsx(
        'group flex items-end gap-2 px-4',
        isMine ? 'flex-row-reverse' : 'flex-row'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar — only for received messages */}
      {!isMine && (
        <Avatar
          name={getSenderName(message)}
          size="sm"
          className="flex-shrink-0 mb-1"
        />
      )}

      <div className={clsx('flex flex-col gap-1 max-w-[70%]', isMine && 'items-end')}>
        {/* Bubble */}
        <div
          className={clsx(
            'relative px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words',
            isMine
              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm'
              : 'bg-white/[0.07] border border-white/[0.06] text-white/90 rounded-bl-sm',
            isPending && 'opacity-60',
            message.isDeleted && 'italic text-white/40'
          )}
        >
          {message.isDeleted
            ? '🚫 Message supprimé'
            : message.text}
        </div>

        {/* Meta row: time + read receipt + delete button */}
        <div className={clsx('flex items-center gap-1.5 px-0.5', isMine && 'flex-row-reverse')}>
          <span className="text-[10px] text-white/30">{formatTime(message.createdAt)}</span>

          {/* Read receipt ticks (own messages only) */}
          {isMine && !message.isDeleted && (
            <span className="text-[10px]" aria-label={message.isRead ? 'Lu' : 'Envoyé'}>
              {isPending ? (
                <Loader2 className="w-2.5 h-2.5 text-white/30 animate-spin" />
              ) : message.isRead ? (
                <CheckCheck className="w-3 h-3 text-indigo-400" />
              ) : (
                <Check className="w-3 h-3 text-white/30" />
              )}
            </span>
          )}

          {/* Delete button (own, non-deleted messages only) */}
          {isMine && !message.isDeleted && !isPending && hovered && (
            <button
              onClick={() => onDelete(message._id)}
              className="text-white/25 hover:text-rose-400 transition-colors"
              aria-label="Supprimer le message"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ChatWindow({
  token,
  currentUserId,
  receiverId,
  receiverName,
  receiverAvatar,
}: ChatWindowProps) {
  const {
    status, messages, pendingIds, isTyping,
    hasMore, isLoadingMore, error,
    sendMessage, setTyping, markRead, deleteMessage, loadMore,
  } = useChat({ token, currentUserId, receiverId });

  const [text, setText] = useState('');
  const bottomRef       = useRef<HTMLDivElement>(null);
  const listRef         = useRef<HTMLDivElement>(null);

  // ── Auto-scroll on new messages ────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // ── Mark read when window gains focus ──────────────────────────────────────
  useEffect(() => {
    const onFocus = () => markRead();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [markRead]);

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || status !== 'connected') return;
    sendMessage(trimmed);
    setText('');
    setTyping(false);
  }, [text, status, sendMessage, setTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      setTyping(e.target.value.length > 0);
    },
    [setTyping]
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-brand-dark rounded-2xl border border-white/[0.06] overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.03]">
        <Avatar name={receiverName} src={receiverAvatar} size="md" online />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{receiverName}</p>
          <p className="text-xs text-white/40">
            {status === 'connecting' && 'Connexion...'}
            {status === 'connected'  && 'En ligne'}
            {status === 'error'      && '⚠ Erreur de connexion'}
            {status === 'disconnected' && 'Hors ligne'}
          </p>
        </div>
        {/* Connection indicator dot */}
        <span
          className={clsx(
            'w-2 h-2 rounded-full flex-shrink-0',
            status === 'connected'   && 'bg-emerald-400 animate-pulse',
            status === 'connecting'  && 'bg-amber-400 animate-pulse',
            status === 'error'       && 'bg-rose-500',
            status === 'disconnected' && 'bg-white/20'
          )}
        />
      </div>

      {/* ── Message list ───────────────────────────────────────────── */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto py-4 space-y-2 scroll-smooth"
      >
        {/* Load more button */}
        {hasMore && (
          <div className="flex justify-center pb-2">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {isLoadingMore
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <ChevronUp className="w-3 h-3" />
              }
              {isLoadingMore ? 'Chargement...' : 'Afficher plus'}
            </button>
          </div>
        )}

        {/* Initial loading skeleton */}
        {status === 'connecting' && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-white/30 py-16">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Connexion au chat...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mx-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => {
          const isMine = getSenderId(msg) === currentUserId;
          return (
            <MessageBubble
              key={msg._id}
              message={msg}
              isMine={isMine}
              isPending={pendingIds.has(msg._id)}
              onDelete={deleteMessage}
            />
          );
        })}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator name={receiverName} />}

        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ──────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez un message..."
            rows={1}
            disabled={status !== 'connected'}
            className={clsx(
              'flex-1 resize-none rounded-xl px-3.5 py-2.5 text-sm',
              'bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-white/30',
              'focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30',
              'transition-colors max-h-32 leading-relaxed',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || status !== 'connected'}
            className={clsx(
              'flex-shrink-0 p-2.5 rounded-xl transition-all duration-200',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500',
              text.trim() && status === 'connected'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 active:scale-95 shadow-lg shadow-indigo-900/30'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            )}
            aria-label="Envoyer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-white/20 mt-1.5 ps-1">
          Entrée pour envoyer · Shift+Entrée pour un saut de ligne
        </p>
      </div>
    </div>
  );
}

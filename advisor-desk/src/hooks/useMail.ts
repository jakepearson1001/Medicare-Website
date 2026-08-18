import { useMemo, useState } from 'react';
import { MESSAGES } from '../data/mail';
import type { MailMessage } from '../types';

export type MailFilter = 'inbox' | 'flagged' | 'sent' | 'compliance';

/**
 * Mailbox seam. Today this serves src/data/mail.ts; to wire Microsoft Graph,
 * fetch messages here and keep the same return shape — no component changes.
 */
export function useMail() {
  const [messages, setMessages] = useState<MailMessage[]>(MESSAGES);
  const [filter, setFilter] = useState<MailFilter>('inbox');

  const visible = useMemo(() => {
    const list =
      filter === 'flagged'
        ? messages.filter((m) => m.flagged)
        : messages.filter((m) => m.folder === filter);
    return [...list].sort((a, b) => b.time.localeCompare(a.time));
  }, [messages, filter]);

  const unreadCount = messages.filter((m) => m.folder === 'inbox' && m.unread).length;

  const markRead = (id: string) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, unread: false } : m)));

  return { messages: visible, filter, setFilter, markRead, unreadCount };
}

export function formatMailTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

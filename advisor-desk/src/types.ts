export interface Client {
  id: string;
  name: string;
  plan: string;
  policyNumber: string;
  phone: string;
  email: string;
  aum: number;
  nextReview: string; // ISO date
  lastContact: string; // ISO date
}

export type MailFolder = 'inbox' | 'sent' | 'compliance';

export interface MailMessage {
  id: string;
  folder: MailFolder;
  from: string;
  subject: string;
  preview: string;
  body: string;
  time: string; // ISO datetime
  unread: boolean;
  flagged: boolean;
}

export type EventType = 'client' | 'internal' | 'personal' | 'compliance';

export interface CalendarEvent {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  start: string; // "09:30"
  end: string; // "10:00"
  title: string;
  location: string;
  type: EventType;
}

export interface LinkItem {
  id: string;
  name: string;
  url: string;
  /** Built-in behavior override; 'videos' opens the in-app Company Videos window. */
  builtin?: 'videos';
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string; // ISO date
}

export interface TickerItem {
  id: string;
  label: string;
  value: string;
  change?: string;
  direction?: 'up' | 'down' | 'flat';
}

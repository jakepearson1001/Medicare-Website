import type { MailMessage } from '../types';

function todayAt(hour: number, minute: number, dayOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/**
 * Mock mailbox. Replace by pointing useMail() at Microsoft Graph —
 * see src/hooks/useMail.ts.
 */
export const MESSAGES: MailMessage[] = [
  {
    id: 'm1',
    folder: 'inbox',
    from: 'Margaret Holloway',
    subject: 'Question about my drug tier change',
    preview: 'Dave, the pharmacy said my Eliquis moved to tier 3 and I wanted to check…',
    body: 'Dave,\n\nThe pharmacy said my Eliquis moved to tier 3 and I wanted to check whether that changes what I pay at the counter, or if we should look at a different Part D plan during AEP.\n\nThanks as always,\nMargaret',
    time: todayAt(8, 42),
    unread: true,
    flagged: true,
  },
  {
    id: 'm2',
    folder: 'inbox',
    from: 'Tricia Vance (Compliance)',
    subject: 'Annual attestation due Friday',
    preview: 'Reminder: your annual marketing material attestation is due by end of day…',
    body: 'Reminder: your annual marketing material attestation is due by end of day Friday. Portal link is the same as last year. Ping me if your login is locked out.\n\n— Tricia',
    time: todayAt(7, 58),
    unread: true,
    flagged: false,
  },
  {
    id: 'm3',
    folder: 'inbox',
    from: 'Ronald Gearhart',
    subject: 'Re: Annuity ladder review',
    preview: 'Thursday at 2 works for both of us. Pat wants to talk about the RMD…',
    body: 'Thursday at 2 works for both of us. Pat wants to talk about the RMD timing on the IRA too if we have time.\n\nRon',
    time: todayAt(16, 21, -1),
    unread: false,
    flagged: true,
  },
  {
    id: 'm4',
    folder: 'inbox',
    from: 'Jordan Credit Union — Leads',
    subject: 'This week’s member referrals (4 new)',
    preview: 'Four new member referrals were added to the shared spreadsheet this week…',
    body: 'Four new member referrals were added to the shared spreadsheet this week. Two flagged Medicare-eligible in October. Sheet is sorted newest-first.\n\n— Branch team',
    time: todayAt(14, 5, -1),
    unread: false,
    flagged: false,
  },
  {
    id: 'm5',
    folder: 'inbox',
    from: 'Eleanor Whitfield',
    subject: 'Thank you!',
    preview: 'Just wanted to say thanks for walking my sister through her options…',
    body: 'Just wanted to say thanks for walking my sister through her options yesterday. She said it was the first time anyone explained the difference between Advantage and Supplement in plain English.\n\nEllie',
    time: todayAt(11, 30, -2),
    unread: false,
    flagged: false,
  },
  {
    id: 'm6',
    folder: 'sent',
    from: 'Dave Pearson',
    subject: 'Your review is booked — Thursday 2:00',
    preview: 'Ron — confirmed for Thursday at 2:00 at the office. I’ll have the annuity…',
    body: 'Ron — confirmed for Thursday at 2:00 at the office. I’ll have the annuity ladder summary and RMD projections printed. See you both then.\n\nDave',
    time: todayAt(16, 40, -1),
    unread: false,
    flagged: false,
  },
  {
    id: 'm7',
    folder: 'sent',
    from: 'Dave Pearson',
    subject: 'Booking link for your neighbor',
    preview: 'Happy to help — here’s my calendar, she can grab any time that works…',
    body: 'Happy to help — here’s my calendar, she can grab any time that works for her:\n\nhttps://calendly.com/dave-peakfinancial/30min\n\nDave',
    time: todayAt(9, 12, -2),
    unread: false,
    flagged: false,
  },
  {
    id: 'm8',
    folder: 'compliance',
    from: 'Tricia Vance (Compliance)',
    subject: 'APPROVED: October seminar slide deck v3',
    preview: 'The October educational seminar deck v3 is approved with one edit…',
    body: 'The October educational seminar deck v3 is approved with one edit: slide 9 needs the current-year disclaimer footer. Approval code CMP-2026-1174.\n\n— Tricia',
    time: todayAt(15, 2, -3),
    unread: false,
    flagged: false,
  },
  {
    id: 'm9',
    folder: 'compliance',
    from: 'CMS Notices',
    subject: '2027 AEP marketing guidelines published',
    preview: 'The updated Medicare Communications and Marketing Guidelines are now…',
    body: 'The updated Medicare Communications and Marketing Guidelines for the 2027 plan year are now available. Review the summary of changes before producing new materials.',
    time: todayAt(10, 15, -4),
    unread: true,
    flagged: false,
  },
];

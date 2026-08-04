'use client';

import { useState, type FormEvent } from 'react';
import { MICROCOPY } from '@/lib/copy/microcopy';

interface DialogueOption {
  id: string;
  label: string;
  subject: string;
  npcResponse: string;
}

const OPTIONS: DialogueOption[] = [
  {
    id: 'order',
    label: 'Ask about order',
    subject: 'Order Inquiry',
    npcResponse: 'A wise choice. Have your order number ready, Player.',
  },
  {
    id: 'complain-polite',
    label: 'Complain politely',
    subject: 'A Polite Complaint',
    npcResponse: 'Your feedback has been logged in a system that definitely exists.',
  },
  {
    id: 'complain-impolite',
    label: 'Complain impolitely',
    subject: 'An Impolite Complaint',
    npcResponse: 'Understood. I will relay your tone exactly, in writing, forever.',
  },
  {
    id: 'browsing',
    label: 'Just browsing',
    subject: 'Just Browsing',
    npcResponse: 'Cool. I will stand here. That is what I do.',
  },
];

export default function DialogueTreeForm() {
  const [selected, setSelected] = useState<DialogueOption | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: selected.subject, name, email, message }),
      });
      if (!res.ok) throw new Error('bad response');
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (!selected) {
    return (
      <div className="border-2 border-ink bg-cream">
        <div className="border-b-2 border-ink bg-ink px-3 py-1.5 font-mono text-cream">NPC</div>
        <div className="p-5">
          <p className="mb-4 font-mono text-sm">What do you need, Player?</p>
          <div className="flex flex-col gap-2">
            {OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected(opt)}
                className="cursor-select border-2 border-ink px-4 py-3 text-left font-mono text-sm hover:bg-ink hover:text-cream"
              >
                [ {opt.label} ]
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="border-2 border-ink bg-cream p-6 text-center">
        <p className="font-mono text-sm">{MICROCOPY.formSuccess}</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-ink bg-cream">
      <div className="border-b-2 border-ink bg-ink px-3 py-1.5 font-mono text-cream">NPC</div>
      <div className="p-5">
        <p className="mb-4 font-mono text-sm">{selected.npcResponse}</p>
        <form onSubmit={handleSubmit} className="space-y-3 font-mono text-sm">
          <div>
            <label className="mb-1 block text-xs uppercase text-npcgray-dark">Subject</label>
            <input
              value={selected.subject}
              readOnly
              className="w-full border-2 border-npcgray-light bg-npcgray-light/20 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase text-npcgray-dark">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-ink bg-cream px-3 py-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase text-npcgray-dark">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-ink bg-cream px-3 py-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase text-npcgray-dark">Message</label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border-2 border-ink bg-cream px-3 py-2 focus:outline-none"
            />
          </div>
          {status === 'error' && (
            <p className="text-errorred">{MICROCOPY.formError}</p>
          )}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="cursor-select border-2 border-ink px-4 py-2"
            >
              ← Choose again
            </button>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="cursor-select flex-1 border-2 border-ink bg-ink px-4 py-2 text-cream disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending...' : 'Send Dialogue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, type FormEvent } from 'react';
import { MICROCOPY } from '@/lib/copy/microcopy';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('bad response');
      setStatus('done');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="font-mono text-sm">
      <h3 className="mb-1 uppercase tracking-widest text-npcgray-light">
        {MICROCOPY.newsletterTitle}
      </h3>
      <p className="mb-3 text-npcgray-light">{MICROCOPY.newsletterBody}</p>
      {status === 'done' ? (
        <p className="border-2 border-cream px-3 py-2 text-cream">
          {MICROCOPY.newsletterSuccess}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="player@email.com"
            className="w-full min-w-0 border-2 border-cream bg-ink px-3 py-2 text-cream placeholder:text-npcgray-dark focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="cursor-select shrink-0 border-2 border-cream bg-cream px-3 py-2 text-ink uppercase hover:bg-npcgray-light disabled:opacity-50"
          >
            {status === 'loading' ? '...' : MICROCOPY.newsletterCta}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="mt-2 text-errorred">{MICROCOPY.formError}</p>
      )}
    </div>
  );
}

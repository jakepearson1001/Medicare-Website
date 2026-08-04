import type { Metadata } from 'next';
import Link from 'next/link';
import { PATCH_NOTES } from '@/lib/copy/patch-notes';

export const metadata: Metadata = {
  title: 'Patch Notes',
  description: 'The blog, but every post is written as game patch notes.',
};

export default function PatchNotesPage() {
  const sorted = [...PATCH_NOTES].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-npcgray-dark">
          Changelog
        </p>
        <h1 className="mb-8 font-display text-3xl uppercase sm:text-4xl">Patch Notes</h1>

        <div className="space-y-6">
          {sorted.map((note) => (
            <Link
              key={note.slug}
              href={`/patch-notes/${note.slug}`}
              className="block border-2 border-ink bg-cream p-5 transition-colors hover:bg-ink hover:text-cream"
            >
              <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-npcgray-dark">
                <span>{note.version}</span>
                <span>{note.date}</span>
              </div>
              <h2 className="mt-1 font-display text-xl uppercase">{note.title}</h2>
              <p className="mt-2 font-mono text-sm">{note.summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

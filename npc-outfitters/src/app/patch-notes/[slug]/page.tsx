import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PATCH_NOTES } from '@/lib/copy/patch-notes';

export function generateStaticParams() {
  return PATCH_NOTES.map((n) => ({ slug: n.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const note = PATCH_NOTES.find((n) => n.slug === params.slug);
  if (!note) return {};
  return { title: `${note.version} — ${note.title}`, description: note.summary };
}

export default function PatchNoteDetailPage({ params }: { params: { slug: string } }) {
  const note = PATCH_NOTES.find((n) => n.slug === params.slug);
  if (!note) notFound();

  return (
    <div className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link href="/patch-notes" className="cursor-select font-mono text-xs uppercase text-npcgray-dark">
          ← Back to Patch Notes
        </Link>
        <div className="mt-4 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-npcgray-dark">
          <span>{note.version}</span>
          <span>{note.date}</span>
        </div>
        <h1 className="mt-1 font-display text-3xl uppercase sm:text-4xl">{note.title}</h1>
        <p className="mt-4 font-mono text-sm">{note.summary}</p>

        <ul className="mt-8 space-y-3 border-t-2 border-ink pt-6 font-mono text-sm leading-relaxed">
          {note.notes.map((line, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-npcgray-dark">▶</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

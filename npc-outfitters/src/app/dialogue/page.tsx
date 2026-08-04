import type { Metadata } from 'next';
import DialogueTreeForm from '@/components/DialogueTreeForm';

export const metadata: Metadata = {
  title: 'Dialogue',
  description: 'Contact us. Select a dialogue option to begin.',
};

export default function DialoguePage() {
  return (
    <div className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-npcgray-dark">
          Select Dialogue Option
        </p>
        <h1 className="mb-8 font-display text-3xl uppercase sm:text-4xl">Talk to an NPC</h1>
        <DialogueTreeForm />
      </div>
    </div>
  );
}

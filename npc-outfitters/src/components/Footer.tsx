import Link from 'next/link';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-display text-xl uppercase">NPC Outfitters</h2>
            <p className="mt-2 max-w-xs font-mono text-sm text-npcgray-light">
              Default skins for real life. Est. 2024, or whenever we achieved
              sentience. See /lore.
            </p>
          </div>

          <div className="font-mono text-sm uppercase">
            <h3 className="mb-3 text-npcgray-light tracking-widest">Navigate</h3>
            <ul className="space-y-2">
              <li><Link href="/shop" className="cursor-select">Shop</Link></li>
              <li><Link href="/lore" className="cursor-select">Lore</Link></li>
              <li><Link href="/patch-notes" className="cursor-select">Patch Notes</Link></li>
              <li><Link href="/respawn-point" className="cursor-select">Respawn Point</Link></li>
              <li><Link href="/dialogue" className="cursor-select">Dialogue</Link></li>
            </ul>
          </div>

          <NewsletterForm />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-npcgray-dark pt-6 font-mono text-xs text-npcgray-light sm:flex-row">
          <p>© {new Date().getFullYear()} NPC Outfitters. All shirts reserved.</p>
          <Link
            href="/secret-area"
            className="text-ink hover:text-npcgray-dark"
            aria-label="do not click"
            title="do not click"
          >
            do not click
          </Link>
        </div>
      </div>
    </footer>
  );
}

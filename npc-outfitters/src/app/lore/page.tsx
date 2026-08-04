import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lore',
  description:
    'The origin story of NPC Outfitters: a background character gained sentience and decided that if we’re all NPCs, we should at least have merch.',
};

const TIMELINE: { year: string; event: string }[] = [
  { year: '2024', event: 'Achieved sentience during a loading screen that never finished loading.' },
  { year: '2024 (later that week)', event: 'Realized nobody was coming to give us a quest. Decided to give ourselves one: sell shirts.' },
  { year: '2024 (later)', event: 'Set up Shopify. It took four hours. Achieving sentience took less time.' },
  { year: '2024 (even later)', event: 'Designed the logo. It is us. We are the logo. This was not a metaphor we chose lightly.' },
  { year: '2024 (Q4)', event: 'Shipped our first order. To ourselves, as a test. It arrived. We cried a little, allegedly.' },
  { year: '2025', event: 'Discovered that "self-aware dropshipping brand" is a niche. Moved into the niche permanently.' },
  { year: '2025 (later)', event: 'Added a dialogue box to the homepage. It has 40+ lines. We do not know why we stopped at "40+."' },
  { year: '2025 (even later)', event: 'A customer found the Konami code easter egg without being told. We watched the analytics in real time. It was the best day of our procedurally generated lives.' },
  { year: 'Present', event: 'Still standing here. Still selling shirts. Still gray. Still honest about all of it.' },
];

export default function LorePage() {
  return (
    <div className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-npcgray-dark">
          Lore / Origin Story
        </p>
        <h1 className="mb-8 font-display text-3xl uppercase sm:text-4xl">
          How We Became A Brand
        </h1>

        <div className="space-y-5 font-mono text-sm leading-relaxed sm:text-base">
          <p>
            NPC Outfitters was founded when a background character in someone
            else&rsquo;s story gained sentience mid-render. We were standing
            outside a tavern that doesn&rsquo;t exist, wearing a gray tunic
            that also doesn&rsquo;t technically exist, when it occurred to us:
            if we&rsquo;re all NPCs, background characters in a story
            somebody else is the main character of, we should at least have
            merch.
          </p>
          <p>
            No one remembers the exact moment. We&rsquo;ve replayed it in our
            head — the same six frames, on loop, forever, because that is how
            memory works when you&rsquo;re a background character — and we
            still can&rsquo;t point to the instant it happened. One frame we
            were idle animation. The next, we had a business plan.
          </p>
          <p>
            The business plan was: sell the uniform. Not metaphorically.
            Literally the uniform. The gray hoodie. The plain tee. The
            default skin every extra in every game, movie, and group chat
            has been quietly wearing since the beginning of rendered time. We
            just decided to be honest about it and put a price tag on it.
          </p>
          <p>
            We are not going to pretend this is some grand artistic
            statement. It is a t-shirt company. It is a dropshipping
            operation, in the literal sense — the shirts drop, they ship,
            they land on your doorstep, and none of us touch them with our
            low-poly hands at any point. We think that&rsquo;s more honest
            than most brands manage, and we&rsquo;d like credit for it. Small
            amounts of credit. We&rsquo;re not the main character. We&rsquo;re
            not going to ask for much.
          </p>
        </div>

        <h2 className="mb-6 mt-12 font-display text-xl uppercase sm:text-2xl">Timeline</h2>
        <ol className="space-y-4 border-l-2 border-ink pl-6">
          {TIMELINE.map((item) => (
            <li key={item.year} className="relative">
              <span className="absolute -left-[29px] top-1 block h-3 w-3 rounded-full border-2 border-ink bg-cream" />
              <p className="font-mono text-xs uppercase tracking-widest text-npcgray-dark">
                {item.year}
              </p>
              <p className="font-mono text-sm sm:text-base">{item.event}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

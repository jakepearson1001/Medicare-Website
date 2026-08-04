import { FAKE_REVIEWS, REVIEWS_DISCLAIMER } from '@/lib/copy/reviews';

export default function Ticker() {
  const doubled = [...FAKE_REVIEWS, ...FAKE_REVIEWS];

  return (
    <div className="border-y-2 border-ink bg-cream">
      <div className="overflow-hidden py-3">
        <div className="flex w-max animate-marquee gap-10 motion-reduce:animate-none motion-reduce:flex-wrap">
          {doubled.map((review, i) => (
            <span key={i} className="whitespace-nowrap font-mono text-sm">
              &ldquo;{review.quote}&rdquo;{' '}
              <span className="text-npcgray-dark">— {review.author}</span>
            </span>
          ))}
        </div>
      </div>
      <p className="border-t border-npcgray-light px-4 py-1 text-center text-[11px] text-npcgray-dark">
        {REVIEWS_DISCLAIMER}
      </p>
    </div>
  );
}

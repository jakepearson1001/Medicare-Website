import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Respawn Point',
  description: 'Returns, exchanges, and shipping — the jokes are in the headers, the policy is real.',
};

export default function RespawnPointPage() {
  return (
    <div className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-npcgray-dark">
          Returns &amp; Shipping
        </p>
        <h1 className="mb-8 font-display text-3xl uppercase sm:text-4xl">Respawn Point</h1>

        <div className="space-y-10 font-mono text-sm leading-relaxed sm:text-base">
          <section>
            <h2 className="mb-2 font-display text-xl uppercase">Dying Is Temporary (Returns)</h2>
            <p>
              You have <strong>30 days</strong> from the delivery date to
              return an item for a full refund to your original payment
              method. Items must be unworn, unwashed, and in their original
              condition with tags attached. To start a return, use{' '}
              <a href="/dialogue" className="underline">
                the Dialogue page
              </a>{' '}
              and select &ldquo;Ask about order,&rdquo; or email us directly.
              We&rsquo;ll send a prepaid return label and process your refund
              within 5–7 business days of receiving the item back.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-xl uppercase">Character Re-Roll (Exchanges)</h2>
            <p>
              Wrong size? Wrong vibe? Exchanges are free within 30 days of
              delivery, subject to stock availability — and stock, as
              established elsewhere on this site, restocks when the
              algorithm feels like it. If your requested size or item is out
              of stock, we&rsquo;ll issue a full refund instead.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-xl uppercase">Loading Times (Shipping)</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Orders are processed within 1–3 business days.</li>
              <li>Standard shipping (US): 5–8 business days after processing.</li>
              <li>Free standard shipping on all orders over $50.</li>
              <li>Expedited shipping options are available at checkout for an additional fee.</li>
              <li>
                International shipping is available to select countries;
                rates and delivery windows are calculated at checkout.
              </li>
              <li>
                You&rsquo;ll receive a tracking number by email as soon as
                your order ships.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-display text-xl uppercase">Corrupted Save Files (Damaged or Wrong Items)</h2>
            <p>
              If your order arrives damaged, defective, or incorrect,
              contact us within 14 days of delivery with your order number
              and a photo of the issue. We&rsquo;ll replace the item or issue
              a full refund at no cost to you — this one isn&rsquo;t a bit,
              we just want it fixed.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-xl uppercase">Non-Returnable Items</h2>
            <p>
              Final sale / clearance items are marked as such at checkout
              and are not eligible for return or exchange unless defective.
              Gift cards are non-refundable.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-xl uppercase">Still Stuck? (Contact)</h2>
            <p>
              Head to{' '}
              <a href="/dialogue" className="underline">
                /dialogue
              </a>{' '}
              and pick whichever option best matches your mood. An actual
              human reads every message, we promise, even the impolite ones.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

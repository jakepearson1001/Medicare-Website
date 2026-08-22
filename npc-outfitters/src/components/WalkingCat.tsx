'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Generic, brand-original characters — deliberately not likenesses of real
// people or trademarked mascots, since this ships on a live storefront.
const CRITTER_TYPES = [
  { key: 'burger', emoji: '🍔' },
  { key: 'ape', emoji: '🦍' },
  { key: 'croc', emoji: '🐊' },
  { key: 'blob', emoji: '🟣' },
  { key: 'spiky', emoji: '🦔' },
  { key: 'suit', emoji: '🕴️' },
];

const MAX_CRITTERS = 6;
// Wide enough that the cat's speech bubble (centered on it, ~210px max)
// never clips off the side of the viewport.
const EDGE_MARGIN = 120;
const WANDER_MS = 4500;
const TRAVEL_MS = 3000;
// After this long with no clicks the whole scene despawns and the cat walks
// back to its corner, so the page never accumulates critters forever.
const IDLE_RESET_MS = 30000;

const AT_CAPACITY_LINES = [
  'Six. That is the limit. I do not make the rules. I am the rules.',
  'The render budget is full. Take one away first.',
  'No. Six is already too many. Look at them.',
];

interface Critter {
  id: number;
  key: string;
  emoji: string;
  x: number;
  y: number;
  facingLeft: boolean;
  dying: boolean;
}

interface Beam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function WalkingCat() {
  const [mounted, setMounted] = useState(false);
  const [catPos, setCatPos] = useState({ x: EDGE_MARGIN, y: 0 });
  const [catFacingLeft, setCatFacingLeft] = useState(false);
  const [critters, setCritters] = useState<Critter[]>([]);
  const [beams, setBeams] = useState<Beam[] | null>(null);
  const [catState, setCatState] = useState<'idle' | 'firing' | 'mad'>('idle');
  const [bubble, setBubble] = useState<string | null>('Do not pet the cat.');
  const [frozen, setFrozen] = useState(false);

  const catRef = useRef<HTMLButtonElement>(null);
  const critterRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const nextId = useRef(1);
  const reduceMotion = useRef(false);
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const resetScene = useCallback(() => {
    // Never yank the scene out from under an in-flight laser.
    if (busy.current) {
      idleTimer.current = setTimeout(resetScene, 1500);
      return;
    }
    setCritters([]);
    critterRefs.current = {};
    setBeams(null);
    setCatState('idle');
    setFrozen(false);
    setCatFacingLeft(false);
    setCatPos({ x: EDGE_MARGIN, y: window.innerHeight - 150 });
    setBubble('Do not pet the cat.');
    later(() => setBubble((b) => (b === 'Do not pet the cat.' ? null : b)), 4000);
  }, [later]);

  // Restart the 30s countdown on every interaction.
  const bumpIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(resetScene, IDLE_RESET_MS);
  }, [resetScene]);

  function randomSpot() {
    const maxX = Math.max(EDGE_MARGIN, window.innerWidth - EDGE_MARGIN - 40);
    const maxY = Math.max(120, window.innerHeight - 150);
    return {
      x: EDGE_MARGIN + Math.random() * (maxX - EDGE_MARGIN),
      y: 120 + Math.random() * (maxY - 120),
    };
  }

  useEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setCatPos({ x: EDGE_MARGIN, y: window.innerHeight - 150 });
    setMounted(true);

    const introTimer = setTimeout(() => {
      setBubble((b) => (b === 'Do not pet the cat.' ? null : b));
    }, 4000);
    bumpIdle();

    if (reduceMotion.current) {
      return () => clearTimeout(introTimer);
    }

    // One heartbeat moves the cat and every critter to a fresh target.
    const id = setInterval(() => {
      if (busy.current) return;
      setCatPos((prev) => {
        const next = randomSpot();
        setCatFacingLeft(next.x < prev.x);
        return next;
      });
      setCritters((prev) =>
        prev.map((c) => {
          if (c.dying) return c;
          const next = randomSpot();
          return { ...c, x: next.x, y: next.y, facingLeft: next.x < c.x };
        })
      );
    }, WANDER_MS);

    return () => {
      clearInterval(id);
      clearTimeout(introTimer);
    };
  }, [bumpIdle]);

  // Keep everyone inside the viewport when it changes size.
  useEffect(() => {
    function onResize() {
      const maxX = Math.max(EDGE_MARGIN, window.innerWidth - EDGE_MARGIN - 40);
      const maxY = Math.max(120, window.innerHeight - 150);
      const clamp = <T extends { x: number; y: number }>(p: T): T => ({
        ...p,
        x: Math.min(p.x, maxX),
        y: Math.min(p.y, maxY),
      });
      setCatPos(clamp);
      setCritters((prev) => prev.map(clamp));
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const pending = timers;
    return () => {
      pending.current.forEach(clearTimeout);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  function spawnCritter() {
    const taken = new Set(critters.map((c) => c.key));
    const available = CRITTER_TYPES.filter((t) => !taken.has(t.key));
    if (available.length === 0) return;
    const type = available[Math.floor(Math.random() * available.length)];
    const spot = randomSpot();
    setCritters((prev) => [
      ...prev,
      { id: nextId.current++, key: type.key, emoji: type.emoji, ...spot, facingLeft: Math.random() > 0.5, dying: false },
    ]);
  }

  function handleCatClick() {
    if (busy.current) return;
    bumpIdle();

    if (critters.length >= MAX_CRITTERS) {
      busy.current = true;
      setCatState('mad');
      setBubble(AT_CAPACITY_LINES[Math.floor(Math.random() * AT_CAPACITY_LINES.length)]);
      later(() => {
        setCatState('idle');
        setBubble(null);
        busy.current = false;
      }, 2200);
      return;
    }

    setBubble(null);
    spawnCritter();
  }

  function handleCritterClick(critterId: number) {
    if (busy.current) return;
    bumpIdle();
    const catEl = catRef.current;
    const critterEl = critterRefs.current[critterId];
    if (!catEl || !critterEl) return;

    busy.current = true;

    // Snapshot everyone where they're actually rendered right now and pin
    // them there, so the beams line up instead of chasing a CSS transition.
    const catRect = catEl.getBoundingClientRect();
    const targetRect = critterEl.getBoundingClientRect();

    setFrozen(true);
    setCatPos({ x: catRect.left, y: catRect.top });
    setCritters((prev) =>
      prev.map((c) => {
        const el = critterRefs.current[c.id];
        if (!el) return c;
        const r = el.getBoundingClientRect();
        return { ...c, x: r.left, y: r.top };
      })
    );

    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;
    const eyeY = catRect.top + catRect.height * 0.42;
    const catCenterX = catRect.left + catRect.width / 2;

    setCatFacingLeft(targetX < catCenterX);
    setCatState('firing');
    setBubble(null);
    setBeams([
      { x1: catCenterX - 7, y1: eyeY, x2: targetX, y2: targetY },
      { x1: catCenterX + 7, y1: eyeY, x2: targetX, y2: targetY },
    ]);

    later(() => {
      setBeams(null);
      setCritters((prev) => prev.map((c) => (c.id === critterId ? { ...c, dying: true } : c)));
    }, 420);

    later(() => {
      setCritters((prev) => prev.filter((c) => c.id !== critterId));
      delete critterRefs.current[critterId];
      setCatState('idle');
      setFrozen(false);
      busy.current = false;
    }, 1050);
  }

  if (!mounted) return null;

  const catEmoji = catState === 'mad' ? '😾' : catState === 'firing' ? '😼' : '🐈';
  const moveClass = frozen || reduceMotion.current ? '' : 'transition-all ease-in-out';
  const moveStyle = frozen || reduceMotion.current ? undefined : { transitionDuration: `${TRAVEL_MS}ms` };

  return (
    <>
      {beams && (
        <svg className="pointer-events-none fixed inset-0 z-[45] h-full w-full" aria-hidden="true">
          {beams.map((b, i) => (
            <g key={i}>
              <line {...b} stroke="#E4322E" strokeWidth={6} strokeLinecap="round" opacity={0.85} />
              <line {...b} stroke="#FFF3F3" strokeWidth={2} strokeLinecap="round" />
            </g>
          ))}
        </svg>
      )}

      {critters.map((c) => (
        <button
          key={c.id}
          ref={(el) => {
            critterRefs.current[c.id] = el;
          }}
          type="button"
          onClick={() => handleCritterClick(c.id)}
          aria-label="An unauthorized character. Click to have the cat handle it."
          className={`fixed z-40 select-none text-3xl leading-none ${moveClass} ${
            c.dying ? 'scale-150' : c.facingLeft ? '-scale-x-100' : ''
          }`}
          style={{ left: c.x, top: c.y, ...moveStyle }}
        >
          {c.dying ? '💥' : c.emoji}
        </button>
      ))}

      <div
        className={`fixed z-[46] select-none ${moveClass}`}
        style={{ left: catPos.x, top: catPos.y, ...moveStyle }}
      >
        {bubble && (
          <div className="absolute -top-14 left-1/2 w-max max-w-[min(210px,calc(100vw-2rem))] -translate-x-1/2 border-2 border-ink bg-cream px-2 py-1.5 text-center font-mono text-[11px] uppercase leading-snug shadow-md">
            {bubble}
          </div>
        )}
        <button
          ref={catRef}
          type="button"
          onClick={handleCatClick}
          aria-label="A cat. Do not pet it. Clicking it summons a character."
          className={`block text-4xl leading-none ${catFacingLeft ? '-scale-x-100' : ''} ${
            catState === 'mad' ? 'animate-glitch' : ''
          }`}
          style={catState === 'firing' ? { filter: 'drop-shadow(0 0 9px #E4322E)' } : undefined}
        >
          {catEmoji}
        </button>
      </div>
    </>
  );
}

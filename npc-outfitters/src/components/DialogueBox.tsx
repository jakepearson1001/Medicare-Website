'use client';

import { useEffect, useRef, useState } from 'react';

interface DialogueBoxProps {
  lines: string[];
  speaker?: string;
  typingSpeedMs?: number;
  className?: string;
  /** Re-roll a new random line whenever this key changes. */
  rerollKey?: number;
}

/**
 * A video-game-style dialogue box that types out one randomly chosen line
 * per mount (or per `rerollKey` change), with a "next" caret you can click
 * to re-roll another line without leaving the page.
 */
export default function DialogueBox({
  lines,
  speaker = 'NPC',
  typingSpeedMs = 28,
  className,
  rerollKey,
}: DialogueBoxProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const chosenLine = useRef<string>('');
  const reduceMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    chosenLine.current = lines[Math.floor(Math.random() * lines.length)];
    setLineIndex((i) => i + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rerollKey]);

  useEffect(() => {
    const line = chosenLine.current;
    if (!line) return;

    if (reduceMotion.current) {
      setDisplayed(line);
      setDone(true);
      return;
    }

    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setDisplayed(line.slice(0, i));
      if (i >= line.length) {
        clearInterval(id);
        setDone(true);
      }
    }, typingSpeedMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIndex]);

  function reroll() {
    chosenLine.current = lines[Math.floor(Math.random() * lines.length)];
    setLineIndex((i) => i + 1);
  }

  return (
    <div
      className={`border-2 border-ink bg-cream font-mono text-sm sm:text-base ${className ?? ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between border-b-2 border-ink bg-ink px-3 py-1.5">
        <span className="text-cream tracking-wide">{speaker}</span>
        <span className="text-npcgray text-xs">[ dialogue ]</span>
      </div>
      <button
        type="button"
        onClick={reroll}
        className="block w-full px-4 py-4 text-left leading-relaxed"
        aria-label="Next line"
      >
        {displayed}
        <span className={done ? 'animate-caret' : ''}>▌</span>
      </button>
      <div className="flex justify-end border-t-2 border-ink px-3 py-1 text-xs text-npcgray-dark">
        <span>{done ? 'click to continue ▶' : 'skip'}</span>
      </div>
    </div>
  );
}

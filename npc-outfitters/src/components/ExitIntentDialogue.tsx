'use client';

import { useEffect, useRef, useState } from 'react';

const SESSION_KEY = 'npc-exit-intent-shown';

export default function ExitIntentDialogue() {
  const [visible, setVisible] = useState(false);
  const [dodged, setDodged] = useState(false);
  const [resolved, setResolved] = useState(false);
  const leaveBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (window.sessionStorage.getItem(SESSION_KEY)) return;
    // Desktop only: fine-pointer devices (mouse), avoids annoying mobile users.
    if (!window.matchMedia('(pointer: fine)').matches) return;

    function onMouseLeave(e: MouseEvent) {
      if (e.clientY > 20) return;
      setVisible(true);
      window.sessionStorage.setItem(SESSION_KEY, '1');
      document.removeEventListener('mouseleave', onMouseLeave);
    }

    document.addEventListener('mouseleave', onMouseLeave);
    return () => document.removeEventListener('mouseleave', onMouseLeave);
  }, []);

  useEffect(() => {
    if (!resolved) return;
    const id = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(id);
  }, [resolved]);

  function dodgeOnce() {
    if (dodged || !leaveBtnRef.current) return;
    setDodged(true);
    const btn = leaveBtnRef.current;
    const offsetX = Math.random() > 0.5 ? 90 : -90;
    const offsetY = Math.random() > 0.5 ? 30 : -30;
    btn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/60 px-4">
      <div className="w-full max-w-sm border-2 border-ink bg-cream font-mono">
        <div className="border-b-2 border-ink bg-ink px-3 py-1.5 text-cream">NPC</div>
        <div className="p-4">
          <p className="mb-4 text-sm">
            Wait. I have one more dialogue option.
          </p>
          {resolved ? (
            <p className="text-sm">Fine. Free will. Whatever.</p>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setVisible(false)}
                className="cursor-select border-2 border-ink bg-ink px-3 py-2 text-left text-cream"
              >
                [ Take 10% off — code NPC10 ]
              </button>
              <button
                ref={leaveBtnRef}
                type="button"
                onMouseEnter={dodgeOnce}
                onClick={() => setResolved(true)}
                className="cursor-select border-2 border-ink bg-cream px-3 py-2 text-left transition-transform duration-150"
              >
                [ Leave forever ]
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

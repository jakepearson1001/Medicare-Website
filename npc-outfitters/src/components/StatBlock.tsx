import type { StatLine } from '@/lib/commerce/types';

interface StatBlockProps {
  stats: StatLine[];
  durability: number;
  classRequirement: string;
}

export default function StatBlock({ stats, durability, classRequirement }: StatBlockProps) {
  return (
    <div className="stat-block p-4 text-sm">
      <div className="mb-2 text-npcgray-light tracking-widest">{'// ITEM STATS'}</div>
      <ul className="space-y-1">
        {stats.map((stat) => (
          <li key={stat.label} className="flex justify-between gap-4">
            <span>{stat.label}</span>
            <span className={stat.positive ? 'text-emerald-400' : 'text-errorred'}>
              {stat.value}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-npcgray-dark pt-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span>Durability</span>
          <span>{durability}/100</span>
        </div>
        <div className="hp-bar-track h-2 w-full border-npcgray">
          <div
            className="h-full bg-cream"
            style={{ width: `${durability}%` }}
          />
        </div>
      </div>
      <div className="mt-3 text-xs text-npcgray-light">
        Class Requirement: <span className="text-cream">{classRequirement}</span>
      </div>
    </div>
  );
}

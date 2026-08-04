export interface PatchNote {
  slug: string;
  version: string;
  title: string;
  date: string;
  summary: string;
  notes: string[];
}

export const PATCH_NOTES: PatchNote[] = [
  {
    slug: 'v1-0-launch',
    version: 'v1.0',
    title: 'Launch Build',
    date: '2024-01-08',
    summary:
      'Initial release. NPC Outfitters is live. Servers are, allegedly, stable.',
    notes: [
      'Added: The entire store. All of it. Every product you see was in this patch.',
      'Added: The Default Class, The Ironic Class, and The Meta Class.',
      'Added: NPC dialogue box on the homepage. Contains 40+ lines. We are aware that is a lot of lines for a t-shirt site.',
      'Added: Checkout. It works. We tested it. Mostly.',
      'Buffed: Hoodie softness by 12%, according to a survey of one (1) employee.',
      'Nerfed: Shipping times, industry standard, not our fault, please direct complaints to the concept of geography.',
      'Fixed: Bug where customers felt like main characters. Resolved via honest marketing copy.',
      'Known issue: Site occasionally glitches on purpose. This is a feature. Do not submit a ticket.',
    ],
  },
  {
    slug: 'v1-1-rare-drops',
    version: 'v1.1',
    title: 'Rare Drops Update',
    date: '2024-03-19',
    summary:
      'Added a rotating cast of absurd limited items. Restocks are vibes-based, not calendar-based.',
    notes: [
      'Added: The Rare Drops class, including Fog of War (bucket hat) and The Render Distance (tracksuit).',
      'Added: Restock system. Restocks when the algorithm feels like it. This is not a bug, this is the whole policy.',
      'Changed: Product pages now include a full RPG stat block, because regular size charts were too honest for us to leave alone.',
      'Fixed: Customers no longer receive a t-shirt shaped like disappointment unless they specifically ordered the hoodie.',
      'Balance: Reduced individuality stat across all gray items by an additional -1, for consistency.',
      'Known issue: One (1) hidden page still cannot be found by most players. Working as intended.',
    ],
  },
  {
    slug: 'v1-2-quality-of-life',
    version: 'v1.2',
    title: 'Quality of Life Patch',
    date: '2024-06-02',
    summary:
      'Mostly backend. Mostly. There may also be an easter egg or several in this patch.',
    notes: [
      'Buffed: Hoodie softness by another 12%. We do not know how, we just kept buffing it.',
      'Nerfed: Shipping times again. Somehow. Geography remains undefeated.',
      'Fixed: Bug where customers felt like main characters. Recurring issue, apparently. Patched again.',
      'Added: A cart drawer styled as an inventory grid, because a normal cart icon felt like lying to you.',
      'Added: An exit-intent dialogue box. It has one more offer for you. It will not stop you from leaving. It will just ask nicely.',
      'Changed: Announcement bar now rotates between real information and pure nonsense, unlabeled, for your own good.',
      'Fixed: Several NPCs were standing in slightly wrong positions. Repositioned to slightly less wrong positions.',
      'Known issue: A very specific button sequence still does something. We are not going to tell you which one.',
    ],
  },
];

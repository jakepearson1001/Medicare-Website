export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function pickRandomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

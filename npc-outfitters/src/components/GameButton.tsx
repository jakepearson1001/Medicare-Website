import type { ButtonHTMLAttributes } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BaseProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type LinkProps = BaseProps & {
  href: string;
  children: React.ReactNode;
  className?: string;
};

const base =
  'cursor-select inline-flex items-center justify-center border-2 border-ink font-display uppercase tracking-wide text-sm sm:text-base px-5 py-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

const variants = {
  primary: 'bg-ink text-cream hover:bg-npcgray-dark',
  secondary: 'bg-cream text-ink hover:bg-npcgray-light',
  ghost: 'bg-transparent text-ink hover:bg-ink hover:text-cream',
};

export function GameButton({
  variant = 'primary',
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], fullWidth ? 'w-full' : '', className)}
      {...props}
    />
  );
}

export function GameLinkButton({
  variant = 'primary',
  fullWidth,
  href,
  className,
  children,
}: LinkProps) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], fullWidth ? 'w-full' : '', className)}
    >
      {children}
    </Link>
  );
}

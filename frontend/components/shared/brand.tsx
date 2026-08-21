import { Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BrandProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md';
}

export function Brand({ className, showText = true, size = 'md' }: BrandProps) {
  const iconSize = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-lake-gradient text-primary-foreground shadow-sm"
      >
        <Droplets className={cn(iconSize, 'text-white')} />
      </span>
      {showText && (
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          Aqua<span className="text-primary">-Seal</span>
        </span>
      )}
    </span>
  );
}

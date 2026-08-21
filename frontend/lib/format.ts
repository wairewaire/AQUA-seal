import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

// Centralized formatting helpers so labels stay consistent across the app.

export function formatDateTime(iso: string): string {
  const d = parseISO(iso);
  if (!isValid(d)) return '—';
  return format(d, 'd MMM yyyy, HH:mm');
}

export function formatDate(iso: string): string {
  const d = parseISO(iso);
  if (!isValid(d)) return '—';
  return format(d, 'd MMM yyyy');
}

export function formatTime(iso: string): string {
  const d = parseISO(iso);
  if (!isValid(d)) return '—';
  return format(d, 'HH:mm');
}

export function formatRelative(iso: string): string {
  const d = parseISO(iso);
  if (!isValid(d)) return '—';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`;
}

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

export function batchStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Draft',
    landed: 'Landed',
    verified: 'Verified',
    needs_review: 'Needs review',
    expired: 'Expired',
    rejected: 'Rejected',
  };
  return map[status] ?? status;
}

export function freshnessLabel(rating: string): string {
  const map: Record<string, string> = {
    grade_a: 'Grade A — Fresh',
    grade_b: 'Grade B — Good',
    grade_c: 'Grade C — Fair',
    spoiled: 'Spoiled',
  };
  return map[rating] ?? rating;
}

export function freshnessShort(rating: string): string {
  const map: Record<string, string> = {
    grade_a: 'Grade A',
    grade_b: 'Grade B',
    grade_c: 'Grade C',
    spoiled: 'Spoiled',
  };
  return map[rating] ?? rating;
}

export function harvestMethodLabel(method: string): string {
  const map: Record<string, string> = {
    gillnet: 'Gillnet',
    longline: 'Longline',
    seine: 'Beach seine',
    traps: 'Traps',
    angling: 'Angling',
  };
  return map[method] ?? method;
}

export function verificationLabel(status: string): string {
  const map: Record<string, string> = {
    verified: 'Verified',
    partially_verified: 'Partially verified',
    unverified: 'Unverified',
    disputed: 'Disputed',
  };
  return map[status] ?? status;
}

export function handlingEventLabel(type: string): string {
  const map: Record<string, string> = {
    harvested: 'Harvested',
    landed: 'Landed',
    weighed: 'Weighed',
    iced: 'Iced',
    transported: 'Transported',
    inspected: 'Inspected',
    listed: 'Listed for sale',
    sold: 'Sold',
  };
  return map[type] ?? type;
}

export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    fisher: 'Fisher',
    bmu_officer: 'BMU officer',
    county_officer: 'County officer',
    buyer: 'Buyer',
    admin: 'Admin',
  };
  return map[role] ?? role;
}

import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, Store, ShieldCheck } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Batch overview & freshness',
  },
  {
    label: 'BMU',
    href: '/bmu',
    icon: Users,
    description: 'Beach Management Unit',
  },
  {
    label: 'Marketplace',
    href: '/marketplace',
    icon: Store,
    description: 'Buy & sell landed fish',
  },
  {
    label: 'Verify',
    href: '/verify',
    icon: ShieldCheck,
    description: 'Trace a batch by ID or QR',
  },
];

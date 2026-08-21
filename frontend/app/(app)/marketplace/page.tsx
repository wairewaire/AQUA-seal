import { Construction } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

export default function MarketplacePage() {
  return (
    <EmptyState
      icon={Construction}
      title="Marketplace coming next"
      description="Live listings, purchase requests, and low-stock alerts will be built here in the next pass."
    />
  );
}

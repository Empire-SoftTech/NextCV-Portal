import { CampaignStatus } from '../../core/models/campaigns.models';

/** Tailwind classes for a status badge. */
export function statusClasses(status: CampaignStatus): string {
  switch (status) {
    case 'sent':
      return 'bg-green-100 text-green-700';
    case 'failed':
      return 'bg-red-100 text-red-700';
    case 'sending':
    case 'queued':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

/** Human-readable audience of a campaign. */
export function targetLabel(targetType: string, targetValue: string | null): string {
  if (targetType === 'all') return 'All users';
  return `${targetType === 'topic' ? 'Topic' : 'User'}: ${targetValue ?? '—'}`;
}

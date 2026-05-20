export function formatOrderStatusLabel(status: string): string {
  const s = status.trim();
  if (!s) {
    return 'Unknown';
  }
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Human-readable date for order summary (e.g. "May 20, 2026"). */
export function formatOrderDate(createdAt: string): string {
  const trimmed = createdAt.trim();
  if (!trimmed) {
    return '—';
  }
  const parsed = Date.parse(trimmed);
  if (!Number.isFinite(parsed)) {
    return trimmed;
  }
  return new Intl.DateTimeFormat('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(parsed));
}

export const ORDER_PAYMENT_LABEL = 'COD';

export function formatPrice(value: number | null): string {
  if (value == null || Number.isNaN(value)) {
    return 'N/A';
  }

  if (value >= 1) {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 4 })}`;
  }

  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 8 })}`;
}

export function formatCap(value: number | null): string {
  if (value == null || Number.isNaN(value)) {
    return 'N/A';
  }

  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)} B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)} M`;
  }

  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

export function fearTone(value: number | null): string {
  if (value == null) {
    return 'neutral';
  }
  if (value < 25) {
    return 'danger';
  }
  if (value < 45) {
    return 'warning';
  }
  if (value < 60) {
    return 'neutral';
  }

  return 'positive';
}

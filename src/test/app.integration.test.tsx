import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import type { MarketDataProvider } from '../types';

const provider: MarketDataProvider = {
  async getDashboardMetrics() {
    return {
      btcDominance: 59.2,
      ethDominance: 10.9,
      altcoinIndex: 31,
      altcoinIndexHistory: [24, 27, 31],
      fearValue: 14,
      fearLabel: 'Extreme Fear',
      updatedAt: '1710000000'
    };
  },
  async getWatchlistMarketData(coins: string[]) {
    return coins.map((coin, index) => ({ coin, cap: 1_000_000 * (index + 1), priceNow: index + 0.5 }));
  }
};

beforeEach(() => {
  localStorage.clear();
});

describe('app integration', () => {
  it('preserves manual fields across refresh', async () => {
    render(<App provider={provider} autoRefreshOnMount={false} />);

    const commentInput = await screen.findByLabelText('Comment GRASS');
    await userEvent.type(commentInput, 'Keep this note');

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await userEvent.click(refreshButton);

    await waitFor(() => {
      expect(commentInput).toHaveValue('Keep this note');
    });
  });

  it('restores saved fields after remount', async () => {
    const { unmount } = render(<App provider={provider} autoRefreshOnMount={false} />);

    const thoughtInput = await screen.findByLabelText('Thought GRASS');
    await userEvent.type(thoughtInput, 'Momentum setup');
    await waitFor(() => expect(thoughtInput).toHaveValue('Momentum setup'));

    unmount();
    render(<App provider={provider} autoRefreshOnMount={false} />);

    const restoredThoughtInput = await screen.findByDisplayValue('Momentum setup');
    expect(restoredThoughtInput).toBeInTheDocument();
  });
});

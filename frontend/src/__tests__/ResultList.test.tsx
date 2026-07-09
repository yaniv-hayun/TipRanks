import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import ResultList from '../components/ResultList';
import type { AutocompleteResult } from '../types';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

const mockMixedResults: AutocompleteResult[] = [
  {
    type: 'stock',
    ticker: 'AAPL',
    name: 'Apple Inc',
    marketCap: 3900351316097,
  },
  {
    type: 'stock',
    ticker: 'AMZN',
    name: 'Amazon.Com, Inc.',
    marketCap: 2391180015646,
  },
  { type: 'expert', name: 'Andrew Bary', expertType: 'blogger' },
  { type: 'expert', name: 'Fadi Chamoun', expertType: 'analyst' },
];

const mockStocksOnly: AutocompleteResult[] = [
  {
    type: 'stock',
    ticker: 'NVDA',
    name: 'Nvidia Corporation',
    marketCap: 4526117866516,
  },
];

const mockExpertsOnly: AutocompleteResult[] = [
  { type: 'expert', name: 'Andrew Bary', expertType: 'blogger' },
];

describe('ResultList', () => {
  it('returns null when query is empty', () => {
    const { container } = renderWithTheme(
      <ResultList results={[]} query="" loading={false} error={null} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows loading spinner when loading with no results', () => {
    renderWithTheme(
      <ResultList results={[]} query="a" loading={true} error={null} />,
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error message on error', () => {
    renderWithTheme(
      <ResultList
        results={[]}
        query="a"
        loading={false}
        error="Network error"
      />,
    );
    expect(
      screen.getByText('Something went wrong. Please try again.'),
    ).toBeInTheDocument();
  });

  it('shows empty state when no results', () => {
    renderWithTheme(
      <ResultList results={[]} query="xyz" loading={false} error={null} />,
    );
    expect(
      screen.getByText('No results found for "xyz"'),
    ).toBeInTheDocument();
  });

  it('renders stocks and experts grouped with subheaders', () => {
    renderWithTheme(
      <ResultList
        results={mockMixedResults}
        query="a"
        loading={false}
        error={null}
      />,
    );

    expect(screen.getByText('Stocks')).toBeInTheDocument();
    expect(screen.getByText('Experts')).toBeInTheDocument();
  });

  it('displays stock ticker and name (text may be split by highlight marks)', () => {
    const { container } = renderWithTheme(
      <ResultList
        results={mockMixedResults}
        query="a"
        loading={false}
        error={null}
      />,
    );

    // Text is split across mark/text nodes, so use textContent check
    const listItems = container.querySelectorAll('li.MuiListItem-root');
    const firstStockText = listItems[0]?.textContent ?? '';
    expect(firstStockText).toContain('AAPL');
    expect(firstStockText).toContain('Apple Inc');
  });

  it('displays expert name and type chip', () => {
    const { container } = renderWithTheme(
      <ResultList
        results={mockMixedResults}
        query="a"
        loading={false}
        error={null}
      />,
    );

    // Find expert items (after the "Experts" subheader)
    const allText = container.textContent ?? '';
    expect(allText).toContain('Andrew Bary');
    expect(allText).toContain('blogger');
    expect(allText).toContain('Fadi Chamoun');
    expect(allText).toContain('analyst');
  });

  it('renders only stocks section when no experts match', () => {
    renderWithTheme(
      <ResultList
        results={mockStocksOnly}
        query="nvda"
        loading={false}
        error={null}
      />,
    );

    expect(screen.getByText('Stocks')).toBeInTheDocument();
    expect(screen.queryByText('Experts')).not.toBeInTheDocument();
  });

  it('renders only experts section when no stocks match', () => {
    renderWithTheme(
      <ResultList
        results={mockExpertsOnly}
        query="andrew"
        loading={false}
        error={null}
      />,
    );

    expect(screen.getByText('Experts')).toBeInTheDocument();
    expect(screen.queryByText('Stocks')).not.toBeInTheDocument();
  });

  it('formats market cap correctly', () => {
    renderWithTheme(
      <ResultList
        results={mockMixedResults}
        query="a"
        loading={false}
        error={null}
      />,
    );

    // $3.9T for Apple
    expect(screen.getByText('$3.9T')).toBeInTheDocument();
  });
});

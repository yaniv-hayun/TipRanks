import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import SearchBox from '../components/SearchBox';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('SearchBox', () => {
  it('renders the search input with placeholder', () => {
    renderWithTheme(<SearchBox onQueryChange={() => {}} />);
    expect(
      screen.getByPlaceholderText('Search stocks & experts...'),
    ).toBeInTheDocument();
  });

  it('calls onQueryChange when user types', async () => {
    const onQueryChange = vi.fn();
    renderWithTheme(<SearchBox onQueryChange={onQueryChange} />);

    const input = screen.getByPlaceholderText('Search stocks & experts...');
    await userEvent.type(input, 'AAPL');

    // onQueryChange should be called for each keystroke
    expect(onQueryChange).toHaveBeenCalledTimes(4);
    expect(onQueryChange).toHaveBeenLastCalledWith('AAPL');
  });

  it('displays the typed value in the input', async () => {
    renderWithTheme(<SearchBox onQueryChange={() => {}} />);

    const input = screen.getByPlaceholderText(
      'Search stocks & experts...',
    ) as HTMLInputElement;
    await userEvent.type(input, 'Tesla');

    expect(input.value).toBe('Tesla');
  });

  it('has an id for testing', () => {
    renderWithTheme(<SearchBox onQueryChange={() => {}} />);
    expect(
      document.getElementById('autocomplete-search-input'),
    ).toBeInTheDocument();
  });
});

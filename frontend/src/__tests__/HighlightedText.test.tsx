import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import HighlightedText from '../components/HighlightedText';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('HighlightedText', () => {
  it('renders plain text when query is empty', () => {
    renderWithTheme(<HighlightedText text="Apple Inc" query="" />);
    expect(screen.getByText('Apple Inc')).toBeInTheDocument();
    expect(screen.queryByRole('mark')).not.toBeInTheDocument();
  });

  it('renders plain text when query does not match', () => {
    renderWithTheme(<HighlightedText text="Apple Inc" query="xyz" />);
    expect(screen.getByText('Apple Inc')).toBeInTheDocument();
  });

  it('wraps matching substring in a mark element', () => {
    const { container } = renderWithTheme(
      <HighlightedText text="Apple Inc" query="app" />,
    );
    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark?.textContent).toBe('App');
  });

  it('performs case-insensitive matching', () => {
    const { container } = renderWithTheme(
      <HighlightedText text="APPLE INC" query="apple" />,
    );
    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark?.textContent).toBe('APPLE');
  });

  it('preserves text before and after the match', () => {
    const { container } = renderWithTheme(
      <HighlightedText text="Apple Inc" query="ple" />,
    );
    const span = container.querySelector('span');
    expect(span?.textContent).toBe('Apple Inc');
  });

  it('handles whitespace-only query', () => {
    renderWithTheme(<HighlightedText text="Apple Inc" query="   " />);
    expect(screen.getByText('Apple Inc')).toBeInTheDocument();
  });

  it('highlights at the beginning of text', () => {
    const { container } = renderWithTheme(
      <HighlightedText text="Apple Inc" query="Ap" />,
    );
    const mark = container.querySelector('mark');
    expect(mark?.textContent).toBe('Ap');
  });

  it('highlights at the end of text', () => {
    const { container } = renderWithTheme(
      <HighlightedText text="Apple Inc" query="Inc" />,
    );
    const mark = container.querySelector('mark');
    expect(mark?.textContent).toBe('Inc');
  });
});

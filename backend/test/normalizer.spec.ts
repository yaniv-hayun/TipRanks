import {
  normalizeText,
  normalizeTicker,
  cleanTicker,
  extractTickerSuffix,
} from '../src/search/normalizer.util';

describe('normalizeText', () => {
  it('should lowercase text', () => {
    expect(normalizeText('APPLE')).toBe('apple');
    expect(normalizeText('Apple Inc')).toBe('apple inc');
  });

  it('should strip diacritics', () => {
    expect(normalizeText('Nestlé')).toBe('nestle');
    expect(normalizeText('Über')).toBe('uber');
  });

  it('should replace & with "and"', () => {
    expect(normalizeText('Johnson & Johnson')).toBe('johnson and johnson');
    expect(normalizeText('Procter & Gamble Company')).toBe(
      'procter and gamble company',
    );
  });

  it('should strip punctuation except spaces', () => {
    expect(normalizeText('Amazon.Com, Inc.')).toBe('amazoncom inc');
    expect(normalizeText("L'Oreal SA")).toBe('loreal sa');
    expect(normalizeText('Dr. Paul')).toBe('dr paul');
    expect(normalizeText('McDonald\'s Corporation')).toBe(
      'mcdonalds corporation',
    );
  });

  it('should collapse multiple spaces', () => {
    expect(normalizeText('Agricultural Bank of China  Class H')).toBe(
      'agricultural bank of china class h',
    );
  });

  it('should trim whitespace', () => {
    expect(normalizeText('  Apple Inc  ')).toBe('apple inc');
  });

  it('should handle empty string', () => {
    expect(normalizeText('')).toBe('');
  });

  it('should handle CFA suffix in expert names', () => {
    expect(normalizeText('Scott Chan CFA')).toBe('scott chan cfa');
  });
});

describe('normalizeTicker', () => {
  it('should lowercase ticker', () => {
    expect(normalizeTicker('AAPL')).toBe('aapl');
  });

  it('should preserve dots', () => {
    expect(normalizeTicker('BRK.A')).toBe('brk.a');
  });

  it('should preserve colons', () => {
    expect(normalizeTicker('JP:3350')).toBe('jp:3350');
  });

  it('should trim whitespace', () => {
    expect(normalizeTicker('  AAPL  ')).toBe('aapl');
  });
});

describe('cleanTicker', () => {
  it('should strip dots', () => {
    expect(cleanTicker('BRK.A')).toBe('brka');
    expect(cleanTicker('BRK.B')).toBe('brkb');
  });

  it('should strip colons', () => {
    expect(cleanTicker('JP:3350')).toBe('jp3350');
    expect(cleanTicker('GB:AZN')).toBe('gbazn');
  });

  it('should lowercase', () => {
    expect(cleanTicker('AAPL')).toBe('aapl');
  });
});

describe('extractTickerSuffix', () => {
  it('should extract suffix after colon', () => {
    expect(extractTickerSuffix('JP:3350')).toBe('3350');
    expect(extractTickerSuffix('GB:AZN')).toBe('azn');
    expect(extractTickerSuffix('GB:0GWL')).toBe('0gwl');
  });

  it('should return null when no colon', () => {
    expect(extractTickerSuffix('AAPL')).toBeNull();
    expect(extractTickerSuffix('BRK.A')).toBeNull();
  });

  it('should return null for trailing colon with no suffix', () => {
    expect(extractTickerSuffix('TEST:')).toBeNull();
  });
});

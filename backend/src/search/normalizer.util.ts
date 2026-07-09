/**
 * Text normalization utilities for search indexing and query processing.
 *
 * This pipeline is applied ONCE at index time (startup) to pre-compute
 * normalized fields, and ONCE per request to normalize the user's query.
 *
 * Pipeline: lowercase → strip diacritics → replace & with "and"
 *           → strip punctuation (except spaces) → collapse whitespace → trim
 */

/**
 * Full normalization pipeline for general text (names, company names).
 * Strips diacritics, replaces & with "and", removes punctuation, collapses whitespace.
 */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    // Strip diacritics: é → e, ü → u, etc.
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace & with "and" (handles both literal & and unicode \u0026)
    .replace(/&/g, ' and ')
    // Remove all punctuation except spaces and alphanumerics
    .replace(/[^a-z0-9\s]/g, '')
    // Collapse multiple spaces into one
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize a ticker symbol for search matching.
 * Keeps the original casing lowered but preserves dots and colons
 * (e.g., "BRK.A" → "brk.a", "JP:3350" → "jp:3350").
 */
export function normalizeTicker(ticker: string): string {
  return ticker.toLowerCase().trim();
}

/**
 * Produce a "clean" ticker by stripping all non-alphanumeric characters.
 * Used as a secondary search key so users can type "brka" to match "BRK.A"
 * or "jp3350" to match "JP:3350".
 */
export function cleanTicker(ticker: string): string {
  return ticker.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Extract the suffix after ':' in international tickers.
 * "JP:3350" → "3350", "GB:AZN" → "azn"
 * Returns null if no colon is present.
 */
export function extractTickerSuffix(ticker: string): string | null {
  const colonIndex = ticker.indexOf(':');
  if (colonIndex === -1) return null;
  return ticker.substring(colonIndex + 1).toLowerCase().trim() || null;
}

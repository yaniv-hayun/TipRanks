/**
 * Interfaces for the pre-normalized in-memory search index.
 *
 * These structures hold both original fields (for API responses)
 * and pre-computed normalized fields (for fast search matching).
 * Normalization happens once at startup — never per request.
 */

/** Raw stock record as loaded from stocks.json */
export interface RawStock {
  ticker: string;
  name: string;
  marketCap: number;
}

/** Raw expert record as loaded from experts.json */
export interface RawExpert {
  name: string;
  firm: string;
  type: 'Analyst' | 'Insider' | 'Blogger';
}

/**
 * Stock record enriched with pre-computed normalized search keys.
 * Stored in memory for O(n) linear scan matching.
 */
export interface SearchableStock {
  // Original fields (returned in API response)
  ticker: string;
  name: string;
  marketCap: number;

  // Pre-computed normalized fields (used for search matching)
  normalizedTicker: string;       // "brk.a"
  normalizedTickerClean: string;  // "brka" (dots/colons stripped)
  tickerSuffix: string | null;    // "3350" for "JP:3350", null otherwise
  normalizedName: string;         // "berkshire hathaway a"
}

/**
 * Expert record enriched with pre-computed normalized search keys.
 * Stored in memory for O(n) linear scan matching.
 */
export interface SearchableExpert {
  // Original fields (returned in API response)
  name: string;
  expertType: string; // lowercased: "analyst" | "insider" | "blogger"

  // Pre-computed normalized field (used for search matching)
  normalizedName: string; // "dr paul nunzio de santis"
}

/** Match tier for ranking search results */
export enum MatchTier {
  EXACT = 1,
  PREFIX = 2,
  SUBSTRING = 3,
}

/** A scored search result with its match tier */
export interface ScoredResult<T> {
  item: T;
  tier: MatchTier;
}

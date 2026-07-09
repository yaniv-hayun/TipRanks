import { Injectable } from '@nestjs/common';
import { DataLoaderService } from '../data/data-loader.service';
import { normalizeText } from './normalizer.util';
import {
  SearchableStock,
  SearchableExpert,
  MatchTier,
  ScoredResult,
} from './interfaces/searchable.interface';

/**
 * Core search engine that matches a normalized query against
 * pre-normalized in-memory indexes.
 *
 * At query time, ONLY the user's query string is normalized.
 * All data fields were pre-normalized at startup by DataLoaderService.
 *
 * Matching tiers:
 *   1 (EXACT)     — normalized field === normalized query
 *   2 (PREFIX)    — normalized field starts with normalized query
 *   3 (SUBSTRING) — normalized field contains normalized query
 *
 * For stocks, we check: normalizedTicker, normalizedTickerClean,
 *   tickerSuffix, and normalizedName.
 * For experts, we check: normalizedName.
 */
@Injectable()
export class SearchEngineService {
  constructor(private readonly dataLoader: DataLoaderService) {}

  /**
   * Search stocks by query. Returns scored results sorted by:
   *   1. Match tier (exact > prefix > substring)
   *   2. Market cap descending (within same tier)
   */
  searchStocks(query: string): ScoredResult<SearchableStock>[] {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return [];

    const results: ScoredResult<SearchableStock>[] = [];

    for (const stock of this.dataLoader.getStocks()) {
      const tier = this.getStockMatchTier(stock, normalizedQuery);
      if (tier !== null) {
        results.push({ item: stock, tier });
      }
    }

    // Sort: tier ascending (best first), then marketCap descending
    results.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return b.item.marketCap - a.item.marketCap;
    });

    return results;
  }

  /**
   * Search experts by query. Returns scored results sorted by:
   *   1. Match tier (exact > prefix > substring)
   *   2. Name alphabetically (within same tier)
   */
  searchExperts(query: string): ScoredResult<SearchableExpert>[] {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return [];

    const results: ScoredResult<SearchableExpert>[] = [];

    for (const expert of this.dataLoader.getExperts()) {
      const tier = this.getExpertMatchTier(expert, normalizedQuery);
      if (tier !== null) {
        results.push({ item: expert, tier });
      }
    }

    // Sort: tier ascending (best first), then name alphabetically
    results.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return a.item.name.localeCompare(b.item.name);
    });

    return results;
  }

  /**
   * Determine the best match tier for a stock across all its searchable fields.
   * Returns the highest-priority (lowest number) tier, or null if no match.
   */
  private getStockMatchTier(
    stock: SearchableStock,
    normalizedQuery: string,
  ): MatchTier | null {
    let bestTier: MatchTier | null = null;

    // Check all ticker variants
    const tickerFields = [
      stock.normalizedTicker,
      stock.normalizedTickerClean,
      stock.tickerSuffix,
    ].filter(Boolean) as string[];

    for (const field of tickerFields) {
      const tier = this.getMatchTier(field, normalizedQuery);
      if (tier !== null && (bestTier === null || tier < bestTier)) {
        bestTier = tier;
      }
    }

    // Check name
    const nameTier = this.getMatchTier(stock.normalizedName, normalizedQuery);
    if (nameTier !== null && (bestTier === null || nameTier < bestTier)) {
      bestTier = nameTier;
    }

    return bestTier;
  }

  /**
   * Determine the match tier for an expert based on their name.
   */
  private getExpertMatchTier(
    expert: SearchableExpert,
    normalizedQuery: string,
  ): MatchTier | null {
    return this.getMatchTier(expert.normalizedName, normalizedQuery);
  }

  /**
   * Compare a single pre-normalized field against the normalized query.
   * Returns the match tier or null if no match.
   */
  private getMatchTier(field: string, query: string): MatchTier | null {
    if (field === query) return MatchTier.EXACT;
    if (field.startsWith(query)) return MatchTier.PREFIX;
    if (field.includes(query)) return MatchTier.SUBSTRING;
    return null;
  }
}

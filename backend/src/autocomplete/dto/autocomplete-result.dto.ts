/**
 * Response DTOs for the autocomplete endpoint.
 * These define the exact shape of each result type returned to the client.
 */

export interface StockResult {
  type: 'stock';
  ticker: string;
  name: string;
  marketCap: number;
}

export interface ExpertResult {
  type: 'expert';
  name: string;
  expertType: string;
}

export type AutocompleteResult = StockResult | ExpertResult;

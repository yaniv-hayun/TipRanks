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

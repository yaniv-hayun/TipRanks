import { Injectable } from '@nestjs/common';
import { SearchEngineService } from '../search/search-engine.service';
import {
  AutocompleteResult,
  StockResult,
  ExpertResult,
} from './dto/autocomplete-result.dto';
import {
  SearchableStock,
  SearchableExpert,
} from '../search/interfaces/searchable.interface';

/**
 * Orchestrates the autocomplete search across stocks and experts.
 *
 * Mixing rule (5/5 split with fallback):
 *   - Allocate up to 5 slots for stocks and 5 for experts
 *   - If one type has fewer than 5 matches, give remaining slots to the other
 *   - Final results sorted by tier, then by type (stocks before experts within same tier)
 *   - Total capped at 10
 */
@Injectable()
export class AutocompleteService {
  private static readonly MAX_RESULTS = 10;
  private static readonly MAX_PER_TYPE = 5;

  constructor(private readonly searchEngine: SearchEngineService) {}

  search(query: string): AutocompleteResult[] {
    if (!query || !query.trim()) {
      return [];
    }

    const stockResults = this.searchEngine.searchStocks(query);
    const expertResults = this.searchEngine.searchExperts(query);

    // Apply 5/5 split with fallback
    let stockSlots = Math.min(
      stockResults.length,
      AutocompleteService.MAX_PER_TYPE,
    );
    let expertSlots = Math.min(
      expertResults.length,
      AutocompleteService.MAX_PER_TYPE,
    );

    // Redistribute unused slots
    const totalSlots = stockSlots + expertSlots;
    if (totalSlots < AutocompleteService.MAX_RESULTS) {
      const remaining = AutocompleteService.MAX_RESULTS - totalSlots;
      if (stockResults.length > stockSlots) {
        stockSlots += Math.min(remaining, stockResults.length - stockSlots);
      }
      if (expertResults.length > expertSlots) {
        const remainingAfterStocks =
          AutocompleteService.MAX_RESULTS - stockSlots - expertSlots;
        expertSlots += Math.min(
          remainingAfterStocks,
          expertResults.length - expertSlots,
        );
      }
    }

    // Build combined results with tier info for final sorting
    const combined: {
      result: AutocompleteResult;
      tier: number;
      typeOrder: number;
    }[] = [];

    for (let i = 0; i < stockSlots; i++) {
      combined.push({
        result: this.toStockResult(stockResults[i].item),
        tier: stockResults[i].tier,
        typeOrder: 0, // stocks before experts within same tier
      });
    }

    for (let i = 0; i < expertSlots; i++) {
      combined.push({
        result: this.toExpertResult(expertResults[i].item),
        tier: expertResults[i].tier,
        typeOrder: 1, // experts after stocks within same tier
      });
    }

    // Sort: tier ascending, then stocks before experts within same tier
    combined.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return a.typeOrder - b.typeOrder;
    });

    return combined.map((c) => c.result);
  }

  private toStockResult(stock: SearchableStock): StockResult {
    return {
      type: 'stock',
      ticker: stock.ticker,
      name: stock.name,
      marketCap: stock.marketCap,
    };
  }

  private toExpertResult(expert: SearchableExpert): ExpertResult {
    return {
      type: 'expert',
      name: expert.name,
      expertType: expert.expertType,
    };
  }
}

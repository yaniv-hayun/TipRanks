import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  RawStock,
  RawExpert,
  SearchableStock,
  SearchableExpert,
} from '../search/interfaces/searchable.interface';
import {
  normalizeText,
  normalizeTicker,
  cleanTicker,
  extractTickerSuffix,
} from '../search/normalizer.util';

/**
 * Loads stock and expert data from JSON files at application startup
 * and pre-computes all normalized search fields.
 *
 * This service runs ONCE on startup (OnModuleInit). After initialization,
 * it exposes immutable, pre-normalized arrays for the SearchEngine to use.
 * No normalization happens per request — only the query is normalized.
 */
@Injectable()
export class DataLoaderService implements OnModuleInit {
  private readonly logger = new Logger(DataLoaderService.name);
  private stocks: SearchableStock[] = [];
  private experts: SearchableExpert[] = [];

  onModuleInit(): void {
    this.loadStocks();
    this.loadExperts();
    this.logger.log(
      `Data loaded: ${this.stocks.length} stocks, ${this.experts.length} experts`,
    );
  }

  getStocks(): SearchableStock[] {
    return this.stocks;
  }

  getExperts(): SearchableExpert[] {
    return this.experts;
  }

  private loadStocks(): void {
    const filePath = path.resolve(__dirname, '..', 'db', 'stocks.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as RawStock[];

    this.stocks = raw.map((stock) => ({
      // Original fields (for API response)
      ticker: stock.ticker,
      name: stock.name,
      marketCap: stock.marketCap,

      // Pre-computed normalized fields (for search matching)
      normalizedTicker: normalizeTicker(stock.ticker),
      normalizedTickerClean: cleanTicker(stock.ticker),
      tickerSuffix: extractTickerSuffix(stock.ticker),
      normalizedName: normalizeText(stock.name),
    }));
  }

  private loadExperts(): void {
    const filePath = path.resolve(__dirname, '..', 'db', 'experts.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as RawExpert[];

    this.experts = raw.map((expert) => ({
      // Original fields (for API response)
      name: expert.name,
      expertType: expert.type.toLowerCase(), // "Analyst" → "analyst"

      // Pre-computed normalized field (for search matching)
      normalizedName: normalizeText(expert.name),
    }));
  }
}

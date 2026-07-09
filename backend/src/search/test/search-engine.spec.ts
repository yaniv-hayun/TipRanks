import { Test, TestingModule } from '@nestjs/testing';
import { SearchEngineService } from '../search-engine.service';
import { DataLoaderService } from '../../data/data-loader.service';
import {
  SearchableStock,
  SearchableExpert,
  MatchTier,
} from '../interfaces/searchable.interface';

/**
 * Mock DataLoaderService with controlled test data to isolate
 * SearchEngine logic from filesystem dependencies.
 */
const mockStocks: SearchableStock[] = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc',
    marketCap: 3900351316097,
    normalizedTicker: 'aapl',
    normalizedTickerClean: 'aapl',
    tickerSuffix: null,
    normalizedName: 'apple inc',
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.Com, Inc.',
    marketCap: 2391180015646,
    normalizedTicker: 'amzn',
    normalizedTickerClean: 'amzn',
    tickerSuffix: null,
    normalizedName: 'amazoncom inc',
  },
  {
    ticker: 'BRK.A',
    name: 'Berkshire Hathaway A',
    marketCap: 1061814716499,
    normalizedTicker: 'brk.a',
    normalizedTickerClean: 'brka',
    tickerSuffix: null,
    normalizedName: 'berkshire hathaway a',
  },
  {
    ticker: 'BRK.B',
    name: 'Berkshire Hathaway B',
    marketCap: 1061814716499,
    normalizedTicker: 'brk.b',
    normalizedTickerClean: 'brkb',
    tickerSuffix: null,
    normalizedName: 'berkshire hathaway b',
  },
  {
    ticker: 'JP:3350',
    name: 'Metaplanet KK',
    marketCap: 535714620239,
    normalizedTicker: 'jp:3350',
    normalizedTickerClean: 'jp3350',
    tickerSuffix: '3350',
    normalizedName: 'metaplanet kk',
  },
  {
    ticker: 'JNJ',
    name: 'Johnson & Johnson',
    marketCap: 458729738420,
    normalizedTicker: 'jnj',
    normalizedTickerClean: 'jnj',
    tickerSuffix: null,
    normalizedName: 'johnson and johnson',
  },
  {
    ticker: 'NSRGF',
    name: 'Nestlé',
    marketCap: 255050588390,
    normalizedTicker: 'nsrgf',
    normalizedTickerClean: 'nsrgf',
    tickerSuffix: null,
    normalizedName: 'nestle',
  },
  {
    ticker: 'APP',
    name: 'AppLovin Corp. Class A',
    marketCap: 209714952915,
    normalizedTicker: 'app',
    normalizedTickerClean: 'app',
    tickerSuffix: null,
    normalizedName: 'applovin corp class a',
  },
  {
    ticker: 'AMD',
    name: 'Advanced Micro Devices, Inc.',
    marketCap: 410449638278,
    normalizedTicker: 'amd',
    normalizedTickerClean: 'amd',
    tickerSuffix: null,
    normalizedName: 'advanced micro devices inc',
  },
];

const mockExperts: SearchableExpert[] = [
  { name: 'Andrew Bary', expertType: 'blogger', normalizedName: 'andrew bary' },
  { name: 'Andrew Kaip', expertType: 'analyst', normalizedName: 'andrew kaip' },
  {
    name: 'Fadi Chamoun',
    expertType: 'analyst',
    normalizedName: 'fadi chamoun',
  },
  {
    name: 'Dr. Paul Nunzio De Santis',
    expertType: 'blogger',
    normalizedName: 'dr paul nunzio de santis',
  },
  {
    name: 'Scott Chan CFA',
    expertType: 'analyst',
    normalizedName: 'scott chan cfa',
  },
];

describe('SearchEngineService', () => {
  let service: SearchEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchEngineService,
        {
          provide: DataLoaderService,
          useValue: {
            getStocks: () => mockStocks,
            getExperts: () => mockExperts,
          },
        },
      ],
    }).compile();

    service = module.get<SearchEngineService>(SearchEngineService);
  });

  describe('searchStocks', () => {
    it('should return exact ticker match as tier 1', () => {
      const results = service.searchStocks('AAPL');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.ticker).toBe('AAPL');
      expect(results[0].tier).toBe(MatchTier.EXACT);
    });

    it('should be case-insensitive', () => {
      const results = service.searchStocks('aapl');
      expect(results[0].item.ticker).toBe('AAPL');
      expect(results[0].tier).toBe(MatchTier.EXACT);
    });

    it('should return prefix matches', () => {
      const results = service.searchStocks('app');
      // "APP" is exact, "Apple Inc" is prefix on name
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results[0].tier).toBe(MatchTier.EXACT); // APP ticker
      expect(results[0].item.ticker).toBe('APP');
    });

    it('should return substring matches', () => {
      const results = service.searchStocks('pple');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.ticker).toBe('AAPL');
      expect(results[0].tier).toBe(MatchTier.SUBSTRING);
    });

    it('should sort by marketCap within same tier', () => {
      const results = service.searchStocks('a');
      const samePrefix = results.filter((r) => r.tier === MatchTier.PREFIX);
      for (let i = 1; i < samePrefix.length; i++) {
        expect(samePrefix[i - 1].item.marketCap).toBeGreaterThanOrEqual(
          samePrefix[i].item.marketCap,
        );
      }
    });

    it('should match dotted ticker with clean version (brka → BRK.A)', () => {
      const results = service.searchStocks('brka');
      expect(results.some((r) => r.item.ticker === 'BRK.A')).toBe(true);
    });

    it('should match colon-ticker suffix (3350 → JP:3350)', () => {
      const results = service.searchStocks('3350');
      expect(results.some((r) => r.item.ticker === 'JP:3350')).toBe(true);
    });

    it('should match ampersand-normalized names (johnson and johnson)', () => {
      const results = service.searchStocks('johnson and johnson');
      expect(results.some((r) => r.item.ticker === 'JNJ')).toBe(true);
    });

    it('should match accent-normalized names (nestle → Nestlé)', () => {
      const results = service.searchStocks('nestle');
      expect(results.some((r) => r.item.ticker === 'NSRGF')).toBe(true);
    });

    it('should return empty array for empty query', () => {
      expect(service.searchStocks('')).toEqual([]);
      expect(service.searchStocks('   ')).toEqual([]);
    });

    it('should return empty array for no matches', () => {
      expect(service.searchStocks('zzzzz')).toEqual([]);
    });
  });

  describe('searchExperts', () => {
    it('should return exact name match', () => {
      const results = service.searchExperts('Andrew Bary');
      expect(results[0].item.name).toBe('Andrew Bary');
      expect(results[0].tier).toBe(MatchTier.EXACT);
    });

    it('should return prefix matches', () => {
      const results = service.searchExperts('and');
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((r) => r.item.name.toLowerCase().startsWith('and')),
      ).toBe(true);
    });

    it('should sort alphabetically within same tier', () => {
      const results = service.searchExperts('andrew');
      const names = results.map((r) => r.item.name);
      expect(names).toEqual([...names].sort());
    });

    it('should match through title prefix (dr paul)', () => {
      const results = service.searchExperts('dr paul');
      expect(
        results.some((r) => r.item.name === 'Dr. Paul Nunzio De Santis'),
      ).toBe(true);
    });

    it('should match through CFA suffix (scott chan)', () => {
      const results = service.searchExperts('scott chan');
      expect(results.some((r) => r.item.name === 'Scott Chan CFA')).toBe(true);
    });

    it('should return empty array for empty query', () => {
      expect(service.searchExperts('')).toEqual([]);
    });
  });
});

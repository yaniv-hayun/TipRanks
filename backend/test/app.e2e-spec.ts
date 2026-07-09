/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Autocomplete API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/autocomplete?query= should return empty array for empty query', () => {
    return request(app.getHttpServer())
      .get('/api/autocomplete?query=')
      .expect(200)
      .expect([]);
  });

  it('GET /api/autocomplete without query param should return empty array', () => {
    return request(app.getHttpServer())
      .get('/api/autocomplete')
      .expect(200)
      .expect([]);
  });

  it('GET /api/autocomplete?query=AAPL should return Apple as first result (exact match)', () => {
    return request(app.getHttpServer())
      .get('/api/autocomplete?query=AAPL')
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toEqual({
          type: 'stock',
          ticker: 'AAPL',
          name: 'Apple Inc',
          marketCap: 3900351316097,
        });
      });
  });

  it('should return at most 10 results', () => {
    return request(app.getHttpServer())
      .get('/api/autocomplete?query=a')
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBeLessThanOrEqual(10);
      });
  });

  it('should return a mix of stocks and experts when both match', () => {
    return request(app.getHttpServer())
      .get('/api/autocomplete?query=a')
      .expect(200)
      .then((res) => {
        const types = res.body.map((r: any) => r.type);
        expect(types).toContain('stock');
        expect(types).toContain('expert');
      });
  });

  it('should match BRK prefix for both BRK.A and BRK.B', () => {
    return request(app.getHttpServer())
      .get('/api/autocomplete?query=brk')
      .expect(200)
      .then((res) => {
        const tickers = res.body
          .filter((r: any) => r.type === 'stock')
          .map((r: any) => r.ticker);
        expect(tickers).toContain('BRK.A');
        expect(tickers).toContain('BRK.B');
      });
  });

  it('should return stock results with correct shape', () => {
    return request(app.getHttpServer())
      .get('/api/autocomplete?query=NVDA')
      .expect(200)
      .then((res) => {
        const stock = res.body.find((r: any) => r.type === 'stock');
        expect(stock).toBeDefined();
        expect(stock).toHaveProperty('type', 'stock');
        expect(stock).toHaveProperty('ticker');
        expect(stock).toHaveProperty('name');
        expect(stock).toHaveProperty('marketCap');
      });
  });

  it('should return expert results with expertType (lowercase)', () => {
    return request(app.getHttpServer())
      .get('/api/autocomplete?query=fadi')
      .expect(200)
      .then((res) => {
        const expert = res.body.find((r: any) => r.type === 'expert');
        expect(expert).toBeDefined();
        expect(expert).toHaveProperty('name', 'Fadi Chamoun');
        expect(expert).toHaveProperty('expertType', 'analyst');
        // Should NOT have the raw 'type' field from source JSON
        expect(expert.type).toBe('expert');
      });
  });

  it('should handle case-insensitive search', () => {
    return request(app.getHttpServer())
      .get('/api/autocomplete?query=apple')
      .expect(200)
      .then((res) => {
        const tickers = res.body
          .filter((r: any) => r.type === 'stock')
          .map((r: any) => r.ticker);
        expect(tickers).toContain('AAPL');
      });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../repositories/transactions.js', () => ({
  getIncomeVsExpenses: vi.fn(),
  getSpendingByCategory: vi.fn(),
}));

vi.mock('../lib/cache.js', () => ({
  cacheGet: vi.fn().mockReturnValue(undefined),
  cacheSet: vi.fn(),
}));

import * as analyticsService from './analytics.js';
import * as txRepo from '../repositories/transactions.js';
import { cacheGet, cacheSet } from '../lib/cache.js';

const mockGetIncomeVsExpenses = txRepo.getIncomeVsExpenses as ReturnType<typeof vi.fn>;
const mockGetSpendingByCategory = txRepo.getSpendingByCategory as ReturnType<typeof vi.fn>;
const mockCacheGet = cacheGet as ReturnType<typeof vi.fn>;
const mockCacheSet = cacheSet as ReturnType<typeof vi.fn>;

const HH_ID = 'household-1';

beforeEach(() => {
  vi.clearAllMocks();
  mockCacheGet.mockReturnValue(undefined);
});

describe('Analytics service — getOverview', () => {
  it('returns income, expenses, and savings rate computed from transactions', async () => {
    mockGetIncomeVsExpenses.mockResolvedValue([
      { month: 'Nov', income: '12500', expense: '9200' },
    ]);

    const result = await analyticsService.getOverview(HH_ID);

    expect(result.income).toBe(12500);
    expect(result.expenses).toBe(9200);
    expect(result.savingsRate).toBe(26); // Math.round((3300/12500)*100)
  });

  it('returns zeros when no transaction data exists', async () => {
    mockGetIncomeVsExpenses.mockResolvedValue([]);

    const result = await analyticsService.getOverview(HH_ID);

    expect(result.income).toBe(0);
    expect(result.expenses).toBe(0);
    expect(result.savingsRate).toBe(0);
  });

  it('caches the result after first fetch', async () => {
    mockGetIncomeVsExpenses.mockResolvedValue([
      { month: 'Nov', income: '10000', expense: '8000' },
    ]);

    await analyticsService.getOverview(HH_ID);

    expect(mockCacheSet).toHaveBeenCalledWith(
      `analytics:overview:${HH_ID}`,
      { income: 10000, expenses: 8000, savingsRate: 20 },
      60000,
    );
  });

  it('returns cached data when available', async () => {
    const cached = { income: 5000, expenses: 3000, savingsRate: 40 };
    mockCacheGet.mockReturnValue(cached);

    const result = await analyticsService.getOverview(HH_ID);

    expect(result).toEqual(cached);
    expect(mockGetIncomeVsExpenses).not.toHaveBeenCalled();
  });
});

describe('Analytics service — getSpendingByCategory', () => {
  it('returns category spending mapped with name and color', async () => {
    mockGetSpendingByCategory.mockResolvedValue([
      { category_name_en: 'Shopping', category_name_ar: 'التسوق', total: '2450', color: '#8b5cf6' },
      { category_name_en: 'Food', category_name_ar: 'الطعام', total: '1820', color: '#f59e0b' },
    ]);

    const result = await analyticsService.getSpendingByCategory(HH_ID);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: { en: 'Shopping', ar: 'التسوق' },
      value: 2450,
      color: '#8b5cf6',
    });
    expect(result[1]).toEqual({
      name: { en: 'Food', ar: 'الطعام' },
      value: 1820,
      color: '#f59e0b',
    });
  });

  it('returns empty array when no spending exists', async () => {
    mockGetSpendingByCategory.mockResolvedValue([]);

    const result = await analyticsService.getSpendingByCategory(HH_ID);
    expect(result).toEqual([]);
  });

  it('total spending values are numeric (not strings)', async () => {
    mockGetSpendingByCategory.mockResolvedValue([
      { category_name_en: 'Test', category_name_ar: 'اختبار', total: '999.50', color: '#000' },
    ]);

    const result = await analyticsService.getSpendingByCategory(HH_ID);
    expect(typeof result[0].value).toBe('number');
    expect(result[0].value).toBe(999.5);
  });
});

describe('Analytics service — getIncomeVsExpenses', () => {
  it('returns monthly income vs expense data', async () => {
    mockGetIncomeVsExpenses.mockResolvedValue([
      { month: 'Sep', income: '13000', expense: '8700' },
      { month: 'Oct', income: '12500', expense: '9800' },
      { month: 'Nov', income: '12500', expense: '9200' },
    ]);

    const result = await analyticsService.getIncomeVsExpenses(HH_ID, 3);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ month: 'Sep', income: 13000, expense: 8700 });
    expect(result[2]).toEqual({ month: 'Nov', income: 12500, expense: 9200 });
  });

  it('parses string amounts to numbers correctly', async () => {
    mockGetIncomeVsExpenses.mockResolvedValue([
      { month: 'Jan', income: '0.00', expense: '0.00' },
    ]);

    const result = await analyticsService.getIncomeVsExpenses(HH_ID, 1);
    expect(result[0].income).toBe(0);
    expect(result[0].expense).toBe(0);
  });

  it('defaults to 5 months when no parameter given', async () => {
    mockGetIncomeVsExpenses.mockResolvedValue([]);

    await analyticsService.getIncomeVsExpenses(HH_ID);

    expect(mockGetIncomeVsExpenses).toHaveBeenCalledWith(HH_ID, 5);
  });
});

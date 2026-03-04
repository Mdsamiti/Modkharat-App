import { describe, it, expect } from 'vitest';
import { cacheGet, cacheSet, cacheInvalidate } from './cache.js';

describe('TTL cache', () => {
  it('returns undefined for missing key', () => {
    expect(cacheGet('nonexistent')).toBeUndefined();
  });

  it('stores and retrieves a value', () => {
    cacheSet('test:key1', { foo: 'bar' });
    expect(cacheGet('test:key1')).toEqual({ foo: 'bar' });
  });

  it('returns undefined after TTL expires', async () => {
    cacheSet('test:expires', 42, 10); // 10ms TTL
    await new Promise((r) => setTimeout(r, 20));
    expect(cacheGet('test:expires')).toBeUndefined();
  });

  it('invalidates keys by prefix', () => {
    cacheSet('analytics:hh1:overview', 'a');
    cacheSet('analytics:hh1:category', 'b');
    cacheSet('analytics:hh2:overview', 'c');

    cacheInvalidate('analytics:hh1');

    expect(cacheGet('analytics:hh1:overview')).toBeUndefined();
    expect(cacheGet('analytics:hh1:category')).toBeUndefined();
    expect(cacheGet('analytics:hh2:overview')).toBe('c');
  });
});

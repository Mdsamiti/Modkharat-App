import type { DimensionValue } from 'react-native';

/** Helper to create a percentage width value that TypeScript accepts as DimensionValue */
export function pct(value: number | string): DimensionValue {
  return `${value}%` as DimensionValue;
}

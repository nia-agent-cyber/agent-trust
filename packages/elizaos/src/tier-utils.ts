import { TierName, TIER_ORDER, TIER_NAMES } from './types.js';

export function tierLevelToName(level: number): TierName {
  return TIER_NAMES[level] ?? 'unverified';
}

export function tierNameToLevel(name: TierName): number {
  return TIER_ORDER.indexOf(name);
}

export function tierMeetsMinimum(actual: TierName, required: TierName): boolean {
  return tierNameToLevel(actual) >= tierNameToLevel(required);
}

export function extractTierLevel(result: { tier: number; tierName?: string } | number): number {
  if (typeof result === 'number') return result;
  return result.tier;
}

export function extractScore(result: { score: number } | number): number {
  if (typeof result === 'number') return result;
  return result.score;
}

const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const ZERO_ADDRESS_RE = /^0x0{40}$/i;

export function isValidAddress(address: unknown): address is string {
  return (
    typeof address === 'string' &&
    ETH_ADDRESS_RE.test(address) &&
    !ZERO_ADDRESS_RE.test(address)
  );
}

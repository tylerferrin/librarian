// Effect category color definitions for UI
import type { EffectCategory, EffectType } from './types';
import { EFFECT_CATEGORIES } from './constants';

/** Color information for effect categories */
export interface EffectCategoryColors {
  borderColor: string;
  bgColor: string;
  textColor: string;
  activeBgColor: string;
}

/** Color accents for each category */
export const CATEGORY_COLORS: Record<EffectCategory, EffectCategoryColors> = {
  MicroLoop: {
    borderColor: 'rgba(168, 85, 247, 0.4)',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    textColor: '#a855f7',
    activeBgColor: '#a855f7',
  },
  MultiDelay: {
    borderColor: 'rgba(6, 182, 212, 0.4)',
    bgColor: 'rgba(6, 182, 212, 0.1)',
    textColor: '#06b6d4',
    activeBgColor: '#06b6d4',
  },
  Granules: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    textColor: '#f59e0b',
    activeBgColor: '#f59e0b',
  },
  MultiPass: {
    borderColor: 'rgba(244, 63, 94, 0.4)',
    bgColor: 'rgba(244, 63, 94, 0.1)',
    textColor: '#f43f5e',
    activeBgColor: '#f43f5e',
  },
};

/**
 * Get the category for a given effect type
 */
export function getEffectCategory(effectType: EffectType): EffectCategory | null {
  for (const category of EFFECT_CATEGORIES) {
    if (category.effects.some(e => e.id === effectType)) {
      return category.id;
    }
  }
  return null;
}

/**
 * Get the color information for a given effect type
 */
export function getEffectColors(effectType: EffectType): EffectCategoryColors | null {
  const category = getEffectCategory(effectType);
  return category ? CATEGORY_COLORS[category] : null;
}

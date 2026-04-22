// Microcosm effect categories and metadata

import type { EffectCategory, EffectType } from './types';

/** Effect category metadata for UI rendering */
export interface EffectCategoryInfo {
  id: EffectCategory;
  name: string;
  effects: { id: EffectType; name: string }[];
}

/** All Microcosm effect categories */
export const EFFECT_CATEGORIES: EffectCategoryInfo[] = [
  {
    id: 'MicroLoop',
    name: 'Micro Loop',
    effects: [
      { id: 'Mosaic', name: 'Mosaic' },
      { id: 'Seq', name: 'Seq' },
      { id: 'Glide', name: 'Glide' },
    ],
  },
  {
    id: 'Granules',
    name: 'Granules',
    effects: [
      { id: 'Haze', name: 'Haze' },
      { id: 'Tunnel', name: 'Tunnel' },
      { id: 'Strum', name: 'Strum' },
    ],
  },
  {
    id: 'MultiDelay',
    name: 'Glitch',
    effects: [
      { id: 'Blocks', name: 'Blocks' },
      { id: 'Interrupt', name: 'Interrupt' },
      { id: 'Arp', name: 'Arp' },
    ],
  },
  {
    id: 'MultiPass',
    name: 'Multi Delay',
    effects: [
      { id: 'Pattern', name: 'Pattern' },
      { id: 'Warp', name: 'Warp' },
    ],
  },
];

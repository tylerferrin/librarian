// Mood MkII module - re-exports all Mood MkII-specific functionality

import { pedalRegistry } from '../../pedalRegistry';
import { moodMkiiDefinition } from './definition';

// Self-register on module import
pedalRegistry.register(moodMkiiDefinition);

export * from './types';
export * from './api';
export { moodMkiiDefinition };

// Microcosm module - re-exports all Microcosm-specific functionality

import { pedalRegistry } from '../../pedalRegistry';
import { microcosmDefinition } from './definition';

// Self-register on module import
pedalRegistry.register(microcosmDefinition);

export * from './types';
export * from './constants';
export * from './helpers';
export * from './api';
export * from './colors';
export { microcosmDefinition };

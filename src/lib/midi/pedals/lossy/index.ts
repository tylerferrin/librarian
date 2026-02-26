// Lossy module - re-exports all Lossy-specific functionality

import { pedalRegistry } from '../../pedalRegistry';
import { lossyDefinition } from './definition';

// Self-register on module import
pedalRegistry.register(lossyDefinition);

export * from './types';
export * from './api';
export { lossyDefinition };

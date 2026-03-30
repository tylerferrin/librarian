// Gen Loss MKII module - re-exports all Gen Loss MKII-specific functionality

import { pedalRegistry } from '../../pedalRegistry';
import { genLossDefinition } from './definition';

// Self-register on module import
pedalRegistry.register(genLossDefinition);

export * from './types';
export * from './api';
export { genLossDefinition };

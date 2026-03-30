// Clean module - re-exports all Clean-specific functionality

import { pedalRegistry } from '../../pedalRegistry';
import { cleanDefinition } from './definition';

// Self-register on module import
pedalRegistry.register(cleanDefinition);

export * from './types';
export * from './api';
export { cleanDefinition };

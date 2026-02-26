// Reverse Mode C module - re-exports all Reverse Mode C-specific functionality

import { pedalRegistry } from '../../pedalRegistry';
import { reverseModeCDefinition } from './definition';

// Self-register on module import
pedalRegistry.register(reverseModeCDefinition);

export * from './types';
export * from './api';
export { reverseModeCDefinition };

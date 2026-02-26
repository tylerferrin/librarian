// Brothers AM module - re-exports all Brothers AM-specific functionality

import { pedalRegistry } from '../../pedalRegistry';
import { brothersAmDefinition } from './definition';

// Self-register on module import
pedalRegistry.register(brothersAmDefinition);

export * from './types';
export * from './api';
export { brothersAmDefinition };

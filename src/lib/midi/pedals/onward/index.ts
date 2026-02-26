// Onward module - re-exports all Onward-specific functionality

import { pedalRegistry } from '../../pedalRegistry';
import { onwardDefinition } from './definition';

// Self-register on module import
pedalRegistry.register(onwardDefinition);

export * from './types';
export * from './api';
export { onwardDefinition };

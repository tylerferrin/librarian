// Billy Strings Wombtone module - re-exports all functionality

import { pedalRegistry } from '../../pedalRegistry';
import { billyStringsWombtoneDefinition } from './definition';

// Self-register on module import
pedalRegistry.register(billyStringsWombtoneDefinition);

export * from './types';
export * from './api';
export { billyStringsWombtoneDefinition };

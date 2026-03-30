// Chroma Console - Public API exports

import { pedalRegistry } from '../../pedalRegistry';
import { chromaConsoleDefinition } from './definition';

// Self-register on module import
pedalRegistry.register(chromaConsoleDefinition);

export * from './types';
export * from './api';
export * from './constants';
export * from './helpers';
export { chromaConsoleDefinition };

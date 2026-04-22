import { pedalRegistry } from '../../pedalRegistry';
import { chromaConsoleDefinition } from './definition';

pedalRegistry.register(chromaConsoleDefinition);

export * from './types';
export * from './api';
export * from './constants';
export * from './helpers';
export { chromaConsoleDefinition };

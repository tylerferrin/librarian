import { pedalRegistry } from '../../pedalRegistry';
import { brothersAmDefinition } from './definition';

pedalRegistry.register(brothersAmDefinition);

export * from './types';
export * from './api';
export { brothersAmDefinition };

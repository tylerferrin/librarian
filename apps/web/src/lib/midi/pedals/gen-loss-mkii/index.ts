import { pedalRegistry } from '../../pedalRegistry';
import { genLossDefinition } from './definition';

pedalRegistry.register(genLossDefinition);

export * from './types';
export * from './api';
export { genLossDefinition };

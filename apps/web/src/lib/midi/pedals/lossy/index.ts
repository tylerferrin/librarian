import { pedalRegistry } from '../../pedalRegistry';
import { lossyDefinition } from './definition';

pedalRegistry.register(lossyDefinition);

export * from './types';
export * from './api';
export { lossyDefinition };

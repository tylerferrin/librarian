import { pedalRegistry } from '../../pedalRegistry';
import { cleanDefinition } from './definition';

pedalRegistry.register(cleanDefinition);

export * from './types';
export * from './api';
export { cleanDefinition };

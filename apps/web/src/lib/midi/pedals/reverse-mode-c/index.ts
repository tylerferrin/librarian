import { pedalRegistry } from '../../pedalRegistry';
import { reverseModeCDefinition } from './definition';

pedalRegistry.register(reverseModeCDefinition);

export * from './types';
export * from './api';
export { reverseModeCDefinition };

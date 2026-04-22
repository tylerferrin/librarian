import { pedalRegistry } from '../../pedalRegistry';
import { moodMkiiDefinition } from './definition';

pedalRegistry.register(moodMkiiDefinition);

export * from './types';
export * from './api';
export { moodMkiiDefinition };

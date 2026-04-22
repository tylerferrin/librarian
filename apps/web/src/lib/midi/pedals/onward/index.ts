import { pedalRegistry } from '../../pedalRegistry';
import { onwardDefinition } from './definition';

pedalRegistry.register(onwardDefinition);

export * from './types';
export * from './api';
export { onwardDefinition };

import { pedalRegistry } from '../../pedalRegistry';
import { preampMk2Definition } from './definition';

pedalRegistry.register(preampMk2Definition);

export * from './types';
export * from './api';
export { preampMk2Definition };

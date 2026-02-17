// Chase Bliss Preamp MK II - Public API exports

import { pedalRegistry } from '../../pedalRegistry';
import { preampMk2Definition } from './definition';

// Self-register on module import
pedalRegistry.register(preampMk2Definition);

export * from './types';
export * from './api';
export { preampMk2Definition };

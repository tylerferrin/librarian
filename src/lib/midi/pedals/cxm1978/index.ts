// Chase Bliss / Meris CXM 1978 — Public API exports

import { pedalRegistry } from '../../pedalRegistry';
import { cxm1978Definition } from './definition';

// Self-register on module import
pedalRegistry.register(cxm1978Definition);

export * from './types';
export * from './api';
export { cxm1978Definition };

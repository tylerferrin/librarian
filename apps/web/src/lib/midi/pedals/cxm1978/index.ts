import { pedalRegistry } from '../../pedalRegistry';
import { cxm1978Definition } from './definition';

pedalRegistry.register(cxm1978Definition);

export * from './types';
export * from './api';
export { cxm1978Definition };

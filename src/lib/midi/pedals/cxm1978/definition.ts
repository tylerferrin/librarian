// Chase Bliss / Meris CXM 1978 pedal definition — self-contained metadata

import type { PedalDefinition } from '../../pedalRegistry';

export const cxm1978Definition: PedalDefinition = {
  type: 'Cxm1978',
  name: 'CXM 1978',
  manufacturer: 'Chase Bliss Audio / Meris',
  icon: '🌊',
  color: '#3b82f6', // Blue — reverb
  hasEditor: true,
  bankConfig: {
    programChangeStart: 0,
    programChangeEnd: 29,
    numBanks: 3,
    slotsPerBank: 10,
    bankLabels: ['Bank 1', 'Bank 2', 'Bank 3'],
    bankColors: ['red', 'green', 'blue'],
    midiSave: {
      type: 'supported',
      ccNumber: 27,
      description: 'CC 27 — Preset Save (value 0-29 selects slot)',
    },
  },
};

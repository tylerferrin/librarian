// Lossy pedal definition

import type { PedalDefinition } from '../../pedalRegistry';

export const lossyDefinition: PedalDefinition = {
  type: 'Lossy',
  name: 'Lossy',
  manufacturer: 'Chase Bliss Audio',
  icon: '📡',
  color: '#ef4444',
  hasEditor: true,
  defaultMidiChannel: 2,
  bankConfig: {
    programChangeStart: 1,
    programChangeEnd: 122,
    numBanks: 1,
    slotsPerBank: 122,
    bankLabels: ['Preset'],
    bankColors: ['red'],
    midiSave: {
      type: 'supported',
      ccNumber: 111,
      description: 'CC 111 - Preset Save (value 1-122 selects slot)',
    },
  },
};

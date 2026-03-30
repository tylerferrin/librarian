// Clean pedal definition - self-contained metadata

import type { PedalDefinition } from '../../pedalRegistry';

export const cleanDefinition: PedalDefinition = {
  type: 'Clean',
  name: 'Clean',
  manufacturer: 'Chase Bliss Audio',
  icon: '✨',
  color: '#3b82f6',
  hasEditor: true,
  defaultMidiChannel: 2,
  bankConfig: {
    programChangeStart: 1,
    programChangeEnd: 122,
    numBanks: 1,
    slotsPerBank: 122,
    bankLabels: ['Preset'],
    bankColors: ['blue'],
    midiSave: {
      type: 'supported',
      ccNumber: 111,
      description: 'CC 111 - Preset Save (value 1-122 selects slot)',
    },
  },
};

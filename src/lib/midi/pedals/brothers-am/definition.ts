// Brothers AM pedal definition - self-contained metadata

import type { PedalDefinition } from '../../pedalRegistry';

export const brothersAmDefinition: PedalDefinition = {
  type: 'BrothersAm',
  name: 'Brothers AM',
  manufacturer: 'Chase Bliss Audio',
  icon: '🎸',
  color: '#f97316',
  hasEditor: true,
  defaultMidiChannel: 2,
  bankConfig: {
    programChangeStart: 1,
    programChangeEnd: 122,
    numBanks: 1,
    slotsPerBank: 122,
    bankLabels: ['Preset'],
    bankColors: ['orange'],
    midiSave: {
      type: 'supported',
      ccNumber: 111,
      description: 'CC 111 - Preset Save (value 1-122 selects slot)',
    },
  },
};

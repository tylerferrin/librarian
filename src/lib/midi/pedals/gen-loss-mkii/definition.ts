// Gen Loss MKII pedal definition - self-contained metadata

import type { PedalDefinition } from '../../pedalRegistry';

export const genLossDefinition: PedalDefinition = {
  type: 'GenLossMkii',
  name: 'Generation Loss MKII',
  manufacturer: 'Chase Bliss Audio',
  icon: '📼',
  color: '#d97706',
  hasEditor: true,
  defaultMidiChannel: 2,
  bankConfig: {
    programChangeStart: 1,
    programChangeEnd: 122,
    numBanks: 1,
    slotsPerBank: 122,
    bankLabels: ['Preset'],
    bankColors: ['amber'],
    midiSave: {
      type: 'supported',
      ccNumber: 111,
      description: 'CC 111 - Preset Save (value 1-122 selects slot)',
    },
  },
};

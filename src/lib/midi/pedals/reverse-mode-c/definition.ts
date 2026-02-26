// Reverse Mode C pedal definition - self-contained metadata

import type { PedalDefinition } from '../../pedalRegistry';

export const reverseModeCDefinition: PedalDefinition = {
  type: 'ReverseModeC',
  name: 'Reverse Mode C',
  manufacturer: 'Chase Bliss Audio',
  icon: '↩️',
  color: '#a855f7',
  hasEditor: true,
  defaultMidiChannel: 2,
  bankConfig: {
    programChangeStart: 1,
    programChangeEnd: 122,
    numBanks: 1,
    slotsPerBank: 122,
    bankLabels: ['Preset'],
    bankColors: ['purple'],
    midiSave: {
      type: 'supported',
      ccNumber: 111,
      description: 'CC 111 - Preset Save (value 1-122 selects slot)',
    },
  },
};

// Onward pedal definition - self-contained metadata

import type { PedalDefinition } from '../../pedalRegistry';

export const onwardDefinition: PedalDefinition = {
  type: 'Onward',
  name: 'Onward',
  manufacturer: 'Chase Bliss Audio',
  icon: '🌀',
  color: '#10b981',
  hasEditor: true,
  defaultMidiChannel: 2,
  bankConfig: {
    programChangeStart: 1,
    programChangeEnd: 122,
    numBanks: 1,
    slotsPerBank: 122,
    bankLabels: ['Preset'],
    bankColors: ['green'],
    midiSave: {
      type: 'supported',
      ccNumber: 111,
      description: 'CC 111 - Preset Save (value 1-122 selects slot)',
    },
  },
};

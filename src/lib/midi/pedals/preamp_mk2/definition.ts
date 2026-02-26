// Chase Bliss Preamp MK II pedal definition - self-contained metadata

import type { PedalDefinition } from '../../pedalRegistry';

export const preampMk2Definition: PedalDefinition = {
  type: 'PreampMk2',
  name: 'Preamp MK II',
  manufacturer: 'Chase Bliss Audio',
  icon: '🎚️',
  color: '#ef4444', // Chase Bliss red
  hasEditor: true,
  defaultMidiChannel: 2,
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
      description: 'CC 27 - Preset Save (value 0-29 selects slot)',
    },
  },
};

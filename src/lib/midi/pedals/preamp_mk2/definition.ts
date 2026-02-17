// Chase Bliss Preamp MK II pedal definition - self-contained metadata

import type { PedalDefinition } from '../../pedalRegistry';

export const preampMk2Definition: PedalDefinition = {
  type: 'PreampMk2',
  name: 'Preamp MK II',
  manufacturer: 'Chase Bliss Audio',
  icon: '🎚️',
  color: '#ef4444', // Chase Bliss red
  hasEditor: true,
  bankConfig: {
    programChangeStart: 0,
    programChangeEnd: 29,
    numBanks: 3,
    slotsPerBank: 10,
    bankLabels: ['Bank 1', 'Bank 2', 'Bank 3'],
    bankColors: ['red', 'green', 'blue'],
    midiSave: {
      type: 'cc',
      ccNumber: 27,
      instructions: 'Send CC 27 with value 0-29 to save to that preset slot',
    },
  },
};

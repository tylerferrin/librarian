// Microcosm pedal definition - self-contained metadata

import type { PedalDefinition } from '../../pedalRegistry';

export const microcosmDefinition: PedalDefinition = {
  type: 'Microcosm',
  name: 'Microcosm',
  manufacturer: 'Hologram Electronics',
  icon: '🌌',
  color: '#a855f7',
  hasEditor: true,
  defaultMidiChannel: 1,
  bankConfig: {
    programChangeStart: 45,
    programChangeEnd: 60,
    numBanks: 4,
    slotsPerBank: 4,
    bankLabels: ['1', '2', '3', '4'],
    bankColors: ['red', 'yellow', 'green', 'blue'],
    midiSave: {
      type: 'supported',
      ccNumber: 46,
      description: 'CC 46 - Preset Save',
    },
  },
};

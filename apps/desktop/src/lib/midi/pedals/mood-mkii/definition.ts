// Mood MkII pedal definition

import type { PedalDefinition } from '../../pedalRegistry';

export const moodMkiiDefinition: PedalDefinition = {
  type: 'MoodMkii',
  name: 'Mood MkII',
  manufacturer: 'Chase Bliss Audio',
  icon: '🌊',
  color: '#0d9488',
  hasEditor: true,
  defaultMidiChannel: 2,
  bankConfig: {
    programChangeStart: 1,
    programChangeEnd: 122,
    numBanks: 1,
    slotsPerBank: 122,
    bankLabels: ['Preset'],
    bankColors: ['teal'],
    midiSave: {
      type: 'supported',
      ccNumber: 111,
      description: 'CC 111 - Preset Save (value 1-122 selects slot)',
    },
  },
};

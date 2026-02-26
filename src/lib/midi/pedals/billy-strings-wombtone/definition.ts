// Billy Strings Wombtone pedal definition

import type { PedalDefinition } from '../../pedalRegistry';

export const billyStringsWombtoneDefinition: PedalDefinition = {
  type: 'BillyStringsWombtone',
  name: 'Billy Strings Wombtone',
  manufacturer: 'Chase Bliss Audio',
  icon: '🌀',
  color: '#eab308',
  hasEditor: true,
  defaultMidiChannel: 2,
  bankConfig: {
    programChangeStart: 1,
    programChangeEnd: 122,
    numBanks: 1,
    slotsPerBank: 122,
    bankLabels: ['Preset'],
    bankColors: ['yellow'],
    midiSave: {
      type: 'supported',
      ccNumber: 111,
      description: 'CC 111 - Preset Save (value 1-122 selects slot)',
    },
  },
};

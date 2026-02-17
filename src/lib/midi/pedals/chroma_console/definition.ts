// Chroma Console pedal definition - self-contained metadata

import type { PedalDefinition } from '../../pedalRegistry';

export const chromaConsoleDefinition: PedalDefinition = {
  type: 'ChromaConsole',
  name: 'Chroma Console',
  manufacturer: 'Chase Bliss Audio',
  icon: '🎨',
  color: '#06b6d4',
  hasEditor: true,
  bankConfig: {
    programChangeStart: 0,
    programChangeEnd: 79,
    numBanks: 4,
    slotsPerBank: 20,
    bankLabels: ['A', 'B', 'C', 'D'],
    bankColors: ['red', 'orange', 'green', 'blue'],
    midiSave: {
      type: 'manualOnly',
      instructions: 'Press and hold the footswitch to save the preset to the pedal\'s internal memory',
    },
  },
};

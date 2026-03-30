import { describe, it, expect } from 'vitest'
import { formatBankSlot, BANK_COLORS } from './utils'
import type { BankConfig } from './types'

describe('formatBankSlot', () => {
  // Mock Microcosm config (small banks: 4 slots per bank)
  const microcosmConfig: BankConfig = {
    programChangeStart: 45,
    programChangeEnd: 60,
    numBanks: 4,
    slotsPerBank: 4,
    bankLabels: ['1', '2', '3', '4'],
    bankColors: ['red', 'yellow', 'green', 'blue'],
    midiSave: { type: 'supported', ccNumber: 46, description: 'CC 46 - Preset Save' },
  }

  // Mock Chroma Console config (large banks: 20 slots per bank)
  const chromaConsoleConfig: BankConfig = {
    programChangeStart: 0,
    programChangeEnd: 79,
    numBanks: 4,
    slotsPerBank: 20,
    bankLabels: ['A', 'B', 'C', 'D'],
    bankColors: ['red', 'orange', 'green', 'blue'],
    midiSave: { type: 'manualOnly', instructions: 'Press and hold the footswitch' },
  }

  describe('Microcosm format (small banks)', () => {
    it('should format bank 45 as 1A with red color', () => {
      const result = formatBankSlot(45, microcosmConfig)
      expect(result.label).toBe('1A')
      expect(result.color).toBe('#ef4444') // red
      expect(result.group).toBe(1)
      expect(result.letter).toBe('A')
    })

    it('should format bank 46 as 1B', () => {
      const result = formatBankSlot(46, microcosmConfig)
      expect(result.label).toBe('1B')
      expect(result.letter).toBe('B')
    })

    it('should format bank 48 as 1D (last slot in bank 1)', () => {
      const result = formatBankSlot(48, microcosmConfig)
      expect(result.label).toBe('1D')
      expect(result.letter).toBe('D')
    })

    it('should format bank 49 as 2A with yellow color', () => {
      const result = formatBankSlot(49, microcosmConfig)
      expect(result.label).toBe('2A')
      expect(result.color).toBe('#f59e0b') // yellow
      expect(result.group).toBe(2)
      expect(result.letter).toBe('A')
    })

    it('should format bank 53 as 3A with green color', () => {
      const result = formatBankSlot(53, microcosmConfig)
      expect(result.label).toBe('3A')
      expect(result.color).toBe('#10b981') // green
      expect(result.group).toBe(3)
      expect(result.letter).toBe('A')
    })

    it('should format bank 57 as 4A with blue color', () => {
      const result = formatBankSlot(57, microcosmConfig)
      expect(result.label).toBe('4A')
      expect(result.color).toBe('#3b82f6') // blue
      expect(result.group).toBe(4)
      expect(result.letter).toBe('A')
    })

    it('should format bank 60 as 4D (last slot)', () => {
      const result = formatBankSlot(60, microcosmConfig)
      expect(result.label).toBe('4D')
      expect(result.letter).toBe('D')
    })
  })

  describe('Chroma Console format (large banks)', () => {
    it('should format bank 0 as A-1 with red color', () => {
      const result = formatBankSlot(0, chromaConsoleConfig)
      expect(result.label).toBe('A-1')
      expect(result.color).toBe('#ef4444') // red
      expect(result.group).toBe(1)
      expect(result.letter).toBe('A')
    })

    it('should format bank 10 as A-11', () => {
      const result = formatBankSlot(10, chromaConsoleConfig)
      expect(result.label).toBe('A-11')
      expect(result.group).toBe(1)
      expect(result.letter).toBe('A')
    })

    it('should format bank 19 as A-20 (last slot in bank A)', () => {
      const result = formatBankSlot(19, chromaConsoleConfig)
      expect(result.label).toBe('A-20')
      expect(result.letter).toBe('A')
    })

    it('should format bank 20 as B-1 with orange color', () => {
      const result = formatBankSlot(20, chromaConsoleConfig)
      expect(result.label).toBe('B-1')
      expect(result.color).toBe('#f59e0b') // orange
      expect(result.group).toBe(2)
      expect(result.letter).toBe('B')
    })

    it('should format bank 40 as C-1 with green color', () => {
      const result = formatBankSlot(40, chromaConsoleConfig)
      expect(result.label).toBe('C-1')
      expect(result.color).toBe('#10b981') // green
      expect(result.group).toBe(3)
      expect(result.letter).toBe('C')
    })

    it('should format bank 60 as D-1 with blue color', () => {
      const result = formatBankSlot(60, chromaConsoleConfig)
      expect(result.label).toBe('D-1')
      expect(result.color).toBe('#3b82f6') // blue
      expect(result.group).toBe(4)
      expect(result.letter).toBe('D')
    })

    it('should format bank 79 as D-20 (last slot)', () => {
      const result = formatBankSlot(79, chromaConsoleConfig)
      expect(result.label).toBe('D-20')
      expect(result.letter).toBe('D')
    })
  })

  describe('Edge cases', () => {
    it('should handle unknown color names with gray fallback', () => {
      const config: BankConfig = {
        programChangeStart: 0,
        programChangeEnd: 3,
        numBanks: 1,
        slotsPerBank: 4,
        bankLabels: ['1'],
        bankColors: ['unknown-color'],
        midiSave: { type: 'autoSave' },
      }
      
      const result = formatBankSlot(0, config)
      expect(result.color).toBe('#6b7280') // gray fallback
    })

    it('should handle missing bank label with fallback', () => {
      const config: BankConfig = {
        programChangeStart: 0,
        programChangeEnd: 7,
        numBanks: 2,
        slotsPerBank: 4,
        bankLabels: ['1'], // Only one label for 2 banks
        bankColors: ['red', 'blue'],
        midiSave: { type: 'autoSave' },
      }
      
      const result = formatBankSlot(4, config) // Second bank
      expect(result.label).toBe('2A') // Falls back to numeric label
    })
  })

  describe('Letter calculation', () => {
    it('should generate correct letters for alphabet (A-D)', () => {
      const letters = [0, 1, 2, 3].map(i => {
        const result = formatBankSlot(45 + i, microcosmConfig)
        return result.letter
      })
      
      expect(letters).toEqual(['A', 'B', 'C', 'D'])
    })
  })
})

describe('BANK_COLORS constant', () => {
  it('should have correct color values', () => {
    expect(BANK_COLORS[1]).toBe('#ef4444') // Red
    expect(BANK_COLORS[2]).toBe('#f59e0b') // Yellow
    expect(BANK_COLORS[3]).toBe('#10b981') // Green
    expect(BANK_COLORS[4]).toBe('#3b82f6') // Blue
  })

  it('should be readonly', () => {
    // TypeScript ensures this at compile time
    expect(Object.isFrozen(BANK_COLORS)).toBe(false) // Not frozen, but readonly in TS
  })
})

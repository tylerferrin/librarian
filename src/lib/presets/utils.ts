// Preset utilities - bank slot formatting and shared constants

import type { BankConfig } from './types';

/**
 * Legacy bank color palette - kept for backwards compatibility
 * @deprecated Use BankConfig.bankColors instead
 */
export const BANK_COLORS = {
  1: '#ef4444', // Red
  2: '#f59e0b', // Yellow
  3: '#10b981', // Green
  4: '#3b82f6', // Blue
} as const;

/** Map of color names to hex values */
const COLOR_MAP: Record<string, string> = {
  red: '#ef4444',
  orange: '#f59e0b',
  yellow: '#f59e0b',
  green: '#10b981',
  blue: '#3b82f6',
  gray: '#6b7280',
};

export interface BankSlotInfo {
  /** Short label like "1A", "2C", "A-5", "B-12" */
  label: string;
  /** Hex color for the bank group */
  color: string;
  /** Bank group number (1-based) */
  group: number;
  /** Slot letter (A-Z) or slot number within bank */
  letter: string;
}

/**
 * Convert a bank number to a human-readable label and color using pedal-specific config.
 *
 * @example
 * // Microcosm
 * formatBankSlot(45, microcosmConfig) => { label: "1A", color: "#ef4444", group: 1, letter: "A" }
 * formatBankSlot(53, microcosmConfig) => { label: "3A", color: "#10b981", group: 3, letter: "A" }
 * 
 * // Chroma Console
 * formatBankSlot(0, chromaConsoleConfig) => { label: "A-1", color: "#ef4444", group: 1, letter: "A" }
 * formatBankSlot(79, chromaConsoleConfig) => { label: "D-20", color: "#3b82f6", group: 4, letter: "D" }
 */
export function formatBankSlot(bankNumber: number, config: BankConfig): BankSlotInfo {
  const offset = bankNumber - config.programChangeStart;
  const bankIndex = Math.floor(offset / config.slotsPerBank);
  const slotIndex = offset % config.slotsPerBank;
  
  const bankLabel = config.bankLabels[bankIndex] || `${bankIndex + 1}`;
  const colorName = config.bankColors[bankIndex] || 'gray';
  const color = COLOR_MAP[colorName.toLowerCase()] || '#6b7280';
  
  // Format label based on bank size
  // Small banks (<=4 slots): "1A", "2C" format
  // Large banks (>4 slots): "A-5", "B-12" format
  let label: string;
  let letter: string;
  
  if (config.slotsPerBank <= 4) {
    letter = String.fromCharCode(65 + slotIndex);
    label = `${bankLabel}${letter}`;
  } else {
    // For large banks, use first char as letter, format as "A-5"
    letter = bankLabel.charAt(0);
    label = `${bankLabel}-${slotIndex + 1}`;
  }

  return {
    label,
    color,
    group: bankIndex + 1,
    letter,
  };
}

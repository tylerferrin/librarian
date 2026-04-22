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

export function formatBankSlot(bankNumber: number, config: BankConfig): BankSlotInfo {
  const offset = bankNumber - config.programChangeStart;
  const bankIndex = Math.floor(offset / config.slotsPerBank);
  const slotIndex = offset % config.slotsPerBank;

  const bankLabel = config.bankLabels[bankIndex] || `${bankIndex + 1}`;
  const colorName = config.bankColors[bankIndex] || 'gray';
  const color = COLOR_MAP[colorName.toLowerCase()] || '#6b7280';

  let label: string;
  let letter: string;

  if (config.slotsPerBank <= 4) {
    letter = String.fromCharCode(65 + slotIndex);
    label = `${bankLabel}${letter}`;
  } else {
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

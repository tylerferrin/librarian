// Preset utilities - bank slot formatting and shared constants

/**
 * Bank color palette used across the app.
 * Must match the colors used in PresetManager bank groups.
 */
export const BANK_COLORS = {
  1: '#ef4444', // Red  - Bank 1 (PC 45-48)
  2: '#f59e0b', // Yellow - Bank 2 (PC 49-52)
  3: '#10b981', // Green - Bank 3 (PC 53-56)
  4: '#3b82f6', // Blue  - Bank 4 (PC 57-60)
} as const;

export interface BankSlotInfo {
  /** Short label like "1A", "2C" */
  label: string;
  /** Hex color for the bank group */
  color: string;
  /** Bank group number (1-4) */
  group: number;
  /** Slot letter (A-D) */
  letter: string;
}

/**
 * Convert a bank number (45-60) to a human-readable label and color.
 *
 * @example
 * formatBankSlot(45) => { label: "1A", color: "#ef4444", group: 1, letter: "A" }
 * formatBankSlot(53) => { label: "3A", color: "#10b981", group: 3, letter: "A" }
 */
export function formatBankSlot(bankNumber: number): BankSlotInfo {
  const bankGroup = Math.floor((bankNumber - 45) / 4) + 1; // 1-4
  const slotLetter = String.fromCharCode(65 + ((bankNumber - 45) % 4)); // A-D
  const color = BANK_COLORS[bankGroup as keyof typeof BANK_COLORS] || '#6b7280';

  return {
    label: `${bankGroup}${slotLetter}`,
    color,
    group: bankGroup,
    letter: slotLetter,
  };
}

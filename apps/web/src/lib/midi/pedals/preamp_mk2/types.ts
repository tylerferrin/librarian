// Chase Bliss Preamp MK II types and enums

// ============================================================================
// Preamp MK II Enums
// ============================================================================

export type Jump = 'Off' | 'Zero' | 'Five';

export type MidsPosition = 'Off' | 'Pre' | 'Post';

export type QResonance = 'Low' | 'Mid' | 'High';

export type DiodeClipping = 'Off' | 'Silicon' | 'Germanium';

export type FuzzMode = 'Off' | 'Open' | 'Gated';

// ============================================================================
// State Interface
// ============================================================================

export interface PreampMk2State {
  // Faders (0-127)
  volume: number;        // CC# 14
  treble: number;        // CC# 15
  mids: number;          // CC# 16
  frequency: number;     // CC# 17
  bass: number;          // CC# 18
  gain: number;          // CC# 19
  
  // Arcade buttons
  jump: Jump;                        // CC# 22 (1-3)
  mids_position: MidsPosition;       // CC# 23 (1-3)
  q_resonance: QResonance;           // CC# 24 (1-3)
  diode_clipping: DiodeClipping;     // CC# 25 (1-3)
  fuzz_mode: FuzzMode;               // CC# 26 (1-3)
  
  // Other controls
  expression: number;    // CC# 100, 0-127
  bypass: boolean;       // CC# 102 (0=bypass, 1-127=engage)
}

// ============================================================================
// Parameter Union Type
// ============================================================================

export type PreampMk2Parameter =
  // Faders
  | { Volume: number }
  | { Treble: number }
  | { Mids: number }
  | { Frequency: number }
  | { Bass: number }
  | { Gain: number }
  // Arcade buttons
  | { Jump: Jump }
  | { MidsPosition: MidsPosition }
  | { QResonance: QResonance }
  | { DiodeClipping: DiodeClipping }
  | { FuzzMode: FuzzMode }
  // Other controls
  | { Expression: number }
  | { Bypass: boolean };

// Chase Bliss / Meris CXM 1978 Automatone types and enums

// ============================================================================
// CXM 1978 Enums
// ============================================================================

export type Jump = 'Off' | 'Zero' | 'Five';

export type ReverbType = 'Room' | 'Plate' | 'Hall';

export type Diffusion = 'Low' | 'Med' | 'High';

export type TankMod = 'Low' | 'Med' | 'High';

export type Clock = 'HiFi' | 'Standard' | 'LoFi';

// ============================================================================
// State Interface
// ============================================================================

export interface Cxm1978State {
  // Faders (0-127)
  bass: number;      // CC# 14 — bass decay time
  mids: number;      // CC# 15 — mids decay time
  cross: number;     // CC# 16 — crossover frequency
  treble: number;    // CC# 17 — treble level
  mix: number;       // CC# 18 — wet/dry mix
  pre_dly: number;   // CC# 19 — pre-delay time

  // Arcade buttons
  jump: Jump;              // CC# 22 (1-3)
  reverb_type: ReverbType; // CC# 23 (1-3)
  diffusion: Diffusion;    // CC# 24 (1-3)
  tank_mod: TankMod;       // CC# 25 (1-3)
  clock: Clock;            // CC# 26 (1-3)

  // Other controls
  expression: number; // CC# 100, 0-127
  bypass: boolean;    // CC# 102 (0=bypass, 1-127=engage)
}

// ============================================================================
// Parameter Union Type
// ============================================================================

export type Cxm1978Parameter =
  // Faders
  | { Bass: number }
  | { Mids: number }
  | { Cross: number }
  | { Treble: number }
  | { Mix: number }
  | { PreDly: number }
  // Arcade buttons
  | { Jump: Jump }
  | { ReverbType: ReverbType }
  | { Diffusion: Diffusion }
  | { TankMod: TankMod }
  | { Clock: Clock }
  // Other controls
  | { Expression: number }
  | { Bypass: boolean };

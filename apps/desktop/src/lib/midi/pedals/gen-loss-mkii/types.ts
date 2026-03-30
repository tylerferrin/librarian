// Gen Loss MKII types and enums — mirrors tauri/src/midi/pedals/gen_loss_mkii/types.rs

// Tape machine model selection (CC 16)
export type TapeModel =
  | 'None'
  | 'CPR3300Gen1'
  | 'CPR3300Gen2'
  | 'CPR3300Gen3'
  | 'PortamaxRT'
  | 'PortamaxHT'
  | 'CAM8'
  | 'DictatronEX'
  | 'DictatronIN'
  | 'Fishy60'
  | 'MSWalker'
  | 'AMU2'
  | 'MPEX';

export const TAPE_MODEL_NAMES: Record<TapeModel, string> = {
  None: 'None',
  CPR3300Gen1: 'CPR-3300 Gen 1',
  CPR3300Gen2: 'CPR-3300 Gen 2',
  CPR3300Gen3: 'CPR-3300 Gen 3',
  PortamaxRT: 'Portamax-RT',
  PortamaxHT: 'Portamax-HT',
  CAM8: 'CAM-8',
  DictatronEX: 'DICTATRON-EX',
  DictatronIN: 'DICTATRON-IN',
  Fishy60: 'FISHY 60',
  MSWalker: 'MS-WALKER',
  AMU2: 'AMU-2',
  MPEX: 'M-PEX',
};

export const TAPE_MODELS: TapeModel[] = [
  'None', 'CPR3300Gen1', 'CPR3300Gen2', 'CPR3300Gen3',
  'PortamaxRT', 'PortamaxHT', 'CAM8', 'DictatronEX',
  'DictatronIN', 'Fishy60', 'MSWalker', 'AMU2', 'MPEX',
];

// Three-position dry mode (CC 22)
export type DryMode = 'Dry1' | 'Dry2' | 'Dry3';

// Three-position noise mode (CC 23)
export type NoiseMode = 'Noise1' | 'Noise2' | 'Noise3';

// Three-position aux mode (CC 21)
export type AuxMode = 'Aux1' | 'Aux2' | 'Aux3';

// DIP switch sweep direction (CC 68)
export type SweepDirection = 'Bottom' | 'Top';

// DIP switch polarity (CC 71)
export type Polarity = 'Forward' | 'Reverse';

// Input gain levels (CC 32)
export type InputGain = 'LineLevel' | 'InstrumentLevel' | 'HighGain';

// DSP bypass mode (CC 26)
export type DspBypassMode = 'TrueBypass' | 'DspBypass';

// Complete state of all Gen Loss MKII parameters
export interface GenLossMkiiState {
  // Main control knobs
  wow: number;
  volume: number;
  model: TapeModel;
  flutter: number;
  saturate: number;
  failure: number;
  ramp_speed: number;

  // Three-position toggles
  dry_mode: DryMode;
  noise_mode: NoiseMode;
  aux_mode: AuxMode;

  // Footswitches
  bypass: boolean;
  aux_switch: boolean;
  alt_mode: boolean;

  // External aux switches
  left_switch: boolean;
  center_switch: boolean;
  right_switch: boolean;

  // DIP switches - Left bank
  dip_wow: boolean;
  dip_flutter: boolean;
  dip_sat_gen: boolean;
  dip_failure_hp: boolean;
  dip_model_lp: boolean;
  dip_bounce: boolean;
  dip_random: boolean;
  dip_sweep: SweepDirection;

  // DIP switches - Right bank
  dip_polarity: Polarity;
  dip_classic: boolean;
  dip_miso: boolean;
  dip_spread: boolean;
  dip_dry_type: boolean;
  dip_drop_byp: boolean;
  dip_snag_byp: boolean;
  dip_hum_byp: boolean;

  // Advanced parameters
  expression: number;
  aux_onset_time: number;
  hiss_level: number;
  mechanical_noise: number;
  crinkle_pop: number;
  input_gain: InputGain;
  dsp_bypass: DspBypassMode;
  ramp_bounce: boolean;
}

// All possible Gen Loss MKII parameters (Rust tagged enum serialization)
export type GenLossMkiiParameter =
  // Main knobs
  | { Wow: number }
  | { Volume: number }
  | { Model: TapeModel }
  | { Flutter: number }
  | { Saturate: number }
  | { Failure: number }
  | { RampSpeed: number }
  // Toggles
  | { DryMode: DryMode }
  | { NoiseMode: NoiseMode }
  | { AuxMode: AuxMode }
  // Footswitches
  | { Bypass: boolean }
  | { AuxSwitch: boolean }
  | { AltMode: boolean }
  // External switches
  | { LeftSwitch: boolean }
  | { CenterSwitch: boolean }
  | { RightSwitch: boolean }
  // DIP switches - Left bank
  | { DipWow: boolean }
  | { DipFlutter: boolean }
  | { DipSatGen: boolean }
  | { DipFailureHp: boolean }
  | { DipModelLp: boolean }
  | { DipBounce: boolean }
  | { DipRandom: boolean }
  | { DipSweep: SweepDirection }
  // DIP switches - Right bank
  | { DipPolarity: Polarity }
  | { DipClassic: boolean }
  | { DipMiso: boolean }
  | { DipSpread: boolean }
  | { DipDryType: boolean }
  | { DipDropByp: boolean }
  | { DipSnagByp: boolean }
  | { DipHumByp: boolean }
  // Advanced
  | { Expression: number }
  | { AuxOnsetTime: number }
  | { HissLevel: number }
  | { MechanicalNoise: number }
  | { CrinklePop: number }
  | { InputGain: InputGain }
  | { DspBypass: DspBypassMode }
  | { PresetSave: number }
  | { RampBounce: boolean };

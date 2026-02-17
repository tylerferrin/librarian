// Chase Bliss Generation Loss MKII MIDI implementation
// 41 MIDI-controllable parameters

use crate::midi::error::{MidiError, MidiResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Chase Bliss Generation Loss MKII pedal with complete MIDI control
#[derive(Debug)]
pub struct GenLossMkii {
    pub state: GenLossMkiiState,
    pub midi_channel: u8,
}

/// Complete state of all Gen Loss MKII parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenLossMkiiState {
    // Main control knobs
    pub wow: u8,
    pub volume: u8,
    pub model: TapeModel,
    pub flutter: u8,
    pub saturate: u8,
    pub failure: u8,
    pub ramp_speed: u8,
    
    // Three-position toggles
    pub dry_mode: DryMode,
    pub noise_mode: NoiseMode,
    pub aux_mode: AuxMode,
    
    // Footswitches
    pub bypass: bool,
    pub aux_switch: bool,
    pub alt_mode: bool,
    
    // External aux switches
    pub left_switch: bool,
    pub center_switch: bool,
    pub right_switch: bool,
    
    // DIP switches - Left bank
    pub dip_wow: bool,
    pub dip_flutter: bool,
    pub dip_sat_gen: bool,
    pub dip_failure_hp: bool,
    pub dip_model_lp: bool,
    pub dip_bounce: bool,
    pub dip_random: bool,
    pub dip_sweep: SweepDirection,
    
    // DIP switches - Right bank
    pub dip_polarity: Polarity,
    pub dip_classic: bool,
    pub dip_miso: bool,
    pub dip_spread: bool,
    pub dip_dry_type: bool,
    pub dip_drop_byp: bool,
    pub dip_snag_byp: bool,
    pub dip_hum_byp: bool,
    
    // Advanced parameters
    pub expression: u8,
    pub aux_onset_time: u8,
    pub hiss_level: u8,
    pub mechanical_noise: u8,
    pub crinkle_pop: u8,
    pub input_gain: InputGain,
    pub dsp_bypass: DspBypassMode,
    pub ramp_bounce: bool,
}

/// Tape machine model selection (CC 16)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TapeModel {
    None,           // 0
    CPR3300Gen1,    // 15
    CPR3300Gen2,    // 24
    CPR3300Gen3,    // 33
    PortamaxRT,     // 43
    PortamaxHT,     // 53
    CAM8,           // 62
    DictatronEX,    // 72
    DictatronIN,    // 82
    Fishy60,        // 91
    MSWalker,       // 101
    AMU2,           // 111
    MPEX,           // 127
}

impl TapeModel {
    pub fn to_cc_value(self) -> u8 {
        match self {
            TapeModel::None => 0,
            TapeModel::CPR3300Gen1 => 15,
            TapeModel::CPR3300Gen2 => 24,
            TapeModel::CPR3300Gen3 => 33,
            TapeModel::PortamaxRT => 43,
            TapeModel::PortamaxHT => 53,
            TapeModel::CAM8 => 62,
            TapeModel::DictatronEX => 72,
            TapeModel::DictatronIN => 82,
            TapeModel::Fishy60 => 91,
            TapeModel::MSWalker => 101,
            TapeModel::AMU2 => 111,
            TapeModel::MPEX => 127,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        // Find closest model based on CC value
        match value {
            0..=7 => TapeModel::None,
            8..=19 => TapeModel::CPR3300Gen1,
            20..=28 => TapeModel::CPR3300Gen2,
            29..=38 => TapeModel::CPR3300Gen3,
            39..=48 => TapeModel::PortamaxRT,
            49..=57 => TapeModel::PortamaxHT,
            58..=67 => TapeModel::CAM8,
            68..=77 => TapeModel::DictatronEX,
            78..=86 => TapeModel::DictatronIN,
            87..=96 => TapeModel::Fishy60,
            97..=106 => TapeModel::MSWalker,
            107..=119 => TapeModel::AMU2,
            _ => TapeModel::MPEX, // 120-127 and beyond
        }
    }
    
    pub fn name(&self) -> &'static str {
        match self {
            TapeModel::None => "None",
            TapeModel::CPR3300Gen1 => "CPR-3300 Gen 1",
            TapeModel::CPR3300Gen2 => "CPR-3300 Gen 2",
            TapeModel::CPR3300Gen3 => "CPR-3300 Gen 3",
            TapeModel::PortamaxRT => "Portamax-RT",
            TapeModel::PortamaxHT => "Portamax-HT",
            TapeModel::CAM8 => "CAM-8",
            TapeModel::DictatronEX => "DICTATRON-EX",
            TapeModel::DictatronIN => "DICTATRON-IN",
            TapeModel::Fishy60 => "FISHY 60",
            TapeModel::MSWalker => "MS-WALKER",
            TapeModel::AMU2 => "AMU-2",
            TapeModel::MPEX => "M-PEX",
        }
    }
}

/// Three-position dry mode (CC 22)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DryMode {
    Dry1,  // 1
    Dry2,  // 2
    Dry3,  // 3
}

impl DryMode {
    pub fn to_cc_value(self) -> u8 {
        match self {
            DryMode::Dry1 => 1,
            DryMode::Dry2 => 2,
            DryMode::Dry3 => 3,
        }
    }
    
    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(DryMode::Dry1),
            2 => Ok(DryMode::Dry2),
            3 => Ok(DryMode::Dry3),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// Three-position noise mode (CC 23)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum NoiseMode {
    Noise1,  // 1
    Noise2,  // 2
    Noise3,  // 3
}

impl NoiseMode {
    pub fn to_cc_value(self) -> u8 {
        match self {
            NoiseMode::Noise1 => 1,
            NoiseMode::Noise2 => 2,
            NoiseMode::Noise3 => 3,
        }
    }
    
    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(NoiseMode::Noise1),
            2 => Ok(NoiseMode::Noise2),
            3 => Ok(NoiseMode::Noise3),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// Three-position aux mode (CC 21)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AuxMode {
    Aux1,  // 1
    Aux2,  // 2
    Aux3,  // 3
}

impl AuxMode {
    pub fn to_cc_value(self) -> u8 {
        match self {
            AuxMode::Aux1 => 1,
            AuxMode::Aux2 => 2,
            AuxMode::Aux3 => 3,
        }
    }
    
    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(AuxMode::Aux1),
            2 => Ok(AuxMode::Aux2),
            3 => Ok(AuxMode::Aux3),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// DIP switch sweep direction (CC 68)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SweepDirection {
    Bottom,  // 0-63
    Top,     // 64-127
}

impl SweepDirection {
    pub fn to_cc_value(self) -> u8 {
        match self {
            SweepDirection::Bottom => 0,
            SweepDirection::Top => 127,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        if value < 64 {
            SweepDirection::Bottom
        } else {
            SweepDirection::Top
        }
    }
}

/// DIP switch polarity (CC 71)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Polarity {
    Forward,  // 0-63
    Reverse,  // 64-127
}

impl Polarity {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Polarity::Forward => 0,
            Polarity::Reverse => 127,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        if value < 64 {
            Polarity::Forward
        } else {
            Polarity::Reverse
        }
    }
}

/// Input gain levels (CC 32)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum InputGain {
    LineLevel,        // 1
    InstrumentLevel,  // 2
    HighGain,         // 3
}

impl InputGain {
    pub fn to_cc_value(self) -> u8 {
        match self {
            InputGain::LineLevel => 1,
            InputGain::InstrumentLevel => 2,
            InputGain::HighGain => 3,
        }
    }
    
    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(InputGain::LineLevel),
            2 => Ok(InputGain::InstrumentLevel),
            3 => Ok(InputGain::HighGain),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// DSP bypass mode (CC 26)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DspBypassMode {
    TrueBypass,  // 0-63
    DspBypass,   // 64-127
}

impl DspBypassMode {
    pub fn to_cc_value(self) -> u8 {
        match self {
            DspBypassMode::TrueBypass => 0,
            DspBypassMode::DspBypass => 127,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        if value < 64 {
            DspBypassMode::TrueBypass
        } else {
            DspBypassMode::DspBypass
        }
    }
}

/// All possible Gen Loss MKII parameters with their values
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GenLossMkiiParameter {
    // Main knobs
    Wow(u8),
    Volume(u8),
    Model(TapeModel),
    Flutter(u8),
    Saturate(u8),
    Failure(u8),
    RampSpeed(u8),
    
    // Toggles
    DryMode(DryMode),
    NoiseMode(NoiseMode),
    AuxMode(AuxMode),
    
    // Footswitches
    Bypass(bool),
    AuxSwitch(bool),
    AltMode(bool),
    
    // External switches
    LeftSwitch(bool),
    CenterSwitch(bool),
    RightSwitch(bool),
    
    // DIP switches - Left bank
    DipWow(bool),
    DipFlutter(bool),
    DipSatGen(bool),
    DipFailureHp(bool),
    DipModelLp(bool),
    DipBounce(bool),
    DipRandom(bool),
    DipSweep(SweepDirection),
    
    // DIP switches - Right bank
    DipPolarity(Polarity),
    DipClassic(bool),
    DipMiso(bool),
    DipSpread(bool),
    DipDryType(bool),
    DipDropByp(bool),
    DipSnagByp(bool),
    DipHumByp(bool),
    
    // Advanced
    Expression(u8),
    AuxOnsetTime(u8),
    HissLevel(u8),
    MechanicalNoise(u8),
    CrinklePop(u8),
    InputGain(InputGain),
    DspBypass(DspBypassMode),
    PresetSave(u8),  // 1-122
    RampBounce(bool),
}

impl GenLossMkiiParameter {
    /// Get the CC number for this parameter
    pub fn cc_number(&self) -> u8 {
        match self {
            GenLossMkiiParameter::Wow(_) => 14,
            GenLossMkiiParameter::Volume(_) => 15,
            GenLossMkiiParameter::Model(_) => 16,
            GenLossMkiiParameter::Flutter(_) => 17,
            GenLossMkiiParameter::Saturate(_) => 18,
            GenLossMkiiParameter::Failure(_) => 19,
            GenLossMkiiParameter::RampSpeed(_) => 20,
            
            GenLossMkiiParameter::DryMode(_) => 22,
            GenLossMkiiParameter::NoiseMode(_) => 23,
            GenLossMkiiParameter::AuxMode(_) => 21,
            
            GenLossMkiiParameter::Bypass(_) => 102,
            GenLossMkiiParameter::AuxSwitch(_) => 103,
            GenLossMkiiParameter::AltMode(_) => 104,
            
            GenLossMkiiParameter::LeftSwitch(_) => 105,
            GenLossMkiiParameter::CenterSwitch(_) => 106,
            GenLossMkiiParameter::RightSwitch(_) => 107,
            
            GenLossMkiiParameter::DipWow(_) => 61,
            GenLossMkiiParameter::DipFlutter(_) => 62,
            GenLossMkiiParameter::DipSatGen(_) => 63,
            GenLossMkiiParameter::DipFailureHp(_) => 64,
            GenLossMkiiParameter::DipModelLp(_) => 65,
            GenLossMkiiParameter::DipBounce(_) => 66,
            GenLossMkiiParameter::DipRandom(_) => 67,
            GenLossMkiiParameter::DipSweep(_) => 68,
            
            GenLossMkiiParameter::DipPolarity(_) => 71,
            GenLossMkiiParameter::DipClassic(_) => 72,
            GenLossMkiiParameter::DipMiso(_) => 73,
            GenLossMkiiParameter::DipSpread(_) => 74,
            GenLossMkiiParameter::DipDryType(_) => 75,
            GenLossMkiiParameter::DipDropByp(_) => 76,
            GenLossMkiiParameter::DipSnagByp(_) => 77,
            GenLossMkiiParameter::DipHumByp(_) => 78,
            
            GenLossMkiiParameter::Expression(_) => 100,
            GenLossMkiiParameter::AuxOnsetTime(_) => 24,
            GenLossMkiiParameter::HissLevel(_) => 27,
            GenLossMkiiParameter::MechanicalNoise(_) => 28,
            GenLossMkiiParameter::CrinklePop(_) => 29,
            GenLossMkiiParameter::InputGain(_) => 32,
            GenLossMkiiParameter::DspBypass(_) => 26,
            GenLossMkiiParameter::PresetSave(_) => 111,
            GenLossMkiiParameter::RampBounce(_) => 52,
        }
    }
    
    /// Get the CC value for this parameter
    pub fn cc_value(&self) -> u8 {
        match self {
            // Continuous parameters
            GenLossMkiiParameter::Wow(v) |
            GenLossMkiiParameter::Volume(v) |
            GenLossMkiiParameter::Flutter(v) |
            GenLossMkiiParameter::Saturate(v) |
            GenLossMkiiParameter::Failure(v) |
            GenLossMkiiParameter::RampSpeed(v) |
            GenLossMkiiParameter::Expression(v) |
            GenLossMkiiParameter::AuxOnsetTime(v) |
            GenLossMkiiParameter::HissLevel(v) |
            GenLossMkiiParameter::MechanicalNoise(v) |
            GenLossMkiiParameter::CrinklePop(v) |
            GenLossMkiiParameter::PresetSave(v) => *v,
            
            // Enum parameters
            GenLossMkiiParameter::Model(m) => m.to_cc_value(),
            GenLossMkiiParameter::DryMode(m) => m.to_cc_value(),
            GenLossMkiiParameter::NoiseMode(m) => m.to_cc_value(),
            GenLossMkiiParameter::AuxMode(m) => m.to_cc_value(),
            GenLossMkiiParameter::DipSweep(d) => d.to_cc_value(),
            GenLossMkiiParameter::DipPolarity(p) => p.to_cc_value(),
            GenLossMkiiParameter::InputGain(g) => g.to_cc_value(),
            GenLossMkiiParameter::DspBypass(m) => m.to_cc_value(),
            
            // Binary parameters
            GenLossMkiiParameter::Bypass(b) |
            GenLossMkiiParameter::AuxSwitch(b) |
            GenLossMkiiParameter::AltMode(b) |
            GenLossMkiiParameter::LeftSwitch(b) |
            GenLossMkiiParameter::CenterSwitch(b) |
            GenLossMkiiParameter::RightSwitch(b) |
            GenLossMkiiParameter::DipWow(b) |
            GenLossMkiiParameter::DipFlutter(b) |
            GenLossMkiiParameter::DipSatGen(b) |
            GenLossMkiiParameter::DipFailureHp(b) |
            GenLossMkiiParameter::DipModelLp(b) |
            GenLossMkiiParameter::DipBounce(b) |
            GenLossMkiiParameter::DipRandom(b) |
            GenLossMkiiParameter::DipClassic(b) |
            GenLossMkiiParameter::DipMiso(b) |
            GenLossMkiiParameter::DipSpread(b) |
            GenLossMkiiParameter::DipDryType(b) |
            GenLossMkiiParameter::DipDropByp(b) |
            GenLossMkiiParameter::DipSnagByp(b) |
            GenLossMkiiParameter::DipHumByp(b) |
            GenLossMkiiParameter::RampBounce(b) => if *b { 127 } else { 0 },
        }
    }
    
    /// Get a human-readable name for this parameter
    pub fn name(&self) -> &'static str {
        match self {
            GenLossMkiiParameter::Wow(_) => "Wow",
            GenLossMkiiParameter::Volume(_) => "Volume",
            GenLossMkiiParameter::Model(_) => "Model",
            GenLossMkiiParameter::Flutter(_) => "Flutter",
            GenLossMkiiParameter::Saturate(_) => "Saturate",
            GenLossMkiiParameter::Failure(_) => "Failure",
            GenLossMkiiParameter::RampSpeed(_) => "Ramp Speed",
            GenLossMkiiParameter::DryMode(_) => "Dry Mode",
            GenLossMkiiParameter::NoiseMode(_) => "Noise Mode",
            GenLossMkiiParameter::AuxMode(_) => "Aux Mode",
            GenLossMkiiParameter::Bypass(_) => "Bypass",
            GenLossMkiiParameter::AuxSwitch(_) => "Aux Switch",
            GenLossMkiiParameter::AltMode(_) => "Alt Mode",
            GenLossMkiiParameter::LeftSwitch(_) => "Left Switch",
            GenLossMkiiParameter::CenterSwitch(_) => "Center Switch",
            GenLossMkiiParameter::RightSwitch(_) => "Right Switch",
            GenLossMkiiParameter::DipWow(_) => "DIP: Wow",
            GenLossMkiiParameter::DipFlutter(_) => "DIP: Flutter",
            GenLossMkiiParameter::DipSatGen(_) => "DIP: Sat/Gen",
            GenLossMkiiParameter::DipFailureHp(_) => "DIP: Failure/HP",
            GenLossMkiiParameter::DipModelLp(_) => "DIP: Model/LP",
            GenLossMkiiParameter::DipBounce(_) => "DIP: Bounce",
            GenLossMkiiParameter::DipRandom(_) => "DIP: Random",
            GenLossMkiiParameter::DipSweep(_) => "DIP: Sweep",
            GenLossMkiiParameter::DipPolarity(_) => "DIP: Polarity",
            GenLossMkiiParameter::DipClassic(_) => "DIP: Classic",
            GenLossMkiiParameter::DipMiso(_) => "DIP: Miso",
            GenLossMkiiParameter::DipSpread(_) => "DIP: Spread",
            GenLossMkiiParameter::DipDryType(_) => "DIP: Dry Type",
            GenLossMkiiParameter::DipDropByp(_) => "DIP: Drop Byp",
            GenLossMkiiParameter::DipSnagByp(_) => "DIP: Snag Byp",
            GenLossMkiiParameter::DipHumByp(_) => "DIP: Hum Byp",
            GenLossMkiiParameter::Expression(_) => "Expression",
            GenLossMkiiParameter::AuxOnsetTime(_) => "Aux Onset Time",
            GenLossMkiiParameter::HissLevel(_) => "Hiss Level",
            GenLossMkiiParameter::MechanicalNoise(_) => "Mechanical Noise",
            GenLossMkiiParameter::CrinklePop(_) => "Crinkle Pop",
            GenLossMkiiParameter::InputGain(_) => "Input Gain",
            GenLossMkiiParameter::DspBypass(_) => "DSP Bypass",
            GenLossMkiiParameter::PresetSave(_) => "Preset Save",
            GenLossMkiiParameter::RampBounce(_) => "Ramp/Bounce",
        }
    }
}

impl Default for GenLossMkiiState {
    fn default() -> Self {
        Self {
            // Main knobs - middle values
            wow: 64,
            volume: 100,
            model: TapeModel::None,
            flutter: 64,
            saturate: 64,
            failure: 0,
            ramp_speed: 64,
            
            // Toggles - default positions
            dry_mode: DryMode::Dry1,
            noise_mode: NoiseMode::Noise1,
            aux_mode: AuxMode::Aux1,
            
            // Switches - all off
            bypass: false,
            aux_switch: false,
            alt_mode: false,
            left_switch: false,
            center_switch: false,
            right_switch: false,
            
            // DIP switches - all off/default
            dip_wow: false,
            dip_flutter: false,
            dip_sat_gen: false,
            dip_failure_hp: false,
            dip_model_lp: false,
            dip_bounce: false,
            dip_random: false,
            dip_sweep: SweepDirection::Bottom,
            dip_polarity: Polarity::Forward,
            dip_classic: false,
            dip_miso: false,
            dip_spread: false,
            dip_dry_type: false,
            dip_drop_byp: false,
            dip_snag_byp: false,
            dip_hum_byp: false,
            
            // Advanced - sensible defaults
            expression: 0,
            aux_onset_time: 64,
            hiss_level: 32,
            mechanical_noise: 32,
            crinkle_pop: 32,
            input_gain: InputGain::InstrumentLevel,
            dsp_bypass: DspBypassMode::TrueBypass,
            ramp_bounce: false,
        }
    }
}

impl GenLossMkii {
    /// Create a new Gen Loss MKII instance with default state
    pub fn new(midi_channel: u8) -> Self {
        Self {
            state: GenLossMkiiState::default(),
            midi_channel,
        }
    }
    
    /// Update internal state from a parameter change
    pub fn update_state(&mut self, param: &GenLossMkiiParameter) {
        match param {
            GenLossMkiiParameter::Wow(v) => self.state.wow = *v,
            GenLossMkiiParameter::Volume(v) => self.state.volume = *v,
            GenLossMkiiParameter::Model(v) => self.state.model = *v,
            GenLossMkiiParameter::Flutter(v) => self.state.flutter = *v,
            GenLossMkiiParameter::Saturate(v) => self.state.saturate = *v,
            GenLossMkiiParameter::Failure(v) => self.state.failure = *v,
            GenLossMkiiParameter::RampSpeed(v) => self.state.ramp_speed = *v,
            GenLossMkiiParameter::DryMode(v) => self.state.dry_mode = *v,
            GenLossMkiiParameter::NoiseMode(v) => self.state.noise_mode = *v,
            GenLossMkiiParameter::AuxMode(v) => self.state.aux_mode = *v,
            GenLossMkiiParameter::Bypass(v) => self.state.bypass = *v,
            GenLossMkiiParameter::AuxSwitch(v) => self.state.aux_switch = *v,
            GenLossMkiiParameter::AltMode(v) => self.state.alt_mode = *v,
            GenLossMkiiParameter::LeftSwitch(v) => self.state.left_switch = *v,
            GenLossMkiiParameter::CenterSwitch(v) => self.state.center_switch = *v,
            GenLossMkiiParameter::RightSwitch(v) => self.state.right_switch = *v,
            GenLossMkiiParameter::DipWow(v) => self.state.dip_wow = *v,
            GenLossMkiiParameter::DipFlutter(v) => self.state.dip_flutter = *v,
            GenLossMkiiParameter::DipSatGen(v) => self.state.dip_sat_gen = *v,
            GenLossMkiiParameter::DipFailureHp(v) => self.state.dip_failure_hp = *v,
            GenLossMkiiParameter::DipModelLp(v) => self.state.dip_model_lp = *v,
            GenLossMkiiParameter::DipBounce(v) => self.state.dip_bounce = *v,
            GenLossMkiiParameter::DipRandom(v) => self.state.dip_random = *v,
            GenLossMkiiParameter::DipSweep(v) => self.state.dip_sweep = *v,
            GenLossMkiiParameter::DipPolarity(v) => self.state.dip_polarity = *v,
            GenLossMkiiParameter::DipClassic(v) => self.state.dip_classic = *v,
            GenLossMkiiParameter::DipMiso(v) => self.state.dip_miso = *v,
            GenLossMkiiParameter::DipSpread(v) => self.state.dip_spread = *v,
            GenLossMkiiParameter::DipDryType(v) => self.state.dip_dry_type = *v,
            GenLossMkiiParameter::DipDropByp(v) => self.state.dip_drop_byp = *v,
            GenLossMkiiParameter::DipSnagByp(v) => self.state.dip_snag_byp = *v,
            GenLossMkiiParameter::DipHumByp(v) => self.state.dip_hum_byp = *v,
            GenLossMkiiParameter::Expression(v) => self.state.expression = *v,
            GenLossMkiiParameter::AuxOnsetTime(v) => self.state.aux_onset_time = *v,
            GenLossMkiiParameter::HissLevel(v) => self.state.hiss_level = *v,
            GenLossMkiiParameter::MechanicalNoise(v) => self.state.mechanical_noise = *v,
            GenLossMkiiParameter::CrinklePop(v) => self.state.crinkle_pop = *v,
            GenLossMkiiParameter::InputGain(v) => self.state.input_gain = *v,
            GenLossMkiiParameter::DspBypass(v) => self.state.dsp_bypass = *v,
            GenLossMkiiParameter::RampBounce(v) => self.state.ramp_bounce = *v,
            GenLossMkiiParameter::PresetSave(_) => {}, // Doesn't update state
        }
    }
    
    /// Get the current state as a hashmap of CC numbers to values
    pub fn state_as_cc_map(&self) -> HashMap<u8, u8> {
        let mut map = HashMap::new();
        
        // Main knobs
        map.insert(14, self.state.wow);
        map.insert(15, self.state.volume);
        map.insert(16, self.state.model.to_cc_value());
        map.insert(17, self.state.flutter);
        map.insert(18, self.state.saturate);
        map.insert(19, self.state.failure);
        map.insert(20, self.state.ramp_speed);
        
        // Toggles
        map.insert(22, self.state.dry_mode.to_cc_value());
        map.insert(23, self.state.noise_mode.to_cc_value());
        map.insert(21, self.state.aux_mode.to_cc_value());
        
        // Switches
        map.insert(102, if self.state.bypass { 127 } else { 0 });
        map.insert(103, if self.state.aux_switch { 127 } else { 0 });
        map.insert(104, if self.state.alt_mode { 127 } else { 0 });
        map.insert(105, if self.state.left_switch { 127 } else { 0 });
        map.insert(106, if self.state.center_switch { 127 } else { 0 });
        map.insert(107, if self.state.right_switch { 127 } else { 0 });
        
        // DIP switches
        map.insert(61, if self.state.dip_wow { 127 } else { 0 });
        map.insert(62, if self.state.dip_flutter { 127 } else { 0 });
        map.insert(63, if self.state.dip_sat_gen { 127 } else { 0 });
        map.insert(64, if self.state.dip_failure_hp { 127 } else { 0 });
        map.insert(65, if self.state.dip_model_lp { 127 } else { 0 });
        map.insert(66, if self.state.dip_bounce { 127 } else { 0 });
        map.insert(67, if self.state.dip_random { 127 } else { 0 });
        map.insert(68, self.state.dip_sweep.to_cc_value());
        map.insert(71, self.state.dip_polarity.to_cc_value());
        map.insert(72, if self.state.dip_classic { 127 } else { 0 });
        map.insert(73, if self.state.dip_miso { 127 } else { 0 });
        map.insert(74, if self.state.dip_spread { 127 } else { 0 });
        map.insert(75, if self.state.dip_dry_type { 127 } else { 0 });
        map.insert(76, if self.state.dip_drop_byp { 127 } else { 0 });
        map.insert(77, if self.state.dip_snag_byp { 127 } else { 0 });
        map.insert(78, if self.state.dip_hum_byp { 127 } else { 0 });
        
        // Advanced
        map.insert(100, self.state.expression);
        map.insert(24, self.state.aux_onset_time);
        map.insert(27, self.state.hiss_level);
        map.insert(28, self.state.mechanical_noise);
        map.insert(29, self.state.crinkle_pop);
        map.insert(32, self.state.input_gain.to_cc_value());
        map.insert(26, self.state.dsp_bypass.to_cc_value());
        map.insert(52, if self.state.ramp_bounce { 127 } else { 0 });
        
        map
    }
}

// Implement PedalCapabilities trait for compile-time enforcement
impl super::PedalCapabilities for GenLossMkii {
    type State = GenLossMkiiState;
    type Parameter = GenLossMkiiParameter;
    
    fn metadata(&self) -> super::PedalMetadata {
        super::PedalMetadata {
            name: "GenLossMkii",
            manufacturer: "Chase Bliss Audio",
            supports_editor: false, // No editor implemented yet
            supports_preset_library: false, // No preset library yet
        }
    }
    
    fn supports_program_change(&self) -> bool {
        false // Gen Loss doesn't support program change
    }
    
    fn midi_channel(&self) -> u8 {
        self.midi_channel
    }
    
    fn state(&self) -> &Self::State {
        &self.state
    }
    
    fn update_state(&mut self, param: &Self::Parameter) {
        self.update_state(param)
    }
    
    fn state_as_cc_map(&self) -> HashMap<u8, u8> {
        self.state_as_cc_map()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    // Test TapeModel conversions
    #[test]
    fn test_tape_model_to_cc() {
        assert_eq!(TapeModel::None.to_cc_value(), 0);
        assert_eq!(TapeModel::CPR3300Gen1.to_cc_value(), 15);
        assert_eq!(TapeModel::CPR3300Gen2.to_cc_value(), 24);
        assert_eq!(TapeModel::MPEX.to_cc_value(), 127);
    }
    
    #[test]
    fn test_tape_model_from_cc() {
        assert_eq!(TapeModel::from_cc_value(0), TapeModel::None);
        assert_eq!(TapeModel::from_cc_value(15), TapeModel::CPR3300Gen1);
        assert_eq!(TapeModel::from_cc_value(24), TapeModel::CPR3300Gen2);
        assert_eq!(TapeModel::from_cc_value(127), TapeModel::MPEX);
        
        // Test boundary values
        assert_eq!(TapeModel::from_cc_value(7), TapeModel::None);
        assert_eq!(TapeModel::from_cc_value(8), TapeModel::CPR3300Gen1);
    }
    
    #[test]
    fn test_tape_model_names() {
        assert_eq!(TapeModel::None.name(), "None");
        assert_eq!(TapeModel::CPR3300Gen1.name(), "CPR-3300 Gen 1");
        assert_eq!(TapeModel::MPEX.name(), "M-PEX");
    }
    
    // Test DryMode conversions
    #[test]
    fn test_dry_mode_to_cc() {
        assert_eq!(DryMode::Dry1.to_cc_value(), 1);
        assert_eq!(DryMode::Dry2.to_cc_value(), 2);
        assert_eq!(DryMode::Dry3.to_cc_value(), 3);
    }
    
    #[test]
    fn test_dry_mode_from_cc() {
        assert_eq!(DryMode::from_cc_value(1).unwrap(), DryMode::Dry1);
        assert_eq!(DryMode::from_cc_value(2).unwrap(), DryMode::Dry2);
        assert_eq!(DryMode::from_cc_value(3).unwrap(), DryMode::Dry3);
        
        // Invalid value
        assert!(DryMode::from_cc_value(0).is_err());
        assert!(DryMode::from_cc_value(4).is_err());
    }
    
    // Test NoiseMode conversions
    #[test]
    fn test_noise_mode_to_cc() {
        assert_eq!(NoiseMode::Noise1.to_cc_value(), 1);
        assert_eq!(NoiseMode::Noise2.to_cc_value(), 2);
        assert_eq!(NoiseMode::Noise3.to_cc_value(), 3);
    }
    
    #[test]
    fn test_noise_mode_from_cc() {
        assert_eq!(NoiseMode::from_cc_value(1).unwrap(), NoiseMode::Noise1);
        assert_eq!(NoiseMode::from_cc_value(2).unwrap(), NoiseMode::Noise2);
        assert_eq!(NoiseMode::from_cc_value(3).unwrap(), NoiseMode::Noise3);
        
        // Invalid value
        assert!(NoiseMode::from_cc_value(0).is_err());
        assert!(NoiseMode::from_cc_value(4).is_err());
    }
    
    // Test AuxMode conversions
    #[test]
    fn test_aux_mode_to_cc() {
        assert_eq!(AuxMode::Aux1.to_cc_value(), 1);
        assert_eq!(AuxMode::Aux2.to_cc_value(), 2);
        assert_eq!(AuxMode::Aux3.to_cc_value(), 3);
    }
    
    #[test]
    fn test_aux_mode_from_cc() {
        assert_eq!(AuxMode::from_cc_value(1).unwrap(), AuxMode::Aux1);
        assert_eq!(AuxMode::from_cc_value(2).unwrap(), AuxMode::Aux2);
        assert_eq!(AuxMode::from_cc_value(3).unwrap(), AuxMode::Aux3);
        
        // Invalid value
        assert!(AuxMode::from_cc_value(0).is_err());
        assert!(AuxMode::from_cc_value(4).is_err());
    }
    
    // Test SweepDirection conversions
    #[test]
    fn test_sweep_direction_to_cc() {
        assert_eq!(SweepDirection::Bottom.to_cc_value(), 0);
        assert_eq!(SweepDirection::Top.to_cc_value(), 127);
    }
    
    #[test]
    fn test_sweep_direction_from_cc() {
        assert_eq!(SweepDirection::from_cc_value(0), SweepDirection::Bottom);
        assert_eq!(SweepDirection::from_cc_value(63), SweepDirection::Bottom);
        assert_eq!(SweepDirection::from_cc_value(64), SweepDirection::Top);
        assert_eq!(SweepDirection::from_cc_value(127), SweepDirection::Top);
    }
    
    // Test Polarity conversions
    #[test]
    fn test_polarity_to_cc() {
        assert_eq!(Polarity::Forward.to_cc_value(), 0);
        assert_eq!(Polarity::Reverse.to_cc_value(), 127);
    }
    
    #[test]
    fn test_polarity_from_cc() {
        assert_eq!(Polarity::from_cc_value(0), Polarity::Forward);
        assert_eq!(Polarity::from_cc_value(63), Polarity::Forward);
        assert_eq!(Polarity::from_cc_value(64), Polarity::Reverse);
        assert_eq!(Polarity::from_cc_value(127), Polarity::Reverse);
    }
    
    // Test InputGain conversions
    #[test]
    fn test_input_gain_to_cc() {
        assert_eq!(InputGain::LineLevel.to_cc_value(), 1);
        assert_eq!(InputGain::InstrumentLevel.to_cc_value(), 2);
        assert_eq!(InputGain::HighGain.to_cc_value(), 3);
    }
    
    #[test]
    fn test_input_gain_from_cc() {
        assert_eq!(InputGain::from_cc_value(1).unwrap(), InputGain::LineLevel);
        assert_eq!(InputGain::from_cc_value(2).unwrap(), InputGain::InstrumentLevel);
        assert_eq!(InputGain::from_cc_value(3).unwrap(), InputGain::HighGain);
        
        // Invalid value
        assert!(InputGain::from_cc_value(0).is_err());
        assert!(InputGain::from_cc_value(4).is_err());
    }
    
    // Test DspBypassMode conversions
    #[test]
    fn test_dsp_bypass_mode_to_cc() {
        assert_eq!(DspBypassMode::TrueBypass.to_cc_value(), 0);
        assert_eq!(DspBypassMode::DspBypass.to_cc_value(), 127);
    }
    
    #[test]
    fn test_dsp_bypass_mode_from_cc() {
        assert_eq!(DspBypassMode::from_cc_value(0), DspBypassMode::TrueBypass);
        assert_eq!(DspBypassMode::from_cc_value(63), DspBypassMode::TrueBypass);
        assert_eq!(DspBypassMode::from_cc_value(64), DspBypassMode::DspBypass);
        assert_eq!(DspBypassMode::from_cc_value(127), DspBypassMode::DspBypass);
    }
    
    // Test GenLossMkiiParameter CC numbers
    #[test]
    fn test_parameter_cc_numbers() {
        assert_eq!(GenLossMkiiParameter::Wow(64).cc_number(), 14);
        assert_eq!(GenLossMkiiParameter::Volume(64).cc_number(), 15);
        assert_eq!(GenLossMkiiParameter::Model(TapeModel::None).cc_number(), 16);
        assert_eq!(GenLossMkiiParameter::Flutter(64).cc_number(), 17);
        assert_eq!(GenLossMkiiParameter::Bypass(true).cc_number(), 102);
    }
    
    // Test GenLossMkiiParameter CC values
    #[test]
    fn test_parameter_cc_values() {
        // Continuous parameters
        assert_eq!(GenLossMkiiParameter::Wow(64).cc_value(), 64);
        assert_eq!(GenLossMkiiParameter::Volume(127).cc_value(), 127);
        assert_eq!(GenLossMkiiParameter::Flutter(0).cc_value(), 0);
        
        // Binary parameters
        assert_eq!(GenLossMkiiParameter::Bypass(true).cc_value(), 127);
        assert_eq!(GenLossMkiiParameter::Bypass(false).cc_value(), 0);
        assert_eq!(GenLossMkiiParameter::AuxSwitch(true).cc_value(), 127);
        assert_eq!(GenLossMkiiParameter::AuxSwitch(false).cc_value(), 0);
        
        // Enum parameters
        assert_eq!(
            GenLossMkiiParameter::Model(TapeModel::CPR3300Gen1).cc_value(),
            15
        );
        assert_eq!(
            GenLossMkiiParameter::DryMode(DryMode::Dry2).cc_value(),
            2
        );
    }
    
    // Test GenLossMkiiParameter names
    #[test]
    fn test_parameter_names() {
        assert_eq!(GenLossMkiiParameter::Wow(64).name(), "Wow");
        assert_eq!(GenLossMkiiParameter::Volume(64).name(), "Volume");
        assert_eq!(GenLossMkiiParameter::Model(TapeModel::None).name(), "Model");
        assert_eq!(GenLossMkiiParameter::Bypass(true).name(), "Bypass");
    }
    
    // Test GenLossMkii state creation
    #[test]
    fn test_gen_loss_new() {
        let gen_loss = GenLossMkii::new(5);
        
        assert_eq!(gen_loss.midi_channel, 5);
        assert_eq!(gen_loss.state.wow, 64);
        assert_eq!(gen_loss.state.volume, 100);
        assert_eq!(gen_loss.state.model, TapeModel::None);
        assert!(!gen_loss.state.bypass);
    }
    
    // Test update_state
    #[test]
    fn test_update_state() {
        let mut gen_loss = GenLossMkii::new(1);
        
        gen_loss.update_state(&GenLossMkiiParameter::Wow(100));
        assert_eq!(gen_loss.state.wow, 100);
        
        gen_loss.update_state(&GenLossMkiiParameter::Bypass(true));
        assert!(gen_loss.state.bypass);
        
        gen_loss.update_state(&GenLossMkiiParameter::Model(TapeModel::MPEX));
        assert_eq!(gen_loss.state.model, TapeModel::MPEX);
    }
    
    // Test state_as_cc_map
    #[test]
    fn test_state_as_cc_map() {
        let gen_loss = GenLossMkii {
            midi_channel: 1,
            state: GenLossMkiiState {
                wow: 80,
                volume: 100,
                model: TapeModel::CPR3300Gen1,
                flutter: 60,
                saturate: 50,
                failure: 40,
                ramp_speed: 64,
                dry_mode: DryMode::Dry2,
                noise_mode: NoiseMode::Noise3,
                aux_mode: AuxMode::Aux1,
                bypass: true,
                aux_switch: false,
                alt_mode: false,
                left_switch: false,
                center_switch: false,
                right_switch: false,
                dip_wow: true,
                dip_flutter: false,
                dip_sat_gen: false,
                dip_failure_hp: false,
                dip_model_lp: false,
                dip_bounce: false,
                dip_random: false,
                dip_sweep: SweepDirection::Top,
                dip_polarity: Polarity::Reverse,
                dip_classic: false,
                dip_miso: false,
                dip_spread: false,
                dip_dry_type: false,
                dip_drop_byp: false,
                dip_snag_byp: false,
                dip_hum_byp: false,
                expression: 64,
                aux_onset_time: 50,
                hiss_level: 30,
                mechanical_noise: 20,
                crinkle_pop: 10,
                input_gain: InputGain::LineLevel,
                dsp_bypass: DspBypassMode::DspBypass,
                ramp_bounce: false,
            },
        };
        
        let cc_map = gen_loss.state_as_cc_map();
        
        // Verify some key mappings
        assert_eq!(cc_map.get(&14), Some(&80)); // wow
        assert_eq!(cc_map.get(&15), Some(&100)); // volume
        assert_eq!(cc_map.get(&16), Some(&15)); // model (CPR3300Gen1)
        assert_eq!(cc_map.get(&102), Some(&127)); // bypass (true)
        assert_eq!(cc_map.get(&22), Some(&2)); // dry_mode (Dry2)
        assert_eq!(cc_map.get(&61), Some(&127)); // dip_wow (true)
        assert_eq!(cc_map.get(&62), Some(&0)); // dip_flutter (false)
        
        // Verify all expected keys are present
        assert!(cc_map.contains_key(&14)); // wow
        assert!(cc_map.contains_key(&15)); // volume
        assert!(cc_map.contains_key(&102)); // bypass
    }
    
    // Test round-trip conversions
    #[test]
    fn test_tape_model_round_trip() {
        let models = vec![
            TapeModel::None,
            TapeModel::CPR3300Gen1,
            TapeModel::MPEX,
        ];
        
        for model in models {
            let cc_value = model.to_cc_value();
            let recovered = TapeModel::from_cc_value(cc_value);
            assert_eq!(recovered, model);
        }
    }
    
    #[test]
    fn test_dry_mode_round_trip() {
        for i in 1..=3 {
            let mode = DryMode::from_cc_value(i).unwrap();
            assert_eq!(mode.to_cc_value(), i);
        }
    }
}

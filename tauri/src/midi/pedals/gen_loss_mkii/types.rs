// Gen Loss MKII domain types - enums, structs, and value objects

use crate::midi::error::{MidiError, MidiResult};
use serde::{Deserialize, Serialize};

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
    PresetSave(u8), // 1-122
    RampBounce(bool),
}

/// Tape machine model selection (CC 16)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TapeModel {
    None,        // 0
    CPR3300Gen1, // 15
    CPR3300Gen2, // 24
    CPR3300Gen3, // 33
    PortamaxRT,  // 43
    PortamaxHT,  // 53
    CAM8,        // 62
    DictatronEX, // 72
    DictatronIN, // 82
    Fishy60,     // 91
    MSWalker,    // 101
    AMU2,        // 111
    MPEX,        // 127
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
    Dry1, // 1
    Dry2, // 2
    Dry3, // 3
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
    Noise1, // 1
    Noise2, // 2
    Noise3, // 3
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
    Aux1, // 1
    Aux2, // 2
    Aux3, // 3
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
    Bottom, // 0-63
    Top,    // 64-127
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
    Forward, // 0-63
    Reverse, // 64-127
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
    LineLevel,       // 1
    InstrumentLevel, // 2
    HighGain,        // 3
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
    TrueBypass, // 0-63
    DspBypass,  // 64-127
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

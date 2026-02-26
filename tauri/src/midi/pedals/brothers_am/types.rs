// Brothers AM domain types - enums, structs, and value objects

use crate::midi::error::MidiResult;
use serde::{Deserialize, Serialize};

/// Complete state of all Brothers AM parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrothersAmState {
    // Main knobs - Channel 2 (top)
    pub gain2: u8,
    pub volume2: u8,
    pub tone2: u8,
    pub presence2: u8,

    // Main knobs - Channel 1 (bottom)
    pub gain1: u8,
    pub volume1: u8,
    pub tone1: u8,
    pub presence1: u8,

    // Three-position toggles
    pub gain2_type: Gain2Type,
    pub treble_boost: TrebleBoost,
    pub gain1_type: Gain1Type,

    // Footswitches
    pub channel1_bypass: bool,
    pub channel2_bypass: bool,

    // DIP switches - Left bank (CC 61-68)
    pub dip_volume1: bool,
    pub dip_volume2: bool,
    pub dip_gain1: bool,
    pub dip_gain2: bool,
    pub dip_tone1: bool,
    pub dip_tone2: bool,
    pub dip_sweep: SweepDirection,
    pub dip_polarity: Polarity,

    // DIP switches - Right bank (CC 71-77, no CC 78)
    pub dip_hi_gain1: bool,
    pub dip_hi_gain2: bool,
    pub dip_moto_byp1: bool,
    pub dip_moto_byp2: bool,
    pub dip_pres_link1: bool,
    pub dip_pres_link2: bool,
    pub dip_master: bool,

    // Utility
    pub expression: u8,
}

impl Default for BrothersAmState {
    fn default() -> Self {
        Self {
            gain2: 64,
            volume2: 64,
            tone2: 64,
            presence2: 64,

            gain1: 64,
            volume1: 64,
            tone1: 64,
            presence1: 64,

            gain2_type: Gain2Type::Boost,
            treble_boost: TrebleBoost::FullSun,
            gain1_type: Gain1Type::Dist,

            channel1_bypass: false,
            channel2_bypass: false,

            dip_volume1: false,
            dip_volume2: false,
            dip_gain1: false,
            dip_gain2: false,
            dip_tone1: false,
            dip_tone2: false,
            dip_sweep: SweepDirection::Bottom,
            dip_polarity: Polarity::Forward,

            dip_hi_gain1: false,
            dip_hi_gain2: false,
            dip_moto_byp1: false,
            dip_moto_byp2: false,
            dip_pres_link1: false,
            dip_pres_link2: false,
            dip_master: false,

            expression: 0,
        }
    }
}

/// All possible Brothers AM parameters with their values
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BrothersAmParameter {
    // Main knobs - Channel 2
    Gain2(u8),
    Volume2(u8),
    Tone2(u8),
    Presence2(u8),

    // Main knobs - Channel 1
    Gain1(u8),
    Volume1(u8),
    Tone1(u8),
    Presence1(u8),

    // Toggles
    Gain2Type(Gain2Type),
    TrebleBoost(TrebleBoost),
    Gain1Type(Gain1Type),

    // Footswitches
    Channel1Bypass(bool),
    Channel2Bypass(bool),

    // DIP switches - Left bank
    DipVolume1(bool),
    DipVolume2(bool),
    DipGain1(bool),
    DipGain2(bool),
    DipTone1(bool),
    DipTone2(bool),
    DipSweep(SweepDirection),
    DipPolarity(Polarity),

    // DIP switches - Right bank (7 switches, no CC 78)
    DipHiGain1(bool),
    DipHiGain2(bool),
    DipMotoByp1(bool),
    DipMotoByp2(bool),
    DipPresLink1(bool),
    DipPresLink2(bool),
    DipMaster(bool),

    // Utility
    Expression(u8),
    PresetSave(u8),
}

/// Gain type for channel 2 (CC 21)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Gain2Type {
    Boost, // 1
    OD,    // 2
    Dist,  // 3
}

impl Gain2Type {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::Boost => 1,
            Self::OD => 2,
            Self::Dist => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            0..=1 => Ok(Self::Boost),
            2 => Ok(Self::OD),
            _ => Ok(Self::Dist),
        }
    }
}

/// Treble boost mode (CC 22)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TrebleBoost {
    FullSun, // 1
    Off,     // 2
    HalfSun, // 3
}

impl TrebleBoost {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::FullSun => 1,
            Self::Off => 2,
            Self::HalfSun => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            0..=1 => Ok(Self::FullSun),
            2 => Ok(Self::Off),
            _ => Ok(Self::HalfSun),
        }
    }
}

/// Gain type for channel 1 (CC 23)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Gain1Type {
    Dist,  // 1
    OD,    // 2
    Boost, // 3
}

impl Gain1Type {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::Dist => 1,
            Self::OD => 2,
            Self::Boost => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            0..=1 => Ok(Self::Dist),
            2 => Ok(Self::OD),
            _ => Ok(Self::Boost),
        }
    }
}

/// DIP switch sweep direction (CC 67)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SweepDirection {
    Bottom, // 0-63
    Top,    // 64-127
}

impl SweepDirection {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::Bottom => 0,
            Self::Top => 127,
        }
    }

    pub fn from_cc_value(value: u8) -> Self {
        if value < 64 {
            Self::Bottom
        } else {
            Self::Top
        }
    }
}

/// DIP switch polarity (CC 68)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Polarity {
    Forward, // 0-63
    Reverse, // 64-127
}

impl Polarity {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::Forward => 0,
            Self::Reverse => 127,
        }
    }

    pub fn from_cc_value(value: u8) -> Self {
        if value < 64 {
            Self::Forward
        } else {
            Self::Reverse
        }
    }
}

#[allow(dead_code)]
fn _exhaustive_gain2_type(v: u8) -> MidiResult<Gain2Type> {
    Gain2Type::from_cc_value(v)
}

// Lossy domain types

use crate::midi::error::{MidiError, MidiResult};
use serde::{Deserialize, Serialize};

/// Complete state of all Lossy parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LossyState {
    // Main knobs
    pub filter: u8,
    pub global: u8,
    pub reverb: u8,
    pub freq: u8,
    pub speed: u8,
    pub loss: u8,
    pub ramp_speed: u8,

    // Three-position toggles
    pub filter_slope: FilterSlope,
    pub packet_mode: PacketMode,
    pub loss_effect: LossEffect,

    // Hidden options
    pub gate: u8,
    pub freezer: u8,
    pub verb_decay: u8,
    pub limiter_threshold: u8,
    pub auto_gain: u8,
    pub loss_gain: u8,
    pub weighting: Weighting,

    // Footswitches
    pub bypass: bool,
    pub freeze_slushie: bool,
    pub alt_mode: bool,
    pub freeze_solid: bool,
    pub gate_switch: bool, // CC 106, named to avoid conflict with `gate` hidden option

    // Left DIP bank (CC 61-68)
    pub dip_filter: bool,
    pub dip_freq: bool,
    pub dip_speed: bool,
    pub dip_loss: bool,
    pub dip_verb: bool,
    pub dip_bounce: bool,
    pub dip_sweep: SweepDirection,
    pub dip_polarity: Polarity,

    // Right DIP bank (CC 71-78)
    pub dip_miso: bool,
    pub dip_spread: bool,
    pub dip_trails: bool,
    pub dip_latch: bool,
    pub dip_pre_post: bool,
    pub dip_slow: bool,
    pub dip_invert: bool,
    pub dip_all_wet: bool,

    // Utility
    pub ramp_bounce: bool,
    pub dry_kill: bool,
    pub expression: u8,
}

impl Default for LossyState {
    fn default() -> Self {
        Self {
            filter: 64,
            global: 64,
            reverb: 64,
            freq: 64,
            speed: 64,
            loss: 64,
            ramp_speed: 64,
            filter_slope: FilterSlope::Db6,
            packet_mode: PacketMode::Repeat,
            loss_effect: LossEffect::Inverse,
            gate: 64,
            freezer: 64,
            verb_decay: 64,
            limiter_threshold: 64,
            auto_gain: 64,
            loss_gain: 64,
            weighting: Weighting::Dark,
            bypass: false,
            freeze_slushie: false,
            alt_mode: false,
            freeze_solid: false,
            gate_switch: false,
            dip_filter: false,
            dip_freq: false,
            dip_speed: false,
            dip_loss: false,
            dip_verb: false,
            dip_bounce: false,
            dip_sweep: SweepDirection::Bottom,
            dip_polarity: Polarity::Forward,
            dip_miso: false,
            dip_spread: false,
            dip_trails: false,
            dip_latch: false,
            dip_pre_post: false,
            dip_slow: false,
            dip_invert: false,
            dip_all_wet: false,
            ramp_bounce: false,
            dry_kill: false,
            expression: 0,
        }
    }
}

/// All possible Lossy parameters with their values
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LossyParameter {
    // Main knobs
    Filter(u8),
    Global(u8),
    Reverb(u8),
    Freq(u8),
    Speed(u8),
    Loss(u8),
    RampSpeed(u8),

    // Three-position toggles
    FilterSlope(FilterSlope),
    PacketMode(PacketMode),
    LossEffect(LossEffect),

    // Hidden options
    Gate(u8),
    Freezer(u8),
    VerbDecay(u8),
    LimiterThreshold(u8),
    AutoGain(u8),
    LossGain(u8),
    Weighting(Weighting),

    // Footswitches
    Bypass(bool),
    FreezeSlushie(bool),
    AltMode(bool),
    FreezeSolid(bool),
    GateSwitch(bool),

    // Left DIP bank
    DipFilter(bool),
    DipFreq(bool),
    DipSpeed(bool),
    DipLoss(bool),
    DipVerb(bool),
    DipBounce(bool),
    DipSweep(SweepDirection),
    DipPolarity(Polarity),

    // Right DIP bank
    DipMiso(bool),
    DipSpread(bool),
    DipTrails(bool),
    DipLatch(bool),
    DipPrePost(bool),
    DipSlow(bool),
    DipInvert(bool),
    DipAllWet(bool),

    // Utility
    RampBounce(bool),
    DryKill(bool),
    Expression(u8),
    PresetSave(u8),
}

/// Filter slope toggle (CC 21)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum FilterSlope {
    Db6,  // 1
    Db24, // 2
    Db96, // 3
}

impl FilterSlope {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::Db6 => 1,
            Self::Db24 => 2,
            Self::Db96 => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(Self::Db6),
            2 => Ok(Self::Db24),
            3 => Ok(Self::Db96),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// Packet mode toggle (CC 22)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PacketMode {
    Repeat,   // 1
    Clean,    // 2
    LossMode, // 3
}

impl PacketMode {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::Repeat => 1,
            Self::Clean => 2,
            Self::LossMode => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(Self::Repeat),
            2 => Ok(Self::Clean),
            3 => Ok(Self::LossMode),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// Loss effect toggle (CC 23)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum LossEffect {
    Inverse,  // 1
    Standard, // 2
    Jitter,   // 3
}

impl LossEffect {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::Inverse => 1,
            Self::Standard => 2,
            Self::Jitter => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(Self::Inverse),
            2 => Ok(Self::Standard),
            3 => Ok(Self::Jitter),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// EQ weighting hidden option (CC 33)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Weighting {
    Dark,    // 1
    Neutral, // 2
    Bright,  // 3
}

impl Weighting {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::Dark => 1,
            Self::Neutral => 2,
            Self::Bright => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(Self::Dark),
            2 => Ok(Self::Neutral),
            3 => Ok(Self::Bright),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// DIP sweep direction (CC 67)
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
        if value < 64 { Self::Bottom } else { Self::Top }
    }
}

/// DIP polarity (CC 68)
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
        if value < 64 { Self::Forward } else { Self::Reverse }
    }
}

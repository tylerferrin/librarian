// Reverse Mode C domain types - enums, structs, and value objects

use crate::midi::error::MidiResult;
use serde::{Deserialize, Serialize};

/// Complete state of all Reverse Mode C parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReverseModeCState {
    // Main knobs
    pub time: u8,
    pub mix: u8,
    pub feedback: u8,
    pub offset: u8,
    pub balance: u8,
    pub filter: u8,
    pub ramp_speed: u8,

    // Three-position toggles
    pub mod_sync: ModSync,
    pub mod_type: ModType,
    pub sequence_mode: SequenceMode,

    // Hidden options
    pub sequencer_subdivision: u8,
    pub ramping_waveform: u8,
    pub mod_depth: u8,
    pub mod_rate: u8,
    pub octave_type: OctaveType,
    pub sequence_spacing: bool, // false = Rest (CC value 1), true = Skip (CC value 2)

    // Footswitches
    pub bypass: bool,
    pub tap: bool,
    pub alt_mode: bool,
    pub freeze: bool,
    pub half_speed: bool,

    // DIP switches - Left bank (CC 61-68)
    pub dip_time: bool,
    pub dip_offset: bool,
    pub dip_balance: bool,
    pub dip_filter: bool,
    pub dip_feed: bool,
    pub dip_bounce: bool,
    pub dip_sweep: SweepDirection,
    pub dip_polarity: Polarity,

    // DIP switches - Right bank (CC 71-78)
    pub dip_swap: bool,
    pub dip_miso: bool,
    pub dip_spread: bool,
    pub dip_trails: bool,
    pub dip_latch: bool,
    pub dip_feed_type: bool,
    pub dip_fade_type: bool,
    pub dip_mod_type: bool,

    // Utility
    pub midi_clock_ignore: bool,
    pub ramp_bounce: bool,
    pub dry_kill: bool,
    pub expression: u8,
}

impl Default for ReverseModeCState {
    fn default() -> Self {
        Self {
            time: 64,
            mix: 64,
            feedback: 64,
            offset: 64,
            balance: 64,
            filter: 64,
            ramp_speed: 64,

            mod_sync: ModSync::Sync,
            mod_type: ModType::Vib,
            sequence_mode: SequenceMode::Run,

            sequencer_subdivision: 64,
            ramping_waveform: 64,
            mod_depth: 64,
            mod_rate: 64,
            octave_type: OctaveType::OctDown,
            sequence_spacing: false,

            bypass: false,
            tap: false,
            alt_mode: false,
            freeze: false,
            half_speed: false,

            dip_time: false,
            dip_offset: false,
            dip_balance: false,
            dip_filter: false,
            dip_feed: false,
            dip_bounce: false,
            dip_sweep: SweepDirection::Bottom,
            dip_polarity: Polarity::Forward,

            dip_swap: false,
            dip_miso: false,
            dip_spread: false,
            dip_trails: false,
            dip_latch: false,
            dip_feed_type: false,
            dip_fade_type: false,
            dip_mod_type: false,

            midi_clock_ignore: false,
            ramp_bounce: false,
            dry_kill: false,
            expression: 0,
        }
    }
}

/// All possible Reverse Mode C parameters with their values
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReverseModeCParameter {
    // Main knobs
    Time(u8),
    Mix(u8),
    Feedback(u8),
    Offset(u8),
    Balance(u8),
    Filter(u8),
    RampSpeed(u8),

    // Toggles
    ModSync(ModSync),
    ModType(ModType),
    SequenceMode(SequenceMode),

    // Hidden options
    SequencerSubdivision(u8),
    RampingWaveform(u8),
    ModDepth(u8),
    ModRate(u8),
    OctaveType(OctaveType),
    SequenceSpacing(bool),

    // Footswitches
    Bypass(bool),
    Tap(bool),
    AltMode(bool),
    Freeze(bool),
    HalfSpeed(bool),

    // DIP switches - Left bank
    DipTime(bool),
    DipOffset(bool),
    DipBalance(bool),
    DipFilter(bool),
    DipFeed(bool),
    DipBounce(bool),
    DipSweep(SweepDirection),
    DipPolarity(Polarity),

    // DIP switches - Right bank
    DipSwap(bool),
    DipMiso(bool),
    DipSpread(bool),
    DipTrails(bool),
    DipLatch(bool),
    DipFeedType(bool),
    DipFadeType(bool),
    DipModType(bool),

    // Utility
    MidiClockIgnore(bool),
    RampBounce(bool),
    DryKill(bool),
    Expression(u8),
    PresetSave(u8),
}

/// Modulation sync mode (CC 21)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ModSync {
    Sync, // 1
    Off,  // 2
    Free, // 3
}

impl ModSync {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::Sync => 1,
            Self::Off => 2,
            Self::Free => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            0..=1 => Ok(Self::Sync),
            2 => Ok(Self::Off),
            _ => Ok(Self::Free),
        }
    }
}

/// Modulation type (CC 22)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ModType {
    Vib,  // 1
    Trem, // 2
    Freq, // 3
}

impl ModType {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::Vib => 1,
            Self::Trem => 2,
            Self::Freq => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            0..=1 => Ok(Self::Vib),
            2 => Ok(Self::Trem),
            _ => Ok(Self::Freq),
        }
    }
}

/// Sequence mode (CC 23)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SequenceMode {
    Run, // 1
    Off, // 2
    Env, // 3
}

impl SequenceMode {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::Run => 1,
            Self::Off => 2,
            Self::Env => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            0..=1 => Ok(Self::Run),
            2 => Ok(Self::Off),
            _ => Ok(Self::Env),
        }
    }
}

/// Octave type (CC 31)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OctaveType {
    OctDown, // 1
    BothOct, // 2
    OctUp,   // 3
}

impl OctaveType {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::OctDown => 1,
            Self::BothOct => 2,
            Self::OctUp => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            0..=1 => Ok(Self::OctDown),
            2 => Ok(Self::BothOct),
            _ => Ok(Self::OctUp),
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
        if value < 64 { Self::Bottom } else { Self::Top }
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
        if value < 64 { Self::Forward } else { Self::Reverse }
    }
}

/// Encode sequence_spacing bool to CC value (CC 33)
/// false = Rest (value 1), true = Skip (value 2)
pub fn sequence_spacing_to_cc(active: bool) -> u8 {
    if active { 2 } else { 1 }
}

/// Decode CC 33 value to sequence_spacing bool
pub fn sequence_spacing_from_cc(value: u8) -> bool {
    value >= 2
}

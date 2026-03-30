// Mood MkII domain types

use crate::midi::error::{MidiError, MidiResult};
use serde::{Deserialize, Serialize};

/// Complete state of all Mood MkII parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoodMkiiState {
    // Main knobs
    pub time: u8,
    pub mix: u8,
    pub length: u8,
    pub modify_wet: u8,
    pub clock: u8,
    pub modify_looper: u8,
    pub ramp_speed: u8,

    // Three-position toggles
    pub wet_channel_routing: WetChannelRouting,
    pub routing: MoodRouting,
    pub micro_looper: MicroLooper,

    // Hidden options
    pub stereo_width: u8,
    pub ramping_waveform: u8,
    pub fade: u8,
    pub tone: u8,
    pub level_balance: u8,
    pub direct_micro_loop: u8,
    pub sync: MoodSync,
    pub spread: MoodSpread,
    pub buffer_length: bool, // false = HalfMki (1), true = Full (2)

    // Footswitches
    pub bypass_left: bool,
    pub bypass_right: bool,
    pub hidden_menu: bool,
    pub freeze: bool,
    pub overdub: bool,

    // Left DIP bank (CC 61-68)
    pub dip_time: bool,
    pub dip_modify_wet: bool,
    pub dip_clock: bool,
    pub dip_modify_looper: bool,
    pub dip_length: bool,
    pub dip_bounce: bool,
    pub dip_sweep: SweepDirection,
    pub dip_polarity: Polarity,

    // Right DIP bank (CC 71-78)
    pub dip_classic: bool,
    pub dip_miso: bool,
    pub dip_spread: bool,
    pub dip_dry_kill: bool,
    pub dip_trails: bool,
    pub dip_latch: bool,
    pub dip_no_dub: bool,
    pub dip_smooth: bool,

    // Utility
    pub midi_clock_ignore: bool,
    pub ramp_bounce: bool,
    pub expression: u8,
}

impl Default for MoodMkiiState {
    fn default() -> Self {
        Self {
            time: 64,
            mix: 64,
            length: 64,
            modify_wet: 64,
            clock: 64,
            modify_looper: 64,
            ramp_speed: 64,
            wet_channel_routing: WetChannelRouting::Reverb,
            routing: MoodRouting::Lfo,
            micro_looper: MicroLooper::Env,
            stereo_width: 64,
            ramping_waveform: 64,
            fade: 64,
            tone: 64,
            level_balance: 64,
            direct_micro_loop: 64,
            sync: MoodSync::On,
            spread: MoodSpread::Only,
            buffer_length: false,
            bypass_left: false,
            bypass_right: false,
            hidden_menu: false,
            freeze: false,
            overdub: false,
            dip_time: false,
            dip_modify_wet: false,
            dip_clock: false,
            dip_modify_looper: false,
            dip_length: false,
            dip_bounce: false,
            dip_sweep: SweepDirection::Bottom,
            dip_polarity: Polarity::Forward,
            dip_classic: false,
            dip_miso: false,
            dip_spread: false,
            dip_dry_kill: false,
            dip_trails: false,
            dip_latch: false,
            dip_no_dub: false,
            dip_smooth: false,
            midi_clock_ignore: false,
            ramp_bounce: false,
            expression: 0,
        }
    }
}

/// All possible Mood MkII parameters with their values
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MoodMkiiParameter {
    // Main knobs
    Time(u8),
    Mix(u8),
    Length(u8),
    ModifyWet(u8),
    Clock(u8),
    ModifyLooper(u8),
    RampSpeed(u8),

    // Three-position toggles
    WetChannelRouting(WetChannelRouting),
    Routing(MoodRouting),
    MicroLooper(MicroLooper),

    // Hidden options
    StereoWidth(u8),
    RampingWaveform(u8),
    Fade(u8),
    Tone(u8),
    LevelBalance(u8),
    DirectMicroLoop(u8),
    Sync(MoodSync),
    Spread(MoodSpread),
    BufferLength(bool),

    // Footswitches
    BypassLeft(bool),
    BypassRight(bool),
    HiddenMenu(bool),
    Freeze(bool),
    Overdub(bool),

    // Left DIP bank
    DipTime(bool),
    DipModifyWet(bool),
    DipClock(bool),
    DipModifyLooper(bool),
    DipLength(bool),
    DipBounce(bool),
    DipSweep(SweepDirection),
    DipPolarity(Polarity),

    // Right DIP bank
    DipClassic(bool),
    DipMiso(bool),
    DipSpread(bool),
    DipDryKill(bool),
    DipTrails(bool),
    DipLatch(bool),
    DipNoDub(bool),
    DipSmooth(bool),

    // Utility
    MidiClockIgnore(bool),
    RampBounce(bool),
    Expression(u8),
    PresetSave(u8),
}

/// Wet channel routing toggle (CC 21)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum WetChannelRouting {
    Reverb, // 1
    Delay,  // 2
    Slip,   // 3
}

impl WetChannelRouting {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::Reverb => 1,
            Self::Delay => 2,
            Self::Slip => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(Self::Reverb),
            2 => Ok(Self::Delay),
            3 => Ok(Self::Slip),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// Routing toggle (CC 22)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MoodRouting {
    Lfo, // 1
    Mid, // 2
    Env, // 3
}

impl MoodRouting {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::Lfo => 1,
            Self::Mid => 2,
            Self::Env => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(Self::Lfo),
            2 => Ok(Self::Mid),
            3 => Ok(Self::Env),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// Micro-looper mode toggle (CC 23)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MicroLooper {
    Env,     // 1
    Tape,    // 2
    Stretch, // 3
}

impl MicroLooper {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::Env => 1,
            Self::Tape => 2,
            Self::Stretch => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(Self::Env),
            2 => Ok(Self::Tape),
            3 => Ok(Self::Stretch),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// Sync hidden option (CC 31)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MoodSync {
    On,     // 1
    NoSync, // 2
    Auto,   // 3
}

impl MoodSync {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::On => 1,
            Self::NoSync => 2,
            Self::Auto => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(Self::On),
            2 => Ok(Self::NoSync),
            3 => Ok(Self::Auto),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// Spread hidden option (CC 32)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MoodSpread {
    Only,    // 1
    Both,    // 2
    OnlyAlt, // 3
}

impl MoodSpread {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Self::Only => 1,
            Self::Both => 2,
            Self::OnlyAlt => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(Self::Only),
            2 => Ok(Self::Both),
            3 => Ok(Self::OnlyAlt),
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

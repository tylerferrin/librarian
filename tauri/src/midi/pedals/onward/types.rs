// Chase Bliss Audio Onward domain types

use crate::midi::error::{MidiError, MidiResult};
use serde::{Deserialize, Serialize};

/// Complete state of all Onward parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OnwardState {
    // Main control knobs
    pub size: u8,
    pub mix: u8,
    pub octave: u8,
    pub error: u8,
    pub sustain: u8,
    pub texture: u8,
    pub ramp_speed: u8,

    // Three-position toggles
    pub error_type: ErrorType,
    pub fade_mode: FadeMode,
    pub animate_mode: AnimateMode,

    // Hidden options
    pub sensitivity: u8,
    pub balance: u8,
    pub duck_depth: u8,
    pub error_blend: u8,
    pub user_fade: u8,
    pub filter: u8,
    pub error_routing: Routing,
    pub sustain_routing: Routing,
    pub effects_routing: Routing,

    // Footswitches
    pub freeze_bypass: bool,
    pub glitch_bypass: bool,
    pub alt_mode: bool,
    pub glitch_hold: bool,
    pub freeze_hold: bool,
    pub retrigger_glitch: bool,
    pub retrigger_freeze: bool,

    // DIP switches - Left bank
    pub dip_size: bool,
    pub dip_error: bool,
    pub dip_sustain: bool,
    pub dip_texture: bool,
    pub dip_octave: bool,
    pub dip_bounce: bool,
    pub dip_sweep: SweepDirection,
    pub dip_polarity: Polarity,

    // DIP switches - Right bank
    pub dip_miso: bool,
    pub dip_spread: bool,
    pub dip_latch: bool,
    pub dip_sidechain: bool,
    pub dip_duck: bool,
    pub dip_reverse: bool,
    pub dip_half_speed: bool,
    pub dip_manual: bool,

    // Utility
    pub midi_clock_ignore: bool,
    pub ramp_bounce: bool,
    pub dry_kill: bool,
    pub trails: bool,
    pub expression: u8,
}

impl Default for OnwardState {
    fn default() -> Self {
        Self {
            size: 64,
            mix: 64,
            octave: 64,
            error: 64,
            sustain: 64,
            texture: 64,
            ramp_speed: 64,

            error_type: ErrorType::Timing,
            fade_mode: FadeMode::Long,
            animate_mode: AnimateMode::Vibrato,

            sensitivity: 64,
            balance: 64,
            duck_depth: 64,
            error_blend: 64,
            user_fade: 64,
            filter: 64,
            error_routing: Routing::Glitch,
            sustain_routing: Routing::Glitch,
            effects_routing: Routing::Glitch,

            freeze_bypass: false,
            glitch_bypass: false,
            alt_mode: false,
            glitch_hold: false,
            freeze_hold: false,
            retrigger_glitch: false,
            retrigger_freeze: false,

            dip_size: false,
            dip_error: false,
            dip_sustain: false,
            dip_texture: false,
            dip_octave: false,
            dip_bounce: false,
            dip_sweep: SweepDirection::Bottom,
            dip_polarity: Polarity::Forward,

            dip_miso: false,
            dip_spread: false,
            dip_latch: false,
            dip_sidechain: false,
            dip_duck: false,
            dip_reverse: false,
            dip_half_speed: false,
            dip_manual: false,

            midi_clock_ignore: false,
            ramp_bounce: false,
            dry_kill: false,
            trails: false,
            expression: 0,
        }
    }
}

/// All possible Onward parameters with their values
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OnwardParameter {
    // Main knobs
    Size(u8),
    Mix(u8),
    Octave(u8),
    Error(u8),
    Sustain(u8),
    Texture(u8),
    RampSpeed(u8),

    // Toggles
    ErrorType(ErrorType),
    FadeMode(FadeMode),
    AnimateMode(AnimateMode),

    // Hidden options
    Sensitivity(u8),
    Balance(u8),
    DuckDepth(u8),
    ErrorBlend(u8),
    UserFade(u8),
    Filter(u8),
    ErrorRouting(Routing),
    SustainRouting(Routing),
    EffectsRouting(Routing),

    // Footswitches
    FreezeBypass(bool),
    GlitchBypass(bool),
    AltMode(bool),
    GlitchHold(bool),
    FreezeHold(bool),
    RetriggerGlitch(bool),
    RetriggerFreeze(bool),

    // DIP switches - Left bank
    DipSize(bool),
    DipError(bool),
    DipSustain(bool),
    DipTexture(bool),
    DipOctave(bool),
    DipBounce(bool),
    DipSweep(SweepDirection),
    DipPolarity(Polarity),

    // DIP switches - Right bank
    DipMiso(bool),
    DipSpread(bool),
    DipLatch(bool),
    DipSidechain(bool),
    DipDuck(bool),
    DipReverse(bool),
    DipHalfSpeed(bool),
    DipManual(bool),

    // Utility
    MidiClockIgnore(bool),
    RampBounce(bool),
    DryKill(bool),
    Trails(bool),
    Expression(u8),
    PresetSave(u8),
}

/// Three-position error type (CC 21)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ErrorType {
    Timing,    // 1
    Condition, // 2
    Playback,  // 3
}

impl ErrorType {
    pub fn to_cc_value(self) -> u8 {
        match self {
            ErrorType::Timing => 1,
            ErrorType::Condition => 2,
            ErrorType::Playback => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(ErrorType::Timing),
            2 => Ok(ErrorType::Condition),
            3 => Ok(ErrorType::Playback),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// Three-position fade mode (CC 22)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum FadeMode {
    Long, // 1
    User, // 2
    Short, // 3
}

impl FadeMode {
    pub fn to_cc_value(self) -> u8 {
        match self {
            FadeMode::Long => 1,
            FadeMode::User => 2,
            FadeMode::Short => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(FadeMode::Long),
            2 => Ok(FadeMode::User),
            3 => Ok(FadeMode::Short),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// Three-position animate mode (CC 23)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AnimateMode {
    Vibrato, // 1
    Off,     // 2
    Chorus,  // 3
}

impl AnimateMode {
    pub fn to_cc_value(self) -> u8 {
        match self {
            AnimateMode::Vibrato => 1,
            AnimateMode::Off => 2,
            AnimateMode::Chorus => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(AnimateMode::Vibrato),
            2 => Ok(AnimateMode::Off),
            3 => Ok(AnimateMode::Chorus),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// Three-position signal routing (CC 31, 32, 33)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Routing {
    Glitch, // 1
    Both,   // 2
    Freeze, // 3
}

impl Routing {
    pub fn to_cc_value(self) -> u8 {
        match self {
            Routing::Glitch => 1,
            Routing::Both => 2,
            Routing::Freeze => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(Routing::Glitch),
            2 => Ok(Routing::Both),
            3 => Ok(Routing::Freeze),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
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

/// DIP switch polarity (CC 68)
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

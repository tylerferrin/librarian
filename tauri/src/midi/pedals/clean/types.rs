// Chase Bliss Audio Clean domain types

use crate::midi::error::{MidiError, MidiResult};
use serde::{Deserialize, Serialize};

/// Complete state of all Clean parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanState {
    // Main control knobs
    pub dynamics: u8,
    pub sensitivity: u8,
    pub wet: u8,
    pub attack: u8,
    pub eq: u8,
    pub dry: u8,
    pub ramp_speed: u8,

    // Three-position toggles
    pub release_mode: ReleaseMode,
    pub effect_mode: EffectMode,
    pub physics_mode: PhysicsMode,

    // Hidden options
    pub noise_gate_release: u8,
    pub noise_gate_sens: u8,
    pub swell_in: u8,
    pub user_release: u8,
    pub balance_filter: u8,
    pub swell_out: u8,
    pub envelope_mode: EnvelopeMode,
    pub shifty_mode: u8, // Raw u8 — only 2 meaningful positions
    pub spread_routing: SpreadRouting,

    // Footswitches
    pub bypass: bool,
    pub swell: bool,
    pub alt_mode: bool,
    pub swell_hold: bool,
    pub dynamics_max: bool,

    // DIP switches - Left bank
    pub dip_dynamics: bool,
    pub dip_attack: bool,
    pub dip_eq: bool,
    pub dip_dry: bool,
    pub dip_wet: bool,
    pub dip_bounce: bool,
    pub dip_sweep: SweepDirection,
    pub dip_polarity: Polarity,

    // DIP switches - Right bank
    pub dip_miso: bool,
    pub dip_spread: bool,
    pub dip_latch: bool,
    pub dip_sidechain: bool,
    pub dip_noise_gate: bool,
    pub dip_motion: bool,
    pub dip_swell_aux: bool,
    pub dip_dusty: bool,

    // Utility
    pub ramp_bounce: bool,
    pub expression: u8,
}

impl Default for CleanState {
    fn default() -> Self {
        Self {
            dynamics: 64,
            sensitivity: 64,
            wet: 64,
            attack: 64,
            eq: 64,
            dry: 64,
            ramp_speed: 64,

            release_mode: ReleaseMode::Fast,
            effect_mode: EffectMode::Shifty,
            physics_mode: PhysicsMode::Wobbly,

            noise_gate_release: 64,
            noise_gate_sens: 64,
            swell_in: 64,
            user_release: 64,
            balance_filter: 64,
            swell_out: 64,
            envelope_mode: EnvelopeMode::Analog,
            shifty_mode: 1,
            spread_routing: SpreadRouting::Eq,

            bypass: false,
            swell: false,
            alt_mode: false,
            swell_hold: false,
            dynamics_max: false,

            dip_dynamics: false,
            dip_attack: false,
            dip_eq: false,
            dip_dry: false,
            dip_wet: false,
            dip_bounce: false,
            dip_sweep: SweepDirection::Bottom,
            dip_polarity: Polarity::Forward,

            dip_miso: false,
            dip_spread: false,
            dip_latch: false,
            dip_sidechain: false,
            dip_noise_gate: false,
            dip_motion: false,
            dip_swell_aux: false,
            dip_dusty: false,

            ramp_bounce: false,
            expression: 0,
        }
    }
}

/// All possible Clean parameters with their values
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CleanParameter {
    // Main knobs
    Dynamics(u8),
    Sensitivity(u8),
    Wet(u8),
    Attack(u8),
    Eq(u8),
    Dry(u8),
    RampSpeed(u8),

    // Toggles
    ReleaseMode(ReleaseMode),
    EffectMode(EffectMode),
    PhysicsMode(PhysicsMode),

    // Hidden options
    NoiseGateRelease(u8),
    NoiseGateSens(u8),
    SwellIn(u8),
    UserRelease(u8),
    BalanceFilter(u8),
    SwellOut(u8),
    EnvelopeMode(EnvelopeMode),
    ShiftyMode(u8),
    SpreadRouting(SpreadRouting),

    // Footswitches
    Bypass(bool),
    Swell(bool),
    AltMode(bool),
    SwellHold(bool),
    DynamicsMax(bool),

    // DIP switches - Left bank
    DipDynamics(bool),
    DipAttack(bool),
    DipEq(bool),
    DipDry(bool),
    DipWet(bool),
    DipBounce(bool),
    DipSweep(SweepDirection),
    DipPolarity(Polarity),

    // DIP switches - Right bank
    DipMiso(bool),
    DipSpread(bool),
    DipLatch(bool),
    DipSidechain(bool),
    DipNoiseGate(bool),
    DipMotion(bool),
    DipSwellAux(bool),
    DipDusty(bool),

    // Utility
    RampBounce(bool),
    Expression(u8),
    PresetSave(u8),
}

/// Three-position release mode (CC 21)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ReleaseMode {
    Fast, // 1
    User, // 2
    Slow, // 3
}

impl ReleaseMode {
    pub fn to_cc_value(self) -> u8 {
        match self {
            ReleaseMode::Fast => 1,
            ReleaseMode::User => 2,
            ReleaseMode::Slow => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(ReleaseMode::Fast),
            2 => Ok(ReleaseMode::User),
            3 => Ok(ReleaseMode::Slow),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// Three-position effect mode (CC 22)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EffectMode {
    Shifty,    // 1
    Manual,    // 2
    Modulated, // 3
}

impl EffectMode {
    pub fn to_cc_value(self) -> u8 {
        match self {
            EffectMode::Shifty => 1,
            EffectMode::Manual => 2,
            EffectMode::Modulated => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(EffectMode::Shifty),
            2 => Ok(EffectMode::Manual),
            3 => Ok(EffectMode::Modulated),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// Three-position physics mode (CC 23)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PhysicsMode {
    Wobbly, // 1
    Off,    // 2
    Twitchy, // 3
}

impl PhysicsMode {
    pub fn to_cc_value(self) -> u8 {
        match self {
            PhysicsMode::Wobbly => 1,
            PhysicsMode::Off => 2,
            PhysicsMode::Twitchy => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(PhysicsMode::Wobbly),
            2 => Ok(PhysicsMode::Off),
            3 => Ok(PhysicsMode::Twitchy),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// Three-position envelope mode (CC 31)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EnvelopeMode {
    Analog,   // 1
    Hybrid,   // 2
    Adaptive, // 3
}

impl EnvelopeMode {
    pub fn to_cc_value(self) -> u8 {
        match self {
            EnvelopeMode::Analog => 1,
            EnvelopeMode::Hybrid => 2,
            EnvelopeMode::Adaptive => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(EnvelopeMode::Analog),
            2 => Ok(EnvelopeMode::Hybrid),
            3 => Ok(EnvelopeMode::Adaptive),
            _ => Err(MidiError::InvalidValue {
                expected: "1-3".to_string(),
                actual: value,
            }),
        }
    }
}

/// Three-position spread routing (CC 33)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SpreadRouting {
    Eq,      // 1
    Both,    // 2
    VolComp, // 3
}

impl SpreadRouting {
    pub fn to_cc_value(self) -> u8 {
        match self {
            SpreadRouting::Eq => 1,
            SpreadRouting::Both => 2,
            SpreadRouting::VolComp => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            1 => Ok(SpreadRouting::Eq),
            2 => Ok(SpreadRouting::Both),
            3 => Ok(SpreadRouting::VolComp),
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

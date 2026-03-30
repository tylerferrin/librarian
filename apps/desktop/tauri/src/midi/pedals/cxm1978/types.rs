// Chase Bliss / Meris CXM 1978 Automatone domain types

use serde::{Deserialize, Serialize};

/// Complete state of all CXM 1978 parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cxm1978State {
    // Faders (0-127)
    pub bass: u8,      // CC# 14 — bass decay time
    pub mids: u8,      // CC# 15 — mids decay time
    pub cross: u8,     // CC# 16 — crossover frequency
    pub treble: u8,    // CC# 17 — treble level
    pub mix: u8,       // CC# 18 — wet/dry mix
    pub pre_dly: u8,   // CC# 19 — pre-delay time

    // Arcade buttons (enum values)
    pub jump: Jump,          // CC# 22
    pub reverb_type: ReverbType,  // CC# 23
    pub diffusion: Diffusion,     // CC# 24
    pub tank_mod: TankMod,        // CC# 25
    pub clock: Clock,             // CC# 26

    // Other controls
    pub expression: u8,  // CC# 100
    pub bypass: bool,    // CC# 102 (0=bypass, 1-127=engage)
}

impl Default for Cxm1978State {
    fn default() -> Self {
        Self {
            bass: 64,
            mids: 64,
            cross: 64,
            treble: 64,
            mix: 64,
            pre_dly: 0,
            jump: Jump::Off,
            reverb_type: ReverbType::Room,
            diffusion: Diffusion::Med,
            tank_mod: TankMod::Low,
            clock: Clock::Standard,
            expression: 0,
            bypass: false,
        }
    }
}

// ============================================================================
// Value Objects — Enums representing domain concepts
// ============================================================================

/// Jump button — quick preset navigation (CC# 22, values 1-3)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Jump {
    Off,   // 1
    Zero,  // 2 (jump to preset 0)
    Five,  // 3 (jump to preset 5)
}

/// Reverb type (CC# 23, values 1-3)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ReverbType {
    Room,   // 1
    Plate,  // 2
    Hall,   // 3
}

/// Diffusion — early reflection density (CC# 24, values 1-3)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Diffusion {
    Low,   // 1
    Med,   // 2
    High,  // 3
}

/// Tank modulation depth (CC# 25, values 1-3)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TankMod {
    Low,   // 1
    Med,   // 2
    High,  // 3
}

/// Clock quality / reverb engine rate (CC# 26, values 1-3)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Clock {
    HiFi,      // 1
    Standard,  // 2
    LoFi,      // 3
}

/// All possible CXM 1978 parameters with their values
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Cxm1978Parameter {
    // Faders
    Bass(u8),
    Mids(u8),
    Cross(u8),
    Treble(u8),
    Mix(u8),
    PreDly(u8),

    // Arcade buttons
    Jump(Jump),
    ReverbType(ReverbType),
    Diffusion(Diffusion),
    TankMod(TankMod),
    Clock(Clock),

    // Other controls
    Expression(u8),
    Bypass(bool),
}

// ============================================================================
// Domain Logic — Methods on domain types
// ============================================================================

impl Jump {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            Jump::Off => 1,
            Jump::Zero => 2,
            Jump::Five => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> Self {
        match value {
            2 => Jump::Zero,
            3 => Jump::Five,
            _ => Jump::Off,
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            Jump::Off => "Off",
            Jump::Zero => "Jump to 0",
            Jump::Five => "Jump to 5",
        }
    }
}

impl ReverbType {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            ReverbType::Room => 1,
            ReverbType::Plate => 2,
            ReverbType::Hall => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> Self {
        match value {
            2 => ReverbType::Plate,
            3 => ReverbType::Hall,
            _ => ReverbType::Room,
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            ReverbType::Room => "Room",
            ReverbType::Plate => "Plate",
            ReverbType::Hall => "Hall",
        }
    }
}

impl Diffusion {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            Diffusion::Low => 1,
            Diffusion::Med => 2,
            Diffusion::High => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> Self {
        match value {
            1 => Diffusion::Low,
            3 => Diffusion::High,
            _ => Diffusion::Med,
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            Diffusion::Low => "Low",
            Diffusion::Med => "Med",
            Diffusion::High => "High",
        }
    }
}

impl TankMod {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            TankMod::Low => 1,
            TankMod::Med => 2,
            TankMod::High => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> Self {
        match value {
            1 => TankMod::Low,
            3 => TankMod::High,
            _ => TankMod::Med,
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            TankMod::Low => "Low",
            TankMod::Med => "Med",
            TankMod::High => "High",
        }
    }
}

impl Clock {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            Clock::HiFi => 1,
            Clock::Standard => 2,
            Clock::LoFi => 3,
        }
    }

    pub fn from_cc_value(value: u8) -> Self {
        match value {
            1 => Clock::HiFi,
            3 => Clock::LoFi,
            _ => Clock::Standard,
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            Clock::HiFi => "HiFi",
            Clock::Standard => "Standard",
            Clock::LoFi => "LoFi",
        }
    }
}

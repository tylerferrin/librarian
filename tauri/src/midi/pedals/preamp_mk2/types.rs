// Chase Bliss Preamp MK II domain types - enums, structs, and value objects

use serde::{Deserialize, Serialize};

/// Complete state of all Preamp MK II parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PreampMk2State {
    // Faders (0-127)
    pub volume: u8,        // CC# 14
    pub treble: u8,        // CC# 15
    pub mids: u8,          // CC# 16
    pub frequency: u8,     // CC# 17
    pub bass: u8,          // CC# 18
    pub gain: u8,          // CC# 19
    
    // Arcade buttons (enum values)
    pub jump: Jump,                        // CC# 22
    pub mids_position: MidsPosition,       // CC# 23
    pub q_resonance: QResonance,           // CC# 24
    pub diode_clipping: DiodeClipping,     // CC# 25
    pub fuzz_mode: FuzzMode,               // CC# 26
    
    // Other controls
    pub expression: u8,    // CC# 100
    pub bypass: bool,      // CC# 102
}

impl Default for PreampMk2State {
    fn default() -> Self {
        Self {
            volume: 64,
            treble: 64,
            mids: 64,
            frequency: 64,
            bass: 64,
            gain: 64,
            jump: Jump::Off,
            mids_position: MidsPosition::Post,
            q_resonance: QResonance::Mid,
            diode_clipping: DiodeClipping::Off,
            fuzz_mode: FuzzMode::Off,
            expression: 0,
            bypass: false,
        }
    }
}

// ============================================================================
// Value Objects - Enums representing domain concepts
// ============================================================================

/// Jump button - quick preset navigation (CC# 22, values 1-3)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Jump {
    Off,   // 1
    Zero,  // 2 (jump to preset 0)
    Five,  // 3 (jump to preset 5)
}

/// Mids position - before or after preamp (CC# 23, values 1-3)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MidsPosition {
    Off,   // 1
    Pre,   // 2 (before preamp)
    Post,  // 3 (after preamp)
}

/// Q resonance - parametric mids width (CC# 24, values 1-3)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum QResonance {
    Low,   // 1 (wider hump/scoop)
    Mid,   // 2 (more focused)
    High,  // 3 (very narrow)
}

/// Diode clipping mode (CC# 25, values 1-3)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DiodeClipping {
    Off,       // 1 (transistor only, stock Benson)
    Silicon,   // 2 (symmetrical silicon)
    Germanium, // 3 (asymmetrical germanium)
}

/// Fuzz mode (CC# 26, values 1-3)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum FuzzMode {
    Off,    // 1
    Open,   // 2 (wide open fuzz)
    Gated,  // 3 (gated version)
}

/// All possible Preamp MK II parameters with their values
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PreampMk2Parameter {
    // Faders
    Volume(u8),
    Treble(u8),
    Mids(u8),
    Frequency(u8),
    Bass(u8),
    Gain(u8),
    
    // Arcade buttons
    Jump(Jump),
    MidsPosition(MidsPosition),
    QResonance(QResonance),
    DiodeClipping(DiodeClipping),
    FuzzMode(FuzzMode),
    
    // Other controls
    Expression(u8),
    Bypass(bool),
}

// ============================================================================
// Domain Logic - Methods on domain types
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
            1 => Jump::Off,
            2 => Jump::Zero,
            3 => Jump::Five,
            _ => Jump::Off, // Default to Off for out-of-range values
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

impl MidsPosition {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            MidsPosition::Off => 1,
            MidsPosition::Pre => 2,
            MidsPosition::Post => 3,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        match value {
            1 => MidsPosition::Off,
            2 => MidsPosition::Pre,
            3 => MidsPosition::Post,
            _ => MidsPosition::Off,
        }
    }
    
    pub fn name(&self) -> &'static str {
        match self {
            MidsPosition::Off => "Off",
            MidsPosition::Pre => "Pre",
            MidsPosition::Post => "Post",
        }
    }
}

impl QResonance {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            QResonance::Low => 1,
            QResonance::Mid => 2,
            QResonance::High => 3,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        match value {
            1 => QResonance::Low,
            2 => QResonance::Mid,
            3 => QResonance::High,
            _ => QResonance::Mid,
        }
    }
    
    pub fn name(&self) -> &'static str {
        match self {
            QResonance::Low => "Low",
            QResonance::Mid => "Mid",
            QResonance::High => "High",
        }
    }
}

impl DiodeClipping {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            DiodeClipping::Off => 1,
            DiodeClipping::Silicon => 2,
            DiodeClipping::Germanium => 3,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        match value {
            1 => DiodeClipping::Off,
            2 => DiodeClipping::Silicon,
            3 => DiodeClipping::Germanium,
            _ => DiodeClipping::Off,
        }
    }
    
    pub fn name(&self) -> &'static str {
        match self {
            DiodeClipping::Off => "Off",
            DiodeClipping::Silicon => "Silicon",
            DiodeClipping::Germanium => "Germanium",
        }
    }
}

impl FuzzMode {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            FuzzMode::Off => 1,
            FuzzMode::Open => 2,
            FuzzMode::Gated => 3,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        match value {
            1 => FuzzMode::Off,
            2 => FuzzMode::Open,
            3 => FuzzMode::Gated,
            _ => FuzzMode::Off,
        }
    }
    
    pub fn name(&self) -> &'static str {
        match self {
            FuzzMode::Off => "Off",
            FuzzMode::Open => "Open",
            FuzzMode::Gated => "Gated",
        }
    }
}

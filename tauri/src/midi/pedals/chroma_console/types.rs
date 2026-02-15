// Chroma Console domain types - enums, structs, and value objects

use serde::{Deserialize, Serialize};

/// Complete state of all Chroma Console parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChromaConsoleState {
    // Primary controls (main knobs on pedal)
    pub tilt: u8,              // CC# 64
    pub rate: u8,              // CC# 66
    pub time: u8,              // CC# 68
    pub mix: u8,               // CC# 70
    pub amount_character: u8,  // CC# 65
    pub amount_movement: u8,   // CC# 67
    pub amount_diffusion: u8,  // CC# 69
    pub amount_texture: u8,    // CC# 71
    
    // Secondary controls
    pub sensitivity: u8,        // CC# 72
    pub drift_movement: u8,     // CC# 74
    pub drift_diffusion: u8,    // CC# 76
    pub output_level: u8,       // CC# 78
    pub effect_vol_character: u8,  // CC# 73
    pub effect_vol_movement: u8,   // CC# 75
    pub effect_vol_diffusion: u8,  // CC# 77
    pub effect_vol_texture: u8,    // CC# 79
    
    // Module selections
    pub character_module: CharacterModule,   // CC# 16
    pub movement_module: MovementModule,     // CC# 17
    pub diffusion_module: DiffusionModule,   // CC# 18
    pub texture_module: TextureModule,       // CC# 19
    
    // Bypass controls
    pub bypass_state: BypassState,           // CC# 91 or CC# 92
    pub character_bypass: bool,              // CC# 103
    pub movement_bypass: bool,               // CC# 104
    pub diffusion_bypass: bool,              // CC# 105
    pub texture_bypass: bool,                // CC# 106
    
    // Other functions
    pub gesture_mode: GestureMode,           // CC# 80
    pub capture_mode: CaptureMode,           // CC# 82
    pub capture_routing: CaptureRouting,     // CC# 83
    pub filter_mode: FilterMode,             // CC# 84
    pub calibration_level: CalibrationLevel, // CC# 94
}

impl Default for ChromaConsoleState {
    fn default() -> Self {
        Self {
            tilt: 64,
            rate: 64,
            time: 64,
            mix: 64,
            amount_character: 64,
            amount_movement: 64,
            amount_diffusion: 64,
            amount_texture: 64,
            sensitivity: 64,
            drift_movement: 64,
            drift_diffusion: 64,
            output_level: 100,
            effect_vol_character: 100,
            effect_vol_movement: 100,
            effect_vol_diffusion: 100,
            effect_vol_texture: 100,
            character_module: CharacterModule::Off,
            movement_module: MovementModule::Off,
            diffusion_module: DiffusionModule::Off,
            texture_module: TextureModule::Off,
            bypass_state: BypassState::Bypass,
            character_bypass: false,
            movement_bypass: false,
            diffusion_bypass: false,
            texture_bypass: false,
            gesture_mode: GestureMode::Play,
            capture_mode: CaptureMode::Stop,
            capture_routing: CaptureRouting::PostFx,
            filter_mode: FilterMode::Lpf,
            calibration_level: CalibrationLevel::Medium,
        }
    }
}

// ============================================================================
// Value Objects - Enums representing domain concepts
// ============================================================================

/// Character module effects (CC# 16)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CharacterModule {
    Drive,    // 0-21
    Sweeten,  // 22-43
    Fuzz,     // 44-65
    Howl,     // 66-87
    Swell,    // 88-109
    Off,      // 110-127
}

/// Movement module effects (CC# 17)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MovementModule {
    Doubler,  // 0-21
    Vibrato,  // 22-43
    Phaser,   // 44-65
    Tremolo,  // 66-87
    Pitch,    // 88-109
    Off,      // 110-127
}

/// Diffusion module effects (CC# 18)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DiffusionModule {
    Cascade,  // 0-21
    Reels,    // 22-43
    Space,    // 44-65
    Collage,  // 66-87
    Reverse,  // 88-109
    Off,      // 110-127
}

/// Texture module effects (CC# 19)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TextureModule {
    Filter,       // 0-21
    Squash,       // 22-43
    Cassette,     // 44-65
    Broken,       // 66-87
    Interference, // 88-109
    Off,          // 110-127
}

/// Overall bypass state (CC# 91 or CC# 92)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum BypassState {
    Bypass,       // CC# 91: 0-63 or CC# 92: 0-31
    Engaged,      // CC# 91: 64-127 or CC# 92: 64-127
    DualBypass,   // CC# 92: 32-63 (only for dual bypass mode)
}

/// Gesture play/record mode (CC# 80)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum GestureMode {
    Play,    // 0-63
    Record,  // 64-127
}

/// Capture mode (CC# 82)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CaptureMode {
    Stop,    // 0-43
    Play,    // 44-87
    Record,  // 88-127
}

/// Capture routing (CC# 83)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CaptureRouting {
    PostFx,  // 0-63
    PreFx,   // 64-127
}

/// Filter mode (CC# 84)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum FilterMode {
    Lpf,   // 0-43 (Low Pass Filter)
    Tilt,  // 44-87
    Hpf,   // 88-127 (High Pass Filter)
}

/// Calibration level (CC# 94)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CalibrationLevel {
    Low,      // 0-31
    Medium,   // 32-63
    High,     // 64-95
    VeryHigh, // 96-127
}

/// All possible Chroma Console parameters with their values
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChromaConsoleParameter {
    // Primary controls
    Tilt(u8),
    Rate(u8),
    Time(u8),
    Mix(u8),
    AmountCharacter(u8),
    AmountMovement(u8),
    AmountDiffusion(u8),
    AmountTexture(u8),
    
    // Secondary controls
    Sensitivity(u8),
    DriftMovement(u8),
    DriftDiffusion(u8),
    OutputLevel(u8),
    EffectVolCharacter(u8),
    EffectVolMovement(u8),
    EffectVolDiffusion(u8),
    EffectVolTexture(u8),
    
    // Module selections
    CharacterModule(CharacterModule),
    MovementModule(MovementModule),
    DiffusionModule(DiffusionModule),
    TextureModule(TextureModule),
    
    // Bypass controls
    BypassState(BypassState),
    CharacterBypass(bool),
    MovementBypass(bool),
    DiffusionBypass(bool),
    TextureBypass(bool),
    
    // Other functions
    GestureMode(GestureMode),
    GestureStop,  // CC# 81 (trigger)
    CaptureMode(CaptureMode),
    CaptureRouting(CaptureRouting),
    TapTempo,  // CC# 93 (trigger)
    FilterMode(FilterMode),
    CalibrationLevel(CalibrationLevel),
    CalibrationEnter(bool),  // CC# 95
}

// ============================================================================
// Domain Logic - Methods on domain types
// ============================================================================

impl CharacterModule {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            CharacterModule::Drive => 10,
            CharacterModule::Sweeten => 32,
            CharacterModule::Fuzz => 54,
            CharacterModule::Howl => 76,
            CharacterModule::Swell => 98,
            CharacterModule::Off => 120,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        match value {
            0..=21 => CharacterModule::Drive,
            22..=43 => CharacterModule::Sweeten,
            44..=65 => CharacterModule::Fuzz,
            66..=87 => CharacterModule::Howl,
            88..=109 => CharacterModule::Swell,
            _ => CharacterModule::Off,
        }
    }
    
    pub fn name(&self) -> &'static str {
        match self {
            CharacterModule::Drive => "Drive",
            CharacterModule::Sweeten => "Sweeten",
            CharacterModule::Fuzz => "Fuzz",
            CharacterModule::Howl => "Howl",
            CharacterModule::Swell => "Swell",
            CharacterModule::Off => "Off",
        }
    }
}

impl MovementModule {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            MovementModule::Doubler => 10,
            MovementModule::Vibrato => 32,
            MovementModule::Phaser => 54,
            MovementModule::Tremolo => 76,
            MovementModule::Pitch => 98,
            MovementModule::Off => 120,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        match value {
            0..=21 => MovementModule::Doubler,
            22..=43 => MovementModule::Vibrato,
            44..=65 => MovementModule::Phaser,
            66..=87 => MovementModule::Tremolo,
            88..=109 => MovementModule::Pitch,
            _ => MovementModule::Off,
        }
    }
    
    pub fn name(&self) -> &'static str {
        match self {
            MovementModule::Doubler => "Doubler",
            MovementModule::Vibrato => "Vibrato",
            MovementModule::Phaser => "Phaser",
            MovementModule::Tremolo => "Tremolo",
            MovementModule::Pitch => "Pitch",
            MovementModule::Off => "Off",
        }
    }
}

impl DiffusionModule {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            DiffusionModule::Cascade => 10,
            DiffusionModule::Reels => 32,
            DiffusionModule::Space => 54,
            DiffusionModule::Collage => 76,
            DiffusionModule::Reverse => 98,
            DiffusionModule::Off => 120,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        match value {
            0..=21 => DiffusionModule::Cascade,
            22..=43 => DiffusionModule::Reels,
            44..=65 => DiffusionModule::Space,
            66..=87 => DiffusionModule::Collage,
            88..=109 => DiffusionModule::Reverse,
            _ => DiffusionModule::Off,
        }
    }
    
    pub fn name(&self) -> &'static str {
        match self {
            DiffusionModule::Cascade => "Cascade",
            DiffusionModule::Reels => "Reels",
            DiffusionModule::Space => "Space",
            DiffusionModule::Collage => "Collage",
            DiffusionModule::Reverse => "Reverse",
            DiffusionModule::Off => "Off",
        }
    }
}

impl TextureModule {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            TextureModule::Filter => 10,
            TextureModule::Squash => 32,
            TextureModule::Cassette => 54,
            TextureModule::Broken => 76,
            TextureModule::Interference => 98,
            TextureModule::Off => 120,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        match value {
            0..=21 => TextureModule::Filter,
            22..=43 => TextureModule::Squash,
            44..=65 => TextureModule::Cassette,
            66..=87 => TextureModule::Broken,
            88..=109 => TextureModule::Interference,
            _ => TextureModule::Off,
        }
    }
    
    pub fn name(&self) -> &'static str {
        match self {
            TextureModule::Filter => "Filter",
            TextureModule::Squash => "Squash",
            TextureModule::Cassette => "Cassette",
            TextureModule::Broken => "Broken",
            TextureModule::Interference => "Interference",
            TextureModule::Off => "Off",
        }
    }
}

impl GestureMode {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            GestureMode::Play => 0,
            GestureMode::Record => 127,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        if value < 64 {
            GestureMode::Play
        } else {
            GestureMode::Record
        }
    }
}

impl CaptureMode {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            CaptureMode::Stop => 21,
            CaptureMode::Play => 65,
            CaptureMode::Record => 108,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        match value {
            0..=43 => CaptureMode::Stop,
            44..=87 => CaptureMode::Play,
            _ => CaptureMode::Record,
        }
    }
}

impl CaptureRouting {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            CaptureRouting::PostFx => 0,
            CaptureRouting::PreFx => 127,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        if value < 64 {
            CaptureRouting::PostFx
        } else {
            CaptureRouting::PreFx
        }
    }
}

impl FilterMode {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            FilterMode::Lpf => 21,
            FilterMode::Tilt => 65,
            FilterMode::Hpf => 108,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        match value {
            0..=43 => FilterMode::Lpf,
            44..=87 => FilterMode::Tilt,
            _ => FilterMode::Hpf,
        }
    }
    
    pub fn name(&self) -> &'static str {
        match self {
            FilterMode::Lpf => "LPF",
            FilterMode::Tilt => "Tilt",
            FilterMode::Hpf => "HPF",
        }
    }
}

impl CalibrationLevel {
    pub fn to_cc_value(&self) -> u8 {
        match self {
            CalibrationLevel::Low => 15,
            CalibrationLevel::Medium => 47,
            CalibrationLevel::High => 79,
            CalibrationLevel::VeryHigh => 111,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        match value {
            0..=31 => CalibrationLevel::Low,
            32..=63 => CalibrationLevel::Medium,
            64..=95 => CalibrationLevel::High,
            _ => CalibrationLevel::VeryHigh,
        }
    }
    
    pub fn name(&self) -> &'static str {
        match self {
            CalibrationLevel::Low => "Low",
            CalibrationLevel::Medium => "Medium",
            CalibrationLevel::High => "High",
            CalibrationLevel::VeryHigh => "Very High",
        }
    }
}

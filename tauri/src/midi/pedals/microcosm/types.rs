// Microcosm domain types - enums, structs, and value objects

use serde::{Deserialize, Serialize};

/// Complete state of all Microcosm parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MicrocosmState {
    // Current effect selection
    pub current_effect: EffectType,
    pub current_variation: EffectVariation,
    
    // Time controls
    pub subdivision: SubdivisionValue,
    pub time: u8,
    pub hold_sampler: bool,
    
    // Special Sauce
    pub activity: u8,
    pub repeats: u8,
    
    // Modulation
    pub shape: WaveformShape,
    pub frequency: u8,
    pub depth: u8,
    
    // Filter
    pub cutoff: u8,
    pub resonance: u8,
    
    // Effect
    pub mix: u8,
    pub volume: u8,
    pub reverse_effect: bool,
    pub bypass: bool,
    
    // Reverb
    pub space: u8,
    pub reverb_time: u8,
    
    // Looper
    pub loop_level: u8,
    pub looper_speed: u8,
    pub looper_speed_stepped: SubdivisionValue,
    pub fade_time: u8,
    pub looper_enabled: bool,
    pub playback_direction: PlaybackDirection,
    pub routing: LooperRouting,
    pub looper_only: bool,
    pub burst_mode: bool,
    pub quantized: bool,
}

impl Default for MicrocosmState {
    fn default() -> Self {
        Self {
            current_effect: EffectType::Mosaic,
            current_variation: EffectVariation::A,
            subdivision: SubdivisionValue::QuarterNote,
            time: 64,
            hold_sampler: false,
            activity: 64,
            repeats: 64,
            shape: WaveformShape::Square,
            frequency: 64,
            depth: 64,
            cutoff: 127,
            resonance: 0,
            mix: 64,
            volume: 100,
            reverse_effect: false,
            bypass: false,
            space: 0,
            reverb_time: 0,
            loop_level: 100,
            looper_speed: 64,
            looper_speed_stepped: SubdivisionValue::QuarterNote,
            fade_time: 64,
            looper_enabled: false,
            playback_direction: PlaybackDirection::Forward,
            routing: LooperRouting::PostFX,
            looper_only: false,
            burst_mode: false,
            quantized: false,
        }
    }
}

// ============================================================================
// Value Objects - Enums representing domain concepts
// ============================================================================

/// Time subdivision values (CC 5 and CC 18)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SubdivisionValue {
    QuarterNote,  // 0
    HalfNote,     // 1
    Tap,          // 2
    Double,       // 3 (2x)
    Quadruple,    // 4 (4x)
    Octuple,      // 5 (8x)
}

/// Modulation waveform shapes (CC 7)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum WaveformShape {
    Square,   // 0-31
    Ramp,     // 32-63
    Triangle, // 64-95
    Saw,      // 96-127
}

/// Looper playback direction (CC 23)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PlaybackDirection {
    Forward,  // 0-63
    Reverse,  // 64-127
}

/// Looper signal routing (CC 24)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum LooperRouting {
    PostFX,  // 0-63
    PreFX,   // 64-127
}

/// Microcosm effect categories (in pedal order)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EffectCategory {
    MicroLoop,   // Mosaic, Seq, Glide
    Granules,    // Haze, Tunnel, Strum
    MultiDelay,  // Blocks, Interrupt, Arp (labeled "Glitch" in UI)
    MultiPass,   // Pattern, Warp (labeled "Multi Delay" in UI)
}

/// Individual effect types within categories
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EffectType {
    // Micro Loop
    Mosaic,
    Seq,
    Glide,
    // Glitch
    Blocks,
    Interrupt,
    Arp,
    // Granules
    Haze,
    Tunnel,
    Strum,
    // Multi Delay
    Pattern,
    Warp,
}

/// Effect variation (A, B, C, D for each effect)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EffectVariation {
    A,
    B,
    C,
    D,
}

/// All possible Microcosm parameters with their values
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MicrocosmParameter {
    // Time
    Subdivision(SubdivisionValue),
    Time(u8),
    HoldSampler(bool),
    TapTempo,  // Trigger only
    
    // Special Sauce
    Activity(u8),
    Repeats(u8),
    
    // Modulation
    Shape(WaveformShape),
    Frequency(u8),
    Depth(u8),
    
    // Filter
    Cutoff(u8),
    Resonance(u8),
    
    // Effect
    Mix(u8),
    Volume(u8),
    ReverseEffect(bool),  // Binary: 0-63 = Forward, 64-127 = Reverse
    Bypass(bool),
    
    // Reverb
    Space(u8),
    ReverbTime(u8),
    
    // Looper
    LoopLevel(u8),
    LooperSpeed(u8),
    LooperSpeedStepped(SubdivisionValue),
    FadeTime(u8),
    LooperEnabled(bool),
    PlaybackDirection(PlaybackDirection),
    Routing(LooperRouting),
    LooperOnly(bool),
    BurstMode(bool),
    Quantized(bool),
    
    // Looper transport
    LooperRecord,
    LooperPlay,
    LooperOverdub,
    LooperStop,
    LooperErase,
    LooperUndo,
    
    // Preset
    PresetCopy,
    PresetSave,
}

// ============================================================================
// Domain Logic - Methods on domain types
// ============================================================================

impl EffectType {
    /// Get the category this effect belongs to
    pub fn category(&self) -> EffectCategory {
        match self {
            EffectType::Mosaic | EffectType::Seq | EffectType::Glide => EffectCategory::MicroLoop,
            EffectType::Haze | EffectType::Tunnel | EffectType::Strum => EffectCategory::Granules,
            EffectType::Blocks | EffectType::Interrupt | EffectType::Arp => EffectCategory::MultiDelay,
            EffectType::Pattern | EffectType::Warp => EffectCategory::MultiPass,
        }
    }
    
    /// Get the base program number for this effect (variation A)
    pub fn base_program(&self) -> u8 {
        match self {
            // Glitch bank (programs 0-11) - UI labels swapped from actual pedal
            EffectType::Blocks => 8,      // UI: Blocks → Pedal: Arp
            EffectType::Interrupt => 4,
            EffectType::Arp => 0,         // UI: Arp → Pedal: Blocks
            // Micro Loop bank (programs 12-23) - UI labels swapped from actual pedal
            EffectType::Mosaic => 20,     // UI: Mosaic → Pedal: Glide
            EffectType::Seq => 16,
            EffectType::Glide => 12,      // UI: Glide → Pedal: Mosaic
            // Remaining banks (programs 24-43)
            EffectType::Haze => 24,
            EffectType::Tunnel => 28,
            EffectType::Strum => 32,
            EffectType::Pattern => 36,
            EffectType::Warp => 40,
        }
    }
    
    /// Get the MIDI program number for this effect with a variation
    pub fn program_number(&self, variation: EffectVariation) -> u8 {
        self.base_program() + variation.offset()
    }
    
    /// Get effect type from a program number
    pub fn from_program(program: u8) -> Option<(Self, EffectVariation)> {
        let effect = match program / 4 {
            0 => EffectType::Arp,      // Program 0-3: Pedal Blocks → UI shows Arp
            1 => EffectType::Interrupt,
            2 => EffectType::Blocks,   // Program 8-11: Pedal Arp → UI shows Blocks
            3 => EffectType::Glide,    // Program 12-15: Pedal Mosaic → UI shows Glide
            4 => EffectType::Seq,
            5 => EffectType::Mosaic,   // Program 20-23: Pedal Glide → UI shows Mosaic
            6 => EffectType::Haze,
            7 => EffectType::Tunnel,
            8 => EffectType::Strum,
            9 => EffectType::Pattern,
            10 => EffectType::Warp,
            _ => return None,
        };
        let variation = EffectVariation::from_offset(program % 4)?;
        Some((effect, variation))
    }
    
    /// Human-readable name
    pub fn name(&self) -> &'static str {
        match self {
            EffectType::Mosaic => "Mosaic",
            EffectType::Seq => "Seq",
            EffectType::Glide => "Glide",
            EffectType::Blocks => "Blocks",
            EffectType::Interrupt => "Interrupt",
            EffectType::Arp => "Arp",
            EffectType::Haze => "Haze",
            EffectType::Tunnel => "Tunnel",
            EffectType::Strum => "Strum",
            EffectType::Pattern => "Pattern",
            EffectType::Warp => "Warp",
        }
    }
}

impl EffectVariation {
    pub fn offset(&self) -> u8 {
        match self {
            EffectVariation::A => 0,
            EffectVariation::B => 1,
            EffectVariation::C => 2,
            EffectVariation::D => 3,
        }
    }
    
    pub fn from_offset(offset: u8) -> Option<Self> {
        match offset {
            0 => Some(EffectVariation::A),
            1 => Some(EffectVariation::B),
            2 => Some(EffectVariation::C),
            3 => Some(EffectVariation::D),
            _ => None,
        }
    }
}

impl EffectCategory {
    pub fn name(&self) -> &'static str {
        match self {
            EffectCategory::MicroLoop => "Micro Loop",
            EffectCategory::Granules => "Granules",
            EffectCategory::MultiDelay => "Glitch",
            EffectCategory::MultiPass => "Multi Delay",
        }
    }
    
    /// Get all effect types in this category
    pub fn effects(&self) -> Vec<EffectType> {
        match self {
            EffectCategory::MicroLoop => vec![EffectType::Mosaic, EffectType::Seq, EffectType::Glide],
            EffectCategory::Granules => vec![EffectType::Haze, EffectType::Tunnel, EffectType::Strum],
            EffectCategory::MultiDelay => vec![EffectType::Blocks, EffectType::Interrupt, EffectType::Arp],
            EffectCategory::MultiPass => vec![EffectType::Pattern, EffectType::Warp],
        }
    }
}

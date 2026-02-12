// Hologram Microcosm MIDI implementation
// 35 MIDI-controllable parameters

use crate::midi::error::{MidiError, MidiResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Hologram Microcosm pedal with complete MIDI control
#[derive(Debug)]
pub struct Microcosm {
    pub state: MicrocosmState,
    pub midi_channel: u8,
}

/// Complete state of all Microcosm parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MicrocosmState {
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
    pub bypass: bool,
    
    // Reverb
    pub space: u8,
    pub reverb_mode: ReverbMode,
    
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

impl SubdivisionValue {
    pub fn to_cc_value(self) -> u8 {
        match self {
            SubdivisionValue::QuarterNote => 0,
            SubdivisionValue::HalfNote => 1,
            SubdivisionValue::Tap => 2,
            SubdivisionValue::Double => 3,
            SubdivisionValue::Quadruple => 4,
            SubdivisionValue::Octuple => 5,
        }
    }
    
    pub fn from_cc_value(value: u8) -> MidiResult<Self> {
        match value {
            0 => Ok(SubdivisionValue::QuarterNote),
            1 => Ok(SubdivisionValue::HalfNote),
            2 => Ok(SubdivisionValue::Tap),
            3 => Ok(SubdivisionValue::Double),
            4 => Ok(SubdivisionValue::Quadruple),
            5 => Ok(SubdivisionValue::Octuple),
            _ => Err(MidiError::InvalidValue {
                expected: "0-5".to_string(),
                actual: value,
            }),
        }
    }
}

/// Modulation waveform shapes (CC 7)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum WaveformShape {
    Square,   // 0-31
    Ramp,     // 32-63
    Triangle, // 64-95
    Saw,      // 96-127
}

impl WaveformShape {
    pub fn to_cc_value(self) -> u8 {
        match self {
            WaveformShape::Square => 16,    // Mid-range of 0-31
            WaveformShape::Ramp => 48,      // Mid-range of 32-63
            WaveformShape::Triangle => 80,  // Mid-range of 64-95
            WaveformShape::Saw => 112,      // Mid-range of 96-127
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        match value {
            0..=31 => WaveformShape::Square,
            32..=63 => WaveformShape::Ramp,
            64..=95 => WaveformShape::Triangle,
            _ => WaveformShape::Saw, // 96-127 and beyond (though u8 max is 255, MIDI max is 127)
        }
    }
}

/// Reverb mode selection (CC 20)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ReverbMode {
    BrightRoom,  // 0-31
    DarkMedium,  // 32-63
    LargeHall,   // 64-95
    Ambient,     // 96-127
}

impl ReverbMode {
    pub fn to_cc_value(self) -> u8 {
        match self {
            ReverbMode::BrightRoom => 16,
            ReverbMode::DarkMedium => 48,
            ReverbMode::LargeHall => 80,
            ReverbMode::Ambient => 112,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        match value {
            0..=31 => ReverbMode::BrightRoom,
            32..=63 => ReverbMode::DarkMedium,
            64..=95 => ReverbMode::LargeHall,
            _ => ReverbMode::Ambient, // 96-127 and beyond
        }
    }
}

/// Looper playback direction (CC 23)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PlaybackDirection {
    Forward,  // 0-63
    Reverse,  // 64-127
}

impl PlaybackDirection {
    pub fn to_cc_value(self) -> u8 {
        match self {
            PlaybackDirection::Forward => 0,
            PlaybackDirection::Reverse => 127,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        if value < 64 {
            PlaybackDirection::Forward
        } else {
            PlaybackDirection::Reverse
        }
    }
}

/// Looper signal routing (CC 24)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum LooperRouting {
    PostFX,  // 0-63
    PreFX,   // 64-127
}

impl LooperRouting {
    pub fn to_cc_value(self) -> u8 {
        match self {
            LooperRouting::PostFX => 0,
            LooperRouting::PreFX => 127,
        }
    }
    
    pub fn from_cc_value(value: u8) -> Self {
        if value < 64 {
            LooperRouting::PostFX
        } else {
            LooperRouting::PreFX
        }
    }
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
    ReverseEffect,  // Trigger
    Bypass(bool),
    
    // Reverb
    Space(u8),
    ReverbMode(ReverbMode),
    
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

impl MicrocosmParameter {
    /// Get the CC number for this parameter
    pub fn cc_number(&self) -> u8 {
        match self {
            // Time
            MicrocosmParameter::Subdivision(_) => 5,
            MicrocosmParameter::Time(_) => 10,
            MicrocosmParameter::HoldSampler(_) => 48,
            MicrocosmParameter::TapTempo => 93,
            
            // Special Sauce
            MicrocosmParameter::Activity(_) => 6,
            MicrocosmParameter::Repeats(_) => 11,
            
            // Modulation
            MicrocosmParameter::Shape(_) => 7,
            MicrocosmParameter::Frequency(_) => 14,
            MicrocosmParameter::Depth(_) => 19,
            
            // Filter
            MicrocosmParameter::Cutoff(_) => 8,
            MicrocosmParameter::Resonance(_) => 15,
            
            // Effect
            MicrocosmParameter::Mix(_) => 9,
            MicrocosmParameter::Volume(_) => 16,
            MicrocosmParameter::ReverseEffect => 47,
            MicrocosmParameter::Bypass(_) => 102,
            
            // Reverb
            MicrocosmParameter::Space(_) => 12,
            MicrocosmParameter::ReverbMode(_) => 20,
            
            // Looper
            MicrocosmParameter::LoopLevel(_) => 13,
            MicrocosmParameter::LooperSpeed(_) => 17,
            MicrocosmParameter::LooperSpeedStepped(_) => 18,
            MicrocosmParameter::FadeTime(_) => 21,
            MicrocosmParameter::LooperEnabled(_) => 22,
            MicrocosmParameter::PlaybackDirection(_) => 23,
            MicrocosmParameter::Routing(_) => 24,
            MicrocosmParameter::LooperOnly(_) => 25,
            MicrocosmParameter::BurstMode(_) => 26,
            MicrocosmParameter::Quantized(_) => 27,
            
            // Looper transport
            MicrocosmParameter::LooperRecord => 28,
            MicrocosmParameter::LooperPlay => 29,
            MicrocosmParameter::LooperOverdub => 30,
            MicrocosmParameter::LooperStop => 31,
            MicrocosmParameter::LooperErase => 34,
            MicrocosmParameter::LooperUndo => 35,
            
            // Preset
            MicrocosmParameter::PresetCopy => 45,
            MicrocosmParameter::PresetSave => 46,
        }
    }
    
    /// Get the CC value for this parameter
    pub fn cc_value(&self) -> u8 {
        match self {
            // Continuous parameters (0-127)
            MicrocosmParameter::Time(v) |
            MicrocosmParameter::Activity(v) |
            MicrocosmParameter::Repeats(v) |
            MicrocosmParameter::Frequency(v) |
            MicrocosmParameter::Depth(v) |
            MicrocosmParameter::Cutoff(v) |
            MicrocosmParameter::Resonance(v) |
            MicrocosmParameter::Mix(v) |
            MicrocosmParameter::Volume(v) |
            MicrocosmParameter::Space(v) |
            MicrocosmParameter::LoopLevel(v) |
            MicrocosmParameter::LooperSpeed(v) |
            MicrocosmParameter::FadeTime(v) => *v,
            
            // Stepped/enum parameters
            MicrocosmParameter::Subdivision(s) |
            MicrocosmParameter::LooperSpeedStepped(s) => s.to_cc_value(),
            MicrocosmParameter::Shape(s) => s.to_cc_value(),
            MicrocosmParameter::ReverbMode(m) => m.to_cc_value(),
            MicrocosmParameter::PlaybackDirection(d) => d.to_cc_value(),
            MicrocosmParameter::Routing(r) => r.to_cc_value(),
            
            // Binary parameters (0-63 = Off, 64-127 = On)
            MicrocosmParameter::HoldSampler(b) |
            MicrocosmParameter::Bypass(b) |
            MicrocosmParameter::LooperEnabled(b) |
            MicrocosmParameter::LooperOnly(b) |
            MicrocosmParameter::BurstMode(b) |
            MicrocosmParameter::Quantized(b) => if *b { 127 } else { 0 },
            
            // Trigger parameters (any value triggers action)
            MicrocosmParameter::TapTempo |
            MicrocosmParameter::ReverseEffect |
            MicrocosmParameter::LooperRecord |
            MicrocosmParameter::LooperPlay |
            MicrocosmParameter::LooperOverdub |
            MicrocosmParameter::LooperStop |
            MicrocosmParameter::LooperErase |
            MicrocosmParameter::LooperUndo |
            MicrocosmParameter::PresetCopy |
            MicrocosmParameter::PresetSave => 127,
        }
    }
    
    /// Get a human-readable name for this parameter
    pub fn name(&self) -> &'static str {
        match self {
            MicrocosmParameter::Subdivision(_) => "Subdivision",
            MicrocosmParameter::Time(_) => "Time",
            MicrocosmParameter::HoldSampler(_) => "Hold Sampler",
            MicrocosmParameter::TapTempo => "Tap Tempo",
            MicrocosmParameter::Activity(_) => "Activity",
            MicrocosmParameter::Repeats(_) => "Repeats",
            MicrocosmParameter::Shape(_) => "Shape",
            MicrocosmParameter::Frequency(_) => "Frequency",
            MicrocosmParameter::Depth(_) => "Depth",
            MicrocosmParameter::Cutoff(_) => "Cutoff",
            MicrocosmParameter::Resonance(_) => "Resonance",
            MicrocosmParameter::Mix(_) => "Mix",
            MicrocosmParameter::Volume(_) => "Volume",
            MicrocosmParameter::ReverseEffect => "Reverse Effect",
            MicrocosmParameter::Bypass(_) => "Bypass",
            MicrocosmParameter::Space(_) => "Space",
            MicrocosmParameter::ReverbMode(_) => "Reverb Mode",
            MicrocosmParameter::LoopLevel(_) => "Loop Level",
            MicrocosmParameter::LooperSpeed(_) => "Looper Speed",
            MicrocosmParameter::LooperSpeedStepped(_) => "Looper Speed (Stepped)",
            MicrocosmParameter::FadeTime(_) => "Fade Time",
            MicrocosmParameter::LooperEnabled(_) => "Looper Enabled",
            MicrocosmParameter::PlaybackDirection(_) => "Playback Direction",
            MicrocosmParameter::Routing(_) => "Routing",
            MicrocosmParameter::LooperOnly(_) => "Looper Only",
            MicrocosmParameter::BurstMode(_) => "Burst Mode",
            MicrocosmParameter::Quantized(_) => "Quantized",
            MicrocosmParameter::LooperRecord => "Looper Record",
            MicrocosmParameter::LooperPlay => "Looper Play",
            MicrocosmParameter::LooperOverdub => "Looper Overdub",
            MicrocosmParameter::LooperStop => "Looper Stop",
            MicrocosmParameter::LooperErase => "Looper Erase",
            MicrocosmParameter::LooperUndo => "Looper Undo",
            MicrocosmParameter::PresetCopy => "Preset Copy",
            MicrocosmParameter::PresetSave => "Preset Save",
        }
    }
}

impl Default for MicrocosmState {
    fn default() -> Self {
        Self {
            // Time controls - sensible defaults
            subdivision: SubdivisionValue::QuarterNote,
            time: 64,
            hold_sampler: false,
            
            // Special Sauce - middle values
            activity: 64,
            repeats: 64,
            
            // Modulation - middle values
            shape: WaveformShape::Triangle,
            frequency: 64,
            depth: 64,
            
            // Filter - open filter
            cutoff: 127,
            resonance: 0,
            
            // Effect - balanced mix
            mix: 64,
            volume: 100,
            bypass: false,
            
            // Reverb - minimal
            space: 0,
            reverb_mode: ReverbMode::BrightRoom,
            
            // Looper - defaults
            loop_level: 100,
            looper_speed: 64,
            looper_speed_stepped: SubdivisionValue::Tap,
            fade_time: 32,
            looper_enabled: false,
            playback_direction: PlaybackDirection::Forward,
            routing: LooperRouting::PostFX,
            looper_only: false,
            burst_mode: false,
            quantized: false,
        }
    }
}

impl Microcosm {
    /// Create a new Microcosm instance with default state
    pub fn new(midi_channel: u8) -> Self {
        Self {
            state: MicrocosmState::default(),
            midi_channel,
        }
    }
    
    /// Update internal state from a parameter change
    pub fn update_state(&mut self, param: &MicrocosmParameter) {
        match param {
            MicrocosmParameter::Subdivision(v) => self.state.subdivision = *v,
            MicrocosmParameter::Time(v) => self.state.time = *v,
            MicrocosmParameter::HoldSampler(v) => self.state.hold_sampler = *v,
            MicrocosmParameter::Activity(v) => self.state.activity = *v,
            MicrocosmParameter::Repeats(v) => self.state.repeats = *v,
            MicrocosmParameter::Shape(v) => self.state.shape = *v,
            MicrocosmParameter::Frequency(v) => self.state.frequency = *v,
            MicrocosmParameter::Depth(v) => self.state.depth = *v,
            MicrocosmParameter::Cutoff(v) => self.state.cutoff = *v,
            MicrocosmParameter::Resonance(v) => self.state.resonance = *v,
            MicrocosmParameter::Mix(v) => self.state.mix = *v,
            MicrocosmParameter::Volume(v) => self.state.volume = *v,
            MicrocosmParameter::Bypass(v) => self.state.bypass = *v,
            MicrocosmParameter::Space(v) => self.state.space = *v,
            MicrocosmParameter::ReverbMode(v) => self.state.reverb_mode = *v,
            MicrocosmParameter::LoopLevel(v) => self.state.loop_level = *v,
            MicrocosmParameter::LooperSpeed(v) => self.state.looper_speed = *v,
            MicrocosmParameter::LooperSpeedStepped(v) => self.state.looper_speed_stepped = *v,
            MicrocosmParameter::FadeTime(v) => self.state.fade_time = *v,
            MicrocosmParameter::LooperEnabled(v) => self.state.looper_enabled = *v,
            MicrocosmParameter::PlaybackDirection(v) => self.state.playback_direction = *v,
            MicrocosmParameter::Routing(v) => self.state.routing = *v,
            MicrocosmParameter::LooperOnly(v) => self.state.looper_only = *v,
            MicrocosmParameter::BurstMode(v) => self.state.burst_mode = *v,
            MicrocosmParameter::Quantized(v) => self.state.quantized = *v,
            // Trigger actions don't update state
            _ => {}
        }
    }
    
    /// Get the current state as a hashmap of CC numbers to values
    pub fn state_as_cc_map(&self) -> HashMap<u8, u8> {
        let mut map = HashMap::new();
        
        // Continuous parameters
        map.insert(5, self.state.subdivision.to_cc_value());
        map.insert(10, self.state.time);
        map.insert(48, if self.state.hold_sampler { 127 } else { 0 });
        map.insert(6, self.state.activity);
        map.insert(11, self.state.repeats);
        map.insert(7, self.state.shape.to_cc_value());
        map.insert(14, self.state.frequency);
        map.insert(19, self.state.depth);
        map.insert(8, self.state.cutoff);
        map.insert(15, self.state.resonance);
        map.insert(9, self.state.mix);
        map.insert(16, self.state.volume);
        map.insert(102, if self.state.bypass { 127 } else { 0 });
        map.insert(12, self.state.space);
        map.insert(20, self.state.reverb_mode.to_cc_value());
        
        // Looper
        map.insert(13, self.state.loop_level);
        map.insert(17, self.state.looper_speed);
        map.insert(18, self.state.looper_speed_stepped.to_cc_value());
        map.insert(21, self.state.fade_time);
        map.insert(22, if self.state.looper_enabled { 127 } else { 0 });
        map.insert(23, self.state.playback_direction.to_cc_value());
        map.insert(24, self.state.routing.to_cc_value());
        map.insert(25, if self.state.looper_only { 127 } else { 0 });
        map.insert(26, if self.state.burst_mode { 127 } else { 0 });
        map.insert(27, if self.state.quantized { 127 } else { 0 });
        
        map
    }
}

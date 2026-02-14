// MIDI CC mapping for Microcosm parameters
// This module handles conversion between domain types and MIDI CC values

use super::types::*;
use crate::midi::error::{MidiError, MidiResult};
use std::collections::HashMap;

// ============================================================================
// Value Object <-> MIDI CC Conversions
// ============================================================================

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
            _ => WaveformShape::Saw, // 96-127
        }
    }
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

// ============================================================================
// Parameter <-> MIDI CC Mapping
// ============================================================================

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
            MicrocosmParameter::ReverseEffect(_) => 47,
            MicrocosmParameter::Bypass(_) => 102,
            
            // Reverb
            MicrocosmParameter::Space(_) => 12,
            MicrocosmParameter::ReverbTime(_) => 20,
            
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
            MicrocosmParameter::ReverbTime(v) |
            MicrocosmParameter::LoopLevel(v) |
            MicrocosmParameter::LooperSpeed(v) |
            MicrocosmParameter::FadeTime(v) => *v,
            
            // Stepped/enum parameters
            MicrocosmParameter::Subdivision(s) |
            MicrocosmParameter::LooperSpeedStepped(s) => s.to_cc_value(),
            MicrocosmParameter::Shape(s) => s.to_cc_value(),
            MicrocosmParameter::PlaybackDirection(d) => d.to_cc_value(),
            MicrocosmParameter::Routing(r) => r.to_cc_value(),
            
            // Binary parameters (0-63 = Off, 64-127 = On)
            MicrocosmParameter::HoldSampler(b) |
            MicrocosmParameter::Bypass(b) |
            MicrocosmParameter::ReverseEffect(b) |
            MicrocosmParameter::LooperEnabled(b) |
            MicrocosmParameter::LooperOnly(b) |
            MicrocosmParameter::BurstMode(b) |
            MicrocosmParameter::Quantized(b) => if *b { 127 } else { 0 },
            
            // Trigger parameters (any value triggers action)
            MicrocosmParameter::TapTempo |
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
            MicrocosmParameter::ReverseEffect(_) => "Reverse Effect",
            MicrocosmParameter::Bypass(_) => "Bypass",
            MicrocosmParameter::Space(_) => "Space",
            MicrocosmParameter::ReverbTime(_) => "Reverb Time",
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

// ============================================================================
// State <-> CC Map Conversion
// ============================================================================

impl MicrocosmState {
    /// Convert the current state to a hashmap of CC numbers to values
    /// Useful for sending a complete preset to the pedal
    pub fn to_cc_map(&self) -> HashMap<u8, u8> {
        let mut map = HashMap::new();
        
        // Time controls
        map.insert(5, self.subdivision.to_cc_value());
        map.insert(10, self.time);
        map.insert(48, if self.hold_sampler { 127 } else { 0 });
        
        // Special Sauce
        map.insert(6, self.activity);
        map.insert(11, self.repeats);
        
        // Modulation
        map.insert(7, self.shape.to_cc_value());
        map.insert(14, self.frequency);
        map.insert(19, self.depth);
        
        // Filter
        map.insert(8, self.cutoff);
        map.insert(15, self.resonance);
        
        // Effect
        map.insert(9, self.mix);
        map.insert(16, self.volume);
        map.insert(47, if self.reverse_effect { 127 } else { 0 });
        map.insert(102, if self.bypass { 127 } else { 0 });
        
        // Reverb
        map.insert(12, self.space);
        map.insert(20, self.reverb_time);
        
        // Looper
        map.insert(13, self.loop_level);
        map.insert(17, self.looper_speed);
        map.insert(18, self.looper_speed_stepped.to_cc_value());
        map.insert(21, self.fade_time);
        map.insert(22, if self.looper_enabled { 127 } else { 0 });
        map.insert(23, self.playback_direction.to_cc_value());
        map.insert(24, self.routing.to_cc_value());
        map.insert(25, if self.looper_only { 127 } else { 0 });
        map.insert(26, if self.burst_mode { 127 } else { 0 });
        map.insert(27, if self.quantized { 127 } else { 0 });
        
        map
    }
}

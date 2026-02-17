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

#[cfg(test)]
mod tests {
    use super::*;
    
    // Test SubdivisionValue conversions
    #[test]
    fn test_subdivision_to_cc() {
        assert_eq!(SubdivisionValue::QuarterNote.to_cc_value(), 0);
        assert_eq!(SubdivisionValue::HalfNote.to_cc_value(), 1);
        assert_eq!(SubdivisionValue::Tap.to_cc_value(), 2);
        assert_eq!(SubdivisionValue::Double.to_cc_value(), 3);
        assert_eq!(SubdivisionValue::Quadruple.to_cc_value(), 4);
        assert_eq!(SubdivisionValue::Octuple.to_cc_value(), 5);
    }
    
    #[test]
    fn test_subdivision_from_cc() {
        assert_eq!(
            SubdivisionValue::from_cc_value(0).unwrap(),
            SubdivisionValue::QuarterNote
        );
        assert_eq!(
            SubdivisionValue::from_cc_value(1).unwrap(),
            SubdivisionValue::HalfNote
        );
        assert_eq!(
            SubdivisionValue::from_cc_value(5).unwrap(),
            SubdivisionValue::Octuple
        );
        
        // Invalid value
        assert!(SubdivisionValue::from_cc_value(6).is_err());
    }
    
    // Test WaveformShape conversions
    #[test]
    fn test_waveform_to_cc() {
        assert_eq!(WaveformShape::Square.to_cc_value(), 16);
        assert_eq!(WaveformShape::Ramp.to_cc_value(), 48);
        assert_eq!(WaveformShape::Triangle.to_cc_value(), 80);
        assert_eq!(WaveformShape::Saw.to_cc_value(), 112);
    }
    
    #[test]
    fn test_waveform_from_cc() {
        assert_eq!(WaveformShape::from_cc_value(0), WaveformShape::Square);
        assert_eq!(WaveformShape::from_cc_value(31), WaveformShape::Square);
        assert_eq!(WaveformShape::from_cc_value(32), WaveformShape::Ramp);
        assert_eq!(WaveformShape::from_cc_value(63), WaveformShape::Ramp);
        assert_eq!(WaveformShape::from_cc_value(64), WaveformShape::Triangle);
        assert_eq!(WaveformShape::from_cc_value(95), WaveformShape::Triangle);
        assert_eq!(WaveformShape::from_cc_value(96), WaveformShape::Saw);
        assert_eq!(WaveformShape::from_cc_value(127), WaveformShape::Saw);
    }
    
    // Test PlaybackDirection conversions
    #[test]
    fn test_playback_direction_to_cc() {
        assert_eq!(PlaybackDirection::Forward.to_cc_value(), 0);
        assert_eq!(PlaybackDirection::Reverse.to_cc_value(), 127);
    }
    
    #[test]
    fn test_playback_direction_from_cc() {
        assert_eq!(
            PlaybackDirection::from_cc_value(0),
            PlaybackDirection::Forward
        );
        assert_eq!(
            PlaybackDirection::from_cc_value(63),
            PlaybackDirection::Forward
        );
        assert_eq!(
            PlaybackDirection::from_cc_value(64),
            PlaybackDirection::Reverse
        );
        assert_eq!(
            PlaybackDirection::from_cc_value(127),
            PlaybackDirection::Reverse
        );
    }
    
    // Test LooperRouting conversions
    #[test]
    fn test_looper_routing_to_cc() {
        assert_eq!(LooperRouting::PostFX.to_cc_value(), 0);
        assert_eq!(LooperRouting::PreFX.to_cc_value(), 127);
    }
    
    #[test]
    fn test_looper_routing_from_cc() {
        assert_eq!(LooperRouting::from_cc_value(0), LooperRouting::PostFX);
        assert_eq!(LooperRouting::from_cc_value(63), LooperRouting::PostFX);
        assert_eq!(LooperRouting::from_cc_value(64), LooperRouting::PreFX);
        assert_eq!(LooperRouting::from_cc_value(127), LooperRouting::PreFX);
    }
    
    // Test MicrocosmParameter CC numbers
    #[test]
    fn test_parameter_cc_numbers() {
        assert_eq!(MicrocosmParameter::Time(64).cc_number(), 10);
        assert_eq!(MicrocosmParameter::Activity(64).cc_number(), 6);
        assert_eq!(MicrocosmParameter::Mix(64).cc_number(), 9);
        assert_eq!(MicrocosmParameter::Subdivision(SubdivisionValue::Tap).cc_number(), 5);
        assert_eq!(MicrocosmParameter::TapTempo.cc_number(), 93);
    }
    
    // Test MicrocosmParameter CC values
    #[test]
    fn test_parameter_cc_values() {
        // Continuous parameters
        assert_eq!(MicrocosmParameter::Time(64).cc_value(), 64);
        assert_eq!(MicrocosmParameter::Activity(127).cc_value(), 127);
        assert_eq!(MicrocosmParameter::Mix(0).cc_value(), 0);
        
        // Binary parameters
        assert_eq!(MicrocosmParameter::Bypass(true).cc_value(), 127);
        assert_eq!(MicrocosmParameter::Bypass(false).cc_value(), 0);
        assert_eq!(MicrocosmParameter::LooperEnabled(true).cc_value(), 127);
        assert_eq!(MicrocosmParameter::LooperEnabled(false).cc_value(), 0);
        
        // Enum parameters
        assert_eq!(
            MicrocosmParameter::Subdivision(SubdivisionValue::Tap).cc_value(),
            2
        );
        assert_eq!(
            MicrocosmParameter::PlaybackDirection(PlaybackDirection::Reverse).cc_value(),
            127
        );
        
        // Trigger parameters
        assert_eq!(MicrocosmParameter::TapTempo.cc_value(), 127);
        assert_eq!(MicrocosmParameter::PresetSave.cc_value(), 127);
    }
    
    // Test MicrocosmParameter names
    #[test]
    fn test_parameter_names() {
        assert_eq!(MicrocosmParameter::Time(64).name(), "Time");
        assert_eq!(MicrocosmParameter::Activity(64).name(), "Activity");
        assert_eq!(MicrocosmParameter::Mix(64).name(), "Mix");
        assert_eq!(MicrocosmParameter::TapTempo.name(), "Tap Tempo");
    }
    
    // Test MicrocosmState to CC map conversion
    #[test]
    fn test_state_to_cc_map() {
        let state = MicrocosmState {
            current_effect: EffectType::Mosaic,
            current_variation: EffectVariation::B,
            subdivision: SubdivisionValue::Tap,
            time: 64,
            hold_sampler: true,
            tempo_mode: None,
            activity: 100,
            repeats: 50,
            shape: WaveformShape::Triangle,
            frequency: 80,
            depth: 60,
            cutoff: 90,
            resonance: 40,
            mix: 127,
            volume: 100,
            reverse_effect: false,
            bypass: false,
            space: 70,
            reverb_time: 90,
            loop_level: 80,
            looper_speed: 64,
            looper_speed_stepped: SubdivisionValue::QuarterNote,
            fade_time: 30,
            looper_enabled: true,
            playback_direction: PlaybackDirection::Forward,
            routing: LooperRouting::PreFX,
            looper_only: false,
            burst_mode: true,
            quantized: false,
        };
        
        let cc_map = state.to_cc_map();
        
        // Verify some key mappings
        assert_eq!(cc_map.get(&5), Some(&2)); // subdivision (Tap)
        assert_eq!(cc_map.get(&10), Some(&64)); // time
        assert_eq!(cc_map.get(&48), Some(&127)); // hold_sampler (true)
        assert_eq!(cc_map.get(&6), Some(&100)); // activity
        assert_eq!(cc_map.get(&9), Some(&127)); // mix
        assert_eq!(cc_map.get(&22), Some(&127)); // looper_enabled (true)
        assert_eq!(cc_map.get(&26), Some(&127)); // burst_mode (true)
        assert_eq!(cc_map.get(&27), Some(&0)); // quantized (false)
        
        // Verify all expected keys are present
        assert!(cc_map.contains_key(&5));  // subdivision
        assert!(cc_map.contains_key(&10)); // time
        assert!(cc_map.contains_key(&6));  // activity
        assert!(cc_map.contains_key(&9));  // mix
    }
    
    // Test round-trip conversions
    #[test]
    fn test_subdivision_round_trip() {
        for i in 0..=5 {
            let subdivision = SubdivisionValue::from_cc_value(i).unwrap();
            assert_eq!(subdivision.to_cc_value(), i);
        }
    }
    
    #[test]
    fn test_playback_direction_round_trip() {
        let forward = PlaybackDirection::Forward;
        assert_eq!(
            PlaybackDirection::from_cc_value(forward.to_cc_value()),
            forward
        );
        
        let reverse = PlaybackDirection::Reverse;
        assert_eq!(
            PlaybackDirection::from_cc_value(reverse.to_cc_value()),
            reverse
        );
    }
}

// Preamp MK II MIDI mapper - converts between domain types and MIDI CC messages

use super::types::*;
use std::collections::HashMap;

// ============================================================================
// MIDI CC Constants
// ============================================================================

// Faders (0-127)
pub const CC_VOLUME: u8 = 14;
pub const CC_TREBLE: u8 = 15;
pub const CC_MIDS: u8 = 16;
pub const CC_FREQUENCY: u8 = 17;
pub const CC_BASS: u8 = 18;
pub const CC_GAIN: u8 = 19;

// Arcade buttons (1-3)
pub const CC_JUMP: u8 = 22;
pub const CC_MIDS_POSITION: u8 = 23;
pub const CC_Q_RESONANCE: u8 = 24;
pub const CC_DIODE_CLIPPING: u8 = 25;
pub const CC_FUZZ_MODE: u8 = 26;

// Other controls
pub const CC_PRESET_SAVE: u8 = 27;
pub const CC_EXPRESSION: u8 = 100;
pub const CC_BYPASS: u8 = 102;

// ============================================================================
// State to CC Map Conversion
// ============================================================================

impl PreampMk2State {
    /// Convert state to a HashMap of CC numbers and values
    pub fn to_cc_map(&self) -> HashMap<u8, u8> {
        let mut map = HashMap::new();
        
        // Faders
        map.insert(CC_VOLUME, self.volume);
        map.insert(CC_TREBLE, self.treble);
        map.insert(CC_MIDS, self.mids);
        map.insert(CC_FREQUENCY, self.frequency);
        map.insert(CC_BASS, self.bass);
        map.insert(CC_GAIN, self.gain);
        
        // Arcade buttons
        map.insert(CC_JUMP, self.jump.to_cc_value());
        map.insert(CC_MIDS_POSITION, self.mids_position.to_cc_value());
        map.insert(CC_Q_RESONANCE, self.q_resonance.to_cc_value());
        map.insert(CC_DIODE_CLIPPING, self.diode_clipping.to_cc_value());
        map.insert(CC_FUZZ_MODE, self.fuzz_mode.to_cc_value());
        
        // NOTE: CC_EXPRESSION (CC 100) and CC_BYPASS (CC 102) are intentionally
        // excluded from the recall map. Expression represents a physical pedal
        // position — sending CC 100 = 0 would lock expression-assigned faders to
        // the heel position and cause them to ignore direct CC input. Bypass is a
        // live performance control and should not be overridden by preset recall.
        
        map
    }
    
    /// Update state from a CC message
    pub fn update_from_cc(&mut self, cc: u8, value: u8) {
        match cc {
            // Faders
            CC_VOLUME => self.volume = value,
            CC_TREBLE => self.treble = value,
            CC_MIDS => self.mids = value,
            CC_FREQUENCY => self.frequency = value,
            CC_BASS => self.bass = value,
            CC_GAIN => self.gain = value,
            
            // Arcade buttons
            CC_JUMP => self.jump = Jump::from_cc_value(value),
            CC_MIDS_POSITION => self.mids_position = MidsPosition::from_cc_value(value),
            CC_Q_RESONANCE => self.q_resonance = QResonance::from_cc_value(value),
            CC_DIODE_CLIPPING => self.diode_clipping = DiodeClipping::from_cc_value(value),
            CC_FUZZ_MODE => self.fuzz_mode = FuzzMode::from_cc_value(value),
            
            // Other controls
            CC_EXPRESSION => self.expression = value,
            CC_BYPASS => self.bypass = value == 0,  // 0 = bypass, 1-127 = engage
            
            // Ignore other CCs
            _ => {}
        }
    }
}

// ============================================================================
// Parameter to CC Conversion
// ============================================================================

impl PreampMk2Parameter {
    /// Get the CC number for this parameter
    pub fn cc_number(&self) -> u8 {
        match self {
            // Faders
            PreampMk2Parameter::Volume(_) => CC_VOLUME,
            PreampMk2Parameter::Treble(_) => CC_TREBLE,
            PreampMk2Parameter::Mids(_) => CC_MIDS,
            PreampMk2Parameter::Frequency(_) => CC_FREQUENCY,
            PreampMk2Parameter::Bass(_) => CC_BASS,
            PreampMk2Parameter::Gain(_) => CC_GAIN,
            
            // Arcade buttons
            PreampMk2Parameter::Jump(_) => CC_JUMP,
            PreampMk2Parameter::MidsPosition(_) => CC_MIDS_POSITION,
            PreampMk2Parameter::QResonance(_) => CC_Q_RESONANCE,
            PreampMk2Parameter::DiodeClipping(_) => CC_DIODE_CLIPPING,
            PreampMk2Parameter::FuzzMode(_) => CC_FUZZ_MODE,
            
            // Other controls
            PreampMk2Parameter::Expression(_) => CC_EXPRESSION,
            PreampMk2Parameter::Bypass(_) => CC_BYPASS,
        }
    }
    
    /// Get the CC value for this parameter
    pub fn cc_value(&self) -> u8 {
        match self {
            // Faders (0-127)
            PreampMk2Parameter::Volume(v) |
            PreampMk2Parameter::Treble(v) |
            PreampMk2Parameter::Mids(v) |
            PreampMk2Parameter::Frequency(v) |
            PreampMk2Parameter::Bass(v) |
            PreampMk2Parameter::Gain(v) |
            PreampMk2Parameter::Expression(v) => *v,
            
            // Arcade buttons (use to_cc_value)
            PreampMk2Parameter::Jump(j) => j.to_cc_value(),
            PreampMk2Parameter::MidsPosition(m) => m.to_cc_value(),
            PreampMk2Parameter::QResonance(q) => q.to_cc_value(),
            PreampMk2Parameter::DiodeClipping(d) => d.to_cc_value(),
            PreampMk2Parameter::FuzzMode(f) => f.to_cc_value(),
            
            // Bypass (0 = bypass, 127 = engage)
            PreampMk2Parameter::Bypass(b) => if *b { 0 } else { 127 },
        }
    }
    
    /// Convert parameter to (CC number, value) tuple
    pub fn to_cc_message(&self) -> Option<(u8, u8)> {
        match self {
            // Faders
            PreampMk2Parameter::Volume(v) => Some((CC_VOLUME, *v)),
            PreampMk2Parameter::Treble(v) => Some((CC_TREBLE, *v)),
            PreampMk2Parameter::Mids(v) => Some((CC_MIDS, *v)),
            PreampMk2Parameter::Frequency(v) => Some((CC_FREQUENCY, *v)),
            PreampMk2Parameter::Bass(v) => Some((CC_BASS, *v)),
            PreampMk2Parameter::Gain(v) => Some((CC_GAIN, *v)),
            
            // Arcade buttons
            PreampMk2Parameter::Jump(j) => Some((CC_JUMP, j.to_cc_value())),
            PreampMk2Parameter::MidsPosition(m) => Some((CC_MIDS_POSITION, m.to_cc_value())),
            PreampMk2Parameter::QResonance(q) => Some((CC_Q_RESONANCE, q.to_cc_value())),
            PreampMk2Parameter::DiodeClipping(d) => Some((CC_DIODE_CLIPPING, d.to_cc_value())),
            PreampMk2Parameter::FuzzMode(f) => Some((CC_FUZZ_MODE, f.to_cc_value())),
            
            // Other controls
            PreampMk2Parameter::Expression(v) => Some((CC_EXPRESSION, *v)),
            PreampMk2Parameter::Bypass(b) => Some((CC_BYPASS, if *b { 0 } else { 127 })),
        }
    }
    
    /// Get human-readable name for this parameter
    pub fn name(&self) -> &'static str {
        match self {
            PreampMk2Parameter::Volume(_) => "Volume",
            PreampMk2Parameter::Treble(_) => "Treble",
            PreampMk2Parameter::Mids(_) => "Mids",
            PreampMk2Parameter::Frequency(_) => "Frequency",
            PreampMk2Parameter::Bass(_) => "Bass",
            PreampMk2Parameter::Gain(_) => "Gain",
            PreampMk2Parameter::Jump(_) => "Jump",
            PreampMk2Parameter::MidsPosition(_) => "Mids Position",
            PreampMk2Parameter::QResonance(_) => "Q Resonance",
            PreampMk2Parameter::DiodeClipping(_) => "Diode Clipping",
            PreampMk2Parameter::FuzzMode(_) => "Fuzz Mode",
            PreampMk2Parameter::Expression(_) => "Expression",
            PreampMk2Parameter::Bypass(_) => "Bypass",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_jump_cc_conversion() {
        assert_eq!(Jump::from_cc_value(1), Jump::Off);
        assert_eq!(Jump::from_cc_value(2), Jump::Zero);
        assert_eq!(Jump::from_cc_value(3), Jump::Five);
        assert_eq!(Jump::Off.to_cc_value(), 1);
        assert_eq!(Jump::Zero.to_cc_value(), 2);
        assert_eq!(Jump::Five.to_cc_value(), 3);
    }

    #[test]
    fn test_mids_position_cc_conversion() {
        assert_eq!(MidsPosition::from_cc_value(1), MidsPosition::Off);
        assert_eq!(MidsPosition::from_cc_value(2), MidsPosition::Pre);
        assert_eq!(MidsPosition::from_cc_value(3), MidsPosition::Post);
    }

    #[test]
    fn test_state_to_cc_map() {
        let state = PreampMk2State::default();
        let cc_map = state.to_cc_map();
        
        assert_eq!(cc_map.get(&CC_VOLUME), Some(&64));
        assert_eq!(cc_map.get(&CC_GAIN), Some(&64));
        assert_eq!(cc_map.get(&CC_JUMP), Some(&1)); // Jump::Off = 1
    }

    #[test]
    fn test_parameter_to_cc_message() {
        let param = PreampMk2Parameter::Volume(100);
        assert_eq!(param.to_cc_message(), Some((CC_VOLUME, 100)));
        
        let param = PreampMk2Parameter::Jump(Jump::Five);
        assert_eq!(param.to_cc_message(), Some((CC_JUMP, 3)));
        
        let param = PreampMk2Parameter::Bypass(false);
        assert_eq!(param.to_cc_message(), Some((CC_BYPASS, 127)));
    }
}

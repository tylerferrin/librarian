// CXM 1978 MIDI mapper — converts between domain types and MIDI CC messages

use super::types::*;
use std::collections::HashMap;

// ============================================================================
// MIDI CC Constants
// ============================================================================

// Faders (0-127)
pub const CC_BASS: u8 = 14;
pub const CC_MIDS: u8 = 15;
pub const CC_CROSS: u8 = 16;
pub const CC_TREBLE: u8 = 17;
pub const CC_MIX: u8 = 18;
pub const CC_PRE_DLY: u8 = 19;

// Arcade buttons (1-3)
pub const CC_JUMP: u8 = 22;
pub const CC_REVERB_TYPE: u8 = 23;
pub const CC_DIFFUSION: u8 = 24;
pub const CC_TANK_MOD: u8 = 25;
pub const CC_CLOCK: u8 = 26;

// Other controls
pub const CC_PRESET_SAVE: u8 = 27;
pub const CC_EXPRESSION: u8 = 100;
pub const CC_BYPASS: u8 = 102;

// ============================================================================
// State to CC Map Conversion
// ============================================================================

impl Cxm1978State {
    /// Convert state to a HashMap of CC numbers and values
    pub fn to_cc_map(&self) -> HashMap<u8, u8> {
        let mut map = HashMap::new();

        // Faders
        map.insert(CC_BASS, self.bass);
        map.insert(CC_MIDS, self.mids);
        map.insert(CC_CROSS, self.cross);
        map.insert(CC_TREBLE, self.treble);
        map.insert(CC_MIX, self.mix);
        map.insert(CC_PRE_DLY, self.pre_dly);

        // Arcade buttons
        map.insert(CC_JUMP, self.jump.to_cc_value());
        map.insert(CC_REVERB_TYPE, self.reverb_type.to_cc_value());
        map.insert(CC_DIFFUSION, self.diffusion.to_cc_value());
        map.insert(CC_TANK_MOD, self.tank_mod.to_cc_value());
        map.insert(CC_CLOCK, self.clock.to_cc_value());

        // NOTE: CC_EXPRESSION (CC 100) and CC_BYPASS (CC 102) are intentionally
        // excluded from the recall map. Expression represents a physical pedal
        // position — sending CC 100 = 0 would lock expression-assigned faders to
        // the heel position. Bypass is a live performance control that should not
        // be overridden by preset recall.

        map
    }

    /// Update state from an incoming CC message
    pub fn update_from_cc(&mut self, cc: u8, value: u8) {
        match cc {
            // Faders
            CC_BASS => self.bass = value,
            CC_MIDS => self.mids = value,
            CC_CROSS => self.cross = value,
            CC_TREBLE => self.treble = value,
            CC_MIX => self.mix = value,
            CC_PRE_DLY => self.pre_dly = value,

            // Arcade buttons
            CC_JUMP => self.jump = Jump::from_cc_value(value),
            CC_REVERB_TYPE => self.reverb_type = ReverbType::from_cc_value(value),
            CC_DIFFUSION => self.diffusion = Diffusion::from_cc_value(value),
            CC_TANK_MOD => self.tank_mod = TankMod::from_cc_value(value),
            CC_CLOCK => self.clock = Clock::from_cc_value(value),

            // Other controls
            CC_EXPRESSION => self.expression = value,
            CC_BYPASS => self.bypass = value == 0, // 0 = bypass, 1-127 = engage

            _ => {}
        }
    }
}

// ============================================================================
// Parameter to CC Conversion
// ============================================================================

impl Cxm1978Parameter {
    /// Get the CC number for this parameter
    pub fn cc_number(&self) -> u8 {
        match self {
            Cxm1978Parameter::Bass(_) => CC_BASS,
            Cxm1978Parameter::Mids(_) => CC_MIDS,
            Cxm1978Parameter::Cross(_) => CC_CROSS,
            Cxm1978Parameter::Treble(_) => CC_TREBLE,
            Cxm1978Parameter::Mix(_) => CC_MIX,
            Cxm1978Parameter::PreDly(_) => CC_PRE_DLY,
            Cxm1978Parameter::Jump(_) => CC_JUMP,
            Cxm1978Parameter::ReverbType(_) => CC_REVERB_TYPE,
            Cxm1978Parameter::Diffusion(_) => CC_DIFFUSION,
            Cxm1978Parameter::TankMod(_) => CC_TANK_MOD,
            Cxm1978Parameter::Clock(_) => CC_CLOCK,
            Cxm1978Parameter::Expression(_) => CC_EXPRESSION,
            Cxm1978Parameter::Bypass(_) => CC_BYPASS,
        }
    }

    /// Get the CC value for this parameter
    pub fn cc_value(&self) -> u8 {
        match self {
            // Faders (0-127)
            Cxm1978Parameter::Bass(v)
            | Cxm1978Parameter::Mids(v)
            | Cxm1978Parameter::Cross(v)
            | Cxm1978Parameter::Treble(v)
            | Cxm1978Parameter::Mix(v)
            | Cxm1978Parameter::PreDly(v)
            | Cxm1978Parameter::Expression(v) => *v,

            // Arcade buttons
            Cxm1978Parameter::Jump(j) => j.to_cc_value(),
            Cxm1978Parameter::ReverbType(t) => t.to_cc_value(),
            Cxm1978Parameter::Diffusion(d) => d.to_cc_value(),
            Cxm1978Parameter::TankMod(t) => t.to_cc_value(),
            Cxm1978Parameter::Clock(c) => c.to_cc_value(),

            // Bypass (0 = bypass, 127 = engage)
            Cxm1978Parameter::Bypass(b) => if *b { 0 } else { 127 },
        }
    }

    /// Convert parameter to (CC number, value) tuple
    pub fn to_cc_message(&self) -> Option<(u8, u8)> {
        Some((self.cc_number(), self.cc_value()))
    }

    /// Get human-readable name for this parameter
    pub fn name(&self) -> &'static str {
        match self {
            Cxm1978Parameter::Bass(_) => "Bass",
            Cxm1978Parameter::Mids(_) => "Mids",
            Cxm1978Parameter::Cross(_) => "Cross",
            Cxm1978Parameter::Treble(_) => "Treble",
            Cxm1978Parameter::Mix(_) => "Mix",
            Cxm1978Parameter::PreDly(_) => "Pre-Delay",
            Cxm1978Parameter::Jump(_) => "Jump",
            Cxm1978Parameter::ReverbType(_) => "Type",
            Cxm1978Parameter::Diffusion(_) => "Diffusion",
            Cxm1978Parameter::TankMod(_) => "Tank Mod",
            Cxm1978Parameter::Clock(_) => "Clock",
            Cxm1978Parameter::Expression(_) => "Expression",
            Cxm1978Parameter::Bypass(_) => "Bypass",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_reverb_type_cc_conversion() {
        assert_eq!(ReverbType::from_cc_value(1), ReverbType::Room);
        assert_eq!(ReverbType::from_cc_value(2), ReverbType::Plate);
        assert_eq!(ReverbType::from_cc_value(3), ReverbType::Hall);
        assert_eq!(ReverbType::Room.to_cc_value(), 1);
        assert_eq!(ReverbType::Plate.to_cc_value(), 2);
        assert_eq!(ReverbType::Hall.to_cc_value(), 3);
    }

    #[test]
    fn test_jump_cc_conversion() {
        assert_eq!(Jump::from_cc_value(1), Jump::Off);
        assert_eq!(Jump::from_cc_value(2), Jump::Zero);
        assert_eq!(Jump::from_cc_value(3), Jump::Five);
    }

    #[test]
    fn test_state_to_cc_map() {
        let state = Cxm1978State::default();
        let cc_map = state.to_cc_map();

        assert_eq!(cc_map.get(&CC_BASS), Some(&64));
        assert_eq!(cc_map.get(&CC_MIX), Some(&64));
        assert_eq!(cc_map.get(&CC_PRE_DLY), Some(&0));
        assert_eq!(cc_map.get(&CC_REVERB_TYPE), Some(&1)); // ReverbType::Room = 1
        assert_eq!(cc_map.get(&CC_CLOCK), Some(&2)); // Clock::Standard = 2
        // Expression and Bypass are excluded from recall map
        assert!(!cc_map.contains_key(&CC_EXPRESSION));
        assert!(!cc_map.contains_key(&CC_BYPASS));
    }

    #[test]
    fn test_parameter_to_cc_message() {
        let param = Cxm1978Parameter::Mix(100);
        assert_eq!(param.to_cc_message(), Some((CC_MIX, 100)));

        let param = Cxm1978Parameter::ReverbType(ReverbType::Hall);
        assert_eq!(param.to_cc_message(), Some((CC_REVERB_TYPE, 3)));

        let param = Cxm1978Parameter::Bypass(false);
        assert_eq!(param.to_cc_message(), Some((CC_BYPASS, 127)));
    }
}

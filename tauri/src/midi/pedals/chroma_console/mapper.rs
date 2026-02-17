// Chroma Console MIDI mapper - converts between domain types and MIDI CC messages

use super::types::*;
use std::collections::HashMap;

// ============================================================================
// MIDI CC Constants
// ============================================================================

// Primary controls
pub const CC_TILT: u8 = 64;
pub const CC_RATE: u8 = 66;
pub const CC_TIME: u8 = 68;
pub const CC_MIX: u8 = 70;
pub const CC_AMOUNT_CHARACTER: u8 = 65;
pub const CC_AMOUNT_MOVEMENT: u8 = 67;
pub const CC_AMOUNT_DIFFUSION: u8 = 69;
pub const CC_AMOUNT_TEXTURE: u8 = 71;

// Secondary controls
pub const CC_SENSITIVITY: u8 = 72;
pub const CC_DRIFT_MOVEMENT: u8 = 74;
pub const CC_DRIFT_DIFFUSION: u8 = 76;
pub const CC_OUTPUT_LEVEL: u8 = 78;
pub const CC_EFFECT_VOL_CHARACTER: u8 = 73;
pub const CC_EFFECT_VOL_MOVEMENT: u8 = 75;
pub const CC_EFFECT_VOL_DIFFUSION: u8 = 77;
pub const CC_EFFECT_VOL_TEXTURE: u8 = 79;

// Module controls
pub const CC_CHARACTER_MODULE: u8 = 16;
pub const CC_MOVEMENT_MODULE: u8 = 17;
pub const CC_DIFFUSION_MODULE: u8 = 18;
pub const CC_TEXTURE_MODULE: u8 = 19;

// Bypass controls
pub const CC_STANDARD_BYPASS: u8 = 91;
pub const CC_DUAL_BYPASS: u8 = 92;
pub const CC_CHARACTER_BYPASS: u8 = 103;
pub const CC_MOVEMENT_BYPASS: u8 = 104;
pub const CC_DIFFUSION_BYPASS: u8 = 105;
pub const CC_TEXTURE_BYPASS: u8 = 106;

// Other functions
pub const CC_GESTURE_PLAY_REC: u8 = 80;
pub const CC_GESTURE_STOP_ERASE: u8 = 81;
pub const CC_CAPTURE: u8 = 82;
pub const CC_CAPTURE_ROUTING: u8 = 83;
pub const CC_TAP_TEMPO: u8 = 93;
pub const CC_FILTER_MODE: u8 = 84;
pub const CC_CALIBRATION_LEVEL: u8 = 94;
pub const CC_CALIBRATION_ENTER: u8 = 95;

// ============================================================================
// State to CC Map Conversion
// ============================================================================

impl ChromaConsoleState {
    /// Convert state to a HashMap of CC numbers and values
    pub fn to_cc_map(&self) -> HashMap<u8, u8> {
        let mut map = HashMap::new();
        
        // Primary controls
        map.insert(CC_TILT, self.tilt);
        map.insert(CC_RATE, self.rate);
        map.insert(CC_TIME, self.time);
        map.insert(CC_MIX, self.mix);
        map.insert(CC_AMOUNT_CHARACTER, self.amount_character);
        map.insert(CC_AMOUNT_MOVEMENT, self.amount_movement);
        map.insert(CC_AMOUNT_DIFFUSION, self.amount_diffusion);
        map.insert(CC_AMOUNT_TEXTURE, self.amount_texture);
        
        // Secondary controls
        map.insert(CC_SENSITIVITY, self.sensitivity);
        map.insert(CC_DRIFT_MOVEMENT, self.drift_movement);
        map.insert(CC_DRIFT_DIFFUSION, self.drift_diffusion);
        map.insert(CC_OUTPUT_LEVEL, self.output_level);
        map.insert(CC_EFFECT_VOL_CHARACTER, self.effect_vol_character);
        map.insert(CC_EFFECT_VOL_MOVEMENT, self.effect_vol_movement);
        map.insert(CC_EFFECT_VOL_DIFFUSION, self.effect_vol_diffusion);
        map.insert(CC_EFFECT_VOL_TEXTURE, self.effect_vol_texture);
        
        // Module selections
        map.insert(CC_CHARACTER_MODULE, self.character_module.to_cc_value());
        map.insert(CC_MOVEMENT_MODULE, self.movement_module.to_cc_value());
        map.insert(CC_DIFFUSION_MODULE, self.diffusion_module.to_cc_value());
        map.insert(CC_TEXTURE_MODULE, self.texture_module.to_cc_value());
        
        // Bypass state (use standard bypass by default)
        // NOTE: Chroma Console uses INVERTED logic: 0 = engaged, 127 = bypassed
        let bypass_value = match self.bypass_state {
            BypassState::Bypass => 127,      // Send 127 to bypass (turn off)
            BypassState::Engaged => 0,        // Send 0 to engage (turn on)
            BypassState::DualBypass => 48,    // For dual bypass mode
        };
        map.insert(CC_STANDARD_BYPASS, bypass_value);
        
        // Module bypasses (true = bypassed, so send 0; false = engaged, so send 127)
        map.insert(CC_CHARACTER_BYPASS, if self.character_bypass { 0 } else { 127 });
        map.insert(CC_MOVEMENT_BYPASS, if self.movement_bypass { 0 } else { 127 });
        map.insert(CC_DIFFUSION_BYPASS, if self.diffusion_bypass { 0 } else { 127 });
        map.insert(CC_TEXTURE_BYPASS, if self.texture_bypass { 0 } else { 127 });
        
        // Other functions
        map.insert(CC_GESTURE_PLAY_REC, self.gesture_mode.to_cc_value());
        map.insert(CC_CAPTURE, self.capture_mode.to_cc_value());
        map.insert(CC_CAPTURE_ROUTING, self.capture_routing.to_cc_value());
        map.insert(CC_FILTER_MODE, self.filter_mode.to_cc_value());
        map.insert(CC_CALIBRATION_LEVEL, self.calibration_level.to_cc_value());
        
        map
    }
    
    /// Update state from a CC message
    pub fn update_from_cc(&mut self, cc: u8, value: u8) {
        match cc {
            // Primary controls
            CC_TILT => self.tilt = value,
            CC_RATE => self.rate = value,
            CC_TIME => self.time = value,
            CC_MIX => self.mix = value,
            CC_AMOUNT_CHARACTER => self.amount_character = value,
            CC_AMOUNT_MOVEMENT => self.amount_movement = value,
            CC_AMOUNT_DIFFUSION => self.amount_diffusion = value,
            CC_AMOUNT_TEXTURE => self.amount_texture = value,
            
            // Secondary controls
            CC_SENSITIVITY => self.sensitivity = value,
            CC_DRIFT_MOVEMENT => self.drift_movement = value,
            CC_DRIFT_DIFFUSION => self.drift_diffusion = value,
            CC_OUTPUT_LEVEL => self.output_level = value,
            CC_EFFECT_VOL_CHARACTER => self.effect_vol_character = value,
            CC_EFFECT_VOL_MOVEMENT => self.effect_vol_movement = value,
            CC_EFFECT_VOL_DIFFUSION => self.effect_vol_diffusion = value,
            CC_EFFECT_VOL_TEXTURE => self.effect_vol_texture = value,
            
            // Module selections
            CC_CHARACTER_MODULE => self.character_module = CharacterModule::from_cc_value(value),
            CC_MOVEMENT_MODULE => self.movement_module = MovementModule::from_cc_value(value),
            CC_DIFFUSION_MODULE => self.diffusion_module = DiffusionModule::from_cc_value(value),
            CC_TEXTURE_MODULE => self.texture_module = TextureModule::from_cc_value(value),
            
            // Bypass controls
            // NOTE: Chroma Console uses INVERTED logic: 0-63 = engaged, 64-127 = bypassed
            CC_STANDARD_BYPASS => {
                self.bypass_state = if value < 64 {
                    BypassState::Engaged  // Low values = engaged (on)
                } else {
                    BypassState::Bypass   // High values = bypassed (off)
                };
            }
            CC_DUAL_BYPASS => {
                // NOTE: Assuming dual bypass follows same inverted logic
                self.bypass_state = match value {
                    0..=31 => BypassState::Engaged,      // Low = engaged
                    32..=63 => BypassState::DualBypass,  // Mid = dual bypass
                    _ => BypassState::Bypass,            // High = bypassed
                };
            }
            // Module bypasses (0-63 = BYPASS = true, 64-127 = ENGAGE = false)
            CC_CHARACTER_BYPASS => self.character_bypass = value < 64,
            CC_MOVEMENT_BYPASS => self.movement_bypass = value < 64,
            CC_DIFFUSION_BYPASS => self.diffusion_bypass = value < 64,
            CC_TEXTURE_BYPASS => self.texture_bypass = value < 64,
            
            // Other functions
            CC_GESTURE_PLAY_REC => self.gesture_mode = GestureMode::from_cc_value(value),
            CC_CAPTURE => self.capture_mode = CaptureMode::from_cc_value(value),
            CC_CAPTURE_ROUTING => self.capture_routing = CaptureRouting::from_cc_value(value),
            CC_FILTER_MODE => self.filter_mode = FilterMode::from_cc_value(value),
            CC_CALIBRATION_LEVEL => self.calibration_level = CalibrationLevel::from_cc_value(value),
            
            _ => {}  // Ignore unknown CC numbers
        }
    }
}

// ============================================================================
// Parameter to CC Message Conversion
// ============================================================================

impl ChromaConsoleParameter {
    /// Get the CC number for this parameter
    pub fn cc_number(&self) -> u8 {
        match self {
            // Primary controls
            ChromaConsoleParameter::Tilt(_) => CC_TILT,
            ChromaConsoleParameter::Rate(_) => CC_RATE,
            ChromaConsoleParameter::Time(_) => CC_TIME,
            ChromaConsoleParameter::Mix(_) => CC_MIX,
            ChromaConsoleParameter::AmountCharacter(_) => CC_AMOUNT_CHARACTER,
            ChromaConsoleParameter::AmountMovement(_) => CC_AMOUNT_MOVEMENT,
            ChromaConsoleParameter::AmountDiffusion(_) => CC_AMOUNT_DIFFUSION,
            ChromaConsoleParameter::AmountTexture(_) => CC_AMOUNT_TEXTURE,
            
            // Secondary controls
            ChromaConsoleParameter::Sensitivity(_) => CC_SENSITIVITY,
            ChromaConsoleParameter::DriftMovement(_) => CC_DRIFT_MOVEMENT,
            ChromaConsoleParameter::DriftDiffusion(_) => CC_DRIFT_DIFFUSION,
            ChromaConsoleParameter::OutputLevel(_) => CC_OUTPUT_LEVEL,
            ChromaConsoleParameter::EffectVolCharacter(_) => CC_EFFECT_VOL_CHARACTER,
            ChromaConsoleParameter::EffectVolMovement(_) => CC_EFFECT_VOL_MOVEMENT,
            ChromaConsoleParameter::EffectVolDiffusion(_) => CC_EFFECT_VOL_DIFFUSION,
            ChromaConsoleParameter::EffectVolTexture(_) => CC_EFFECT_VOL_TEXTURE,
            
            // Module selections
            ChromaConsoleParameter::CharacterModule(_) => CC_CHARACTER_MODULE,
            ChromaConsoleParameter::MovementModule(_) => CC_MOVEMENT_MODULE,
            ChromaConsoleParameter::DiffusionModule(_) => CC_DIFFUSION_MODULE,
            ChromaConsoleParameter::TextureModule(_) => CC_TEXTURE_MODULE,
            
            // Bypass controls
            ChromaConsoleParameter::BypassState(_) => CC_STANDARD_BYPASS,
            ChromaConsoleParameter::CharacterBypass(_) => CC_CHARACTER_BYPASS,
            ChromaConsoleParameter::MovementBypass(_) => CC_MOVEMENT_BYPASS,
            ChromaConsoleParameter::DiffusionBypass(_) => CC_DIFFUSION_BYPASS,
            ChromaConsoleParameter::TextureBypass(_) => CC_TEXTURE_BYPASS,
            
            // Other functions
            ChromaConsoleParameter::GestureMode(_) => CC_GESTURE_PLAY_REC,
            ChromaConsoleParameter::GestureStop => CC_GESTURE_STOP_ERASE,
            ChromaConsoleParameter::CaptureMode(_) => CC_CAPTURE,
            ChromaConsoleParameter::CaptureRouting(_) => CC_CAPTURE_ROUTING,
            ChromaConsoleParameter::TapTempo => CC_TAP_TEMPO,
            ChromaConsoleParameter::FilterMode(_) => CC_FILTER_MODE,
            ChromaConsoleParameter::CalibrationLevel(_) => CC_CALIBRATION_LEVEL,
            ChromaConsoleParameter::CalibrationEnter(_) => CC_CALIBRATION_ENTER,
        }
    }
    
    /// Get the CC value for this parameter
    pub fn cc_value(&self) -> u8 {
        match self {
            // Continuous parameters (0-127)
            ChromaConsoleParameter::Tilt(v) |
            ChromaConsoleParameter::Rate(v) |
            ChromaConsoleParameter::Time(v) |
            ChromaConsoleParameter::Mix(v) |
            ChromaConsoleParameter::AmountCharacter(v) |
            ChromaConsoleParameter::AmountMovement(v) |
            ChromaConsoleParameter::AmountDiffusion(v) |
            ChromaConsoleParameter::AmountTexture(v) |
            ChromaConsoleParameter::Sensitivity(v) |
            ChromaConsoleParameter::DriftMovement(v) |
            ChromaConsoleParameter::DriftDiffusion(v) |
            ChromaConsoleParameter::OutputLevel(v) |
            ChromaConsoleParameter::EffectVolCharacter(v) |
            ChromaConsoleParameter::EffectVolMovement(v) |
            ChromaConsoleParameter::EffectVolDiffusion(v) |
            ChromaConsoleParameter::EffectVolTexture(v) => *v,
            
            // Module selections (use to_cc_value)
            ChromaConsoleParameter::CharacterModule(m) => m.to_cc_value(),
            ChromaConsoleParameter::MovementModule(m) => m.to_cc_value(),
            ChromaConsoleParameter::DiffusionModule(m) => m.to_cc_value(),
            ChromaConsoleParameter::TextureModule(m) => m.to_cc_value(),
            
            // Bypass controls
            // NOTE: Chroma Console uses INVERTED logic: 0 = engaged, 127 = bypassed
            ChromaConsoleParameter::BypassState(state) => match state {
                BypassState::Bypass => 127,      // Send 127 to bypass (turn off)
                BypassState::Engaged => 0,        // Send 0 to engage (turn on)
                BypassState::DualBypass => 48,
            },
            // Module bypasses (true = bypassed, so send 0; false = engaged, so send 127)
            ChromaConsoleParameter::CharacterBypass(b) |
            ChromaConsoleParameter::MovementBypass(b) |
            ChromaConsoleParameter::DiffusionBypass(b) |
            ChromaConsoleParameter::TextureBypass(b) => if *b { 0 } else { 127 },
            ChromaConsoleParameter::CalibrationEnter(b) => if *b { 127 } else { 0 },
            
            // Other functions with enums
            ChromaConsoleParameter::GestureMode(mode) => mode.to_cc_value(),
            ChromaConsoleParameter::CaptureMode(mode) => mode.to_cc_value(),
            ChromaConsoleParameter::CaptureRouting(routing) => routing.to_cc_value(),
            ChromaConsoleParameter::FilterMode(mode) => mode.to_cc_value(),
            ChromaConsoleParameter::CalibrationLevel(level) => level.to_cc_value(),
            
            // Trigger parameters (always send max value)
            ChromaConsoleParameter::GestureStop |
            ChromaConsoleParameter::TapTempo => 127,
        }
    }
    
    /// Convert parameter to (CC number, value) tuple
    /// Returns None for trigger-only parameters that need special handling
    pub fn to_cc_message(&self) -> Option<(u8, u8)> {
        match self {
            // Primary controls
            ChromaConsoleParameter::Tilt(v) => Some((CC_TILT, *v)),
            ChromaConsoleParameter::Rate(v) => Some((CC_RATE, *v)),
            ChromaConsoleParameter::Time(v) => Some((CC_TIME, *v)),
            ChromaConsoleParameter::Mix(v) => Some((CC_MIX, *v)),
            ChromaConsoleParameter::AmountCharacter(v) => Some((CC_AMOUNT_CHARACTER, *v)),
            ChromaConsoleParameter::AmountMovement(v) => Some((CC_AMOUNT_MOVEMENT, *v)),
            ChromaConsoleParameter::AmountDiffusion(v) => Some((CC_AMOUNT_DIFFUSION, *v)),
            ChromaConsoleParameter::AmountTexture(v) => Some((CC_AMOUNT_TEXTURE, *v)),
            
            // Secondary controls
            ChromaConsoleParameter::Sensitivity(v) => Some((CC_SENSITIVITY, *v)),
            ChromaConsoleParameter::DriftMovement(v) => Some((CC_DRIFT_MOVEMENT, *v)),
            ChromaConsoleParameter::DriftDiffusion(v) => Some((CC_DRIFT_DIFFUSION, *v)),
            ChromaConsoleParameter::OutputLevel(v) => Some((CC_OUTPUT_LEVEL, *v)),
            ChromaConsoleParameter::EffectVolCharacter(v) => Some((CC_EFFECT_VOL_CHARACTER, *v)),
            ChromaConsoleParameter::EffectVolMovement(v) => Some((CC_EFFECT_VOL_MOVEMENT, *v)),
            ChromaConsoleParameter::EffectVolDiffusion(v) => Some((CC_EFFECT_VOL_DIFFUSION, *v)),
            ChromaConsoleParameter::EffectVolTexture(v) => Some((CC_EFFECT_VOL_TEXTURE, *v)),
            
            // Module selections
            ChromaConsoleParameter::CharacterModule(m) => Some((CC_CHARACTER_MODULE, m.to_cc_value())),
            ChromaConsoleParameter::MovementModule(m) => Some((CC_MOVEMENT_MODULE, m.to_cc_value())),
            ChromaConsoleParameter::DiffusionModule(m) => Some((CC_DIFFUSION_MODULE, m.to_cc_value())),
            ChromaConsoleParameter::TextureModule(m) => Some((CC_TEXTURE_MODULE, m.to_cc_value())),
            
            // Bypass controls
            // NOTE: Chroma Console uses INVERTED logic: 0 = engaged, 127 = bypassed
            ChromaConsoleParameter::BypassState(state) => {
                let value = match state {
                    BypassState::Bypass => 127,      // Send 127 to bypass (turn off)
                    BypassState::Engaged => 0,        // Send 0 to engage (turn on)
                    BypassState::DualBypass => 48,
                };
                Some((CC_STANDARD_BYPASS, value))
            }
            // Module bypasses (true = bypassed, so send 0; false = engaged, so send 127)
            ChromaConsoleParameter::CharacterBypass(b) => Some((CC_CHARACTER_BYPASS, if *b { 0 } else { 127 })),
            ChromaConsoleParameter::MovementBypass(b) => Some((CC_MOVEMENT_BYPASS, if *b { 0 } else { 127 })),
            ChromaConsoleParameter::DiffusionBypass(b) => Some((CC_DIFFUSION_BYPASS, if *b { 0 } else { 127 })),
            ChromaConsoleParameter::TextureBypass(b) => Some((CC_TEXTURE_BYPASS, if *b { 0 } else { 127 })),
            
            // Other functions
            ChromaConsoleParameter::GestureMode(mode) => Some((CC_GESTURE_PLAY_REC, mode.to_cc_value())),
            ChromaConsoleParameter::GestureStop => Some((CC_GESTURE_STOP_ERASE, 127)),  // Trigger
            ChromaConsoleParameter::CaptureMode(mode) => Some((CC_CAPTURE, mode.to_cc_value())),
            ChromaConsoleParameter::CaptureRouting(routing) => Some((CC_CAPTURE_ROUTING, routing.to_cc_value())),
            ChromaConsoleParameter::TapTempo => Some((CC_TAP_TEMPO, 127)),  // Trigger
            ChromaConsoleParameter::FilterMode(mode) => Some((CC_FILTER_MODE, mode.to_cc_value())),
            ChromaConsoleParameter::CalibrationLevel(level) => Some((CC_CALIBRATION_LEVEL, level.to_cc_value())),
            ChromaConsoleParameter::CalibrationEnter(enter) => Some((CC_CALIBRATION_ENTER, if *enter { 127 } else { 0 })),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_character_module_cc_conversion() {
        assert_eq!(CharacterModule::from_cc_value(10), CharacterModule::Drive);
        assert_eq!(CharacterModule::from_cc_value(32), CharacterModule::Sweeten);
        assert_eq!(CharacterModule::from_cc_value(54), CharacterModule::Fuzz);
        assert_eq!(CharacterModule::from_cc_value(120), CharacterModule::Off);
    }

    #[test]
    fn test_movement_module_cc_conversion() {
        assert_eq!(MovementModule::from_cc_value(10), MovementModule::Doubler);
        assert_eq!(MovementModule::from_cc_value(32), MovementModule::Vibrato);
        assert_eq!(MovementModule::from_cc_value(76), MovementModule::Tremolo);
    }

    #[test]
    fn test_state_to_cc_map() {
        let state = ChromaConsoleState::default();
        let cc_map = state.to_cc_map();
        
        assert_eq!(cc_map.get(&CC_TILT), Some(&64));
        assert_eq!(cc_map.get(&CC_MIX), Some(&64));
        assert_eq!(cc_map.get(&CC_OUTPUT_LEVEL), Some(&100));
    }

    #[test]
    fn test_parameter_to_cc_message() {
        let param = ChromaConsoleParameter::Tilt(100);
        assert_eq!(param.to_cc_message(), Some((CC_TILT, 100)));
        
        let param = ChromaConsoleParameter::CharacterModule(CharacterModule::Fuzz);
        assert_eq!(param.to_cc_message(), Some((CC_CHARACTER_MODULE, 54)));
    }
}

// Hologram Chroma Console MIDI implementation
// Granular micro-looper with 4 effect modules

mod types;
mod mapper;

// Re-export public types
pub use types::*;

/// Hologram Chroma Console pedal with complete MIDI control
/// This is the aggregate root for the Chroma Console domain
#[derive(Debug)]
pub struct ChromaConsole {
    pub state: ChromaConsoleState,
    pub midi_channel: u8,
}

impl ChromaConsole {
    /// Create a new Chroma Console instance with default state
    pub fn new(midi_channel: u8) -> Self {
        Self {
            state: ChromaConsoleState::default(),
            midi_channel,
        }
    }
    
    /// Load a preset from program change number (0-79 for 80 presets)
    pub fn load_preset(&mut self, _program: u8) {
        // Program change 0-79 maps to 80 user presets
        // This doesn't change internal state, just sends the program change
        // The pedal will respond with parameter updates via CC
    }
    
    /// Update internal state from a parameter change
    pub fn update_state(&mut self, param: &ChromaConsoleParameter) {
        match param {
            // Primary controls
            ChromaConsoleParameter::Tilt(v) => self.state.tilt = *v,
            ChromaConsoleParameter::Rate(v) => self.state.rate = *v,
            ChromaConsoleParameter::Time(v) => self.state.time = *v,
            ChromaConsoleParameter::Mix(v) => self.state.mix = *v,
            ChromaConsoleParameter::AmountCharacter(v) => self.state.amount_character = *v,
            ChromaConsoleParameter::AmountMovement(v) => self.state.amount_movement = *v,
            ChromaConsoleParameter::AmountDiffusion(v) => self.state.amount_diffusion = *v,
            ChromaConsoleParameter::AmountTexture(v) => self.state.amount_texture = *v,
            
            // Secondary controls
            ChromaConsoleParameter::Sensitivity(v) => self.state.sensitivity = *v,
            ChromaConsoleParameter::DriftMovement(v) => self.state.drift_movement = *v,
            ChromaConsoleParameter::DriftDiffusion(v) => self.state.drift_diffusion = *v,
            ChromaConsoleParameter::OutputLevel(v) => self.state.output_level = *v,
            ChromaConsoleParameter::EffectVolCharacter(v) => self.state.effect_vol_character = *v,
            ChromaConsoleParameter::EffectVolMovement(v) => self.state.effect_vol_movement = *v,
            ChromaConsoleParameter::EffectVolDiffusion(v) => self.state.effect_vol_diffusion = *v,
            ChromaConsoleParameter::EffectVolTexture(v) => self.state.effect_vol_texture = *v,
            
            // Module selections
            ChromaConsoleParameter::CharacterModule(m) => self.state.character_module = *m,
            ChromaConsoleParameter::MovementModule(m) => self.state.movement_module = *m,
            ChromaConsoleParameter::DiffusionModule(m) => self.state.diffusion_module = *m,
            ChromaConsoleParameter::TextureModule(m) => self.state.texture_module = *m,
            
            // Bypass controls
            ChromaConsoleParameter::BypassState(s) => self.state.bypass_state = *s,
            ChromaConsoleParameter::CharacterBypass(b) => self.state.character_bypass = *b,
            ChromaConsoleParameter::MovementBypass(b) => self.state.movement_bypass = *b,
            ChromaConsoleParameter::DiffusionBypass(b) => self.state.diffusion_bypass = *b,
            ChromaConsoleParameter::TextureBypass(b) => self.state.texture_bypass = *b,
            
            // Other functions
            ChromaConsoleParameter::GestureMode(m) => self.state.gesture_mode = *m,
            ChromaConsoleParameter::CaptureMode(m) => self.state.capture_mode = *m,
            ChromaConsoleParameter::CaptureRouting(r) => self.state.capture_routing = *r,
            ChromaConsoleParameter::FilterMode(m) => self.state.filter_mode = *m,
            ChromaConsoleParameter::CalibrationLevel(l) => self.state.calibration_level = *l,
            
            // Trigger actions don't update state
            ChromaConsoleParameter::GestureStop => {}
            ChromaConsoleParameter::TapTempo => {}
            ChromaConsoleParameter::CalibrationEnter(_) => {}
        }
    }
    
    /// Get the current state as a hashmap of CC numbers to values
    /// Useful for sending the complete state to the pedal
    pub fn state_as_cc_map(&self) -> std::collections::HashMap<u8, u8> {
        self.state.to_cc_map()
    }
}

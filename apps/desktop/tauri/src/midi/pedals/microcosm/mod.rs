// Hologram Microcosm MIDI implementation
// 35 MIDI-controllable parameters

mod types;
mod mapper;
pub mod commands;

// Re-export public types
pub use types::*;

/// Hologram Microcosm pedal with complete MIDI control
/// This is the aggregate root for the Microcosm domain
#[derive(Debug)]
pub struct Microcosm {
    pub state: MicrocosmState,
    pub midi_channel: u8,
}

impl Microcosm {
    /// Create a new Microcosm instance with default state
    pub fn new(midi_channel: u8) -> Self {
        Self {
            state: MicrocosmState::default(),
            midi_channel,
        }
    }
    
    /// Set the current preset from a program number
    pub fn set_current_preset(&mut self, program: u8) {
        if let Some((effect, variation)) = EffectType::from_program(program) {
            self.state.current_effect = effect;
            self.state.current_variation = variation;
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
            MicrocosmParameter::ReverseEffect(v) => self.state.reverse_effect = *v,
            MicrocosmParameter::Bypass(v) => self.state.bypass = *v,
            MicrocosmParameter::Space(v) => self.state.space = *v,
            MicrocosmParameter::ReverbTime(v) => self.state.reverb_time = *v,
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
    /// Useful for sending the complete state to the pedal
    pub fn state_as_cc_map(&self) -> std::collections::HashMap<u8, u8> {
        self.state.to_cc_map()
    }
}

// Implement PedalCapabilities trait for compile-time enforcement
impl super::PedalCapabilities for Microcosm {
    type State = MicrocosmState;
    type Parameter = MicrocosmParameter;
    
    fn metadata(&self) -> super::PedalMetadata {
        super::PedalMetadata {
            name: "Microcosm",
            manufacturer: "Hologram Electronics",
            supports_editor: true,
            supports_preset_library: true,
        }
    }
    
    fn supports_program_change(&self) -> bool {
        true
    }
    
    fn midi_channel(&self) -> u8 {
        self.midi_channel
    }
    
    fn state(&self) -> &Self::State {
        &self.state
    }
    
    fn update_state(&mut self, param: &Self::Parameter) {
        self.update_state(param)
    }
    
    fn state_as_cc_map(&self) -> std::collections::HashMap<u8, u8> {
        self.state_as_cc_map()
    }
    
    fn load_preset(&mut self, program: u8) {
        self.set_current_preset(program);
    }
}

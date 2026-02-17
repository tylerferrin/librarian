// Chase Bliss Preamp MK II MIDI implementation
// Benson Preamp-based overdrive/fuzz with parametric mids and motorized faders

mod types;
mod mapper;

// Re-export public types
pub use types::*;
pub use mapper::CC_PRESET_SAVE;

/// Chase Bliss Preamp MK II pedal with complete MIDI control
/// This is the aggregate root for the Preamp MK II domain
#[derive(Debug)]
pub struct PreampMk2 {
    pub state: PreampMk2State,
    pub midi_channel: u8,
}

impl PreampMk2 {
    /// Create a new Preamp MK II instance with default state
    pub fn new(midi_channel: u8) -> Self {
        Self {
            state: PreampMk2State::default(),
            midi_channel,
        }
    }
    
    /// Save current state to a preset slot (0-29)
    /// This sends CC 27 with the slot number
    /// Note: The pedal saves the current knob positions, not our state
    pub fn save_preset(&self, _slot: u8) {
        // CC 27 with value 0-29 saves to that preset slot
        // This is just a marker method - actual MIDI send happens in manager
    }
    
    /// Update internal state from a parameter change
    pub fn update_state(&mut self, param: &PreampMk2Parameter) {
        match param {
            // Faders
            PreampMk2Parameter::Volume(v) => self.state.volume = *v,
            PreampMk2Parameter::Treble(v) => self.state.treble = *v,
            PreampMk2Parameter::Mids(v) => self.state.mids = *v,
            PreampMk2Parameter::Frequency(v) => self.state.frequency = *v,
            PreampMk2Parameter::Bass(v) => self.state.bass = *v,
            PreampMk2Parameter::Gain(v) => self.state.gain = *v,
            
            // Arcade buttons
            PreampMk2Parameter::Jump(j) => self.state.jump = *j,
            PreampMk2Parameter::MidsPosition(m) => self.state.mids_position = *m,
            PreampMk2Parameter::QResonance(q) => self.state.q_resonance = *q,
            PreampMk2Parameter::DiodeClipping(d) => self.state.diode_clipping = *d,
            PreampMk2Parameter::FuzzMode(f) => self.state.fuzz_mode = *f,
            
            // Other controls
            PreampMk2Parameter::Expression(v) => self.state.expression = *v,
            PreampMk2Parameter::Bypass(b) => self.state.bypass = *b,
        }
    }
    
    /// Get the current state as a hashmap of CC numbers to values
    /// Useful for sending the complete state to the pedal (preset recall)
    pub fn state_as_cc_map(&self) -> std::collections::HashMap<u8, u8> {
        self.state.to_cc_map()
    }
}

// Implement PedalCapabilities trait for compile-time enforcement
impl super::PedalCapabilities for PreampMk2 {
    type State = PreampMk2State;
    type Parameter = PreampMk2Parameter;
    
    fn metadata(&self) -> super::PedalMetadata {
        super::PedalMetadata {
            name: "PreampMk2",
            manufacturer: "Chase Bliss Audio",
            supports_editor: true,
            supports_preset_library: true,
        }
    }
    
    fn supports_program_change(&self) -> bool {
        true // Per manual: "Presets 0-29 are recalled using Program Changes 0-29"
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
    
    fn load_preset(&mut self, _program: u8) {
        // Preamp MK II doesn't support loading presets via MIDI
        // Presets are recalled on the pedal itself using footswitches
        // The pedal will then send CC messages to update our state
    }
}

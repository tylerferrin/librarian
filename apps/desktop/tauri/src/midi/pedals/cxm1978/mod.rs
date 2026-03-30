// Chase Bliss / Meris CXM 1978 Automatone MIDI implementation
// Vintage 70s studio reverb with motorized faders and three reverb algorithms

mod types;
mod mapper;
pub mod commands;

pub use types::*;
pub use mapper::CC_PRESET_SAVE;

/// Chase Bliss CXM 1978 pedal with complete MIDI control
/// This is the aggregate root for the CXM 1978 domain
#[derive(Debug)]
pub struct Cxm1978 {
    pub state: Cxm1978State,
    pub midi_channel: u8,
}

impl Cxm1978 {
    /// Create a new CXM 1978 instance with default state
    pub fn new(midi_channel: u8) -> Self {
        Self {
            state: Cxm1978State::default(),
            midi_channel,
        }
    }

    /// Update internal state from a parameter change
    pub fn update_state(&mut self, param: &Cxm1978Parameter) {
        match param {
            // Faders
            Cxm1978Parameter::Bass(v) => self.state.bass = *v,
            Cxm1978Parameter::Mids(v) => self.state.mids = *v,
            Cxm1978Parameter::Cross(v) => self.state.cross = *v,
            Cxm1978Parameter::Treble(v) => self.state.treble = *v,
            Cxm1978Parameter::Mix(v) => self.state.mix = *v,
            Cxm1978Parameter::PreDly(v) => self.state.pre_dly = *v,

            // Arcade buttons
            Cxm1978Parameter::Jump(j) => self.state.jump = *j,
            Cxm1978Parameter::ReverbType(t) => self.state.reverb_type = *t,
            Cxm1978Parameter::Diffusion(d) => self.state.diffusion = *d,
            Cxm1978Parameter::TankMod(t) => self.state.tank_mod = *t,
            Cxm1978Parameter::Clock(c) => self.state.clock = *c,

            // Other controls
            Cxm1978Parameter::Expression(v) => self.state.expression = *v,
            Cxm1978Parameter::Bypass(b) => self.state.bypass = *b,
        }
    }

    /// Get the current state as a hashmap of CC numbers to values
    pub fn state_as_cc_map(&self) -> std::collections::HashMap<u8, u8> {
        self.state.to_cc_map()
    }
}

impl super::PedalCapabilities for Cxm1978 {
    type State = Cxm1978State;
    type Parameter = Cxm1978Parameter;

    fn metadata(&self) -> super::PedalMetadata {
        super::PedalMetadata {
            name: "Cxm1978",
            manufacturer: "Chase Bliss Audio / Meris",
            supports_editor: true,
            supports_preset_library: true,
        }
    }

    fn supports_program_change(&self) -> bool {
        true // Per manual: "Presets 0-29 are recalled using program changes 0-29"
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
        // CXM 1978 doesn't support loading presets via MIDI CC.
        // Presets are recalled on the pedal via Program Change or footswitches.
        // The pedal then sends CC messages to update our state.
    }
}

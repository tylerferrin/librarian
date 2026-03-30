// Chase Bliss Audio Billy Strings Wombtone MIDI implementation

mod mapper;
mod types;
pub mod commands;

pub use types::*;
pub use mapper::CC_PRESET_SAVE;

/// Chase Bliss Audio Billy Strings Wombtone pedal with complete MIDI control.
/// This is the aggregate root for the BillyStringsWombtone domain.
#[derive(Debug)]
pub struct BillyStringsWombtone {
    pub state: BillyStringsWombtoneState,
    pub midi_channel: u8,
}

impl BillyStringsWombtone {
    /// Create a new Billy Strings Wombtone instance with default state
    pub fn new(midi_channel: u8) -> Self {
        Self {
            state: BillyStringsWombtoneState::default(),
            midi_channel,
        }
    }

    /// Update internal state from a parameter change
    pub fn update_state(&mut self, param: &BillyStringsWombtoneParameter) {
        match param {
            BillyStringsWombtoneParameter::Feed(v) => self.state.feed = *v,
            BillyStringsWombtoneParameter::Volume(v) => self.state.volume = *v,
            BillyStringsWombtoneParameter::Mix(v) => self.state.mix = *v,
            BillyStringsWombtoneParameter::Rate(v) => self.state.rate = *v,
            BillyStringsWombtoneParameter::Depth(v) => self.state.depth = *v,
            BillyStringsWombtoneParameter::Form(v) => self.state.form = *v,
            BillyStringsWombtoneParameter::RampSpeed(v) => self.state.ramp_speed = *v,
            BillyStringsWombtoneParameter::NoteDivision(v) => self.state.note_division = *v,
            BillyStringsWombtoneParameter::Bypass(v) => self.state.bypass = *v,
            BillyStringsWombtoneParameter::Tap(v) => self.state.tap = *v,
            BillyStringsWombtoneParameter::MidiClockIgnore(v) => self.state.midi_clock_ignore = *v,
            BillyStringsWombtoneParameter::Expression(v) => self.state.expression = *v,
            BillyStringsWombtoneParameter::PresetSave(_) => {} // Does not update state
        }
    }

    /// Get the current state as a hashmap of CC numbers to values
    pub fn state_as_cc_map(&self) -> std::collections::HashMap<u8, u8> {
        self.state.to_cc_map()
    }
}

impl super::PedalCapabilities for BillyStringsWombtone {
    type State = BillyStringsWombtoneState;
    type Parameter = BillyStringsWombtoneParameter;

    fn metadata(&self) -> super::PedalMetadata {
        super::PedalMetadata {
            name: "BillyStringsWombtone",
            manufacturer: "Chase Bliss Audio",
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
}

// Chase Bliss Audio Onward MIDI implementation

mod mapper;
mod types;
pub mod commands;

// Re-export public types
pub use types::*;
pub use mapper::CC_PRESET_SAVE;

/// Chase Bliss Audio Onward pedal with complete MIDI control.
/// This is the aggregate root for the Onward domain.
#[derive(Debug)]
pub struct Onward {
    pub state: OnwardState,
    pub midi_channel: u8,
}

impl Onward {
    /// Create a new Onward instance with default state
    pub fn new(midi_channel: u8) -> Self {
        Self {
            state: OnwardState::default(),
            midi_channel,
        }
    }

    /// Update internal state from a parameter change
    pub fn update_state(&mut self, param: &OnwardParameter) {
        match param {
            OnwardParameter::Size(v) => self.state.size = *v,
            OnwardParameter::Mix(v) => self.state.mix = *v,
            OnwardParameter::Octave(v) => self.state.octave = *v,
            OnwardParameter::Error(v) => self.state.error = *v,
            OnwardParameter::Sustain(v) => self.state.sustain = *v,
            OnwardParameter::Texture(v) => self.state.texture = *v,
            OnwardParameter::RampSpeed(v) => self.state.ramp_speed = *v,
            OnwardParameter::ErrorType(v) => self.state.error_type = *v,
            OnwardParameter::FadeMode(v) => self.state.fade_mode = *v,
            OnwardParameter::AnimateMode(v) => self.state.animate_mode = *v,
            OnwardParameter::Sensitivity(v) => self.state.sensitivity = *v,
            OnwardParameter::Balance(v) => self.state.balance = *v,
            OnwardParameter::DuckDepth(v) => self.state.duck_depth = *v,
            OnwardParameter::ErrorBlend(v) => self.state.error_blend = *v,
            OnwardParameter::UserFade(v) => self.state.user_fade = *v,
            OnwardParameter::Filter(v) => self.state.filter = *v,
            OnwardParameter::ErrorRouting(v) => self.state.error_routing = *v,
            OnwardParameter::SustainRouting(v) => self.state.sustain_routing = *v,
            OnwardParameter::EffectsRouting(v) => self.state.effects_routing = *v,
            OnwardParameter::FreezeBypass(v) => self.state.freeze_bypass = *v,
            OnwardParameter::GlitchBypass(v) => self.state.glitch_bypass = *v,
            OnwardParameter::AltMode(v) => self.state.alt_mode = *v,
            OnwardParameter::GlitchHold(v) => self.state.glitch_hold = *v,
            OnwardParameter::FreezeHold(v) => self.state.freeze_hold = *v,
            OnwardParameter::RetriggerGlitch(v) => self.state.retrigger_glitch = *v,
            OnwardParameter::RetriggerFreeze(v) => self.state.retrigger_freeze = *v,
            OnwardParameter::DipSize(v) => self.state.dip_size = *v,
            OnwardParameter::DipError(v) => self.state.dip_error = *v,
            OnwardParameter::DipSustain(v) => self.state.dip_sustain = *v,
            OnwardParameter::DipTexture(v) => self.state.dip_texture = *v,
            OnwardParameter::DipOctave(v) => self.state.dip_octave = *v,
            OnwardParameter::DipBounce(v) => self.state.dip_bounce = *v,
            OnwardParameter::DipSweep(v) => self.state.dip_sweep = *v,
            OnwardParameter::DipPolarity(v) => self.state.dip_polarity = *v,
            OnwardParameter::DipMiso(v) => self.state.dip_miso = *v,
            OnwardParameter::DipSpread(v) => self.state.dip_spread = *v,
            OnwardParameter::DipLatch(v) => self.state.dip_latch = *v,
            OnwardParameter::DipSidechain(v) => self.state.dip_sidechain = *v,
            OnwardParameter::DipDuck(v) => self.state.dip_duck = *v,
            OnwardParameter::DipReverse(v) => self.state.dip_reverse = *v,
            OnwardParameter::DipHalfSpeed(v) => self.state.dip_half_speed = *v,
            OnwardParameter::DipManual(v) => self.state.dip_manual = *v,
            OnwardParameter::MidiClockIgnore(v) => self.state.midi_clock_ignore = *v,
            OnwardParameter::RampBounce(v) => self.state.ramp_bounce = *v,
            OnwardParameter::DryKill(v) => self.state.dry_kill = *v,
            OnwardParameter::Trails(v) => self.state.trails = *v,
            OnwardParameter::Expression(v) => self.state.expression = *v,
            OnwardParameter::PresetSave(_) => {} // Does not update state
        }
    }

    /// Get the current state as a hashmap of CC numbers to values
    pub fn state_as_cc_map(&self) -> std::collections::HashMap<u8, u8> {
        self.state.to_cc_map()
    }
}

impl super::PedalCapabilities for Onward {
    type State = OnwardState;
    type Parameter = OnwardParameter;

    fn metadata(&self) -> super::PedalMetadata {
        super::PedalMetadata {
            name: "Onward",
            manufacturer: "Chase Bliss Audio",
            supports_editor: true,
            supports_preset_library: true,
        }
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

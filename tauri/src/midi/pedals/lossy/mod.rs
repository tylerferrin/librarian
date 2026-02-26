// Chase Bliss Audio Lossy MIDI implementation

mod mapper;
mod types;
pub mod commands;

pub use types::*;
pub use mapper::CC_PRESET_SAVE;

/// Chase Bliss Audio Lossy pedal with complete MIDI control.
/// This is the aggregate root for the Lossy domain.
#[derive(Debug)]
pub struct Lossy {
    pub state: LossyState,
    pub midi_channel: u8,
}

impl Lossy {
    /// Create a new Lossy instance with default state
    pub fn new(midi_channel: u8) -> Self {
        Self {
            state: LossyState::default(),
            midi_channel,
        }
    }

    /// Update internal state from a parameter change
    pub fn update_state(&mut self, param: &LossyParameter) {
        match param {
            LossyParameter::Filter(v) => self.state.filter = *v,
            LossyParameter::Global(v) => self.state.global = *v,
            LossyParameter::Reverb(v) => self.state.reverb = *v,
            LossyParameter::Freq(v) => self.state.freq = *v,
            LossyParameter::Speed(v) => self.state.speed = *v,
            LossyParameter::Loss(v) => self.state.loss = *v,
            LossyParameter::RampSpeed(v) => self.state.ramp_speed = *v,
            LossyParameter::FilterSlope(v) => self.state.filter_slope = *v,
            LossyParameter::PacketMode(v) => self.state.packet_mode = *v,
            LossyParameter::LossEffect(v) => self.state.loss_effect = *v,
            LossyParameter::Gate(v) => self.state.gate = *v,
            LossyParameter::Freezer(v) => self.state.freezer = *v,
            LossyParameter::VerbDecay(v) => self.state.verb_decay = *v,
            LossyParameter::LimiterThreshold(v) => self.state.limiter_threshold = *v,
            LossyParameter::AutoGain(v) => self.state.auto_gain = *v,
            LossyParameter::LossGain(v) => self.state.loss_gain = *v,
            LossyParameter::Weighting(v) => self.state.weighting = *v,
            LossyParameter::Bypass(v) => self.state.bypass = *v,
            LossyParameter::FreezeSlushie(v) => self.state.freeze_slushie = *v,
            LossyParameter::AltMode(v) => self.state.alt_mode = *v,
            LossyParameter::FreezeSolid(v) => self.state.freeze_solid = *v,
            LossyParameter::GateSwitch(v) => self.state.gate_switch = *v,
            LossyParameter::DipFilter(v) => self.state.dip_filter = *v,
            LossyParameter::DipFreq(v) => self.state.dip_freq = *v,
            LossyParameter::DipSpeed(v) => self.state.dip_speed = *v,
            LossyParameter::DipLoss(v) => self.state.dip_loss = *v,
            LossyParameter::DipVerb(v) => self.state.dip_verb = *v,
            LossyParameter::DipBounce(v) => self.state.dip_bounce = *v,
            LossyParameter::DipSweep(v) => self.state.dip_sweep = *v,
            LossyParameter::DipPolarity(v) => self.state.dip_polarity = *v,
            LossyParameter::DipMiso(v) => self.state.dip_miso = *v,
            LossyParameter::DipSpread(v) => self.state.dip_spread = *v,
            LossyParameter::DipTrails(v) => self.state.dip_trails = *v,
            LossyParameter::DipLatch(v) => self.state.dip_latch = *v,
            LossyParameter::DipPrePost(v) => self.state.dip_pre_post = *v,
            LossyParameter::DipSlow(v) => self.state.dip_slow = *v,
            LossyParameter::DipInvert(v) => self.state.dip_invert = *v,
            LossyParameter::DipAllWet(v) => self.state.dip_all_wet = *v,
            LossyParameter::RampBounce(v) => self.state.ramp_bounce = *v,
            LossyParameter::DryKill(v) => self.state.dry_kill = *v,
            LossyParameter::Expression(v) => self.state.expression = *v,
            LossyParameter::PresetSave(_) => {} // Does not update state
        }
    }

    /// Get the current state as a hashmap of CC numbers to values
    pub fn state_as_cc_map(&self) -> std::collections::HashMap<u8, u8> {
        self.state.to_cc_map()
    }
}

impl super::PedalCapabilities for Lossy {
    type State = LossyState;
    type Parameter = LossyParameter;

    fn metadata(&self) -> super::PedalMetadata {
        super::PedalMetadata {
            name: "Lossy",
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

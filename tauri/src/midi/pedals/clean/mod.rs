// Chase Bliss Audio Clean MIDI implementation

mod mapper;
mod types;
pub mod commands;

// Re-export public types
pub use types::*;
pub use mapper::CC_PRESET_SAVE;

/// Chase Bliss Audio Clean pedal with complete MIDI control.
/// This is the aggregate root for the Clean domain.
#[derive(Debug)]
pub struct Clean {
    pub state: CleanState,
    pub midi_channel: u8,
}

impl Clean {
    /// Create a new Clean instance with default state
    pub fn new(midi_channel: u8) -> Self {
        Self {
            state: CleanState::default(),
            midi_channel,
        }
    }

    /// Update internal state from a parameter change
    pub fn update_state(&mut self, param: &CleanParameter) {
        match param {
            CleanParameter::Dynamics(v) => self.state.dynamics = *v,
            CleanParameter::Sensitivity(v) => self.state.sensitivity = *v,
            CleanParameter::Wet(v) => self.state.wet = *v,
            CleanParameter::Attack(v) => self.state.attack = *v,
            CleanParameter::Eq(v) => self.state.eq = *v,
            CleanParameter::Dry(v) => self.state.dry = *v,
            CleanParameter::RampSpeed(v) => self.state.ramp_speed = *v,
            CleanParameter::ReleaseMode(v) => self.state.release_mode = *v,
            CleanParameter::EffectMode(v) => self.state.effect_mode = *v,
            CleanParameter::PhysicsMode(v) => self.state.physics_mode = *v,
            CleanParameter::NoiseGateRelease(v) => self.state.noise_gate_release = *v,
            CleanParameter::NoiseGateSens(v) => self.state.noise_gate_sens = *v,
            CleanParameter::SwellIn(v) => self.state.swell_in = *v,
            CleanParameter::UserRelease(v) => self.state.user_release = *v,
            CleanParameter::BalanceFilter(v) => self.state.balance_filter = *v,
            CleanParameter::SwellOut(v) => self.state.swell_out = *v,
            CleanParameter::EnvelopeMode(v) => self.state.envelope_mode = *v,
            CleanParameter::ShiftyMode(v) => self.state.shifty_mode = *v,
            CleanParameter::SpreadRouting(v) => self.state.spread_routing = *v,
            CleanParameter::Bypass(v) => self.state.bypass = *v,
            CleanParameter::Swell(v) => self.state.swell = *v,
            CleanParameter::AltMode(v) => self.state.alt_mode = *v,
            CleanParameter::SwellHold(v) => self.state.swell_hold = *v,
            CleanParameter::DynamicsMax(v) => self.state.dynamics_max = *v,
            CleanParameter::DipDynamics(v) => self.state.dip_dynamics = *v,
            CleanParameter::DipAttack(v) => self.state.dip_attack = *v,
            CleanParameter::DipEq(v) => self.state.dip_eq = *v,
            CleanParameter::DipDry(v) => self.state.dip_dry = *v,
            CleanParameter::DipWet(v) => self.state.dip_wet = *v,
            CleanParameter::DipBounce(v) => self.state.dip_bounce = *v,
            CleanParameter::DipSweep(v) => self.state.dip_sweep = *v,
            CleanParameter::DipPolarity(v) => self.state.dip_polarity = *v,
            CleanParameter::DipMiso(v) => self.state.dip_miso = *v,
            CleanParameter::DipSpread(v) => self.state.dip_spread = *v,
            CleanParameter::DipLatch(v) => self.state.dip_latch = *v,
            CleanParameter::DipSidechain(v) => self.state.dip_sidechain = *v,
            CleanParameter::DipNoiseGate(v) => self.state.dip_noise_gate = *v,
            CleanParameter::DipMotion(v) => self.state.dip_motion = *v,
            CleanParameter::DipSwellAux(v) => self.state.dip_swell_aux = *v,
            CleanParameter::DipDusty(v) => self.state.dip_dusty = *v,
            CleanParameter::RampBounce(v) => self.state.ramp_bounce = *v,
            CleanParameter::Expression(v) => self.state.expression = *v,
            CleanParameter::PresetSave(_) => {} // Does not update state
        }
    }

    /// Get the current state as a hashmap of CC numbers to values
    pub fn state_as_cc_map(&self) -> std::collections::HashMap<u8, u8> {
        self.state.to_cc_map()
    }
}

impl super::PedalCapabilities for Clean {
    type State = CleanState;
    type Parameter = CleanParameter;

    fn metadata(&self) -> super::PedalMetadata {
        super::PedalMetadata {
            name: "Clean",
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

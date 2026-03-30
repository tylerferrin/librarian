// Chase Bliss Audio Mood MkII MIDI implementation

mod mapper;
mod types;
pub mod commands;

pub use types::*;
pub use mapper::CC_PRESET_SAVE;

/// Chase Bliss Audio Mood MkII pedal with complete MIDI control.
/// This is the aggregate root for the MoodMkii domain.
#[derive(Debug)]
pub struct MoodMkii {
    pub state: MoodMkiiState,
    pub midi_channel: u8,
}

impl MoodMkii {
    /// Create a new Mood MkII instance with default state
    pub fn new(midi_channel: u8) -> Self {
        Self {
            state: MoodMkiiState::default(),
            midi_channel,
        }
    }

    /// Update internal state from a parameter change
    pub fn update_state(&mut self, param: &MoodMkiiParameter) {
        match param {
            MoodMkiiParameter::Time(v) => self.state.time = *v,
            MoodMkiiParameter::Mix(v) => self.state.mix = *v,
            MoodMkiiParameter::Length(v) => self.state.length = *v,
            MoodMkiiParameter::ModifyWet(v) => self.state.modify_wet = *v,
            MoodMkiiParameter::Clock(v) => self.state.clock = *v,
            MoodMkiiParameter::ModifyLooper(v) => self.state.modify_looper = *v,
            MoodMkiiParameter::RampSpeed(v) => self.state.ramp_speed = *v,
            MoodMkiiParameter::WetChannelRouting(v) => self.state.wet_channel_routing = *v,
            MoodMkiiParameter::Routing(v) => self.state.routing = *v,
            MoodMkiiParameter::MicroLooper(v) => self.state.micro_looper = *v,
            MoodMkiiParameter::StereoWidth(v) => self.state.stereo_width = *v,
            MoodMkiiParameter::RampingWaveform(v) => self.state.ramping_waveform = *v,
            MoodMkiiParameter::Fade(v) => self.state.fade = *v,
            MoodMkiiParameter::Tone(v) => self.state.tone = *v,
            MoodMkiiParameter::LevelBalance(v) => self.state.level_balance = *v,
            MoodMkiiParameter::DirectMicroLoop(v) => self.state.direct_micro_loop = *v,
            MoodMkiiParameter::Sync(v) => self.state.sync = *v,
            MoodMkiiParameter::Spread(v) => self.state.spread = *v,
            MoodMkiiParameter::BufferLength(v) => self.state.buffer_length = *v,
            MoodMkiiParameter::BypassLeft(v) => self.state.bypass_left = *v,
            MoodMkiiParameter::BypassRight(v) => self.state.bypass_right = *v,
            MoodMkiiParameter::HiddenMenu(v) => self.state.hidden_menu = *v,
            MoodMkiiParameter::Freeze(v) => self.state.freeze = *v,
            MoodMkiiParameter::Overdub(v) => self.state.overdub = *v,
            MoodMkiiParameter::DipTime(v) => self.state.dip_time = *v,
            MoodMkiiParameter::DipModifyWet(v) => self.state.dip_modify_wet = *v,
            MoodMkiiParameter::DipClock(v) => self.state.dip_clock = *v,
            MoodMkiiParameter::DipModifyLooper(v) => self.state.dip_modify_looper = *v,
            MoodMkiiParameter::DipLength(v) => self.state.dip_length = *v,
            MoodMkiiParameter::DipBounce(v) => self.state.dip_bounce = *v,
            MoodMkiiParameter::DipSweep(v) => self.state.dip_sweep = *v,
            MoodMkiiParameter::DipPolarity(v) => self.state.dip_polarity = *v,
            MoodMkiiParameter::DipClassic(v) => self.state.dip_classic = *v,
            MoodMkiiParameter::DipMiso(v) => self.state.dip_miso = *v,
            MoodMkiiParameter::DipSpread(v) => self.state.dip_spread = *v,
            MoodMkiiParameter::DipDryKill(v) => self.state.dip_dry_kill = *v,
            MoodMkiiParameter::DipTrails(v) => self.state.dip_trails = *v,
            MoodMkiiParameter::DipLatch(v) => self.state.dip_latch = *v,
            MoodMkiiParameter::DipNoDub(v) => self.state.dip_no_dub = *v,
            MoodMkiiParameter::DipSmooth(v) => self.state.dip_smooth = *v,
            MoodMkiiParameter::MidiClockIgnore(v) => self.state.midi_clock_ignore = *v,
            MoodMkiiParameter::RampBounce(v) => self.state.ramp_bounce = *v,
            MoodMkiiParameter::Expression(v) => self.state.expression = *v,
            MoodMkiiParameter::PresetSave(_) => {} // Does not update state
        }
    }

    /// Get the current state as a hashmap of CC numbers to values
    pub fn state_as_cc_map(&self) -> std::collections::HashMap<u8, u8> {
        self.state.to_cc_map()
    }
}

impl super::PedalCapabilities for MoodMkii {
    type State = MoodMkiiState;
    type Parameter = MoodMkiiParameter;

    fn metadata(&self) -> super::PedalMetadata {
        super::PedalMetadata {
            name: "MoodMkii",
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

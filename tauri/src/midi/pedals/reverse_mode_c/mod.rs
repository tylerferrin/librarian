// Chase Bliss Audio Reverse Mode C MIDI implementation

mod mapper;
mod types;
pub mod commands;

pub use types::*;
pub use mapper::CC_PRESET_SAVE;

/// Chase Bliss Audio Reverse Mode C pedal
/// This is the aggregate root for the ReverseModeC domain.
#[derive(Debug)]
pub struct ReverseModeC {
    pub state: ReverseModeCState,
    pub midi_channel: u8,
}

impl ReverseModeC {
    /// Create a new Reverse Mode C instance with default state
    pub fn new(midi_channel: u8) -> Self {
        Self {
            state: ReverseModeCState::default(),
            midi_channel,
        }
    }

    /// Update internal state from a parameter change
    pub fn update_state(&mut self, param: &ReverseModeCParameter) {
        match param {
            ReverseModeCParameter::Time(v) => self.state.time = *v,
            ReverseModeCParameter::Mix(v) => self.state.mix = *v,
            ReverseModeCParameter::Feedback(v) => self.state.feedback = *v,
            ReverseModeCParameter::Offset(v) => self.state.offset = *v,
            ReverseModeCParameter::Balance(v) => self.state.balance = *v,
            ReverseModeCParameter::Filter(v) => self.state.filter = *v,
            ReverseModeCParameter::RampSpeed(v) => self.state.ramp_speed = *v,
            ReverseModeCParameter::ModSync(v) => self.state.mod_sync = *v,
            ReverseModeCParameter::ModType(v) => self.state.mod_type = *v,
            ReverseModeCParameter::SequenceMode(v) => self.state.sequence_mode = *v,
            ReverseModeCParameter::SequencerSubdivision(v) => self.state.sequencer_subdivision = *v,
            ReverseModeCParameter::RampingWaveform(v) => self.state.ramping_waveform = *v,
            ReverseModeCParameter::ModDepth(v) => self.state.mod_depth = *v,
            ReverseModeCParameter::ModRate(v) => self.state.mod_rate = *v,
            ReverseModeCParameter::OctaveType(v) => self.state.octave_type = *v,
            ReverseModeCParameter::SequenceSpacing(v) => self.state.sequence_spacing = *v,
            ReverseModeCParameter::Bypass(v) => self.state.bypass = *v,
            ReverseModeCParameter::Tap(v) => self.state.tap = *v,
            ReverseModeCParameter::AltMode(v) => self.state.alt_mode = *v,
            ReverseModeCParameter::Freeze(v) => self.state.freeze = *v,
            ReverseModeCParameter::HalfSpeed(v) => self.state.half_speed = *v,
            ReverseModeCParameter::DipTime(v) => self.state.dip_time = *v,
            ReverseModeCParameter::DipOffset(v) => self.state.dip_offset = *v,
            ReverseModeCParameter::DipBalance(v) => self.state.dip_balance = *v,
            ReverseModeCParameter::DipFilter(v) => self.state.dip_filter = *v,
            ReverseModeCParameter::DipFeed(v) => self.state.dip_feed = *v,
            ReverseModeCParameter::DipBounce(v) => self.state.dip_bounce = *v,
            ReverseModeCParameter::DipSweep(v) => self.state.dip_sweep = *v,
            ReverseModeCParameter::DipPolarity(v) => self.state.dip_polarity = *v,
            ReverseModeCParameter::DipSwap(v) => self.state.dip_swap = *v,
            ReverseModeCParameter::DipMiso(v) => self.state.dip_miso = *v,
            ReverseModeCParameter::DipSpread(v) => self.state.dip_spread = *v,
            ReverseModeCParameter::DipTrails(v) => self.state.dip_trails = *v,
            ReverseModeCParameter::DipLatch(v) => self.state.dip_latch = *v,
            ReverseModeCParameter::DipFeedType(v) => self.state.dip_feed_type = *v,
            ReverseModeCParameter::DipFadeType(v) => self.state.dip_fade_type = *v,
            ReverseModeCParameter::DipModType(v) => self.state.dip_mod_type = *v,
            ReverseModeCParameter::MidiClockIgnore(v) => self.state.midi_clock_ignore = *v,
            ReverseModeCParameter::RampBounce(v) => self.state.ramp_bounce = *v,
            ReverseModeCParameter::DryKill(v) => self.state.dry_kill = *v,
            ReverseModeCParameter::Expression(v) => self.state.expression = *v,
            ReverseModeCParameter::PresetSave(_) => {} // Does not update persistent state
        }
    }

    /// Get the current state as a hashmap of CC numbers to values
    pub fn state_as_cc_map(&self) -> std::collections::HashMap<u8, u8> {
        self.state.to_cc_map()
    }
}

impl super::PedalCapabilities for ReverseModeC {
    type State = ReverseModeCState;
    type Parameter = ReverseModeCParameter;

    fn metadata(&self) -> super::PedalMetadata {
        super::PedalMetadata {
            name: "ReverseModeC",
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_reverse_mode_c_new() {
        let pedal = ReverseModeC::new(4);
        assert_eq!(pedal.midi_channel, 4);
        assert_eq!(pedal.state.time, 64);
        assert_eq!(pedal.state.mix, 64);
        assert!(!pedal.state.bypass);
        assert!(!pedal.state.sequence_spacing);
        assert_eq!(pedal.state.expression, 0);
    }

    #[test]
    fn test_update_state() {
        let mut pedal = ReverseModeC::new(1);
        pedal.update_state(&ReverseModeCParameter::Time(100));
        assert_eq!(pedal.state.time, 100);
        pedal.update_state(&ReverseModeCParameter::Bypass(true));
        assert!(pedal.state.bypass);
        pedal.update_state(&ReverseModeCParameter::ModSync(ModSync::Free));
        assert_eq!(pedal.state.mod_sync, ModSync::Free);
        pedal.update_state(&ReverseModeCParameter::SequenceSpacing(true));
        assert!(pedal.state.sequence_spacing);
    }

    #[test]
    fn test_state_as_cc_map() {
        let pedal = ReverseModeC::new(1);
        let cc_map = pedal.state_as_cc_map();
        assert!(cc_map.contains_key(&14)); // Time
        assert!(cc_map.contains_key(&20)); // RampSpeed
        assert!(cc_map.contains_key(&78)); // DipModType (right bank has 8 switches)
        assert!(cc_map.contains_key(&102)); // Bypass
        assert!(cc_map.contains_key(&106)); // HalfSpeed
        assert!(cc_map.contains_key(&51)); // MidiClockIgnore
        assert!(cc_map.contains_key(&57)); // DryKill
    }

    #[test]
    fn test_mod_sync_values() {
        assert_eq!(ModSync::Sync.to_cc_value(), 1);
        assert_eq!(ModSync::Off.to_cc_value(), 2);
        assert_eq!(ModSync::Free.to_cc_value(), 3);
        assert!(matches!(ModSync::from_cc_value(1), Ok(ModSync::Sync)));
        assert!(matches!(ModSync::from_cc_value(2), Ok(ModSync::Off)));
        assert!(matches!(ModSync::from_cc_value(3), Ok(ModSync::Free)));
    }

    #[test]
    fn test_sequence_spacing_encoding() {
        use super::types::{sequence_spacing_to_cc, sequence_spacing_from_cc};
        assert_eq!(sequence_spacing_to_cc(false), 1); // Rest
        assert_eq!(sequence_spacing_to_cc(true), 2);  // Skip
        assert!(!sequence_spacing_from_cc(0));
        assert!(!sequence_spacing_from_cc(1));
        assert!(sequence_spacing_from_cc(2));
        assert!(sequence_spacing_from_cc(127));
    }
}

// Chase Bliss Audio Brothers AM MIDI implementation

mod mapper;
mod types;
pub mod commands;

pub use types::*;
pub use mapper::CC_PRESET_SAVE;

/// Chase Bliss Audio Brothers AM dual-channel overdrive/boost/distortion
/// This is the aggregate root for the BrothersAm domain.
#[derive(Debug)]
pub struct BrothersAm {
    pub state: BrothersAmState,
    pub midi_channel: u8,
}

impl BrothersAm {
    /// Create a new Brothers AM instance with default state
    pub fn new(midi_channel: u8) -> Self {
        Self {
            state: BrothersAmState::default(),
            midi_channel,
        }
    }

    /// Update internal state from a parameter change
    pub fn update_state(&mut self, param: &BrothersAmParameter) {
        match param {
            BrothersAmParameter::Gain2(v) => self.state.gain2 = *v,
            BrothersAmParameter::Volume2(v) => self.state.volume2 = *v,
            BrothersAmParameter::Gain1(v) => self.state.gain1 = *v,
            BrothersAmParameter::Tone2(v) => self.state.tone2 = *v,
            BrothersAmParameter::Volume1(v) => self.state.volume1 = *v,
            BrothersAmParameter::Tone1(v) => self.state.tone1 = *v,
            BrothersAmParameter::Presence2(v) => self.state.presence2 = *v,
            BrothersAmParameter::Presence1(v) => self.state.presence1 = *v,
            BrothersAmParameter::Gain2Type(v) => self.state.gain2_type = *v,
            BrothersAmParameter::TrebleBoost(v) => self.state.treble_boost = *v,
            BrothersAmParameter::Gain1Type(v) => self.state.gain1_type = *v,
            BrothersAmParameter::Channel1Bypass(v) => self.state.channel1_bypass = *v,
            BrothersAmParameter::Channel2Bypass(v) => self.state.channel2_bypass = *v,
            BrothersAmParameter::DipVolume1(v) => self.state.dip_volume1 = *v,
            BrothersAmParameter::DipVolume2(v) => self.state.dip_volume2 = *v,
            BrothersAmParameter::DipGain1(v) => self.state.dip_gain1 = *v,
            BrothersAmParameter::DipGain2(v) => self.state.dip_gain2 = *v,
            BrothersAmParameter::DipTone1(v) => self.state.dip_tone1 = *v,
            BrothersAmParameter::DipTone2(v) => self.state.dip_tone2 = *v,
            BrothersAmParameter::DipSweep(v) => self.state.dip_sweep = *v,
            BrothersAmParameter::DipPolarity(v) => self.state.dip_polarity = *v,
            BrothersAmParameter::DipHiGain1(v) => self.state.dip_hi_gain1 = *v,
            BrothersAmParameter::DipHiGain2(v) => self.state.dip_hi_gain2 = *v,
            BrothersAmParameter::DipMotoByp1(v) => self.state.dip_moto_byp1 = *v,
            BrothersAmParameter::DipMotoByp2(v) => self.state.dip_moto_byp2 = *v,
            BrothersAmParameter::DipPresLink1(v) => self.state.dip_pres_link1 = *v,
            BrothersAmParameter::DipPresLink2(v) => self.state.dip_pres_link2 = *v,
            BrothersAmParameter::DipMaster(v) => self.state.dip_master = *v,
            BrothersAmParameter::Expression(v) => self.state.expression = *v,
            BrothersAmParameter::PresetSave(_) => {} // Does not update persistent state
        }
    }

    /// Get the current state as a hashmap of CC numbers to values
    pub fn state_as_cc_map(&self) -> std::collections::HashMap<u8, u8> {
        self.state.to_cc_map()
    }
}

impl super::PedalCapabilities for BrothersAm {
    type State = BrothersAmState;
    type Parameter = BrothersAmParameter;

    fn metadata(&self) -> super::PedalMetadata {
        super::PedalMetadata {
            name: "BrothersAm",
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
    fn test_brothers_am_new() {
        let pedal = BrothersAm::new(3);
        assert_eq!(pedal.midi_channel, 3);
        assert_eq!(pedal.state.gain1, 64);
        assert_eq!(pedal.state.gain2, 64);
        assert!(!pedal.state.channel1_bypass);
        assert!(!pedal.state.channel2_bypass);
        assert_eq!(pedal.state.expression, 0);
    }

    #[test]
    fn test_update_state() {
        let mut pedal = BrothersAm::new(1);
        pedal.update_state(&BrothersAmParameter::Gain1(100));
        assert_eq!(pedal.state.gain1, 100);
        pedal.update_state(&BrothersAmParameter::Channel1Bypass(true));
        assert!(pedal.state.channel1_bypass);
        pedal.update_state(&BrothersAmParameter::Gain2Type(Gain2Type::Dist));
        assert_eq!(pedal.state.gain2_type, Gain2Type::Dist);
    }

    #[test]
    fn test_state_as_cc_map() {
        let pedal = BrothersAm::new(1);
        let cc_map = pedal.state_as_cc_map();
        assert!(cc_map.contains_key(&14)); // Gain2
        assert!(cc_map.contains_key(&16)); // Gain1
        assert!(cc_map.contains_key(&102)); // Channel1Bypass
        assert!(cc_map.contains_key(&103)); // Channel2Bypass
        // Brothers AM has no CC 78
        assert!(!cc_map.contains_key(&78));
    }

    #[test]
    fn test_gain2_type_roundtrip() {
        assert_eq!(Gain2Type::Boost.to_cc_value(), 1);
        assert_eq!(Gain2Type::OD.to_cc_value(), 2);
        assert_eq!(Gain2Type::Dist.to_cc_value(), 3);
        assert!(matches!(Gain2Type::from_cc_value(1), Ok(Gain2Type::Boost)));
        assert!(matches!(Gain2Type::from_cc_value(2), Ok(Gain2Type::OD)));
        assert!(matches!(Gain2Type::from_cc_value(3), Ok(Gain2Type::Dist)));
    }

    #[test]
    fn test_treble_boost_roundtrip() {
        assert_eq!(TrebleBoost::FullSun.to_cc_value(), 1);
        assert_eq!(TrebleBoost::Off.to_cc_value(), 2);
        assert_eq!(TrebleBoost::HalfSun.to_cc_value(), 3);
    }

    #[test]
    fn test_gain1_type_roundtrip() {
        assert_eq!(Gain1Type::Dist.to_cc_value(), 1);
        assert_eq!(Gain1Type::OD.to_cc_value(), 2);
        assert_eq!(Gain1Type::Boost.to_cc_value(), 3);
    }

    #[test]
    fn test_parameter_cc_numbers() {
        assert_eq!(BrothersAmParameter::Gain2(64).cc_number(), 14);
        assert_eq!(BrothersAmParameter::Volume2(64).cc_number(), 15);
        assert_eq!(BrothersAmParameter::Gain1(64).cc_number(), 16);
        assert_eq!(BrothersAmParameter::Tone2(64).cc_number(), 17);
        assert_eq!(BrothersAmParameter::Volume1(64).cc_number(), 18);
        assert_eq!(BrothersAmParameter::Tone1(64).cc_number(), 19);
        assert_eq!(BrothersAmParameter::Presence2(64).cc_number(), 27);
        assert_eq!(BrothersAmParameter::Presence1(64).cc_number(), 29);
        assert_eq!(BrothersAmParameter::Gain2Type(Gain2Type::Boost).cc_number(), 21);
        assert_eq!(BrothersAmParameter::TrebleBoost(TrebleBoost::FullSun).cc_number(), 22);
        assert_eq!(BrothersAmParameter::Gain1Type(Gain1Type::Dist).cc_number(), 23);
        assert_eq!(BrothersAmParameter::Channel1Bypass(false).cc_number(), 102);
        assert_eq!(BrothersAmParameter::Channel2Bypass(false).cc_number(), 103);
        assert_eq!(BrothersAmParameter::Expression(0).cc_number(), 100);
    }
}

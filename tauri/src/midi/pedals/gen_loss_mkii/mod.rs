// Chase Bliss Generation Loss MKII MIDI implementation
// 41 MIDI-controllable parameters

mod mapper;
mod types;
pub mod commands;

// Re-export public types
pub use types::*;

/// Chase Bliss Generation Loss MKII pedal with complete MIDI control
/// This is the aggregate root for the GenLossMkii domain.
#[derive(Debug)]
pub struct GenLossMkii {
    pub state: GenLossMkiiState,
    pub midi_channel: u8,
}

impl GenLossMkii {
    /// Create a new Gen Loss MKII instance with default state
    pub fn new(midi_channel: u8) -> Self {
        Self {
            state: GenLossMkiiState::default(),
            midi_channel,
        }
    }

    /// Update internal state from a parameter change
    pub fn update_state(&mut self, param: &GenLossMkiiParameter) {
        match param {
            GenLossMkiiParameter::Wow(v) => self.state.wow = *v,
            GenLossMkiiParameter::Volume(v) => self.state.volume = *v,
            GenLossMkiiParameter::Model(v) => self.state.model = *v,
            GenLossMkiiParameter::Flutter(v) => self.state.flutter = *v,
            GenLossMkiiParameter::Saturate(v) => self.state.saturate = *v,
            GenLossMkiiParameter::Failure(v) => self.state.failure = *v,
            GenLossMkiiParameter::RampSpeed(v) => self.state.ramp_speed = *v,
            GenLossMkiiParameter::DryMode(v) => self.state.dry_mode = *v,
            GenLossMkiiParameter::NoiseMode(v) => self.state.noise_mode = *v,
            GenLossMkiiParameter::AuxMode(v) => self.state.aux_mode = *v,
            GenLossMkiiParameter::Bypass(v) => self.state.bypass = *v,
            GenLossMkiiParameter::AuxSwitch(v) => self.state.aux_switch = *v,
            GenLossMkiiParameter::AltMode(v) => self.state.alt_mode = *v,
            GenLossMkiiParameter::LeftSwitch(v) => self.state.left_switch = *v,
            GenLossMkiiParameter::CenterSwitch(v) => self.state.center_switch = *v,
            GenLossMkiiParameter::RightSwitch(v) => self.state.right_switch = *v,
            GenLossMkiiParameter::DipWow(v) => self.state.dip_wow = *v,
            GenLossMkiiParameter::DipFlutter(v) => self.state.dip_flutter = *v,
            GenLossMkiiParameter::DipSatGen(v) => self.state.dip_sat_gen = *v,
            GenLossMkiiParameter::DipFailureHp(v) => self.state.dip_failure_hp = *v,
            GenLossMkiiParameter::DipModelLp(v) => self.state.dip_model_lp = *v,
            GenLossMkiiParameter::DipBounce(v) => self.state.dip_bounce = *v,
            GenLossMkiiParameter::DipRandom(v) => self.state.dip_random = *v,
            GenLossMkiiParameter::DipSweep(v) => self.state.dip_sweep = *v,
            GenLossMkiiParameter::DipPolarity(v) => self.state.dip_polarity = *v,
            GenLossMkiiParameter::DipClassic(v) => self.state.dip_classic = *v,
            GenLossMkiiParameter::DipMiso(v) => self.state.dip_miso = *v,
            GenLossMkiiParameter::DipSpread(v) => self.state.dip_spread = *v,
            GenLossMkiiParameter::DipDryType(v) => self.state.dip_dry_type = *v,
            GenLossMkiiParameter::DipDropByp(v) => self.state.dip_drop_byp = *v,
            GenLossMkiiParameter::DipSnagByp(v) => self.state.dip_snag_byp = *v,
            GenLossMkiiParameter::DipHumByp(v) => self.state.dip_hum_byp = *v,
            GenLossMkiiParameter::Expression(v) => self.state.expression = *v,
            GenLossMkiiParameter::AuxOnsetTime(v) => self.state.aux_onset_time = *v,
            GenLossMkiiParameter::HissLevel(v) => self.state.hiss_level = *v,
            GenLossMkiiParameter::MechanicalNoise(v) => self.state.mechanical_noise = *v,
            GenLossMkiiParameter::CrinklePop(v) => self.state.crinkle_pop = *v,
            GenLossMkiiParameter::InputGain(v) => self.state.input_gain = *v,
            GenLossMkiiParameter::DspBypass(v) => self.state.dsp_bypass = *v,
            GenLossMkiiParameter::RampBounce(v) => self.state.ramp_bounce = *v,
            GenLossMkiiParameter::PresetSave(_) => {} // Doesn't update state
        }
    }

    /// Get the current state as a hashmap of CC numbers to values
    pub fn state_as_cc_map(&self) -> std::collections::HashMap<u8, u8> {
        self.state.to_cc_map()
    }
}

// Implement PedalCapabilities trait for compile-time enforcement
impl super::PedalCapabilities for GenLossMkii {
    type State = GenLossMkiiState;
    type Parameter = GenLossMkiiParameter;

    fn metadata(&self) -> super::PedalMetadata {
        super::PedalMetadata {
            name: "GenLossMkii",
            manufacturer: "Chase Bliss Audio",
            supports_editor: false, // No editor implemented yet
            supports_preset_library: false, // No preset library yet
        }
    }

    fn supports_program_change(&self) -> bool {
        false // Gen Loss doesn't support program change
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
    fn test_tape_model_to_cc() {
        assert_eq!(TapeModel::None.to_cc_value(), 0);
        assert_eq!(TapeModel::CPR3300Gen1.to_cc_value(), 15);
        assert_eq!(TapeModel::CPR3300Gen2.to_cc_value(), 24);
        assert_eq!(TapeModel::MPEX.to_cc_value(), 127);
    }

    #[test]
    fn test_tape_model_from_cc() {
        assert_eq!(TapeModel::from_cc_value(0), TapeModel::None);
        assert_eq!(TapeModel::from_cc_value(15), TapeModel::CPR3300Gen1);
        assert_eq!(TapeModel::from_cc_value(24), TapeModel::CPR3300Gen2);
        assert_eq!(TapeModel::from_cc_value(127), TapeModel::MPEX);

        // Test boundary values
        assert_eq!(TapeModel::from_cc_value(7), TapeModel::None);
        assert_eq!(TapeModel::from_cc_value(8), TapeModel::CPR3300Gen1);
    }

    #[test]
    fn test_tape_model_names() {
        assert_eq!(TapeModel::None.name(), "None");
        assert_eq!(TapeModel::CPR3300Gen1.name(), "CPR-3300 Gen 1");
        assert_eq!(TapeModel::MPEX.name(), "M-PEX");
    }

    #[test]
    fn test_dry_mode_to_cc() {
        assert_eq!(DryMode::Dry1.to_cc_value(), 1);
        assert_eq!(DryMode::Dry2.to_cc_value(), 2);
        assert_eq!(DryMode::Dry3.to_cc_value(), 3);
    }

    #[test]
    fn test_dry_mode_from_cc() {
        assert_eq!(DryMode::from_cc_value(1).unwrap(), DryMode::Dry1);
        assert_eq!(DryMode::from_cc_value(2).unwrap(), DryMode::Dry2);
        assert_eq!(DryMode::from_cc_value(3).unwrap(), DryMode::Dry3);
        assert!(DryMode::from_cc_value(0).is_err());
        assert!(DryMode::from_cc_value(4).is_err());
    }

    #[test]
    fn test_noise_mode_to_cc() {
        assert_eq!(NoiseMode::Noise1.to_cc_value(), 1);
        assert_eq!(NoiseMode::Noise2.to_cc_value(), 2);
        assert_eq!(NoiseMode::Noise3.to_cc_value(), 3);
    }

    #[test]
    fn test_noise_mode_from_cc() {
        assert_eq!(NoiseMode::from_cc_value(1).unwrap(), NoiseMode::Noise1);
        assert_eq!(NoiseMode::from_cc_value(2).unwrap(), NoiseMode::Noise2);
        assert_eq!(NoiseMode::from_cc_value(3).unwrap(), NoiseMode::Noise3);
        assert!(NoiseMode::from_cc_value(0).is_err());
        assert!(NoiseMode::from_cc_value(4).is_err());
    }

    #[test]
    fn test_aux_mode_to_cc() {
        assert_eq!(AuxMode::Aux1.to_cc_value(), 1);
        assert_eq!(AuxMode::Aux2.to_cc_value(), 2);
        assert_eq!(AuxMode::Aux3.to_cc_value(), 3);
    }

    #[test]
    fn test_aux_mode_from_cc() {
        assert_eq!(AuxMode::from_cc_value(1).unwrap(), AuxMode::Aux1);
        assert_eq!(AuxMode::from_cc_value(2).unwrap(), AuxMode::Aux2);
        assert_eq!(AuxMode::from_cc_value(3).unwrap(), AuxMode::Aux3);
        assert!(AuxMode::from_cc_value(0).is_err());
        assert!(AuxMode::from_cc_value(4).is_err());
    }

    #[test]
    fn test_sweep_direction_to_cc() {
        assert_eq!(SweepDirection::Bottom.to_cc_value(), 0);
        assert_eq!(SweepDirection::Top.to_cc_value(), 127);
    }

    #[test]
    fn test_sweep_direction_from_cc() {
        assert_eq!(SweepDirection::from_cc_value(0), SweepDirection::Bottom);
        assert_eq!(SweepDirection::from_cc_value(63), SweepDirection::Bottom);
        assert_eq!(SweepDirection::from_cc_value(64), SweepDirection::Top);
        assert_eq!(SweepDirection::from_cc_value(127), SweepDirection::Top);
    }

    #[test]
    fn test_polarity_to_cc() {
        assert_eq!(Polarity::Forward.to_cc_value(), 0);
        assert_eq!(Polarity::Reverse.to_cc_value(), 127);
    }

    #[test]
    fn test_polarity_from_cc() {
        assert_eq!(Polarity::from_cc_value(0), Polarity::Forward);
        assert_eq!(Polarity::from_cc_value(63), Polarity::Forward);
        assert_eq!(Polarity::from_cc_value(64), Polarity::Reverse);
        assert_eq!(Polarity::from_cc_value(127), Polarity::Reverse);
    }

    #[test]
    fn test_input_gain_to_cc() {
        assert_eq!(InputGain::LineLevel.to_cc_value(), 1);
        assert_eq!(InputGain::InstrumentLevel.to_cc_value(), 2);
        assert_eq!(InputGain::HighGain.to_cc_value(), 3);
    }

    #[test]
    fn test_input_gain_from_cc() {
        assert_eq!(InputGain::from_cc_value(1).unwrap(), InputGain::LineLevel);
        assert_eq!(
            InputGain::from_cc_value(2).unwrap(),
            InputGain::InstrumentLevel
        );
        assert_eq!(InputGain::from_cc_value(3).unwrap(), InputGain::HighGain);
        assert!(InputGain::from_cc_value(0).is_err());
        assert!(InputGain::from_cc_value(4).is_err());
    }

    #[test]
    fn test_dsp_bypass_mode_to_cc() {
        assert_eq!(DspBypassMode::TrueBypass.to_cc_value(), 0);
        assert_eq!(DspBypassMode::DspBypass.to_cc_value(), 127);
    }

    #[test]
    fn test_dsp_bypass_mode_from_cc() {
        assert_eq!(DspBypassMode::from_cc_value(0), DspBypassMode::TrueBypass);
        assert_eq!(
            DspBypassMode::from_cc_value(63),
            DspBypassMode::TrueBypass
        );
        assert_eq!(DspBypassMode::from_cc_value(64), DspBypassMode::DspBypass);
        assert_eq!(
            DspBypassMode::from_cc_value(127),
            DspBypassMode::DspBypass
        );
    }

    #[test]
    fn test_parameter_cc_numbers() {
        assert_eq!(GenLossMkiiParameter::Wow(64).cc_number(), 14);
        assert_eq!(GenLossMkiiParameter::Volume(64).cc_number(), 15);
        assert_eq!(GenLossMkiiParameter::Model(TapeModel::None).cc_number(), 16);
        assert_eq!(GenLossMkiiParameter::Flutter(64).cc_number(), 17);
        assert_eq!(GenLossMkiiParameter::Bypass(true).cc_number(), 102);
    }

    #[test]
    fn test_parameter_cc_values() {
        assert_eq!(GenLossMkiiParameter::Wow(64).cc_value(), 64);
        assert_eq!(GenLossMkiiParameter::Volume(127).cc_value(), 127);
        assert_eq!(GenLossMkiiParameter::Flutter(0).cc_value(), 0);
        assert_eq!(GenLossMkiiParameter::Bypass(true).cc_value(), 127);
        assert_eq!(GenLossMkiiParameter::Bypass(false).cc_value(), 0);
        assert_eq!(GenLossMkiiParameter::AuxSwitch(true).cc_value(), 127);
        assert_eq!(GenLossMkiiParameter::AuxSwitch(false).cc_value(), 0);
        assert_eq!(
            GenLossMkiiParameter::Model(TapeModel::CPR3300Gen1).cc_value(),
            15
        );
        assert_eq!(
            GenLossMkiiParameter::DryMode(DryMode::Dry2).cc_value(),
            2
        );
    }

    #[test]
    fn test_parameter_names() {
        assert_eq!(GenLossMkiiParameter::Wow(64).name(), "Wow");
        assert_eq!(GenLossMkiiParameter::Volume(64).name(), "Volume");
        assert_eq!(
            GenLossMkiiParameter::Model(TapeModel::None).name(),
            "Model"
        );
        assert_eq!(GenLossMkiiParameter::Bypass(true).name(), "Bypass");
    }

    #[test]
    fn test_gen_loss_new() {
        let gen_loss = GenLossMkii::new(5);
        assert_eq!(gen_loss.midi_channel, 5);
        assert_eq!(gen_loss.state.wow, 64);
        assert_eq!(gen_loss.state.volume, 100);
        assert_eq!(gen_loss.state.model, TapeModel::None);
        assert!(!gen_loss.state.bypass);
    }

    #[test]
    fn test_update_state() {
        let mut gen_loss = GenLossMkii::new(1);
        gen_loss.update_state(&GenLossMkiiParameter::Wow(100));
        assert_eq!(gen_loss.state.wow, 100);
        gen_loss.update_state(&GenLossMkiiParameter::Bypass(true));
        assert!(gen_loss.state.bypass);
        gen_loss.update_state(&GenLossMkiiParameter::Model(TapeModel::MPEX));
        assert_eq!(gen_loss.state.model, TapeModel::MPEX);
    }

    #[test]
    fn test_state_as_cc_map() {
        let gen_loss = GenLossMkii {
            midi_channel: 1,
            state: GenLossMkiiState {
                wow: 80,
                volume: 100,
                model: TapeModel::CPR3300Gen1,
                flutter: 60,
                saturate: 50,
                failure: 40,
                ramp_speed: 64,
                dry_mode: DryMode::Dry2,
                noise_mode: NoiseMode::Noise3,
                aux_mode: AuxMode::Aux1,
                bypass: true,
                aux_switch: false,
                alt_mode: false,
                left_switch: false,
                center_switch: false,
                right_switch: false,
                dip_wow: true,
                dip_flutter: false,
                dip_sat_gen: false,
                dip_failure_hp: false,
                dip_model_lp: false,
                dip_bounce: false,
                dip_random: false,
                dip_sweep: SweepDirection::Top,
                dip_polarity: Polarity::Reverse,
                dip_classic: false,
                dip_miso: false,
                dip_spread: false,
                dip_dry_type: false,
                dip_drop_byp: false,
                dip_snag_byp: false,
                dip_hum_byp: false,
                expression: 64,
                aux_onset_time: 50,
                hiss_level: 30,
                mechanical_noise: 20,
                crinkle_pop: 10,
                input_gain: InputGain::LineLevel,
                dsp_bypass: DspBypassMode::DspBypass,
                ramp_bounce: false,
            },
        };

        let cc_map = gen_loss.state_as_cc_map();

        assert_eq!(cc_map.get(&14), Some(&80)); // wow
        assert_eq!(cc_map.get(&15), Some(&100)); // volume
        assert_eq!(cc_map.get(&16), Some(&15)); // model (CPR3300Gen1)
        assert_eq!(cc_map.get(&102), Some(&127)); // bypass (true)
        assert_eq!(cc_map.get(&22), Some(&2)); // dry_mode (Dry2)
        assert_eq!(cc_map.get(&61), Some(&127)); // dip_wow (true)
        assert_eq!(cc_map.get(&62), Some(&0)); // dip_flutter (false)
        assert!(cc_map.contains_key(&14));
        assert!(cc_map.contains_key(&15));
        assert!(cc_map.contains_key(&102));
    }

    #[test]
    fn test_tape_model_round_trip() {
        let models = vec![TapeModel::None, TapeModel::CPR3300Gen1, TapeModel::MPEX];
        for model in models {
            let cc_value = model.to_cc_value();
            let recovered = TapeModel::from_cc_value(cc_value);
            assert_eq!(recovered, model);
        }
    }

    #[test]
    fn test_dry_mode_round_trip() {
        for i in 1..=3 {
            let mode = DryMode::from_cc_value(i).unwrap();
            assert_eq!(mode.to_cc_value(), i);
        }
    }
}

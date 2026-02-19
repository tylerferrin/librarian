// Gen Loss MKII MIDI CC mapping - infrastructure layer

use super::types::{
    GenLossMkiiParameter, GenLossMkiiState,
};
use std::collections::HashMap;

impl GenLossMkiiParameter {
    /// Get the CC number for this parameter
    pub fn cc_number(&self) -> u8 {
        match self {
            GenLossMkiiParameter::Wow(_) => 14,
            GenLossMkiiParameter::Volume(_) => 15,
            GenLossMkiiParameter::Model(_) => 16,
            GenLossMkiiParameter::Flutter(_) => 17,
            GenLossMkiiParameter::Saturate(_) => 18,
            GenLossMkiiParameter::Failure(_) => 19,
            GenLossMkiiParameter::RampSpeed(_) => 20,

            GenLossMkiiParameter::AuxMode(_) => 21,
            GenLossMkiiParameter::DryMode(_) => 22,
            GenLossMkiiParameter::NoiseMode(_) => 23,

            GenLossMkiiParameter::Bypass(_) => 102,
            GenLossMkiiParameter::AuxSwitch(_) => 103,
            GenLossMkiiParameter::AltMode(_) => 104,

            GenLossMkiiParameter::LeftSwitch(_) => 105,
            GenLossMkiiParameter::CenterSwitch(_) => 106,
            GenLossMkiiParameter::RightSwitch(_) => 107,

            GenLossMkiiParameter::DipWow(_) => 61,
            GenLossMkiiParameter::DipFlutter(_) => 62,
            GenLossMkiiParameter::DipSatGen(_) => 63,
            GenLossMkiiParameter::DipFailureHp(_) => 64,
            GenLossMkiiParameter::DipModelLp(_) => 65,
            GenLossMkiiParameter::DipBounce(_) => 66,
            GenLossMkiiParameter::DipRandom(_) => 67,
            GenLossMkiiParameter::DipSweep(_) => 68,

            GenLossMkiiParameter::DipPolarity(_) => 71,
            GenLossMkiiParameter::DipClassic(_) => 72,
            GenLossMkiiParameter::DipMiso(_) => 73,
            GenLossMkiiParameter::DipSpread(_) => 74,
            GenLossMkiiParameter::DipDryType(_) => 75,
            GenLossMkiiParameter::DipDropByp(_) => 76,
            GenLossMkiiParameter::DipSnagByp(_) => 77,
            GenLossMkiiParameter::DipHumByp(_) => 78,

            GenLossMkiiParameter::Expression(_) => 100,
            GenLossMkiiParameter::AuxOnsetTime(_) => 24,
            GenLossMkiiParameter::HissLevel(_) => 27,
            GenLossMkiiParameter::MechanicalNoise(_) => 28,
            GenLossMkiiParameter::CrinklePop(_) => 29,
            GenLossMkiiParameter::InputGain(_) => 32,
            GenLossMkiiParameter::DspBypass(_) => 26,
            GenLossMkiiParameter::PresetSave(_) => 111,
            GenLossMkiiParameter::RampBounce(_) => 52,
        }
    }

    /// Get the CC value for this parameter
    pub fn cc_value(&self) -> u8 {
        match self {
            // Continuous parameters
            GenLossMkiiParameter::Wow(v)
            | GenLossMkiiParameter::Volume(v)
            | GenLossMkiiParameter::Flutter(v)
            | GenLossMkiiParameter::Saturate(v)
            | GenLossMkiiParameter::Failure(v)
            | GenLossMkiiParameter::RampSpeed(v)
            | GenLossMkiiParameter::Expression(v)
            | GenLossMkiiParameter::AuxOnsetTime(v)
            | GenLossMkiiParameter::HissLevel(v)
            | GenLossMkiiParameter::MechanicalNoise(v)
            | GenLossMkiiParameter::CrinklePop(v)
            | GenLossMkiiParameter::PresetSave(v) => *v,

            // Enum parameters
            GenLossMkiiParameter::Model(m) => m.to_cc_value(),
            GenLossMkiiParameter::DryMode(m) => m.to_cc_value(),
            GenLossMkiiParameter::NoiseMode(m) => m.to_cc_value(),
            GenLossMkiiParameter::AuxMode(m) => m.to_cc_value(),
            GenLossMkiiParameter::DipSweep(d) => d.to_cc_value(),
            GenLossMkiiParameter::DipPolarity(p) => p.to_cc_value(),
            GenLossMkiiParameter::InputGain(g) => g.to_cc_value(),
            GenLossMkiiParameter::DspBypass(m) => m.to_cc_value(),

            // Binary parameters
            GenLossMkiiParameter::Bypass(b)
            | GenLossMkiiParameter::AuxSwitch(b)
            | GenLossMkiiParameter::AltMode(b)
            | GenLossMkiiParameter::LeftSwitch(b)
            | GenLossMkiiParameter::CenterSwitch(b)
            | GenLossMkiiParameter::RightSwitch(b)
            | GenLossMkiiParameter::DipWow(b)
            | GenLossMkiiParameter::DipFlutter(b)
            | GenLossMkiiParameter::DipSatGen(b)
            | GenLossMkiiParameter::DipFailureHp(b)
            | GenLossMkiiParameter::DipModelLp(b)
            | GenLossMkiiParameter::DipBounce(b)
            | GenLossMkiiParameter::DipRandom(b)
            | GenLossMkiiParameter::DipClassic(b)
            | GenLossMkiiParameter::DipMiso(b)
            | GenLossMkiiParameter::DipSpread(b)
            | GenLossMkiiParameter::DipDryType(b)
            | GenLossMkiiParameter::DipDropByp(b)
            | GenLossMkiiParameter::DipSnagByp(b)
            | GenLossMkiiParameter::DipHumByp(b)
            | GenLossMkiiParameter::RampBounce(b) => {
                if *b { 127 } else { 0 }
            }
        }
    }

    /// Get a human-readable name for this parameter
    pub fn name(&self) -> &'static str {
        match self {
            GenLossMkiiParameter::Wow(_) => "Wow",
            GenLossMkiiParameter::Volume(_) => "Volume",
            GenLossMkiiParameter::Model(_) => "Model",
            GenLossMkiiParameter::Flutter(_) => "Flutter",
            GenLossMkiiParameter::Saturate(_) => "Saturate",
            GenLossMkiiParameter::Failure(_) => "Failure",
            GenLossMkiiParameter::RampSpeed(_) => "Ramp Speed",
            GenLossMkiiParameter::DryMode(_) => "Dry Mode",
            GenLossMkiiParameter::NoiseMode(_) => "Noise Mode",
            GenLossMkiiParameter::AuxMode(_) => "Aux Mode",
            GenLossMkiiParameter::Bypass(_) => "Bypass",
            GenLossMkiiParameter::AuxSwitch(_) => "Aux Switch",
            GenLossMkiiParameter::AltMode(_) => "Alt Mode",
            GenLossMkiiParameter::LeftSwitch(_) => "Left Switch",
            GenLossMkiiParameter::CenterSwitch(_) => "Center Switch",
            GenLossMkiiParameter::RightSwitch(_) => "Right Switch",
            GenLossMkiiParameter::DipWow(_) => "DIP: Wow",
            GenLossMkiiParameter::DipFlutter(_) => "DIP: Flutter",
            GenLossMkiiParameter::DipSatGen(_) => "DIP: Sat/Gen",
            GenLossMkiiParameter::DipFailureHp(_) => "DIP: Failure/HP",
            GenLossMkiiParameter::DipModelLp(_) => "DIP: Model/LP",
            GenLossMkiiParameter::DipBounce(_) => "DIP: Bounce",
            GenLossMkiiParameter::DipRandom(_) => "DIP: Random",
            GenLossMkiiParameter::DipSweep(_) => "DIP: Sweep",
            GenLossMkiiParameter::DipPolarity(_) => "DIP: Polarity",
            GenLossMkiiParameter::DipClassic(_) => "DIP: Classic",
            GenLossMkiiParameter::DipMiso(_) => "DIP: Miso",
            GenLossMkiiParameter::DipSpread(_) => "DIP: Spread",
            GenLossMkiiParameter::DipDryType(_) => "DIP: Dry Type",
            GenLossMkiiParameter::DipDropByp(_) => "DIP: Drop Byp",
            GenLossMkiiParameter::DipSnagByp(_) => "DIP: Snag Byp",
            GenLossMkiiParameter::DipHumByp(_) => "DIP: Hum Byp",
            GenLossMkiiParameter::Expression(_) => "Expression",
            GenLossMkiiParameter::AuxOnsetTime(_) => "Aux Onset Time",
            GenLossMkiiParameter::HissLevel(_) => "Hiss Level",
            GenLossMkiiParameter::MechanicalNoise(_) => "Mechanical Noise",
            GenLossMkiiParameter::CrinklePop(_) => "Crinkle Pop",
            GenLossMkiiParameter::InputGain(_) => "Input Gain",
            GenLossMkiiParameter::DspBypass(_) => "DSP Bypass",
            GenLossMkiiParameter::PresetSave(_) => "Preset Save",
            GenLossMkiiParameter::RampBounce(_) => "Ramp/Bounce",
        }
    }
}

impl GenLossMkiiState {
    /// Convert the current state to a map of CC numbers → CC values.
    /// Used when recalling a full preset (sending all parameters at once).
    pub fn to_cc_map(&self) -> HashMap<u8, u8> {
        let mut map = HashMap::new();

        // Main knobs
        map.insert(14, self.wow);
        map.insert(15, self.volume);
        map.insert(16, self.model.to_cc_value());
        map.insert(17, self.flutter);
        map.insert(18, self.saturate);
        map.insert(19, self.failure);
        map.insert(20, self.ramp_speed);

        // Toggles
        map.insert(21, self.aux_mode.to_cc_value());
        map.insert(22, self.dry_mode.to_cc_value());
        map.insert(23, self.noise_mode.to_cc_value());

        // Switches
        map.insert(102, if self.bypass { 127 } else { 0 });
        map.insert(103, if self.aux_switch { 127 } else { 0 });
        map.insert(104, if self.alt_mode { 127 } else { 0 });
        map.insert(105, if self.left_switch { 127 } else { 0 });
        map.insert(106, if self.center_switch { 127 } else { 0 });
        map.insert(107, if self.right_switch { 127 } else { 0 });

        // DIP switches - Left bank
        map.insert(61, if self.dip_wow { 127 } else { 0 });
        map.insert(62, if self.dip_flutter { 127 } else { 0 });
        map.insert(63, if self.dip_sat_gen { 127 } else { 0 });
        map.insert(64, if self.dip_failure_hp { 127 } else { 0 });
        map.insert(65, if self.dip_model_lp { 127 } else { 0 });
        map.insert(66, if self.dip_bounce { 127 } else { 0 });
        map.insert(67, if self.dip_random { 127 } else { 0 });
        map.insert(68, self.dip_sweep.to_cc_value());

        // DIP switches - Right bank
        map.insert(71, self.dip_polarity.to_cc_value());
        map.insert(72, if self.dip_classic { 127 } else { 0 });
        map.insert(73, if self.dip_miso { 127 } else { 0 });
        map.insert(74, if self.dip_spread { 127 } else { 0 });
        map.insert(75, if self.dip_dry_type { 127 } else { 0 });
        map.insert(76, if self.dip_drop_byp { 127 } else { 0 });
        map.insert(77, if self.dip_snag_byp { 127 } else { 0 });
        map.insert(78, if self.dip_hum_byp { 127 } else { 0 });

        // Advanced
        map.insert(100, self.expression);
        map.insert(24, self.aux_onset_time);
        map.insert(27, self.hiss_level);
        map.insert(28, self.mechanical_noise);
        map.insert(29, self.crinkle_pop);
        map.insert(32, self.input_gain.to_cc_value());
        map.insert(26, self.dsp_bypass.to_cc_value());
        map.insert(52, if self.ramp_bounce { 127 } else { 0 });

        map
    }
}

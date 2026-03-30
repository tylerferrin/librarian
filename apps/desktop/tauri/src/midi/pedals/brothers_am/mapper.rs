// Brothers AM MIDI CC mapping - infrastructure layer

use super::types::{BrothersAmParameter, BrothersAmState};
use std::collections::HashMap;

pub const CC_PRESET_SAVE: u8 = 111;

impl BrothersAmParameter {
    /// Get the CC number for this parameter
    pub fn cc_number(&self) -> u8 {
        match self {
            // Main knobs - Channel 2
            BrothersAmParameter::Gain2(_) => 14,
            BrothersAmParameter::Volume2(_) => 15,
            BrothersAmParameter::Gain1(_) => 16,
            BrothersAmParameter::Tone2(_) => 17,
            BrothersAmParameter::Volume1(_) => 18,
            BrothersAmParameter::Tone1(_) => 19,

            // Presence knobs (in the hidden options CC range but used as main knobs)
            BrothersAmParameter::Presence2(_) => 27,
            BrothersAmParameter::Presence1(_) => 29,

            // Three-position toggles
            BrothersAmParameter::Gain2Type(_) => 21,
            BrothersAmParameter::TrebleBoost(_) => 22,
            BrothersAmParameter::Gain1Type(_) => 23,

            // Footswitches
            BrothersAmParameter::Channel1Bypass(_) => 102,
            BrothersAmParameter::Channel2Bypass(_) => 103,

            // DIP switches - Left bank
            BrothersAmParameter::DipVolume1(_) => 61,
            BrothersAmParameter::DipVolume2(_) => 62,
            BrothersAmParameter::DipGain1(_) => 63,
            BrothersAmParameter::DipGain2(_) => 64,
            BrothersAmParameter::DipTone1(_) => 65,
            BrothersAmParameter::DipTone2(_) => 66,
            BrothersAmParameter::DipSweep(_) => 67,
            BrothersAmParameter::DipPolarity(_) => 68,

            // DIP switches - Right bank (CC 71-77 only, no CC 78)
            BrothersAmParameter::DipHiGain1(_) => 71,
            BrothersAmParameter::DipHiGain2(_) => 72,
            BrothersAmParameter::DipMotoByp1(_) => 73,
            BrothersAmParameter::DipMotoByp2(_) => 74,
            BrothersAmParameter::DipPresLink1(_) => 75,
            BrothersAmParameter::DipPresLink2(_) => 76,
            BrothersAmParameter::DipMaster(_) => 77,

            // Utility
            BrothersAmParameter::Expression(_) => 100,
            BrothersAmParameter::PresetSave(_) => 111,
        }
    }

    /// Get the CC value for this parameter
    pub fn cc_value(&self) -> u8 {
        match self {
            // Continuous parameters
            BrothersAmParameter::Gain2(v)
            | BrothersAmParameter::Volume2(v)
            | BrothersAmParameter::Gain1(v)
            | BrothersAmParameter::Tone2(v)
            | BrothersAmParameter::Volume1(v)
            | BrothersAmParameter::Tone1(v)
            | BrothersAmParameter::Presence2(v)
            | BrothersAmParameter::Presence1(v)
            | BrothersAmParameter::Expression(v)
            | BrothersAmParameter::PresetSave(v) => *v,

            // Enum parameters
            BrothersAmParameter::Gain2Type(t) => t.to_cc_value(),
            BrothersAmParameter::TrebleBoost(t) => t.to_cc_value(),
            BrothersAmParameter::Gain1Type(t) => t.to_cc_value(),
            BrothersAmParameter::DipSweep(d) => d.to_cc_value(),
            BrothersAmParameter::DipPolarity(p) => p.to_cc_value(),

            // Binary parameters
            BrothersAmParameter::Channel1Bypass(b)
            | BrothersAmParameter::Channel2Bypass(b)
            | BrothersAmParameter::DipVolume1(b)
            | BrothersAmParameter::DipVolume2(b)
            | BrothersAmParameter::DipGain1(b)
            | BrothersAmParameter::DipGain2(b)
            | BrothersAmParameter::DipTone1(b)
            | BrothersAmParameter::DipTone2(b)
            | BrothersAmParameter::DipHiGain1(b)
            | BrothersAmParameter::DipHiGain2(b)
            | BrothersAmParameter::DipMotoByp1(b)
            | BrothersAmParameter::DipMotoByp2(b)
            | BrothersAmParameter::DipPresLink1(b)
            | BrothersAmParameter::DipPresLink2(b)
            | BrothersAmParameter::DipMaster(b) => {
                if *b { 127 } else { 0 }
            }
        }
    }

    /// Get a human-readable name for this parameter
    pub fn name(&self) -> &'static str {
        match self {
            BrothersAmParameter::Gain2(_) => "Gain 2",
            BrothersAmParameter::Volume2(_) => "Volume 2",
            BrothersAmParameter::Gain1(_) => "Gain 1",
            BrothersAmParameter::Tone2(_) => "Tone 2",
            BrothersAmParameter::Volume1(_) => "Volume 1",
            BrothersAmParameter::Tone1(_) => "Tone 1",
            BrothersAmParameter::Presence2(_) => "Presence 2",
            BrothersAmParameter::Presence1(_) => "Presence 1",
            BrothersAmParameter::Gain2Type(_) => "Gain 2 Type",
            BrothersAmParameter::TrebleBoost(_) => "Treble Boost",
            BrothersAmParameter::Gain1Type(_) => "Gain 1 Type",
            BrothersAmParameter::Channel1Bypass(_) => "Channel 1 Bypass",
            BrothersAmParameter::Channel2Bypass(_) => "Channel 2 Bypass",
            BrothersAmParameter::DipVolume1(_) => "DIP: Volume 1",
            BrothersAmParameter::DipVolume2(_) => "DIP: Volume 2",
            BrothersAmParameter::DipGain1(_) => "DIP: Gain 1",
            BrothersAmParameter::DipGain2(_) => "DIP: Gain 2",
            BrothersAmParameter::DipTone1(_) => "DIP: Tone 1",
            BrothersAmParameter::DipTone2(_) => "DIP: Tone 2",
            BrothersAmParameter::DipSweep(_) => "DIP: Sweep",
            BrothersAmParameter::DipPolarity(_) => "DIP: Polarity",
            BrothersAmParameter::DipHiGain1(_) => "DIP: Hi Gain 1",
            BrothersAmParameter::DipHiGain2(_) => "DIP: Hi Gain 2",
            BrothersAmParameter::DipMotoByp1(_) => "DIP: Moto Byp 1",
            BrothersAmParameter::DipMotoByp2(_) => "DIP: Moto Byp 2",
            BrothersAmParameter::DipPresLink1(_) => "DIP: Pres Link 1",
            BrothersAmParameter::DipPresLink2(_) => "DIP: Pres Link 2",
            BrothersAmParameter::DipMaster(_) => "DIP: Master",
            BrothersAmParameter::Expression(_) => "Expression",
            BrothersAmParameter::PresetSave(_) => "Preset Save",
        }
    }
}

impl BrothersAmState {
    /// Convert the current state to a map of CC numbers → CC values.
    /// Used when recalling a full preset (sending all parameters at once).
    pub fn to_cc_map(&self) -> HashMap<u8, u8> {
        let mut map = HashMap::new();

        // Main knobs - Channel 2
        map.insert(14, self.gain2);
        map.insert(15, self.volume2);
        map.insert(17, self.tone2);
        map.insert(27, self.presence2);

        // Main knobs - Channel 1
        map.insert(16, self.gain1);
        map.insert(18, self.volume1);
        map.insert(19, self.tone1);
        map.insert(29, self.presence1);

        // Three-position toggles
        map.insert(21, self.gain2_type.to_cc_value());
        map.insert(22, self.treble_boost.to_cc_value());
        map.insert(23, self.gain1_type.to_cc_value());

        // Footswitches
        map.insert(102, if self.channel1_bypass { 127 } else { 0 });
        map.insert(103, if self.channel2_bypass { 127 } else { 0 });

        // DIP switches - Left bank
        map.insert(61, if self.dip_volume1 { 127 } else { 0 });
        map.insert(62, if self.dip_volume2 { 127 } else { 0 });
        map.insert(63, if self.dip_gain1 { 127 } else { 0 });
        map.insert(64, if self.dip_gain2 { 127 } else { 0 });
        map.insert(65, if self.dip_tone1 { 127 } else { 0 });
        map.insert(66, if self.dip_tone2 { 127 } else { 0 });
        map.insert(67, self.dip_sweep.to_cc_value());
        map.insert(68, self.dip_polarity.to_cc_value());

        // DIP switches - Right bank (CC 71-77, no CC 78)
        map.insert(71, if self.dip_hi_gain1 { 127 } else { 0 });
        map.insert(72, if self.dip_hi_gain2 { 127 } else { 0 });
        map.insert(73, if self.dip_moto_byp1 { 127 } else { 0 });
        map.insert(74, if self.dip_moto_byp2 { 127 } else { 0 });
        map.insert(75, if self.dip_pres_link1 { 127 } else { 0 });
        map.insert(76, if self.dip_pres_link2 { 127 } else { 0 });
        map.insert(77, if self.dip_master { 127 } else { 0 });

        // Utility
        map.insert(100, self.expression);

        map
    }
}

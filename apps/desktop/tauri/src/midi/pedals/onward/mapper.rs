// Chase Bliss Audio Onward MIDI CC mapping - infrastructure layer

use super::types::{OnwardParameter, OnwardState};
use std::collections::HashMap;

pub const CC_PRESET_SAVE: u8 = 111;

impl OnwardParameter {
    /// Get the CC number for this parameter
    pub fn cc_number(&self) -> u8 {
        match self {
            OnwardParameter::Size(_) => 14,
            OnwardParameter::Mix(_) => 15,
            OnwardParameter::Octave(_) => 16,
            OnwardParameter::Error(_) => 17,
            OnwardParameter::Sustain(_) => 18,
            OnwardParameter::Texture(_) => 19,
            OnwardParameter::RampSpeed(_) => 20,

            OnwardParameter::ErrorType(_) => 21,
            OnwardParameter::FadeMode(_) => 22,
            OnwardParameter::AnimateMode(_) => 23,

            OnwardParameter::Sensitivity(_) => 24,
            OnwardParameter::Balance(_) => 25,
            OnwardParameter::DuckDepth(_) => 26,
            OnwardParameter::ErrorBlend(_) => 27,
            OnwardParameter::UserFade(_) => 28,
            OnwardParameter::Filter(_) => 29,
            OnwardParameter::ErrorRouting(_) => 31,
            OnwardParameter::SustainRouting(_) => 32,
            OnwardParameter::EffectsRouting(_) => 33,

            OnwardParameter::FreezeBypass(_) => 102,
            OnwardParameter::GlitchBypass(_) => 103,
            OnwardParameter::AltMode(_) => 104,
            OnwardParameter::GlitchHold(_) => 105,
            OnwardParameter::FreezeHold(_) => 106,
            OnwardParameter::RetriggerGlitch(_) => 108,
            OnwardParameter::RetriggerFreeze(_) => 109,

            OnwardParameter::DipSize(_) => 61,
            OnwardParameter::DipError(_) => 62,
            OnwardParameter::DipSustain(_) => 63,
            OnwardParameter::DipTexture(_) => 64,
            OnwardParameter::DipOctave(_) => 65,
            OnwardParameter::DipBounce(_) => 66,
            OnwardParameter::DipSweep(_) => 67,
            OnwardParameter::DipPolarity(_) => 68,

            OnwardParameter::DipMiso(_) => 71,
            OnwardParameter::DipSpread(_) => 72,
            OnwardParameter::DipLatch(_) => 73,
            OnwardParameter::DipSidechain(_) => 74,
            OnwardParameter::DipDuck(_) => 75,
            OnwardParameter::DipReverse(_) => 76,
            OnwardParameter::DipHalfSpeed(_) => 77,
            OnwardParameter::DipManual(_) => 78,

            OnwardParameter::MidiClockIgnore(_) => 51,
            OnwardParameter::RampBounce(_) => 52,
            OnwardParameter::DryKill(_) => 57,
            OnwardParameter::Trails(_) => 58,
            OnwardParameter::Expression(_) => 100,
            OnwardParameter::PresetSave(_) => 111,
        }
    }

    /// Get the CC value for this parameter
    pub fn cc_value(&self) -> u8 {
        match self {
            // Continuous parameters
            OnwardParameter::Size(v)
            | OnwardParameter::Mix(v)
            | OnwardParameter::Octave(v)
            | OnwardParameter::Error(v)
            | OnwardParameter::Sustain(v)
            | OnwardParameter::Texture(v)
            | OnwardParameter::RampSpeed(v)
            | OnwardParameter::Sensitivity(v)
            | OnwardParameter::Balance(v)
            | OnwardParameter::DuckDepth(v)
            | OnwardParameter::ErrorBlend(v)
            | OnwardParameter::UserFade(v)
            | OnwardParameter::Filter(v)
            | OnwardParameter::Expression(v)
            | OnwardParameter::PresetSave(v) => *v,

            // Enum parameters
            OnwardParameter::ErrorType(m) => m.to_cc_value(),
            OnwardParameter::FadeMode(m) => m.to_cc_value(),
            OnwardParameter::AnimateMode(m) => m.to_cc_value(),
            OnwardParameter::ErrorRouting(m) => m.to_cc_value(),
            OnwardParameter::SustainRouting(m) => m.to_cc_value(),
            OnwardParameter::EffectsRouting(m) => m.to_cc_value(),
            OnwardParameter::DipSweep(d) => d.to_cc_value(),
            OnwardParameter::DipPolarity(p) => p.to_cc_value(),

            // Binary parameters
            OnwardParameter::FreezeBypass(b)
            | OnwardParameter::GlitchBypass(b)
            | OnwardParameter::AltMode(b)
            | OnwardParameter::GlitchHold(b)
            | OnwardParameter::FreezeHold(b)
            | OnwardParameter::RetriggerGlitch(b)
            | OnwardParameter::RetriggerFreeze(b)
            | OnwardParameter::DipSize(b)
            | OnwardParameter::DipError(b)
            | OnwardParameter::DipSustain(b)
            | OnwardParameter::DipTexture(b)
            | OnwardParameter::DipOctave(b)
            | OnwardParameter::DipBounce(b)
            | OnwardParameter::DipMiso(b)
            | OnwardParameter::DipSpread(b)
            | OnwardParameter::DipLatch(b)
            | OnwardParameter::DipSidechain(b)
            | OnwardParameter::DipDuck(b)
            | OnwardParameter::DipReverse(b)
            | OnwardParameter::DipHalfSpeed(b)
            | OnwardParameter::DipManual(b)
            | OnwardParameter::MidiClockIgnore(b)
            | OnwardParameter::RampBounce(b)
            | OnwardParameter::DryKill(b)
            | OnwardParameter::Trails(b) => {
                if *b { 127 } else { 0 }
            }
        }
    }

    /// Get a human-readable name for this parameter
    pub fn name(&self) -> &'static str {
        match self {
            OnwardParameter::Size(_) => "Size",
            OnwardParameter::Mix(_) => "Mix",
            OnwardParameter::Octave(_) => "Octave",
            OnwardParameter::Error(_) => "Error",
            OnwardParameter::Sustain(_) => "Sustain",
            OnwardParameter::Texture(_) => "Texture",
            OnwardParameter::RampSpeed(_) => "Ramp Speed",
            OnwardParameter::ErrorType(_) => "Error Type",
            OnwardParameter::FadeMode(_) => "Fade Mode",
            OnwardParameter::AnimateMode(_) => "Animate Mode",
            OnwardParameter::Sensitivity(_) => "Sensitivity",
            OnwardParameter::Balance(_) => "Balance",
            OnwardParameter::DuckDepth(_) => "Duck Depth",
            OnwardParameter::ErrorBlend(_) => "Error Blend",
            OnwardParameter::UserFade(_) => "User Fade",
            OnwardParameter::Filter(_) => "Filter",
            OnwardParameter::ErrorRouting(_) => "Error Routing",
            OnwardParameter::SustainRouting(_) => "Sustain Routing",
            OnwardParameter::EffectsRouting(_) => "Effects Routing",
            OnwardParameter::FreezeBypass(_) => "Freeze Bypass",
            OnwardParameter::GlitchBypass(_) => "Glitch Bypass",
            OnwardParameter::AltMode(_) => "Alt Mode",
            OnwardParameter::GlitchHold(_) => "Glitch Hold",
            OnwardParameter::FreezeHold(_) => "Freeze Hold",
            OnwardParameter::RetriggerGlitch(_) => "Retrigger Glitch",
            OnwardParameter::RetriggerFreeze(_) => "Retrigger Freeze",
            OnwardParameter::DipSize(_) => "DIP: Size",
            OnwardParameter::DipError(_) => "DIP: Error",
            OnwardParameter::DipSustain(_) => "DIP: Sustain",
            OnwardParameter::DipTexture(_) => "DIP: Texture",
            OnwardParameter::DipOctave(_) => "DIP: Octave",
            OnwardParameter::DipBounce(_) => "DIP: Bounce",
            OnwardParameter::DipSweep(_) => "DIP: Sweep",
            OnwardParameter::DipPolarity(_) => "DIP: Polarity",
            OnwardParameter::DipMiso(_) => "DIP: Miso",
            OnwardParameter::DipSpread(_) => "DIP: Spread",
            OnwardParameter::DipLatch(_) => "DIP: Latch",
            OnwardParameter::DipSidechain(_) => "DIP: Sidechain",
            OnwardParameter::DipDuck(_) => "DIP: Duck",
            OnwardParameter::DipReverse(_) => "DIP: Reverse",
            OnwardParameter::DipHalfSpeed(_) => "DIP: Half Speed",
            OnwardParameter::DipManual(_) => "DIP: Manual",
            OnwardParameter::MidiClockIgnore(_) => "MIDI Clock Ignore",
            OnwardParameter::RampBounce(_) => "Ramp/Bounce",
            OnwardParameter::DryKill(_) => "Dry Kill",
            OnwardParameter::Trails(_) => "Trails",
            OnwardParameter::Expression(_) => "Expression",
            OnwardParameter::PresetSave(_) => "Preset Save",
        }
    }
}

impl OnwardState {
    /// Convert the current state to a map of CC numbers → CC values.
    /// Used when recalling a full preset (sending all parameters at once).
    pub fn to_cc_map(&self) -> HashMap<u8, u8> {
        let mut map = HashMap::new();

        // Main knobs
        map.insert(14, self.size);
        map.insert(15, self.mix);
        map.insert(16, self.octave);
        map.insert(17, self.error);
        map.insert(18, self.sustain);
        map.insert(19, self.texture);
        map.insert(20, self.ramp_speed);

        // Toggles
        map.insert(21, self.error_type.to_cc_value());
        map.insert(22, self.fade_mode.to_cc_value());
        map.insert(23, self.animate_mode.to_cc_value());

        // Hidden options
        map.insert(24, self.sensitivity);
        map.insert(25, self.balance);
        map.insert(26, self.duck_depth);
        map.insert(27, self.error_blend);
        map.insert(28, self.user_fade);
        map.insert(29, self.filter);
        map.insert(31, self.error_routing.to_cc_value());
        map.insert(32, self.sustain_routing.to_cc_value());
        map.insert(33, self.effects_routing.to_cc_value());

        // Footswitches
        map.insert(102, if self.freeze_bypass { 127 } else { 0 });
        map.insert(103, if self.glitch_bypass { 127 } else { 0 });
        map.insert(104, if self.alt_mode { 127 } else { 0 });
        map.insert(105, if self.glitch_hold { 127 } else { 0 });
        map.insert(106, if self.freeze_hold { 127 } else { 0 });
        map.insert(108, if self.retrigger_glitch { 127 } else { 0 });
        map.insert(109, if self.retrigger_freeze { 127 } else { 0 });

        // DIP switches - Left bank
        map.insert(61, if self.dip_size { 127 } else { 0 });
        map.insert(62, if self.dip_error { 127 } else { 0 });
        map.insert(63, if self.dip_sustain { 127 } else { 0 });
        map.insert(64, if self.dip_texture { 127 } else { 0 });
        map.insert(65, if self.dip_octave { 127 } else { 0 });
        map.insert(66, if self.dip_bounce { 127 } else { 0 });
        map.insert(67, self.dip_sweep.to_cc_value());
        map.insert(68, self.dip_polarity.to_cc_value());

        // DIP switches - Right bank
        map.insert(71, if self.dip_miso { 127 } else { 0 });
        map.insert(72, if self.dip_spread { 127 } else { 0 });
        map.insert(73, if self.dip_latch { 127 } else { 0 });
        map.insert(74, if self.dip_sidechain { 127 } else { 0 });
        map.insert(75, if self.dip_duck { 127 } else { 0 });
        map.insert(76, if self.dip_reverse { 127 } else { 0 });
        map.insert(77, if self.dip_half_speed { 127 } else { 0 });
        map.insert(78, if self.dip_manual { 127 } else { 0 });

        // Utility
        map.insert(51, if self.midi_clock_ignore { 127 } else { 0 });
        map.insert(52, if self.ramp_bounce { 127 } else { 0 });
        map.insert(57, if self.dry_kill { 127 } else { 0 });
        map.insert(58, if self.trails { 127 } else { 0 });
        map.insert(100, self.expression);

        map
    }
}

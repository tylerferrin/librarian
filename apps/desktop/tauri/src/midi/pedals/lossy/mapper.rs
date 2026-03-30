// Lossy MIDI CC mapping - infrastructure layer

use super::types::{LossyParameter, LossyState};
use std::collections::HashMap;

pub const CC_PRESET_SAVE: u8 = 111;

impl LossyParameter {
    /// Get the CC number for this parameter
    pub fn cc_number(&self) -> u8 {
        match self {
            // Main knobs
            Self::Filter(_) => 14,
            Self::Global(_) => 15,
            Self::Reverb(_) => 16,
            Self::Freq(_) => 17,
            Self::Speed(_) => 18,
            Self::Loss(_) => 19,
            Self::RampSpeed(_) => 20,

            // Three-position toggles
            Self::FilterSlope(_) => 21,
            Self::PacketMode(_) => 22,
            Self::LossEffect(_) => 23,

            // Hidden options
            Self::Gate(_) => 24,
            Self::Freezer(_) => 25,
            Self::VerbDecay(_) => 26,
            Self::LimiterThreshold(_) => 27,
            Self::AutoGain(_) => 28,
            Self::LossGain(_) => 29,
            Self::Weighting(_) => 33,

            // Utility
            Self::RampBounce(_) => 52,
            Self::DryKill(_) => 57,

            // Left DIP bank
            Self::DipFilter(_) => 61,
            Self::DipFreq(_) => 62,
            Self::DipSpeed(_) => 63,
            Self::DipLoss(_) => 64,
            Self::DipVerb(_) => 65,
            Self::DipBounce(_) => 66,
            Self::DipSweep(_) => 67,
            Self::DipPolarity(_) => 68,

            // Right DIP bank
            Self::DipMiso(_) => 71,
            Self::DipSpread(_) => 72,
            Self::DipTrails(_) => 73,
            Self::DipLatch(_) => 74,
            Self::DipPrePost(_) => 75,
            Self::DipSlow(_) => 76,
            Self::DipInvert(_) => 77,
            Self::DipAllWet(_) => 78,

            // Expression / footswitches / preset
            Self::Expression(_) => 100,
            Self::Bypass(_) => 102,
            Self::FreezeSlushie(_) => 103,
            Self::AltMode(_) => 104,
            Self::FreezeSolid(_) => 105,
            Self::GateSwitch(_) => 106,
            Self::PresetSave(_) => 111,
        }
    }

    /// Get the CC value for this parameter
    pub fn cc_value(&self) -> u8 {
        match self {
            // Continuous
            Self::Filter(v)
            | Self::Global(v)
            | Self::Reverb(v)
            | Self::Freq(v)
            | Self::Speed(v)
            | Self::Loss(v)
            | Self::RampSpeed(v)
            | Self::Gate(v)
            | Self::Freezer(v)
            | Self::VerbDecay(v)
            | Self::LimiterThreshold(v)
            | Self::AutoGain(v)
            | Self::LossGain(v)
            | Self::Expression(v)
            | Self::PresetSave(v) => *v,

            // Three-position enums
            Self::FilterSlope(v) => v.to_cc_value(),
            Self::PacketMode(v) => v.to_cc_value(),
            Self::LossEffect(v) => v.to_cc_value(),
            Self::Weighting(v) => v.to_cc_value(),

            // Two-position enums
            Self::DipSweep(v) => v.to_cc_value(),
            Self::DipPolarity(v) => v.to_cc_value(),

            // Binary (bool → 0 or 127)
            Self::Bypass(b)
            | Self::FreezeSlushie(b)
            | Self::AltMode(b)
            | Self::FreezeSolid(b)
            | Self::GateSwitch(b)
            | Self::DipFilter(b)
            | Self::DipFreq(b)
            | Self::DipSpeed(b)
            | Self::DipLoss(b)
            | Self::DipVerb(b)
            | Self::DipBounce(b)
            | Self::DipMiso(b)
            | Self::DipSpread(b)
            | Self::DipTrails(b)
            | Self::DipLatch(b)
            | Self::DipPrePost(b)
            | Self::DipSlow(b)
            | Self::DipInvert(b)
            | Self::DipAllWet(b)
            | Self::RampBounce(b)
            | Self::DryKill(b) => if *b { 127 } else { 0 },
        }
    }

    /// Get a human-readable name for this parameter
    pub fn name(&self) -> &'static str {
        match self {
            Self::Filter(_) => "Filter",
            Self::Global(_) => "Global",
            Self::Reverb(_) => "Reverb",
            Self::Freq(_) => "Freq",
            Self::Speed(_) => "Speed",
            Self::Loss(_) => "Loss",
            Self::RampSpeed(_) => "Ramp Speed",
            Self::FilterSlope(_) => "Filter Slope",
            Self::PacketMode(_) => "Packet Mode",
            Self::LossEffect(_) => "Loss Effect",
            Self::Gate(_) => "Gate",
            Self::Freezer(_) => "Freezer",
            Self::VerbDecay(_) => "Verb Decay",
            Self::LimiterThreshold(_) => "Limiter Threshold",
            Self::AutoGain(_) => "Auto Gain",
            Self::LossGain(_) => "Loss Gain",
            Self::Weighting(_) => "Weighting",
            Self::Bypass(_) => "Bypass",
            Self::FreezeSlushie(_) => "Freeze Slushie",
            Self::AltMode(_) => "Alt Mode",
            Self::FreezeSolid(_) => "Freeze Solid",
            Self::GateSwitch(_) => "Gate Switch",
            Self::DipFilter(_) => "DIP: Filter",
            Self::DipFreq(_) => "DIP: Freq",
            Self::DipSpeed(_) => "DIP: Speed",
            Self::DipLoss(_) => "DIP: Loss",
            Self::DipVerb(_) => "DIP: Verb",
            Self::DipBounce(_) => "DIP: Bounce",
            Self::DipSweep(_) => "DIP: Sweep",
            Self::DipPolarity(_) => "DIP: Polarity",
            Self::DipMiso(_) => "DIP: Miso",
            Self::DipSpread(_) => "DIP: Spread",
            Self::DipTrails(_) => "DIP: Trails",
            Self::DipLatch(_) => "DIP: Latch",
            Self::DipPrePost(_) => "DIP: Pre/Post",
            Self::DipSlow(_) => "DIP: Slow",
            Self::DipInvert(_) => "DIP: Invert",
            Self::DipAllWet(_) => "DIP: All Wet",
            Self::RampBounce(_) => "Ramp/Bounce",
            Self::DryKill(_) => "Dry Kill",
            Self::Expression(_) => "Expression",
            Self::PresetSave(_) => "Preset Save",
        }
    }
}

impl LossyState {
    /// Convert the current state to a map of CC numbers → CC values.
    /// Used when recalling a full preset (sending all parameters at once).
    pub fn to_cc_map(&self) -> HashMap<u8, u8> {
        let mut map = HashMap::new();

        // Main knobs
        map.insert(14, self.filter);
        map.insert(15, self.global);
        map.insert(16, self.reverb);
        map.insert(17, self.freq);
        map.insert(18, self.speed);
        map.insert(19, self.loss);
        map.insert(20, self.ramp_speed);

        // Three-position toggles
        map.insert(21, self.filter_slope.to_cc_value());
        map.insert(22, self.packet_mode.to_cc_value());
        map.insert(23, self.loss_effect.to_cc_value());

        // Hidden options
        map.insert(24, self.gate);
        map.insert(25, self.freezer);
        map.insert(26, self.verb_decay);
        map.insert(27, self.limiter_threshold);
        map.insert(28, self.auto_gain);
        map.insert(29, self.loss_gain);
        map.insert(33, self.weighting.to_cc_value());

        // Utility
        map.insert(52, if self.ramp_bounce { 127 } else { 0 });
        map.insert(57, if self.dry_kill { 127 } else { 0 });

        // Left DIP bank
        map.insert(61, if self.dip_filter { 127 } else { 0 });
        map.insert(62, if self.dip_freq { 127 } else { 0 });
        map.insert(63, if self.dip_speed { 127 } else { 0 });
        map.insert(64, if self.dip_loss { 127 } else { 0 });
        map.insert(65, if self.dip_verb { 127 } else { 0 });
        map.insert(66, if self.dip_bounce { 127 } else { 0 });
        map.insert(67, self.dip_sweep.to_cc_value());
        map.insert(68, self.dip_polarity.to_cc_value());

        // Right DIP bank
        map.insert(71, if self.dip_miso { 127 } else { 0 });
        map.insert(72, if self.dip_spread { 127 } else { 0 });
        map.insert(73, if self.dip_trails { 127 } else { 0 });
        map.insert(74, if self.dip_latch { 127 } else { 0 });
        map.insert(75, if self.dip_pre_post { 127 } else { 0 });
        map.insert(76, if self.dip_slow { 127 } else { 0 });
        map.insert(77, if self.dip_invert { 127 } else { 0 });
        map.insert(78, if self.dip_all_wet { 127 } else { 0 });

        // Expression / footswitches
        map.insert(100, self.expression);
        map.insert(102, if self.bypass { 127 } else { 0 });
        map.insert(103, if self.freeze_slushie { 127 } else { 0 });
        map.insert(104, if self.alt_mode { 127 } else { 0 });
        map.insert(105, if self.freeze_solid { 127 } else { 0 });
        map.insert(106, if self.gate_switch { 127 } else { 0 });

        map
    }
}

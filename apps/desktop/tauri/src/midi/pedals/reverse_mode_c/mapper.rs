// Reverse Mode C MIDI CC mapping - infrastructure layer

use super::types::{
    ReverseModeCParameter, ReverseModeCState,
    sequence_spacing_to_cc,
};
use std::collections::HashMap;

pub const CC_PRESET_SAVE: u8 = 111;

impl ReverseModeCParameter {
    /// Get the CC number for this parameter
    pub fn cc_number(&self) -> u8 {
        match self {
            // Main knobs
            ReverseModeCParameter::Time(_) => 14,
            ReverseModeCParameter::Mix(_) => 15,
            ReverseModeCParameter::Feedback(_) => 16,
            ReverseModeCParameter::Offset(_) => 17,
            ReverseModeCParameter::Balance(_) => 18,
            ReverseModeCParameter::Filter(_) => 19,
            ReverseModeCParameter::RampSpeed(_) => 20,

            // Three-position toggles
            ReverseModeCParameter::ModSync(_) => 21,
            ReverseModeCParameter::ModType(_) => 22,
            ReverseModeCParameter::SequenceMode(_) => 23,

            // Hidden options
            ReverseModeCParameter::SequencerSubdivision(_) => 24,
            ReverseModeCParameter::RampingWaveform(_) => 25,
            ReverseModeCParameter::ModDepth(_) => 27,
            ReverseModeCParameter::ModRate(_) => 28,
            ReverseModeCParameter::OctaveType(_) => 31,
            ReverseModeCParameter::SequenceSpacing(_) => 33,

            // Footswitches
            ReverseModeCParameter::Bypass(_) => 102,
            ReverseModeCParameter::Tap(_) => 103,
            ReverseModeCParameter::AltMode(_) => 104,
            ReverseModeCParameter::Freeze(_) => 105,
            ReverseModeCParameter::HalfSpeed(_) => 106,

            // DIP switches - Left bank
            ReverseModeCParameter::DipTime(_) => 61,
            ReverseModeCParameter::DipOffset(_) => 62,
            ReverseModeCParameter::DipBalance(_) => 63,
            ReverseModeCParameter::DipFilter(_) => 64,
            ReverseModeCParameter::DipFeed(_) => 65,
            ReverseModeCParameter::DipBounce(_) => 66,
            ReverseModeCParameter::DipSweep(_) => 67,
            ReverseModeCParameter::DipPolarity(_) => 68,

            // DIP switches - Right bank
            ReverseModeCParameter::DipSwap(_) => 71,
            ReverseModeCParameter::DipMiso(_) => 72,
            ReverseModeCParameter::DipSpread(_) => 73,
            ReverseModeCParameter::DipTrails(_) => 74,
            ReverseModeCParameter::DipLatch(_) => 75,
            ReverseModeCParameter::DipFeedType(_) => 76,
            ReverseModeCParameter::DipFadeType(_) => 77,
            ReverseModeCParameter::DipModType(_) => 78,

            // Utility
            ReverseModeCParameter::MidiClockIgnore(_) => 51,
            ReverseModeCParameter::RampBounce(_) => 52,
            ReverseModeCParameter::DryKill(_) => 57,
            ReverseModeCParameter::Expression(_) => 100,
            ReverseModeCParameter::PresetSave(_) => 111,
        }
    }

    /// Get the CC value for this parameter
    pub fn cc_value(&self) -> u8 {
        match self {
            // Continuous parameters
            ReverseModeCParameter::Time(v)
            | ReverseModeCParameter::Mix(v)
            | ReverseModeCParameter::Feedback(v)
            | ReverseModeCParameter::Offset(v)
            | ReverseModeCParameter::Balance(v)
            | ReverseModeCParameter::Filter(v)
            | ReverseModeCParameter::RampSpeed(v)
            | ReverseModeCParameter::SequencerSubdivision(v)
            | ReverseModeCParameter::RampingWaveform(v)
            | ReverseModeCParameter::ModDepth(v)
            | ReverseModeCParameter::ModRate(v)
            | ReverseModeCParameter::Expression(v)
            | ReverseModeCParameter::PresetSave(v) => *v,

            // Enum parameters
            ReverseModeCParameter::ModSync(m) => m.to_cc_value(),
            ReverseModeCParameter::ModType(m) => m.to_cc_value(),
            ReverseModeCParameter::SequenceMode(m) => m.to_cc_value(),
            ReverseModeCParameter::OctaveType(o) => o.to_cc_value(),
            ReverseModeCParameter::DipSweep(d) => d.to_cc_value(),
            ReverseModeCParameter::DipPolarity(p) => p.to_cc_value(),

            // sequence_spacing: false=Rest(1), true=Skip(2)
            ReverseModeCParameter::SequenceSpacing(active) => sequence_spacing_to_cc(*active),

            // Binary parameters
            ReverseModeCParameter::Bypass(b)
            | ReverseModeCParameter::Tap(b)
            | ReverseModeCParameter::AltMode(b)
            | ReverseModeCParameter::Freeze(b)
            | ReverseModeCParameter::HalfSpeed(b)
            | ReverseModeCParameter::DipTime(b)
            | ReverseModeCParameter::DipOffset(b)
            | ReverseModeCParameter::DipBalance(b)
            | ReverseModeCParameter::DipFilter(b)
            | ReverseModeCParameter::DipFeed(b)
            | ReverseModeCParameter::DipBounce(b)
            | ReverseModeCParameter::DipSwap(b)
            | ReverseModeCParameter::DipMiso(b)
            | ReverseModeCParameter::DipSpread(b)
            | ReverseModeCParameter::DipTrails(b)
            | ReverseModeCParameter::DipLatch(b)
            | ReverseModeCParameter::DipFeedType(b)
            | ReverseModeCParameter::DipFadeType(b)
            | ReverseModeCParameter::DipModType(b)
            | ReverseModeCParameter::MidiClockIgnore(b)
            | ReverseModeCParameter::RampBounce(b)
            | ReverseModeCParameter::DryKill(b) => {
                if *b { 127 } else { 0 }
            }
        }
    }

    /// Get a human-readable name for this parameter
    pub fn name(&self) -> &'static str {
        match self {
            ReverseModeCParameter::Time(_) => "Time",
            ReverseModeCParameter::Mix(_) => "Mix",
            ReverseModeCParameter::Feedback(_) => "Feedback",
            ReverseModeCParameter::Offset(_) => "Offset",
            ReverseModeCParameter::Balance(_) => "Balance",
            ReverseModeCParameter::Filter(_) => "Filter",
            ReverseModeCParameter::RampSpeed(_) => "Ramp Speed",
            ReverseModeCParameter::ModSync(_) => "Mod Sync",
            ReverseModeCParameter::ModType(_) => "Mod Type",
            ReverseModeCParameter::SequenceMode(_) => "Sequence Mode",
            ReverseModeCParameter::SequencerSubdivision(_) => "Sequencer Subdivision",
            ReverseModeCParameter::RampingWaveform(_) => "Ramping Waveform",
            ReverseModeCParameter::ModDepth(_) => "Mod Depth",
            ReverseModeCParameter::ModRate(_) => "Mod Rate",
            ReverseModeCParameter::OctaveType(_) => "Octave Type",
            ReverseModeCParameter::SequenceSpacing(_) => "Sequence Spacing",
            ReverseModeCParameter::Bypass(_) => "Bypass",
            ReverseModeCParameter::Tap(_) => "Tap",
            ReverseModeCParameter::AltMode(_) => "Alt Mode",
            ReverseModeCParameter::Freeze(_) => "Freeze",
            ReverseModeCParameter::HalfSpeed(_) => "Half Speed",
            ReverseModeCParameter::DipTime(_) => "DIP: Time",
            ReverseModeCParameter::DipOffset(_) => "DIP: Offset",
            ReverseModeCParameter::DipBalance(_) => "DIP: Balance",
            ReverseModeCParameter::DipFilter(_) => "DIP: Filter",
            ReverseModeCParameter::DipFeed(_) => "DIP: Feed",
            ReverseModeCParameter::DipBounce(_) => "DIP: Bounce",
            ReverseModeCParameter::DipSweep(_) => "DIP: Sweep",
            ReverseModeCParameter::DipPolarity(_) => "DIP: Polarity",
            ReverseModeCParameter::DipSwap(_) => "DIP: Swap",
            ReverseModeCParameter::DipMiso(_) => "DIP: Miso",
            ReverseModeCParameter::DipSpread(_) => "DIP: Spread",
            ReverseModeCParameter::DipTrails(_) => "DIP: Trails",
            ReverseModeCParameter::DipLatch(_) => "DIP: Latch",
            ReverseModeCParameter::DipFeedType(_) => "DIP: Feed Type",
            ReverseModeCParameter::DipFadeType(_) => "DIP: Fade Type",
            ReverseModeCParameter::DipModType(_) => "DIP: Mod Type",
            ReverseModeCParameter::MidiClockIgnore(_) => "MIDI Clock Ignore",
            ReverseModeCParameter::RampBounce(_) => "Ramp Bounce",
            ReverseModeCParameter::DryKill(_) => "Dry Kill",
            ReverseModeCParameter::Expression(_) => "Expression",
            ReverseModeCParameter::PresetSave(_) => "Preset Save",
        }
    }
}

impl ReverseModeCState {
    /// Convert the current state to a map of CC numbers -> CC values.
    /// Used when recalling a full preset (sending all parameters at once).
    pub fn to_cc_map(&self) -> HashMap<u8, u8> {
        let mut map = HashMap::new();

        // Main knobs
        map.insert(14, self.time);
        map.insert(15, self.mix);
        map.insert(16, self.feedback);
        map.insert(17, self.offset);
        map.insert(18, self.balance);
        map.insert(19, self.filter);
        map.insert(20, self.ramp_speed);

        // Three-position toggles
        map.insert(21, self.mod_sync.to_cc_value());
        map.insert(22, self.mod_type.to_cc_value());
        map.insert(23, self.sequence_mode.to_cc_value());

        // Hidden options
        map.insert(24, self.sequencer_subdivision);
        map.insert(25, self.ramping_waveform);
        map.insert(27, self.mod_depth);
        map.insert(28, self.mod_rate);
        map.insert(31, self.octave_type.to_cc_value());
        map.insert(33, sequence_spacing_to_cc(self.sequence_spacing));

        // Footswitches
        map.insert(102, if self.bypass { 127 } else { 0 });
        map.insert(103, if self.tap { 127 } else { 0 });
        map.insert(104, if self.alt_mode { 127 } else { 0 });
        map.insert(105, if self.freeze { 127 } else { 0 });
        map.insert(106, if self.half_speed { 127 } else { 0 });

        // DIP switches - Left bank
        map.insert(61, if self.dip_time { 127 } else { 0 });
        map.insert(62, if self.dip_offset { 127 } else { 0 });
        map.insert(63, if self.dip_balance { 127 } else { 0 });
        map.insert(64, if self.dip_filter { 127 } else { 0 });
        map.insert(65, if self.dip_feed { 127 } else { 0 });
        map.insert(66, if self.dip_bounce { 127 } else { 0 });
        map.insert(67, self.dip_sweep.to_cc_value());
        map.insert(68, self.dip_polarity.to_cc_value());

        // DIP switches - Right bank
        map.insert(71, if self.dip_swap { 127 } else { 0 });
        map.insert(72, if self.dip_miso { 127 } else { 0 });
        map.insert(73, if self.dip_spread { 127 } else { 0 });
        map.insert(74, if self.dip_trails { 127 } else { 0 });
        map.insert(75, if self.dip_latch { 127 } else { 0 });
        map.insert(76, if self.dip_feed_type { 127 } else { 0 });
        map.insert(77, if self.dip_fade_type { 127 } else { 0 });
        map.insert(78, if self.dip_mod_type { 127 } else { 0 });

        // Utility
        map.insert(51, if self.midi_clock_ignore { 127 } else { 0 });
        map.insert(52, if self.ramp_bounce { 127 } else { 0 });
        map.insert(57, if self.dry_kill { 127 } else { 0 });
        map.insert(100, self.expression);

        map
    }
}

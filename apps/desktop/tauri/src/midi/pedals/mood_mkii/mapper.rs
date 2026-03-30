// Mood MkII MIDI CC mapping - infrastructure layer

use super::types::{MoodMkiiParameter, MoodMkiiState};
use std::collections::HashMap;

pub const CC_PRESET_SAVE: u8 = 111;

impl MoodMkiiParameter {
    /// Get the CC number for this parameter
    pub fn cc_number(&self) -> u8 {
        match self {
            // Main knobs
            Self::Time(_) => 14,
            Self::Mix(_) => 15,
            Self::Length(_) => 16,
            Self::ModifyWet(_) => 17,
            Self::Clock(_) => 18,
            Self::ModifyLooper(_) => 19,
            Self::RampSpeed(_) => 20,

            // Three-position toggles
            Self::WetChannelRouting(_) => 21,
            Self::Routing(_) => 22,
            Self::MicroLooper(_) => 23,

            // Hidden options
            Self::StereoWidth(_) => 24,
            Self::RampingWaveform(_) => 25,
            Self::Fade(_) => 26,
            Self::Tone(_) => 27,
            Self::LevelBalance(_) => 28,
            Self::DirectMicroLoop(_) => 29,
            Self::Sync(_) => 31,
            Self::Spread(_) => 32,
            Self::BufferLength(_) => 33,

            // Utility
            Self::MidiClockIgnore(_) => 51,
            Self::RampBounce(_) => 52,

            // Left DIP bank
            Self::DipTime(_) => 61,
            Self::DipModifyWet(_) => 62,
            Self::DipClock(_) => 63,
            Self::DipModifyLooper(_) => 64,
            Self::DipLength(_) => 65,
            Self::DipBounce(_) => 66,
            Self::DipSweep(_) => 67,
            Self::DipPolarity(_) => 68,

            // Right DIP bank
            Self::DipClassic(_) => 71,
            Self::DipMiso(_) => 72,
            Self::DipSpread(_) => 73,
            Self::DipDryKill(_) => 74,
            Self::DipTrails(_) => 75,
            Self::DipLatch(_) => 76,
            Self::DipNoDub(_) => 77,
            Self::DipSmooth(_) => 78,

            // Expression / footswitches / preset
            Self::Expression(_) => 100,
            Self::BypassLeft(_) => 102,
            Self::BypassRight(_) => 103,
            Self::HiddenMenu(_) => 104,
            Self::Freeze(_) => 105,
            Self::Overdub(_) => 106,
            Self::PresetSave(_) => 111,
        }
    }

    /// Get the CC value for this parameter
    pub fn cc_value(&self) -> u8 {
        match self {
            // Continuous
            Self::Time(v)
            | Self::Mix(v)
            | Self::Length(v)
            | Self::ModifyWet(v)
            | Self::Clock(v)
            | Self::ModifyLooper(v)
            | Self::RampSpeed(v)
            | Self::StereoWidth(v)
            | Self::RampingWaveform(v)
            | Self::Fade(v)
            | Self::Tone(v)
            | Self::LevelBalance(v)
            | Self::DirectMicroLoop(v)
            | Self::Expression(v)
            | Self::PresetSave(v) => *v,

            // Three-position enums
            Self::WetChannelRouting(v) => v.to_cc_value(),
            Self::Routing(v) => v.to_cc_value(),
            Self::MicroLooper(v) => v.to_cc_value(),
            Self::Sync(v) => v.to_cc_value(),
            Self::Spread(v) => v.to_cc_value(),

            // Two-position enums
            Self::DipSweep(v) => v.to_cc_value(),
            Self::DipPolarity(v) => v.to_cc_value(),

            // BufferLength: false=HalfMki(1), true=Full(2)
            Self::BufferLength(b) => if *b { 2 } else { 1 },

            // Binary (bool → 0 or 127)
            Self::BypassLeft(b)
            | Self::BypassRight(b)
            | Self::HiddenMenu(b)
            | Self::Freeze(b)
            | Self::Overdub(b)
            | Self::DipTime(b)
            | Self::DipModifyWet(b)
            | Self::DipClock(b)
            | Self::DipModifyLooper(b)
            | Self::DipLength(b)
            | Self::DipBounce(b)
            | Self::DipClassic(b)
            | Self::DipMiso(b)
            | Self::DipSpread(b)
            | Self::DipDryKill(b)
            | Self::DipTrails(b)
            | Self::DipLatch(b)
            | Self::DipNoDub(b)
            | Self::DipSmooth(b)
            | Self::MidiClockIgnore(b)
            | Self::RampBounce(b) => if *b { 127 } else { 0 },
        }
    }

    /// Get a human-readable name for this parameter
    pub fn name(&self) -> &'static str {
        match self {
            Self::Time(_) => "Time",
            Self::Mix(_) => "Mix",
            Self::Length(_) => "Length",
            Self::ModifyWet(_) => "Modify Wet",
            Self::Clock(_) => "Clock",
            Self::ModifyLooper(_) => "Modify Looper",
            Self::RampSpeed(_) => "Ramp Speed",
            Self::WetChannelRouting(_) => "Wet Channel Routing",
            Self::Routing(_) => "Routing",
            Self::MicroLooper(_) => "Micro Looper",
            Self::StereoWidth(_) => "Stereo Width",
            Self::RampingWaveform(_) => "Ramping Waveform",
            Self::Fade(_) => "Fade",
            Self::Tone(_) => "Tone",
            Self::LevelBalance(_) => "Level Balance",
            Self::DirectMicroLoop(_) => "Direct Micro Loop",
            Self::Sync(_) => "Sync",
            Self::Spread(_) => "Spread",
            Self::BufferLength(_) => "Buffer Length",
            Self::BypassLeft(_) => "Bypass Left",
            Self::BypassRight(_) => "Bypass Right",
            Self::HiddenMenu(_) => "Hidden Menu",
            Self::Freeze(_) => "Freeze",
            Self::Overdub(_) => "Overdub",
            Self::DipTime(_) => "DIP: Time",
            Self::DipModifyWet(_) => "DIP: Modify Wet",
            Self::DipClock(_) => "DIP: Clock",
            Self::DipModifyLooper(_) => "DIP: Modify Looper",
            Self::DipLength(_) => "DIP: Length",
            Self::DipBounce(_) => "DIP: Bounce",
            Self::DipSweep(_) => "DIP: Sweep",
            Self::DipPolarity(_) => "DIP: Polarity",
            Self::DipClassic(_) => "DIP: Classic",
            Self::DipMiso(_) => "DIP: Miso",
            Self::DipSpread(_) => "DIP: Spread",
            Self::DipDryKill(_) => "DIP: Dry Kill",
            Self::DipTrails(_) => "DIP: Trails",
            Self::DipLatch(_) => "DIP: Latch",
            Self::DipNoDub(_) => "DIP: No Dub",
            Self::DipSmooth(_) => "DIP: Smooth",
            Self::MidiClockIgnore(_) => "MIDI Clock Ignore",
            Self::RampBounce(_) => "Ramp/Bounce",
            Self::Expression(_) => "Expression",
            Self::PresetSave(_) => "Preset Save",
        }
    }
}

impl MoodMkiiState {
    /// Convert the current state to a map of CC numbers → CC values.
    /// Used when recalling a full preset (sending all parameters at once).
    pub fn to_cc_map(&self) -> HashMap<u8, u8> {
        let mut map = HashMap::new();

        // Main knobs
        map.insert(14, self.time);
        map.insert(15, self.mix);
        map.insert(16, self.length);
        map.insert(17, self.modify_wet);
        map.insert(18, self.clock);
        map.insert(19, self.modify_looper);
        map.insert(20, self.ramp_speed);

        // Three-position toggles
        map.insert(21, self.wet_channel_routing.to_cc_value());
        map.insert(22, self.routing.to_cc_value());
        map.insert(23, self.micro_looper.to_cc_value());

        // Hidden options
        map.insert(24, self.stereo_width);
        map.insert(25, self.ramping_waveform);
        map.insert(26, self.fade);
        map.insert(27, self.tone);
        map.insert(28, self.level_balance);
        map.insert(29, self.direct_micro_loop);
        map.insert(31, self.sync.to_cc_value());
        map.insert(32, self.spread.to_cc_value());
        map.insert(33, if self.buffer_length { 2 } else { 1 });

        // Utility
        map.insert(51, if self.midi_clock_ignore { 127 } else { 0 });
        map.insert(52, if self.ramp_bounce { 127 } else { 0 });

        // Left DIP bank
        map.insert(61, if self.dip_time { 127 } else { 0 });
        map.insert(62, if self.dip_modify_wet { 127 } else { 0 });
        map.insert(63, if self.dip_clock { 127 } else { 0 });
        map.insert(64, if self.dip_modify_looper { 127 } else { 0 });
        map.insert(65, if self.dip_length { 127 } else { 0 });
        map.insert(66, if self.dip_bounce { 127 } else { 0 });
        map.insert(67, self.dip_sweep.to_cc_value());
        map.insert(68, self.dip_polarity.to_cc_value());

        // Right DIP bank
        map.insert(71, if self.dip_classic { 127 } else { 0 });
        map.insert(72, if self.dip_miso { 127 } else { 0 });
        map.insert(73, if self.dip_spread { 127 } else { 0 });
        map.insert(74, if self.dip_dry_kill { 127 } else { 0 });
        map.insert(75, if self.dip_trails { 127 } else { 0 });
        map.insert(76, if self.dip_latch { 127 } else { 0 });
        map.insert(77, if self.dip_no_dub { 127 } else { 0 });
        map.insert(78, if self.dip_smooth { 127 } else { 0 });

        // Expression / footswitches
        map.insert(100, self.expression);
        map.insert(102, if self.bypass_left { 127 } else { 0 });
        map.insert(103, if self.bypass_right { 127 } else { 0 });
        map.insert(104, if self.hidden_menu { 127 } else { 0 });
        map.insert(105, if self.freeze { 127 } else { 0 });
        map.insert(106, if self.overdub { 127 } else { 0 });

        map
    }
}

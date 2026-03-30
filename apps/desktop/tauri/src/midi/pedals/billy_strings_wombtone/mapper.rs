// Billy Strings Wombtone MIDI CC mapping - infrastructure layer

use super::types::{BillyStringsWombtoneParameter, BillyStringsWombtoneState};
use std::collections::HashMap;

pub const CC_PRESET_SAVE: u8 = 111;

impl BillyStringsWombtoneParameter {
    /// Get the CC number for this parameter
    pub fn cc_number(&self) -> u8 {
        match self {
            Self::Feed(_) => 14,
            Self::Volume(_) => 15,
            Self::Mix(_) => 16,
            Self::Rate(_) => 17,
            Self::Depth(_) => 18,
            Self::Form(_) => 19,
            Self::RampSpeed(_) => 20,
            Self::NoteDivision(_) => 21,
            Self::MidiClockIgnore(_) => 51,
            Self::Tap(_) => 93,
            Self::Expression(_) => 100,
            Self::Bypass(_) => 102,
            Self::PresetSave(_) => 111,
        }
    }

    /// Get the CC value for this parameter
    pub fn cc_value(&self) -> u8 {
        match self {
            // Continuous
            Self::Feed(v)
            | Self::Volume(v)
            | Self::Mix(v)
            | Self::Rate(v)
            | Self::Depth(v)
            | Self::Form(v)
            | Self::RampSpeed(v)
            | Self::Expression(v)
            | Self::PresetSave(v) => *v,

            // Note division: raw value 0-5
            Self::NoteDivision(v) => *v,

            // Bypass: split-range — off=0, on=64
            Self::Bypass(b) => if *b { 64 } else { 0 },

            // Tap: sends 127 when active
            Self::Tap(b) => if *b { 127 } else { 0 },

            // MIDI Clock Ignore
            Self::MidiClockIgnore(b) => if *b { 127 } else { 0 },
        }
    }

    /// Get a human-readable name for this parameter
    pub fn name(&self) -> &'static str {
        match self {
            Self::Feed(_) => "Feed",
            Self::Volume(_) => "Volume",
            Self::Mix(_) => "Mix",
            Self::Rate(_) => "Rate",
            Self::Depth(_) => "Depth",
            Self::Form(_) => "Form",
            Self::RampSpeed(_) => "Ramp Speed",
            Self::NoteDivision(_) => "Note Division",
            Self::Bypass(_) => "Bypass",
            Self::Tap(_) => "Tap",
            Self::MidiClockIgnore(_) => "MIDI Clock Ignore",
            Self::Expression(_) => "Expression",
            Self::PresetSave(_) => "Preset Save",
        }
    }
}

impl BillyStringsWombtoneState {
    /// Convert the current state to a map of CC numbers → CC values.
    /// Used when recalling a full preset (sending all parameters at once).
    pub fn to_cc_map(&self) -> HashMap<u8, u8> {
        let mut map = HashMap::new();

        // Main knobs
        map.insert(14, self.feed);
        map.insert(15, self.volume);
        map.insert(16, self.mix);
        map.insert(17, self.rate);
        map.insert(18, self.depth);
        map.insert(19, self.form);
        map.insert(20, self.ramp_speed);

        // Note division (raw 0-5)
        map.insert(21, self.note_division);

        // Utility
        map.insert(51, if self.midi_clock_ignore { 127 } else { 0 });

        // Tap (transient action — not recalled in presets, but included for completeness)
        map.insert(93, if self.tap { 127 } else { 0 });

        // Expression
        map.insert(100, self.expression);

        // Bypass: split-range
        map.insert(102, if self.bypass { 64 } else { 0 });

        map
    }
}

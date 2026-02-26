// Billy Strings Wombtone domain types

use serde::{Deserialize, Serialize};

/// Complete state of all Billy Strings Wombtone parameters.
/// Simplest Chase Bliss pedal: no DIP switches, no alt menu, no hidden options.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BillyStringsWombtoneState {
    // Main knobs
    pub feed: u8,
    pub volume: u8,
    pub mix: u8,
    pub rate: u8,
    pub depth: u8,
    pub form: u8,
    pub ramp_speed: u8,

    // Note division (raw u8, 0-5)
    // 0=Whole, 1=Half, 2=QuarterTriplet, 3=Quarter, 4=Eighth, 5=Sixteenth
    pub note_division: u8,

    // Footswitches
    pub bypass: bool, // CC 102, split-range: off=0, on=64
    pub tap: bool,    // CC 93, sends 127 when true

    // Utility
    pub midi_clock_ignore: bool,
    pub expression: u8,
}

impl Default for BillyStringsWombtoneState {
    fn default() -> Self {
        Self {
            feed: 64,
            volume: 64,
            mix: 64,
            rate: 64,
            depth: 64,
            form: 64,
            ramp_speed: 64,
            note_division: 3, // Quarter note default
            bypass: false,
            tap: false,
            midi_clock_ignore: false,
            expression: 0,
        }
    }
}

/// All possible Billy Strings Wombtone parameters with their values
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BillyStringsWombtoneParameter {
    // Main knobs
    Feed(u8),
    Volume(u8),
    Mix(u8),
    Rate(u8),
    Depth(u8),
    Form(u8),
    RampSpeed(u8),

    // Note division (raw 0-5)
    NoteDivision(u8),

    // Footswitches
    Bypass(bool),
    Tap(bool),

    // Utility
    MidiClockIgnore(bool),
    Expression(u8),
    PresetSave(u8),
}

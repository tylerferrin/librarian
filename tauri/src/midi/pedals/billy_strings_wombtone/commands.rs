// Tauri commands for Chase Bliss Audio Billy Strings Wombtone

use crate::midi::SharedMidiManager;
use crate::midi::pedals::billy_strings_wombtone::{BillyStringsWombtoneParameter, BillyStringsWombtoneState};
use tauri::State;

/// Connect to a Billy Strings Wombtone pedal
#[tauri::command]
pub async fn connect_billy_strings_wombtone(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    midi_channel: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .connect_billy_strings_wombtone(&device_name, midi_channel)
        .map_err(|e| e.to_string())
}

/// Send a Billy Strings Wombtone parameter change
#[tauri::command]
pub async fn send_billy_strings_wombtone_parameter(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    param: BillyStringsWombtoneParameter,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_billy_strings_wombtone_parameter(&device_name, param)
        .map_err(|e| e.to_string())
}

/// Get the current Billy Strings Wombtone state
#[tauri::command]
pub async fn get_billy_strings_wombtone_state(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<BillyStringsWombtoneState, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .get_billy_strings_wombtone_state(&device_name)
        .map_err(|e| e.to_string())
}

/// Recall a Billy Strings Wombtone preset (send all parameters)
#[tauri::command]
pub async fn recall_billy_strings_wombtone_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    state: BillyStringsWombtoneState,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .recall_billy_strings_wombtone_preset(&device_name, &state)
        .map_err(|e| e.to_string())
}

/// Save current state to a Billy Strings Wombtone preset slot (1-122)
#[tauri::command]
pub async fn save_billy_strings_wombtone_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    slot: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .save_billy_strings_wombtone_preset(&device_name, slot)
        .map_err(|e| e.to_string())
}

/// Send a program change to a Billy Strings Wombtone (navigate to preset slot 1-122)
#[tauri::command]
pub async fn send_billy_strings_wombtone_program_change(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    program: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_billy_strings_wombtone_program_change(&device_name, program)
        .map_err(|e| e.to_string())
}

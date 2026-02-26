// Tauri commands for Chase Bliss Audio Reverse Mode C pedal

use crate::midi::SharedMidiManager;
use crate::midi::pedals::reverse_mode_c::{ReverseModeCParameter, ReverseModeCState};
use tauri::State;

/// Connect to a Reverse Mode C pedal
#[tauri::command]
pub async fn connect_reverse_mode_c(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    midi_channel: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .connect_reverse_mode_c(&device_name, midi_channel)
        .map_err(|e| e.to_string())
}

/// Send a Reverse Mode C parameter change
#[tauri::command]
pub async fn send_reverse_mode_c_parameter(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    param: ReverseModeCParameter,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_reverse_mode_c_parameter(&device_name, param)
        .map_err(|e| e.to_string())
}

/// Get current Reverse Mode C state
#[tauri::command]
pub async fn get_reverse_mode_c_state(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<ReverseModeCState, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .get_reverse_mode_c_state(&device_name)
        .map_err(|e| e.to_string())
}

/// Recall a Reverse Mode C preset (send all parameters at once)
#[tauri::command]
pub async fn recall_reverse_mode_c_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    state: ReverseModeCState,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .recall_reverse_mode_c_preset(&device_name, &state)
        .map_err(|e| e.to_string())
}

/// Save current state to a Reverse Mode C preset slot (1-122)
#[tauri::command]
pub async fn save_reverse_mode_c_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    slot: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .save_reverse_mode_c_preset(&device_name, slot)
        .map_err(|e| e.to_string())
}

/// Send a program change to a Reverse Mode C (navigate to preset slot 1-122)
#[tauri::command]
pub async fn send_reverse_mode_c_program_change(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    program: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_reverse_mode_c_program_change(&device_name, program)
        .map_err(|e| e.to_string())
}

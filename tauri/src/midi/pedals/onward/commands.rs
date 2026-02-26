// Tauri commands for Chase Bliss Audio Onward pedal

use crate::midi::SharedMidiManager;
use crate::midi::pedals::onward::{OnwardParameter, OnwardState};
use tauri::State;

/// Connect to an Onward pedal
#[tauri::command]
pub async fn connect_onward(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    midi_channel: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .connect_onward(&device_name, midi_channel)
        .map_err(|e| e.to_string())
}

/// Send an Onward parameter change
#[tauri::command]
pub async fn send_onward_parameter(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    param: OnwardParameter,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_onward_parameter(&device_name, param)
        .map_err(|e| e.to_string())
}

/// Get current Onward state
#[tauri::command]
pub async fn get_onward_state(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<OnwardState, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .get_onward_state(&device_name)
        .map_err(|e| e.to_string())
}

/// Recall an Onward preset (send all parameters)
#[tauri::command]
pub async fn recall_onward_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    state: OnwardState,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .recall_onward_preset(&device_name, &state)
        .map_err(|e| e.to_string())
}

/// Save current state to an Onward preset slot (1-122)
#[tauri::command]
pub async fn save_onward_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    slot: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .save_onward_preset(&device_name, slot)
        .map_err(|e| e.to_string())
}

/// Send a program change to an Onward pedal (navigate to preset slot 1-122)
#[tauri::command]
pub async fn send_onward_program_change(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    program: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_onward_program_change(&device_name, program)
        .map_err(|e| e.to_string())
}

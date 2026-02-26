// Tauri commands for Chase Bliss Audio Clean pedal

use crate::midi::SharedMidiManager;
use crate::midi::pedals::clean::{CleanParameter, CleanState};
use tauri::State;

/// Connect to a Clean pedal
#[tauri::command]
pub async fn connect_clean(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    midi_channel: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .connect_clean(&device_name, midi_channel)
        .map_err(|e| e.to_string())
}

/// Send a Clean parameter change
#[tauri::command]
pub async fn send_clean_parameter(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    param: CleanParameter,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_clean_parameter(&device_name, param)
        .map_err(|e| e.to_string())
}

/// Get current Clean state
#[tauri::command]
pub async fn get_clean_state(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<CleanState, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .get_clean_state(&device_name)
        .map_err(|e| e.to_string())
}

/// Recall a Clean preset (send all parameters)
#[tauri::command]
pub async fn recall_clean_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    state: CleanState,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .recall_clean_preset(&device_name, &state)
        .map_err(|e| e.to_string())
}

/// Save current state to a Clean preset slot (1-122)
#[tauri::command]
pub async fn save_clean_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    slot: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .save_clean_preset(&device_name, slot)
        .map_err(|e| e.to_string())
}

/// Send a program change to a Clean pedal (navigate to preset slot 1-122)
#[tauri::command]
pub async fn send_clean_program_change(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    program: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_clean_program_change(&device_name, program)
        .map_err(|e| e.to_string())
}

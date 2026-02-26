// Tauri commands for Chase Bliss Audio Lossy

use crate::midi::SharedMidiManager;
use crate::midi::pedals::lossy::{LossyParameter, LossyState};
use tauri::State;

/// Connect to a Lossy pedal
#[tauri::command]
pub async fn connect_lossy(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    midi_channel: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .connect_lossy(&device_name, midi_channel)
        .map_err(|e| e.to_string())
}

/// Send a Lossy parameter change
#[tauri::command]
pub async fn send_lossy_parameter(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    param: LossyParameter,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_lossy_parameter(&device_name, param)
        .map_err(|e| e.to_string())
}

/// Get the current Lossy state
#[tauri::command]
pub async fn get_lossy_state(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<LossyState, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .get_lossy_state(&device_name)
        .map_err(|e| e.to_string())
}

/// Recall a Lossy preset (send all parameters)
#[tauri::command]
pub async fn recall_lossy_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    state: LossyState,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .recall_lossy_preset(&device_name, &state)
        .map_err(|e| e.to_string())
}

/// Save current state to a Lossy preset slot (1-122)
#[tauri::command]
pub async fn save_lossy_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    slot: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .save_lossy_preset(&device_name, slot)
        .map_err(|e| e.to_string())
}

/// Send a program change to a Lossy (navigate to preset slot 1-122)
#[tauri::command]
pub async fn send_lossy_program_change(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    program: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_lossy_program_change(&device_name, program)
        .map_err(|e| e.to_string())
}

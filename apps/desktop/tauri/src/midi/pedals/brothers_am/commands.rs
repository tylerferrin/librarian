// Tauri commands for Chase Bliss Audio Brothers AM pedal

use crate::midi::SharedMidiManager;
use crate::midi::pedals::brothers_am::{BrothersAmParameter, BrothersAmState};
use tauri::State;

/// Connect to a Brothers AM pedal
#[tauri::command]
pub async fn connect_brothers_am(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    midi_channel: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .connect_brothers_am(&device_name, midi_channel)
        .map_err(|e| e.to_string())
}

/// Send a Brothers AM parameter change
#[tauri::command]
pub async fn send_brothers_am_parameter(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    param: BrothersAmParameter,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_brothers_am_parameter(&device_name, param)
        .map_err(|e| e.to_string())
}

/// Get current Brothers AM state
#[tauri::command]
pub async fn get_brothers_am_state(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<BrothersAmState, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .get_brothers_am_state(&device_name)
        .map_err(|e| e.to_string())
}

/// Recall a Brothers AM preset (send all parameters at once)
#[tauri::command]
pub async fn recall_brothers_am_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    state: BrothersAmState,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .recall_brothers_am_preset(&device_name, &state)
        .map_err(|e| e.to_string())
}

/// Save current state to a Brothers AM preset slot (1-122)
#[tauri::command]
pub async fn save_brothers_am_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    slot: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .save_brothers_am_preset(&device_name, slot)
        .map_err(|e| e.to_string())
}

/// Send a program change to a Brothers AM (navigate to preset slot 1-122)
#[tauri::command]
pub async fn send_brothers_am_program_change(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    program: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_brothers_am_program_change(&device_name, program)
        .map_err(|e| e.to_string())
}

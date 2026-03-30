// Tauri commands for Hologram Microcosm pedal

use crate::midi::SharedMidiManager;
use crate::midi::pedals::microcosm::{MicrocosmParameter, MicrocosmState};
use tauri::State;

/// Connect to a Microcosm pedal
#[tauri::command]
pub async fn connect_microcosm(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    midi_channel: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .connect_microcosm(&device_name, midi_channel)
        .map_err(|e| e.to_string())
}

/// Send a Microcosm parameter change
#[tauri::command]
pub async fn send_microcosm_parameter(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    param: MicrocosmParameter,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_microcosm_parameter(&device_name, param)
        .map_err(|e| e.to_string())
}

/// Send a program change to a Microcosm (select effect/preset)
#[tauri::command]
pub async fn send_microcosm_program_change(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    program: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_microcosm_program_change(&device_name, program)
        .map_err(|e| e.to_string())
}

/// Get current Microcosm state
#[tauri::command]
pub async fn get_microcosm_state(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<MicrocosmState, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .get_microcosm_state(&device_name)
        .map_err(|e| e.to_string())
}

/// Recall a Microcosm preset (send all parameters)
#[tauri::command]
pub async fn recall_microcosm_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    state: MicrocosmState,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .recall_microcosm_preset(&device_name, &state)
        .map_err(|e| e.to_string())
}

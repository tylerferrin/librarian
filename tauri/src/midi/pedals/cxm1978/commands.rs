// Tauri commands for Chase Bliss / Meris CXM 1978 Automatone

use crate::midi::SharedMidiManager;
use crate::midi::pedals::cxm1978::{Cxm1978Parameter, Cxm1978State};
use tauri::State;

/// Connect to a CXM 1978 pedal
#[tauri::command]
pub async fn connect_cxm1978(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    midi_channel: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .connect_cxm1978(&device_name, midi_channel)
        .map_err(|e| e.to_string())
}

/// Send a parameter change to a CXM 1978
#[tauri::command]
pub async fn send_cxm1978_parameter(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    param: Cxm1978Parameter,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_cxm1978_parameter(&device_name, param)
        .map_err(|e| e.to_string())
}

/// Send a Program Change to recall a CXM 1978 preset (PC 0-29)
#[tauri::command]
pub async fn send_cxm1978_program_change(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    program: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_cxm1978_program_change(&device_name, program)
        .map_err(|e| e.to_string())
}

/// Get the current state of a CXM 1978
#[tauri::command]
pub async fn get_cxm1978_state(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<Cxm1978State, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .get_cxm1978_state(&device_name)
        .map_err(|e| e.to_string())
}

/// Recall a CXM 1978 preset (send all parameters via CC)
#[tauri::command]
pub async fn recall_cxm1978_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    state: Cxm1978State,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .recall_cxm1978_preset(&device_name, &state)
        .map_err(|e| e.to_string())
}

/// Save current state to a CXM 1978 preset slot (0-29)
#[tauri::command]
pub async fn save_cxm1978_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    slot: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .save_cxm1978_preset(&device_name, slot)
        .map_err(|e| e.to_string())
}

// Tauri commands for Chase Bliss Generation Loss MKII pedal

use crate::midi::SharedMidiManager;
use crate::midi::pedals::gen_loss_mkii::{GenLossMkiiParameter, GenLossMkiiState};
use tauri::State;

/// Connect to a Gen Loss MKII pedal
#[tauri::command]
pub async fn connect_gen_loss_mkii(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    midi_channel: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .connect_gen_loss_mkii(&device_name, midi_channel)
        .map_err(|e| e.to_string())
}

/// Send a Gen Loss MKII parameter change
#[tauri::command]
pub async fn send_gen_loss_parameter(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    param: GenLossMkiiParameter,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_gen_loss_parameter(&device_name, param)
        .map_err(|e| e.to_string())
}

/// Get current Gen Loss MKII state
#[tauri::command]
pub async fn get_gen_loss_state(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<GenLossMkiiState, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .get_gen_loss_state(&device_name)
        .map_err(|e| e.to_string())
}

/// Recall a Gen Loss MKII preset (send all parameters)
#[tauri::command]
pub async fn recall_gen_loss_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    state: GenLossMkiiState,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .recall_gen_loss_preset(&device_name, &state)
        .map_err(|e| e.to_string())
}

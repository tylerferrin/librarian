// Tauri commands for Chase Bliss Preamp MK II pedal

use crate::midi::SharedMidiManager;
use crate::midi::pedals::preamp_mk2::{PreampMk2Parameter, PreampMk2State};
use tauri::State;

/// Connect to a Preamp MK II pedal
#[tauri::command]
pub async fn connect_preamp_mk2(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    midi_channel: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .connect_preamp_mk2(&device_name, midi_channel)
        .map_err(|e| e.to_string())
}

/// Send a parameter change to a Preamp MK II
#[tauri::command]
pub async fn send_preamp_mk2_parameter(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    param: PreampMk2Parameter,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_preamp_mk2_parameter(&device_name, param)
        .map_err(|e| e.to_string())
}

/// Send a Program Change to recall a Preamp MK II preset (PC 0-29)
#[tauri::command]
pub async fn send_preamp_mk2_program_change(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    program: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_preamp_mk2_program_change(&device_name, program)
        .map_err(|e| e.to_string())
}

/// Get the current state of a Preamp MK II
#[tauri::command]
pub async fn get_preamp_mk2_state(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<PreampMk2State, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .get_preamp_mk2_state(&device_name)
        .map_err(|e| e.to_string())
}

/// Recall a Preamp MK II preset (send all parameters)
#[tauri::command]
pub async fn recall_preamp_mk2_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    state: PreampMk2State,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .recall_preamp_mk2_preset(&device_name, &state)
        .map_err(|e| e.to_string())
}

/// Save current state to a Preamp MK II preset slot (0-29)
#[tauri::command]
pub async fn save_preamp_mk2_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    slot: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .save_preamp_mk2_preset(&device_name, slot)
        .map_err(|e| e.to_string())
}

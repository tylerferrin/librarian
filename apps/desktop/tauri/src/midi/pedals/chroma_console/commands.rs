// Tauri commands for Chase Bliss Chroma Console pedal

use crate::midi::SharedMidiManager;
use crate::midi::pedals::chroma_console::{ChromaConsoleParameter, ChromaConsoleState};
use tauri::State;

/// Connect to a Chroma Console pedal
#[tauri::command]
pub async fn connect_chroma_console(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    midi_channel: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .connect_chroma_console(&device_name, midi_channel)
        .map_err(|e| e.to_string())
}

/// Send a Chroma Console parameter change
#[tauri::command]
pub async fn send_chroma_console_parameter(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    param: ChromaConsoleParameter,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_chroma_console_parameter(&device_name, param)
        .map_err(|e| e.to_string())
}

/// Send a program change to a Chroma Console (0-79)
#[tauri::command]
pub async fn send_chroma_console_program_change(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    program: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_chroma_console_program_change(&device_name, program)
        .map_err(|e| e.to_string())
}

/// Get current Chroma Console state
#[tauri::command]
pub async fn get_chroma_console_state(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<ChromaConsoleState, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .get_chroma_console_state(&device_name)
        .map_err(|e| e.to_string())
}

/// Recall a Chroma Console preset (send all parameters)
#[tauri::command]
pub async fn recall_chroma_console_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    state: ChromaConsoleState,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .recall_chroma_console_preset(&device_name, &state)
        .map_err(|e| e.to_string())
}

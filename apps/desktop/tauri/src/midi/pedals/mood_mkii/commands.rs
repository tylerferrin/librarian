// Tauri commands for Chase Bliss Audio Mood MkII

use crate::midi::SharedMidiManager;
use crate::midi::pedals::mood_mkii::{MoodMkiiParameter, MoodMkiiState};
use tauri::State;

/// Connect to a Mood MkII pedal
#[tauri::command]
pub async fn connect_mood_mkii(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    midi_channel: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .connect_mood_mkii(&device_name, midi_channel)
        .map_err(|e| e.to_string())
}

/// Send a Mood MkII parameter change
#[tauri::command]
pub async fn send_mood_mkii_parameter(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    param: MoodMkiiParameter,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_mood_mkii_parameter(&device_name, param)
        .map_err(|e| e.to_string())
}

/// Get the current Mood MkII state
#[tauri::command]
pub async fn get_mood_mkii_state(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<MoodMkiiState, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .get_mood_mkii_state(&device_name)
        .map_err(|e| e.to_string())
}

/// Recall a Mood MkII preset (send all parameters)
#[tauri::command]
pub async fn recall_mood_mkii_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    state: MoodMkiiState,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .recall_mood_mkii_preset(&device_name, &state)
        .map_err(|e| e.to_string())
}

/// Save current state to a Mood MkII preset slot (1-122)
#[tauri::command]
pub async fn save_mood_mkii_preset(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    slot: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .save_mood_mkii_preset(&device_name, slot)
        .map_err(|e| e.to_string())
}

/// Send a program change to a Mood MkII (navigate to preset slot 1-122)
#[tauri::command]
pub async fn send_mood_mkii_program_change(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    program: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager
        .send_mood_mkii_program_change(&device_name, program)
        .map_err(|e| e.to_string())
}

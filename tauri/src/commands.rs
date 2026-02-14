// Tauri commands for frontend integration
// These functions are exposed to the frontend via IPC

use crate::midi::{SharedMidiManager, ConnectedDevice, PedalType};
use crate::midi::pedals::microcosm::{MicrocosmParameter, MicrocosmState};
use crate::midi::pedals::gen_loss_mkii::{GenLossMkiiParameter, GenLossMkiiState};
use crate::presets::{SharedPresetLibrary, Preset, PresetId, PresetFilter, BankSlot};
use serde::{Deserialize, Serialize};
use tauri::State;

/// Device information for frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub name: String,
    pub pedal_type: String,
    pub midi_channel: u8,
}

impl From<ConnectedDevice> for DeviceInfo {
    fn from(device: ConnectedDevice) -> Self {
        Self {
            name: device.device_name,
            pedal_type: match device.pedal_type {
                PedalType::Microcosm => "Microcosm".to_string(),
                PedalType::GenLossMkii => "GenLossMkii".to_string(),
            },
            midi_channel: device.midi_channel,
        }
    }
}

/// List all available MIDI devices
#[tauri::command]
pub async fn list_midi_devices(
    manager: State<'_, SharedMidiManager>,
) -> Result<Vec<String>, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager.list_devices().map_err(|e| e.to_string())
}

/// Connect to a Microcosm pedal
#[tauri::command]
pub async fn connect_microcosm(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    midi_channel: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager.connect_microcosm(&device_name, midi_channel)
        .map_err(|e| e.to_string())
}

/// Connect to a Gen Loss MKII pedal
#[tauri::command]
pub async fn connect_gen_loss_mkii(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    midi_channel: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager.connect_gen_loss_mkii(&device_name, midi_channel)
        .map_err(|e| e.to_string())
}

/// Disconnect from a device
#[tauri::command]
pub async fn disconnect_device(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager.disconnect(&device_name)
        .map_err(|e| e.to_string())
}

/// List all connected devices
#[tauri::command]
pub async fn list_connected_devices(
    manager: State<'_, SharedMidiManager>,
) -> Result<Vec<DeviceInfo>, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    Ok(manager.connected_devices()
        .into_iter()
        .map(DeviceInfo::from)
        .collect())
}

/// Send a Microcosm parameter change
#[tauri::command]
pub async fn send_microcosm_parameter(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    param: MicrocosmParameter,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager.send_microcosm_parameter(&device_name, param)
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
    manager.send_microcosm_program_change(&device_name, program)
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
    manager.send_gen_loss_parameter(&device_name, param)
        .map_err(|e| e.to_string())
}

/// Get current Microcosm state
#[tauri::command]
pub async fn get_microcosm_state(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<MicrocosmState, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager.get_microcosm_state(&device_name)
        .map_err(|e| e.to_string())
}

/// Get current Gen Loss MKII state
#[tauri::command]
pub async fn get_gen_loss_state(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<GenLossMkiiState, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager.get_gen_loss_state(&device_name)
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
    manager.recall_microcosm_preset(&device_name, &state)
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
    manager.recall_gen_loss_preset(&device_name, &state)
        .map_err(|e| e.to_string())
}

/// Check if a device is connected
#[tauri::command]
pub async fn is_device_connected(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<bool, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    Ok(manager.is_connected(&device_name))
}

// ===== Preset Management Commands =====

/// Save a new preset
#[tauri::command]
pub async fn save_preset(
    library: State<'_, SharedPresetLibrary>,
    name: String,
    pedal_type: String,
    description: Option<String>,
    parameters: serde_json::Value,
    tags: Vec<String>,
) -> Result<Preset, String> {
    let library = library.lock().map_err(|e| e.to_string())?;
    library.save_preset(name, pedal_type, description, parameters, tags)
        .map_err(|e| e.to_string())
}

/// Update an existing preset
#[tauri::command]
pub async fn update_preset(
    library: State<'_, SharedPresetLibrary>,
    id: String,
    name: Option<String>,
    description: Option<String>,
    tags: Option<Vec<String>>,
    is_favorite: Option<bool>,
    parameters: Option<serde_json::Value>,
) -> Result<Preset, String> {
    let library = library.lock().map_err(|e| e.to_string())?;
    let preset_id = PresetId::new(id);
    library.update_preset(&preset_id, name, description, tags, is_favorite, parameters)
        .map_err(|e| e.to_string())
}

/// Get a preset by ID
#[tauri::command]
pub async fn get_preset(
    library: State<'_, SharedPresetLibrary>,
    id: String,
) -> Result<Preset, String> {
    let library = library.lock().map_err(|e| e.to_string())?;
    let preset_id = PresetId::new(id);
    library.get_preset(&preset_id)
        .map_err(|e| e.to_string())
}

/// List presets with optional filtering
#[tauri::command]
pub async fn list_presets(
    library: State<'_, SharedPresetLibrary>,
    pedal_type: Option<String>,
    tags: Option<Vec<String>>,
    is_favorite: Option<bool>,
    search_query: Option<String>,
) -> Result<Vec<Preset>, String> {
    let library = library.lock().map_err(|e| e.to_string())?;
    let filter = PresetFilter {
        pedal_type,
        tags: tags.unwrap_or_default(),
        is_favorite,
        search_query,
    };
    library.list_presets(filter)
        .map_err(|e| e.to_string())
}

/// Delete a preset
#[tauri::command]
pub async fn delete_preset(
    library: State<'_, SharedPresetLibrary>,
    id: String,
) -> Result<(), String> {
    let library = library.lock().map_err(|e| e.to_string())?;
    let preset_id = PresetId::new(id);
    library.delete_preset(&preset_id)
        .map_err(|e| e.to_string())
}

/// Toggle favorite status
#[tauri::command]
pub async fn toggle_favorite(
    library: State<'_, SharedPresetLibrary>,
    id: String,
) -> Result<Preset, String> {
    let library = library.lock().map_err(|e| e.to_string())?;
    let preset_id = PresetId::new(id);
    library.toggle_favorite(&preset_id)
        .map_err(|e| e.to_string())
}

/// Get the state of all pedal banks
#[tauri::command]
pub async fn get_bank_state(
    library: State<'_, SharedPresetLibrary>,
    pedal_type: String,
) -> Result<Vec<BankSlot>, String> {
    println!("🔍 get_bank_state called with pedal_type: {}", pedal_type);
    let library = library.lock().map_err(|e| e.to_string())?;
    let result = library.get_bank_state(&pedal_type)
        .map_err(|e| e.to_string())?;
    println!("📦 get_bank_state returning {} bank slots", result.len());
    Ok(result)
}

/// Assign a preset to a specific bank
#[tauri::command]
pub async fn assign_to_bank(
    library: State<'_, SharedPresetLibrary>,
    pedal_type: String,
    bank_number: u8,
    preset_id: String,
) -> Result<(), String> {
    let library = library.lock().map_err(|e| e.to_string())?;
    let id = PresetId::new(preset_id);
    library.assign_to_bank(&pedal_type, bank_number, &id)
        .map_err(|e| e.to_string())
}

/// Save a preset to a specific pedal bank (recalls preset, then sends CC 46 to save)
#[tauri::command]
pub async fn save_preset_to_bank(
    midi_manager: State<'_, SharedMidiManager>,
    library: State<'_, SharedPresetLibrary>,
    device_name: String,
    preset_id: String,
    bank_number: u8,
) -> Result<(), String> {
    // Get the preset
    let id = PresetId::new(preset_id.clone());
    let preset = {
        let library = library.lock().map_err(|e| e.to_string())?;
        library.get_preset(&id).map_err(|e| e.to_string())?
    };
    
    // Send program change to switch to the target bank
    {
        let mut manager = midi_manager.lock().map_err(|e| e.to_string())?;
        manager.send_microcosm_program_change(&device_name, bank_number)
            .map_err(|e| e.to_string())?;
    }
    
    // Wait for pedal to switch banks
    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
    
    // Deserialize and send all parameters
    let state: MicrocosmState = serde_json::from_value(preset.parameters.clone())
        .map_err(|e| format!("Failed to deserialize preset parameters: {}", e))?;
    
    {
        let mut manager = midi_manager.lock().map_err(|e| e.to_string())?;
        manager.recall_microcosm_preset(&device_name, &state)
            .map_err(|e| e.to_string())?;
    }
    
    // Wait for parameters to apply
    tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
    
    // Send CC 46 (Preset Save) to save to pedal
    {
        let mut manager = midi_manager.lock().map_err(|e| e.to_string())?;
        manager.send_microcosm_parameter(&device_name, MicrocosmParameter::PresetSave)
            .map_err(|e| e.to_string())?;
    }
    
    // Update bank assignment in database
    {
        let library = library.lock().map_err(|e| e.to_string())?;
        library.assign_to_bank(&preset.pedal_type, bank_number, &id)
            .map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

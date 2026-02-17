// Tauri commands for frontend integration
// These functions are exposed to the frontend via IPC

use crate::midi::{SharedMidiManager, ConnectedDevice, PedalType, request_device_identity, DeviceIdentity};
use crate::midi::pedals::microcosm::{MicrocosmParameter, MicrocosmState};
use crate::midi::pedals::gen_loss_mkii::{GenLossMkiiParameter, GenLossMkiiState};
use crate::midi::pedals::chroma_console::{ChromaConsoleParameter, ChromaConsoleState};
use crate::presets::{self, SharedPresetLibrary, Preset, PresetId, PresetFilter, BankSlot, PresetWithBanks, MidiSaveCapability};
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
                PedalType::ChromaConsole => "ChromaConsole".to_string(),
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

/// Connect to a Chroma Console pedal
#[tauri::command]
pub async fn connect_chroma_console(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    midi_channel: u8,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager.connect_chroma_console(&device_name, midi_channel)
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

/// Device identity information for frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceIdentityInfo {
    pub manufacturer_id: Vec<u8>,
    pub manufacturer_name: Option<String>,
    pub device_family: u16,
    pub device_model: u16,
    pub software_version: Vec<u8>,
    pub description: String,
}

impl From<DeviceIdentity> for DeviceIdentityInfo {
    fn from(identity: DeviceIdentity) -> Self {
        Self {
            manufacturer_id: identity.manufacturer_id.clone(),
            manufacturer_name: identity.manufacturer_name().map(|s| s.to_string()),
            device_family: identity.device_family,
            device_model: identity.device_model,
            software_version: identity.software_version.clone(),
            description: identity.description(),
        }
    }
}

/// Request device identity using MIDI Universal Device Inquiry
#[tauri::command]
pub async fn request_midi_device_identity(
    device_name: String,
    timeout_ms: Option<u64>,
) -> Result<Option<DeviceIdentityInfo>, String> {
    let timeout = timeout_ms.unwrap_or(2000); // Default 2 second timeout
    
    println!("🔍 Frontend requested device identity for: {}", device_name);
    
    match request_device_identity(&device_name, timeout) {
        Ok(Some(identity)) => {
            println!("✅ Got device identity: {}", identity.description());
            Ok(Some(DeviceIdentityInfo::from(identity)))
        }
        Ok(None) => {
            println!("⏱️ No response from device (timeout)");
            Ok(None)
        }
        Err(e) => {
            eprintln!("❌ Error requesting device identity: {}", e);
            Err(e.to_string())
        }
    }
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

/// Send a Chroma Console parameter change
#[tauri::command]
pub async fn send_chroma_console_parameter(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
    param: ChromaConsoleParameter,
) -> Result<(), String> {
    let mut manager = manager.lock().map_err(|e| e.to_string())?;
    manager.send_chroma_console_parameter(&device_name, param)
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
    manager.send_chroma_console_program_change(&device_name, program)
        .map_err(|e| e.to_string())
}

/// Get current Chroma Console state
#[tauri::command]
pub async fn get_chroma_console_state(
    manager: State<'_, SharedMidiManager>,
    device_name: String,
) -> Result<ChromaConsoleState, String> {
    let manager = manager.lock().map_err(|e| e.to_string())?;
    manager.get_chroma_console_state(&device_name)
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
    manager.recall_chroma_console_preset(&device_name, &state)
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
    let library = library.lock().map_err(|e| e.to_string())?;
    let result = library.get_bank_state(&pedal_type)
        .map_err(|e| e.to_string())?;
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

/// Clear a bank slot (unassign preset from slot without deleting preset)
#[tauri::command]
pub async fn clear_bank(
    library: State<'_, SharedPresetLibrary>,
    pedal_type: String,
    bank_number: u8,
) -> Result<(), String> {
    let library = library.lock().map_err(|e| e.to_string())?;
    library.clear_bank(&pedal_type, bank_number)
        .map_err(|e| e.to_string())
}

/// Get all presets with their bank assignments (for library drawer)
#[tauri::command]
pub async fn get_presets_with_banks(
    library: State<'_, SharedPresetLibrary>,
    pedal_type: String,
) -> Result<Vec<PresetWithBanks>, String> {
    let library = library.lock().map_err(|e| e.to_string())?;
    library.get_presets_with_banks(&pedal_type)
        .map_err(|e| e.to_string())
}

/// Get the bank configuration for a specific pedal type
#[tauri::command]
pub async fn get_bank_config(pedal_type: String) -> Result<presets::BankConfig, String> {
    presets::bank_config::get_bank_config(&pedal_type)
        .ok_or_else(|| format!("No bank configuration for pedal type: {}", pedal_type))
}

/// Result of saving a preset to a bank - includes save capability info for UI feedback
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveToBankResult {
    pub success: bool,
    pub saved_via_midi: bool,
    pub manual_save_required: bool,
    pub instructions: Option<String>,
}

/// Save a preset to a specific pedal bank (universal for all pedals)
#[tauri::command]
pub async fn save_preset_to_bank(
    midi_manager: State<'_, SharedMidiManager>,
    library: State<'_, SharedPresetLibrary>,
    device_name: String,
    preset_id: String,
    bank_number: u8,
) -> Result<SaveToBankResult, String> {
    // Get the preset
    let id = PresetId::new(preset_id.clone());
    let preset = {
        let library = library.lock().map_err(|e| e.to_string())?;
        library.get_preset(&id).map_err(|e| e.to_string())?
    };
    
    // Get bank config to determine save capability
    let bank_config = presets::bank_config::get_bank_config(&preset.pedal_type)
        .ok_or_else(|| format!("No bank configuration for pedal type: {}", preset.pedal_type))?;
    
    // Step 1: Send program change to switch to target bank (universal)
    // Step 2: Send all parameters to load preset (universal)
    // Step 3: Send save command (capability-dependent)
    
    match preset.pedal_type.as_str() {
        "Microcosm" => {
            let state: MicrocosmState = serde_json::from_value(preset.parameters.clone())
                .map_err(|e| format!("Failed to deserialize preset: {}", e))?;
            
            let midi_program = bank_number - 1;
            
            // OPTIMIZED SEQUENCE: Copy → Navigate → Save
            // Assumes pedal is already configured (true when updating from editor)
            // Manual: Hold (copy) → Turn to slot → Hold again (save)
            // MIDI: CC 45 → PC to slot → CC 46
            
            println!("[Save to Bank] Saving current pedal state to bank {}", bank_number);
            
            // Step 1: Copy (enters paste mode, pedal flashes blue)
            {
                let mut manager = midi_manager.lock().map_err(|e| e.to_string())?;
                println!("[Save to Bank] Copy (CC 45)");
                manager.send_microcosm_parameter(&device_name, MicrocosmParameter::PresetCopy)
                    .map_err(|e| e.to_string())?;
            }
            tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
            
            // Step 2: Navigate to target user bank (stays in paste mode)
            {
                let mut manager = midi_manager.lock().map_err(|e| e.to_string())?;
                println!("[Save to Bank] Navigate to bank {} (PC {})", bank_number, midi_program);
                manager.send_microcosm_program_change(&device_name, midi_program)
                    .map_err(|e| e.to_string())?;
            }
            tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
            
            // Step 3: Save/Paste (pedal flashes blue again)
            {
                let mut manager = midi_manager.lock().map_err(|e| e.to_string())?;
                println!("[Save to Bank] Save (CC 46)");
                manager.send_microcosm_parameter(&device_name, MicrocosmParameter::PresetSave)
                    .map_err(|e| e.to_string())?;
            }
            tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
            
            println!("[Save to Bank] ✅ Saved to bank {}", bank_number);
        }
        "ChromaConsole" => {
            // Send program change
            {
                let mut manager = midi_manager.lock().map_err(|e| e.to_string())?;
                manager.send_chroma_console_program_change(&device_name, bank_number)
                    .map_err(|e| e.to_string())?;
            }
            tokio::time::sleep(tokio::time::Duration::from_millis(50)).await;
            
            // Recall preset (send all parameters)
            let state: ChromaConsoleState = serde_json::from_value(preset.parameters.clone())
                .map_err(|e| format!("Failed to deserialize preset: {}", e))?;
            
            {
                let mut manager = midi_manager.lock().map_err(|e| e.to_string())?;
                manager.recall_chroma_console_preset(&device_name, &state)
                    .map_err(|e| e.to_string())?;
            }
            
            // No MIDI save command - user must manually save
        }
        _ => {
            return Err(format!("Unsupported pedal type: {}", preset.pedal_type));
        }
    }
    
    // Update bank assignment in database
    {
        let library = library.lock().map_err(|e| e.to_string())?;
        library.assign_to_bank(&preset.pedal_type, bank_number, &id)
            .map_err(|e| e.to_string())?;
    }
    
    // Return result based on save capability
    let result = match &bank_config.midi_save {
        MidiSaveCapability::Supported { .. } => SaveToBankResult {
            success: true,
            saved_via_midi: true,
            manual_save_required: false,
            instructions: None,
        },
        MidiSaveCapability::ManualOnly { instructions } => SaveToBankResult {
            success: true,
            saved_via_midi: false,
            manual_save_required: true,
            instructions: Some(instructions.clone()),
        },
        MidiSaveCapability::AutoSave => SaveToBankResult {
            success: true,
            saved_via_midi: true,
            manual_save_required: false,
            instructions: None,
        },
    };
    
    Ok(result)
}

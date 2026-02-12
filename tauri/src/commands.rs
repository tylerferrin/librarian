// Tauri commands for frontend integration
// These functions are exposed to the frontend via IPC

use crate::midi::{SharedMidiManager, ConnectedDevice, PedalType};
use crate::midi::pedals::microcosm::{MicrocosmParameter, MicrocosmState};
use crate::midi::pedals::gen_loss_mkii::{GenLossMkiiParameter, GenLossMkiiState};
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

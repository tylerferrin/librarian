// MIDI Manager - Central hub for all MIDI communication
// Handles device connections, message sending, and state management

use crate::midi::error::{MidiError, MidiResult};
use crate::midi::pedals::{Microcosm, GenLossMkii, ChromaConsole, PreampMk2, Cxm1978, MoodMkii, BillyStringsWombtone, Lossy, BrothersAm, ReverseModeC, Clean, Onward};
use crate::midi::pedals::microcosm::{MicrocosmParameter, MicrocosmState};
use crate::midi::pedals::gen_loss_mkii::{GenLossMkiiParameter, GenLossMkiiState, CC_PRESET_SAVE as GEN_LOSS_CC_PRESET_SAVE};
use crate::midi::pedals::chroma_console::{ChromaConsoleParameter, ChromaConsoleState};
use crate::midi::pedals::preamp_mk2::{PreampMk2Parameter, PreampMk2State, CC_PRESET_SAVE as PREAMP_CC_PRESET_SAVE};
use crate::midi::pedals::cxm1978::{Cxm1978Parameter, Cxm1978State, CC_PRESET_SAVE as CXM_CC_PRESET_SAVE};
use crate::midi::pedals::mood_mkii::{MoodMkiiParameter, MoodMkiiState, CC_PRESET_SAVE as MOOD_CC_PRESET_SAVE};
use crate::midi::pedals::billy_strings_wombtone::{BillyStringsWombtoneParameter, BillyStringsWombtoneState, CC_PRESET_SAVE as BSW_CC_PRESET_SAVE};
use crate::midi::pedals::lossy::{LossyParameter, LossyState, CC_PRESET_SAVE as LOSSY_CC_PRESET_SAVE};
use crate::midi::pedals::brothers_am::{BrothersAmParameter, BrothersAmState, CC_PRESET_SAVE as BROTHERS_AM_CC_PRESET_SAVE};
use crate::midi::pedals::reverse_mode_c::{ReverseModeCParameter, ReverseModeCState, CC_PRESET_SAVE as REVERSE_MODE_C_CC_PRESET_SAVE};
use crate::midi::pedals::clean::{CleanParameter, CleanState, CC_PRESET_SAVE as CLEAN_CC_PRESET_SAVE};
use crate::midi::pedals::onward::{OnwardParameter, OnwardState, CC_PRESET_SAVE as ONWARD_CC_PRESET_SAVE};
use serde::{Serialize, Deserialize};
use tauri::Emitter;

use midir::{MidiOutput, MidiOutputConnection, MidiInput, MidiInputConnection, Ignore};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

/// MIDI CC message event payload for frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MidiCCEvent {
    pub device_name: String,
    pub pedal_type: String,
    pub channel: u8,
    pub cc_number: u8,
    pub value: u8,
}

/// Type of pedal device
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum PedalType {
    Microcosm,
    GenLossMkii,
    ChromaConsole,
    PreampMk2,
    Cxm1978,
    MoodMkii,
    BillyStringsWombtone,
    Lossy,
    BrothersAm,
    ReverseModeC,
    Clean,
    Onward,
}

/// Information about a connected device
#[derive(Debug, Clone)]
pub struct ConnectedDevice {
    pub device_name: String,
    pub pedal_type: PedalType,
    pub midi_channel: u8,
}

/// Active MIDI connection with bidirectional capability
struct MidiConnection {
    output: MidiOutputConnection,
    #[allow(dead_code)]
    input: Option<MidiInputConnection<()>>,
    midi_channel: u8,
}

impl MidiConnection {
    /// Send a Control Change message
    fn send_cc(&mut self, cc_number: u8, value: u8) -> MidiResult<()> {
        // MIDI CC message format: [Status byte, CC number, Value]
        // Status byte = 0xB0 + (channel - 1)
        let status = 0xB0 + (self.midi_channel - 1);
        let message = [status, cc_number, value];
        
        self.output
            .send(&message)
            .map_err(|e| MidiError::SendFailed(e.to_string()))?;
        
        Ok(())
    }
    
    /// Send a Program Change message
    fn send_program_change(&mut self, program: u8) -> MidiResult<()> {
        // MIDI Program Change format: [Status byte, Program number]
        // Status byte = 0xC0 + (channel - 1)
        let status = 0xC0 + (self.midi_channel - 1);
        let message = [status, program];
        
        self.output
            .send(&message)
            .map_err(|e| MidiError::SendFailed(e.to_string()))?;
        
        Ok(())
    }
}

/// Device-specific connection wrapper
enum DeviceConnection {
    Microcosm {
        connection: MidiConnection,
        state: Microcosm,
    },
    GenLossMkii {
        connection: MidiConnection,
        state: GenLossMkii,
    },
    ChromaConsole {
        connection: MidiConnection,
        state: ChromaConsole,
    },
    PreampMk2 {
        connection: MidiConnection,
        state: PreampMk2,
    },
    Cxm1978 {
        connection: MidiConnection,
        state: Cxm1978,
    },
    MoodMkii {
        connection: MidiConnection,
        state: MoodMkii,
    },
    BillyStringsWombtone {
        connection: MidiConnection,
        state: BillyStringsWombtone,
    },
    Lossy {
        connection: MidiConnection,
        state: Lossy,
    },
    BrothersAm {
        connection: MidiConnection,
        state: BrothersAm,
    },
    ReverseModeC {
        connection: MidiConnection,
        state: ReverseModeC,
    },
    Clean {
        connection: MidiConnection,
        state: Clean,
    },
    Onward {
        connection: MidiConnection,
        state: Onward,
    },
}

/// Central MIDI Manager for all device communication
pub struct MidiManager {
    connections: HashMap<String, DeviceConnection>,
    midi_output: Option<MidiOutput>,
    app_handle: Option<tauri::AppHandle>,
}

impl MidiManager {
    /// Create a new MIDI Manager
    pub fn new() -> MidiResult<Self> {
        let midi_output = MidiOutput::new("Librarian Output")
            .map_err(|e| MidiError::Other(e.to_string()))?;
        
        Ok(Self {
            connections: HashMap::new(),
            midi_output: Some(midi_output),
            app_handle: None,
        })
    }
    
    /// Set the Tauri app handle for event emission
    pub fn set_app_handle(&mut self, handle: tauri::AppHandle) {
        self.app_handle = Some(handle);
    }
    
    /// Setup MIDI input listener for a device
    fn setup_midi_input(
        &self,
        device_name: &str,
        pedal_type: PedalType,
        midi_channel: u8,
    ) -> MidiResult<Option<MidiInputConnection<()>>> {
        // Only setup input if we have an app handle
        if self.app_handle.is_none() {
            println!("⚠️  No app handle available, skipping MIDI input setup");
            return Ok(None);
        }
        
        let mut midi_in = MidiInput::new("Librarian Input")
            .map_err(|e| MidiError::Other(e.to_string()))?;
        midi_in.ignore(Ignore::None);
        
        // List all available input ports (debug mode only)
        #[cfg(debug_assertions)]
        {
            println!("🔍 Available MIDI input ports:");
            for port in midi_in.ports().iter() {
                if let Ok(name) = midi_in.port_name(port) {
                    println!("   - {}", name);
                }
            }
        }
        
        // Find the matching input port
        let in_ports = midi_in.ports();
        let port_opt = in_ports.into_iter()
            .find(|p| {
                midi_in.port_name(p)
                    .map(|name| {
                        let matches = name.to_lowercase().contains(&device_name.to_lowercase());
                        if matches {
                            println!("✅ Found matching input port: {}", name);
                        }
                        matches
                    })
                    .unwrap_or(false)
            });
        
        if let Some(port) = port_opt {
            let device_name_clone = device_name.to_string();
            let pedal_type_str = match pedal_type {
                PedalType::Microcosm => "Microcosm".to_string(),
                PedalType::GenLossMkii => "GenLossMkii".to_string(),
                PedalType::ChromaConsole => "ChromaConsole".to_string(),
                PedalType::PreampMk2 => "PreampMk2".to_string(),
                PedalType::Cxm1978 => "Cxm1978".to_string(),
                PedalType::MoodMkii => "MoodMkii".to_string(),
                PedalType::BillyStringsWombtone => "BillyStringsWombtone".to_string(),
                PedalType::Lossy => "Lossy".to_string(),
                PedalType::BrothersAm => "BrothersAm".to_string(),
                PedalType::ReverseModeC => "ReverseModeC".to_string(),
                PedalType::Clean => "Clean".to_string(),
                PedalType::Onward => "Onward".to_string(),
            };
            let app_handle = self.app_handle.as_ref().unwrap().clone();
            
            let conn_in = midi_in.connect(
                &port,
                "librarian-listener",
                move |_stamp, message, _| {
                    if message.is_empty() {
                        return;
                    }
                    
                    let status = message[0];
                    
                    // Filter out System Real-Time messages (0xF8-0xFF)
                    // 0xF8 = MIDI Clock (sent 24 times per quarter note)
                    // 0xFA = Start, 0xFB = Continue, 0xFC = Stop
                    // 0xFE = Active Sensing, 0xFF = System Reset
                    if status >= 0xF8 {
                        // Silently ignore timing/sync messages
                        return;
                    }
                    
                    // Parse CC messages (need at least 3 bytes)
                    if message.len() >= 3 {
                        let data1 = message[1];
                        let data2 = message[2];
                        
                        // Check if it's a Control Change message (0xB0-0xBF)
                        if status >= 0xB0 && status <= 0xBF {
                            let channel = (status & 0x0F) + 1;
                            
                            // Process messages on the correct channel
                            if channel == midi_channel {
                                let event = MidiCCEvent {
                                    device_name: device_name_clone.clone(),
                                    pedal_type: pedal_type_str.clone(),
                                    channel,
                                    cc_number: data1,
                                    value: data2,
                                };
                                
                                println!("📥 MIDI CC: {}, CC#={}, Value={}", 
                                    event.device_name, event.cc_number, event.value);
                                
                                // Emit event to frontend
                                if let Err(e) = app_handle.emit("midi-cc-received", &event) {
                                    eprintln!("❌ Failed to emit MIDI event: {}", e);
                                }
                            }
                        }
                    }
                },
                (),
            ).map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;
            
            println!("✅ MIDI input listener setup for: {}", device_name);
            Ok(Some(conn_in))
        } else {
            println!("⚠️  No MIDI input port found for: {}", device_name);
            Ok(None)
        }
    }
    
    /// List all available MIDI output devices
    pub fn list_devices(&self) -> MidiResult<Vec<String>> {
        let midi_out = MidiOutput::new("Librarian Scanner")
            .map_err(|e| MidiError::Other(e.to_string()))?;
        
        let mut devices = Vec::new();
        for port in midi_out.ports().iter() {
            if let Ok(name) = midi_out.port_name(port) {
                devices.push(name);
            }
        }
        
        Ok(devices)
    }

    /// Send a Program Change on a specific channel to a device without establishing
    /// a persistent connection. Used to trigger channel reassignment on pedals that
    /// accept the first received PC to set their new MIDI channel.
    pub fn send_channel_assignment_pc(&self, device_name: &str, channel: u8) -> MidiResult<()> {
        if channel < 1 || channel > 16 {
            return Err(MidiError::InvalidChannel(channel));
        }

        let midi_out = MidiOutput::new("Librarian Channel Assign")
            .map_err(|e| MidiError::Other(e.to_string()))?;

        let ports = midi_out.ports();
        let port = ports
            .iter()
            .find(|p| {
                midi_out
                    .port_name(p)
                    .map(|name| name.to_lowercase().contains(&device_name.to_lowercase()))
                    .unwrap_or(false)
            })
            .ok_or_else(|| MidiError::DeviceNotFound(device_name.to_string()))?;

        let mut output = midi_out
            .connect(port, "Librarian Channel Assign")
            .map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;

        // Send PC 1 — same value used to recall the first bank slot.
        // Program 0 is outside the valid range on CB pedals (1–122), so using 1
        // ensures the pedal treats this as a valid PC and reads the channel from
        // the status byte to complete the channel assignment.
        let status = 0xC0 + (channel - 1);
        output
            .send(&[status, 1])
            .map_err(|e| MidiError::SendFailed(e.to_string()))?;

        println!(
            "✅ Sent channel assignment PC on channel {} to '{}'",
            channel, device_name
        );

        Ok(())
    }
    
    /// Connect to a Microcosm pedal
    pub fn connect_microcosm(
        &mut self,
        device_name: &str,
        midi_channel: u8,
    ) -> MidiResult<()> {
        // Validate channel (1-16)
        if midi_channel < 1 || midi_channel > 16 {
            return Err(MidiError::InvalidChannel(midi_channel));
        }
        
        // Check if already connected
        if self.connections.contains_key(device_name) {
            return Err(MidiError::AlreadyConnected(device_name.to_string()));
        }
        
        // Find the MIDI port
        let midi_out = self.midi_output.take()
            .ok_or_else(|| MidiError::Other("MIDI output not initialized".to_string()))?;
        
        // Find the matching port by iterating and collecting the port we need
        let port_opt = {
            let ports = midi_out.ports();
            ports.into_iter()
                .find(|p| {
                    midi_out.port_name(p)
                        .map(|name| name.to_lowercase().contains(&device_name.to_lowercase()))
                        .unwrap_or(false)
                })
        };
        
        let port = port_opt.ok_or_else(|| MidiError::DeviceNotFound(device_name.to_string()))?;
        
        // Connect to the port
        let output = midi_out.connect(&port, "Librarian")
            .map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;
        
        // Setup MIDI input for bidirectional communication
        let input = self.setup_midi_input(device_name, PedalType::Microcosm, midi_channel)?;
        
        // Create connection and device state
        let connection = MidiConnection {
            output,
            input,
            midi_channel,
        };
        
        let state = Microcosm::new(midi_channel);
        
        self.connections.insert(
            device_name.to_string(),
            DeviceConnection::Microcosm { connection, state },
        );
        
        println!("✅ Connected to Microcosm: '{}' on MIDI Channel {}", device_name, midi_channel);
        
        // Reinitialize MIDI output for future connections
        self.midi_output = Some(MidiOutput::new("Librarian Output")
            .map_err(|e| MidiError::Other(e.to_string()))?);
        
        Ok(())
    }
    
    /// Connect to a Gen Loss MKII pedal
    pub fn connect_gen_loss_mkii(
        &mut self,
        device_name: &str,
        midi_channel: u8,
    ) -> MidiResult<()> {
        // Validate channel (1-16)
        if midi_channel < 1 || midi_channel > 16 {
            return Err(MidiError::InvalidChannel(midi_channel));
        }
        
        // Check if already connected
        if self.connections.contains_key(device_name) {
            return Err(MidiError::AlreadyConnected(device_name.to_string()));
        }
        
        // Find the MIDI port
        let midi_out = self.midi_output.take()
            .ok_or_else(|| MidiError::Other("MIDI output not initialized".to_string()))?;
        
        // Find the matching port by iterating and collecting the port we need
        let port_opt = {
            let ports = midi_out.ports();
            ports.into_iter()
                .find(|p| {
                    midi_out.port_name(p)
                        .map(|name| name.to_lowercase().contains(&device_name.to_lowercase()))
                        .unwrap_or(false)
                })
        };
        
        let port = port_opt.ok_or_else(|| MidiError::DeviceNotFound(device_name.to_string()))?;
        
        // Connect to the port
        let output = midi_out.connect(&port, "Librarian")
            .map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;
        
        // Setup MIDI input for bidirectional communication
        let input = self.setup_midi_input(device_name, PedalType::GenLossMkii, midi_channel)?;
        
        // Create connection and device state
        let connection = MidiConnection {
            output,
            input,
            midi_channel,
        };
        
        let state = GenLossMkii::new(midi_channel);
        
        self.connections.insert(
            device_name.to_string(),
            DeviceConnection::GenLossMkii { connection, state },
        );
        
        // Reinitialize MIDI output for future connections
        self.midi_output = Some(MidiOutput::new("Librarian Output")
            .map_err(|e| MidiError::Other(e.to_string()))?);
        
        Ok(())
    }
    
    /// Connect to a Chroma Console pedal
    pub fn connect_chroma_console(
        &mut self,
        device_name: &str,
        midi_channel: u8,
    ) -> MidiResult<()> {
        // Validate channel (1-16)
        if midi_channel < 1 || midi_channel > 16 {
            return Err(MidiError::InvalidChannel(midi_channel));
        }
        
        // Check if already connected
        if self.connections.contains_key(device_name) {
            return Err(MidiError::AlreadyConnected(device_name.to_string()));
        }
        
        // Find the MIDI port
        let midi_out = self.midi_output.take()
            .ok_or_else(|| MidiError::Other("MIDI output not initialized".to_string()))?;
        
        // Find the matching port by iterating and collecting the port we need
        let port_opt = {
            let ports = midi_out.ports();
            ports.into_iter()
                .find(|p| {
                    midi_out.port_name(p)
                        .map(|name| name.to_lowercase().contains(&device_name.to_lowercase()))
                        .unwrap_or(false)
                })
        };
        
        let port = port_opt.ok_or_else(|| MidiError::DeviceNotFound(device_name.to_string()))?;
        
        // Connect to the port
        let output = midi_out.connect(&port, "Librarian")
            .map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;
        
        // Setup MIDI input for bidirectional communication
        let input = self.setup_midi_input(device_name, PedalType::ChromaConsole, midi_channel)?;
        
        // Create connection and device state
        let connection = MidiConnection {
            output,
            input,
            midi_channel,
        };
        
        let state = ChromaConsole::new(midi_channel);
        
        self.connections.insert(
            device_name.to_string(),
            DeviceConnection::ChromaConsole { connection, state },
        );
        
        println!("✅ Connected to Chroma Console: '{}' on MIDI Channel {}", device_name, midi_channel);
        
        // Reinitialize MIDI output for future connections
        self.midi_output = Some(MidiOutput::new("Librarian Output")
            .map_err(|e| MidiError::Other(e.to_string()))?);
        
        Ok(())
    }
    
    /// Disconnect from a device
    pub fn disconnect(&mut self, device_name: &str) -> MidiResult<()> {
        self.connections.remove(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        Ok(())
    }
    
    /// Send a parameter change to a Microcosm
    pub fn send_microcosm_parameter(
        &mut self,
        device_name: &str,
        param: MicrocosmParameter,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::Microcosm { connection, state } => {
                let cc_number = param.cc_number();
                let cc_value = param.cc_value();
                
                connection.send_cc(cc_number, cc_value)?;
                state.update_state(&param);
                
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Microcosm".to_string())),
        }
    }
    
    /// Send a program change to a Microcosm (select effect/preset)
    pub fn send_microcosm_program_change(
        &mut self,
        device_name: &str,
        program: u8,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::Microcosm { connection, state } => {
                connection.send_program_change(program)?;
                state.set_current_preset(program);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Microcosm".to_string())),
        }
    }
    
    /// Send a parameter change to a Gen Loss MKII
    pub fn send_gen_loss_parameter(
        &mut self,
        device_name: &str,
        param: GenLossMkiiParameter,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::GenLossMkii { connection, state } => {
                let cc_number = param.cc_number();
                let cc_value = param.cc_value();
                
                connection.send_cc(cc_number, cc_value)?;
                state.update_state(&param);
                
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Gen Loss MKII".to_string())),
        }
    }
    
    /// Recall a preset on a Microcosm (send all parameters)
    pub fn recall_microcosm_preset(
        &mut self,
        device_name: &str,
        state: &MicrocosmState,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::Microcosm { connection, state: device_state } => {
                // Get all CC values from the preset state
                let temp_microcosm = Microcosm {
                    state: state.clone(),
                    midi_channel: connection.midi_channel,
                };
                let cc_map = temp_microcosm.state_as_cc_map();
                
                println!("[Microcosm] Recalling preset: sending {} CC messages", cc_map.len());
                
                // Send all CC messages with increased throttling to prevent buffer overflow
                for (cc_number, value) in cc_map.iter() {
                    connection.send_cc(*cc_number, *value)?;
                    println!("[Microcosm] Sent CC#{}: {}", cc_number, value);
                    tokio::task::block_in_place(|| thread::sleep(Duration::from_millis(20)));
                }
                
                println!("[Microcosm] Preset recall complete");
                
                // Update device state
                *device_state = temp_microcosm;
                
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Microcosm".to_string())),
        }
    }
    
    /// Recall a preset on a Gen Loss MKII (send all parameters)
    pub fn recall_gen_loss_preset(
        &mut self,
        device_name: &str,
        state: &GenLossMkiiState,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::GenLossMkii { connection, state: device_state } => {
                // Get all CC values from the preset state
                let temp_gen_loss = GenLossMkii {
                    state: state.clone(),
                    midi_channel: connection.midi_channel,
                };
                let cc_map = temp_gen_loss.state_as_cc_map();
                
                println!("[Gen Loss MKII] Recalling preset: sending {} CC messages", cc_map.len());
                
                // Send all CC messages with increased throttling to prevent buffer overflow
                for (cc_number, value) in cc_map.iter() {
                    connection.send_cc(*cc_number, *value)?;
                    println!("[Gen Loss MKII] Sent CC#{}: {}", cc_number, value);
                    tokio::task::block_in_place(|| thread::sleep(Duration::from_millis(20)));
                }
                
                println!("[Gen Loss MKII] Preset recall complete");
                
                // Update device state
                *device_state = temp_gen_loss;
                
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Gen Loss MKII".to_string())),
        }
    }
    
    /// Save current state to a Gen Loss MKII preset slot (1-122) using CC 111
    pub fn save_gen_loss_preset(
        &mut self,
        device_name: &str,
        slot: u8,
    ) -> MidiResult<()> {
        if slot < 1 || slot > 122 {
            return Err(MidiError::Other(format!("Invalid preset slot: {}. Must be 1-122", slot)));
        }
        
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::GenLossMkii { connection, .. } => {
                connection.send_cc(GEN_LOSS_CC_PRESET_SAVE, slot)?;
                println!("[Gen Loss MKII] Saved current state to preset slot {}", slot);
                
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Gen Loss MKII".to_string())),
        }
    }
    
    /// Send a program change to a Gen Loss MKII (navigate to preset slot 1-122)
    pub fn send_gen_loss_program_change(
        &mut self,
        device_name: &str,
        program: u8,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;

        match device {
            DeviceConnection::GenLossMkii { connection, .. } => {
                connection.send_program_change(program)?;
                println!("[Gen Loss MKII] Sent PC {} (navigated to preset slot {})", program, program);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Gen Loss MKII".to_string())),
        }
    }

    /// Get the current state of a Microcosm
    pub fn get_microcosm_state(&self, device_name: &str) -> MidiResult<MicrocosmState> {
        let device = self.connections.get(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::Microcosm { state, .. } => Ok(state.state.clone()),
            _ => Err(MidiError::Other("Device is not a Microcosm".to_string())),
        }
    }
    
    /// Get the current state of a Gen Loss MKII
    pub fn get_gen_loss_state(&self, device_name: &str) -> MidiResult<GenLossMkiiState> {
        let device = self.connections.get(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::GenLossMkii { state, .. } => Ok(state.state.clone()),
            _ => Err(MidiError::Other("Device is not a Gen Loss MKII".to_string())),
        }
    }
    
    /// Send a parameter change to a Chroma Console
    pub fn send_chroma_console_parameter(
        &mut self,
        device_name: &str,
        param: ChromaConsoleParameter,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::ChromaConsole { connection, state } => {
                let cc_number = param.cc_number();
                let cc_value = param.cc_value();
                
                connection.send_cc(cc_number, cc_value)?;
                state.update_state(&param);
                
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Chroma Console".to_string())),
        }
    }
    
    /// Send a program change to a Chroma Console (0-79 for 80 user presets)
    pub fn send_chroma_console_program_change(
        &mut self,
        device_name: &str,
        program: u8,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::ChromaConsole { connection, state } => {
                connection.send_program_change(program)?;
                state.load_preset(program);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Chroma Console".to_string())),
        }
    }
    
    /// Recall a preset on a Chroma Console (send all parameters)
    pub fn recall_chroma_console_preset(
        &mut self,
        device_name: &str,
        state: &ChromaConsoleState,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::ChromaConsole { connection, state: device_state } => {
                // Get all CC values from the preset state
                let temp_chroma = ChromaConsole {
                    state: state.clone(),
                    midi_channel: connection.midi_channel,
                };
                let cc_map = temp_chroma.state_as_cc_map();
                
                println!("[Chroma Console] Recalling preset: sending {} CC messages", cc_map.len());
                
                // Send all CC messages with increased throttling to prevent buffer overflow
                for (cc_number, value) in cc_map.iter() {
                    connection.send_cc(*cc_number, *value)?;
                    println!("[Chroma Console] Sent CC#{}: {}", cc_number, value);
                    tokio::task::block_in_place(|| thread::sleep(Duration::from_millis(20)));
                }
                
                println!("[Chroma Console] Preset recall complete");
                
                // Update device state
                *device_state = temp_chroma;
                
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Chroma Console".to_string())),
        }
    }
    
    /// Get the current state of a Chroma Console
    pub fn get_chroma_console_state(&self, device_name: &str) -> MidiResult<ChromaConsoleState> {
        let device = self.connections.get(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::ChromaConsole { state, .. } => Ok(state.state.clone()),
            _ => Err(MidiError::Other("Device is not a Chroma Console".to_string())),
        }
    }
    
    // ========================================================================
    // Chase Bliss Preamp MK II Methods
    // ========================================================================
    
    /// Connect to a Chase Bliss Preamp MK II
    pub fn connect_preamp_mk2(
        &mut self,
        device_name: &str,
        midi_channel: u8,
    ) -> MidiResult<()> {
        // Validate channel (1-16)
        if midi_channel < 1 || midi_channel > 16 {
            return Err(MidiError::InvalidChannel(midi_channel));
        }
        
        // Check if already connected
        if self.connections.contains_key(device_name) {
            return Err(MidiError::AlreadyConnected(device_name.to_string()));
        }
        
        // Find the MIDI port
        let midi_out = self.midi_output.take()
            .ok_or_else(|| MidiError::Other("MIDI output not initialized".to_string()))?;
        
        // Find the matching port by iterating and collecting the port we need
        let port_opt = {
            let ports = midi_out.ports();
            ports.into_iter()
                .find(|p| {
                    midi_out.port_name(p)
                        .map(|name| name.to_lowercase().contains(&device_name.to_lowercase()))
                        .unwrap_or(false)
                })
        };
        
        let port = port_opt.ok_or_else(|| MidiError::DeviceNotFound(device_name.to_string()))?;
        
        // Connect to the output port
        let output = midi_out
            .connect(&port, "Librarian")
            .map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;
        
        // Setup MIDI input for bidirectional communication
        let input = self.setup_midi_input(device_name, PedalType::PreampMk2, midi_channel)?;
        
        // Create connection and device state
        let connection = MidiConnection {
            output,
            input,
            midi_channel,
        };
        
        let state = PreampMk2::new(midi_channel);
        
        self.connections.insert(
            device_name.to_string(),
            DeviceConnection::PreampMk2 { connection, state },
        );
        
        println!("✅ Connected to Preamp MK II: '{}' on MIDI Channel {}", device_name, midi_channel);
        
        // Reinitialize MIDI output for future connections
        self.midi_output = Some(MidiOutput::new("Librarian Output")
            .map_err(|e| MidiError::Other(e.to_string()))?);
        
        Ok(())
    }
    
    /// Send a parameter change to a Preamp MK II
    pub fn send_preamp_mk2_parameter(
        &mut self,
        device_name: &str,
        param: PreampMk2Parameter,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::PreampMk2 { connection, state } => {
                let cc_number = param.cc_number();
                let cc_value = param.cc_value();
                
                #[cfg(debug_assertions)]
                println!("[Preamp MK II] Sending CC#{} = {} (ch {})", cc_number, cc_value, connection.midi_channel);
                
                connection.send_cc(cc_number, cc_value)?;
                state.update_state(&param);
                
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Preamp MK II".to_string())),
        }
    }
    
    /// Send a Program Change to a Preamp MK II to recall a preset (PC 0-29 → presets 0-29)
    pub fn send_preamp_mk2_program_change(
        &mut self,
        device_name: &str,
        program: u8,
    ) -> MidiResult<()> {
        if program > 29 {
            return Err(MidiError::Other(format!("Invalid preset slot: {}. Must be 0-29", program)));
        }
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;

        match device {
            DeviceConnection::PreampMk2 { connection, .. } => {
                connection.send_program_change(program)?;
                println!("[Preamp MK II] Sent Program Change {} to recall preset {}", program, program);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Preamp MK II".to_string())),
        }
    }

    /// Recall a preset by sending all parameters to the Preamp MK II
    pub fn recall_preamp_mk2_preset(
        &mut self,
        device_name: &str,
        state: &PreampMk2State,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::PreampMk2 { connection, state: device_state } => {
                // Get all CC values from the preset state
                let temp_preamp = PreampMk2 {
                    state: state.clone(),
                    midi_channel: connection.midi_channel,
                };
                let cc_map = temp_preamp.state_as_cc_map();
                
                println!("[Preamp MK II] Recalling preset: sending {} CC messages", cc_map.len());
                
                // Send all CC messages with throttling
                for (cc_number, value) in cc_map.iter() {
                    connection.send_cc(*cc_number, *value)?;
                    println!("[Preamp MK II] Sent CC#{}: {}", cc_number, value);
                    tokio::task::block_in_place(|| thread::sleep(Duration::from_millis(20)));
                }
                
                println!("[Preamp MK II] Preset recall complete");
                
                // Update device state
                *device_state = temp_preamp;
                
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Preamp MK II".to_string())),
        }
    }
    
    /// Save current state to a preset slot (0-29) using CC 27
    pub fn save_preamp_mk2_preset(
        &mut self,
        device_name: &str,
        slot: u8,
    ) -> MidiResult<()> {
        // Validate slot (0-29 for 30 presets)
        if slot > 29 {
            return Err(MidiError::Other(format!("Invalid preset slot: {}. Must be 0-29", slot)));
        }
        
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::PreampMk2 { connection, .. } => {
                // Send CC 27 with slot number (0-29)
                connection.send_cc(PREAMP_CC_PRESET_SAVE, slot)?;
                println!("[Preamp MK II] Saved current state to preset slot {}", slot);
                
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Preamp MK II".to_string())),
        }
    }
    
    /// Get the current state of a Preamp MK II
    pub fn get_preamp_mk2_state(&self, device_name: &str) -> MidiResult<PreampMk2State> {
        let device = self.connections.get(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        
        match device {
            DeviceConnection::PreampMk2 { state, .. } => Ok(state.state.clone()),
            _ => Err(MidiError::Other("Device is not a Preamp MK II".to_string())),
        }
    }
    
    // ========================================================================
    // Chase Bliss / Meris CXM 1978 Methods
    // ========================================================================

    /// Connect to a Chase Bliss / Meris CXM 1978
    pub fn connect_cxm1978(
        &mut self,
        device_name: &str,
        midi_channel: u8,
    ) -> MidiResult<()> {
        if midi_channel < 1 || midi_channel > 16 {
            return Err(MidiError::InvalidChannel(midi_channel));
        }

        if self.connections.contains_key(device_name) {
            return Err(MidiError::AlreadyConnected(device_name.to_string()));
        }

        let midi_out = self.midi_output.take()
            .ok_or_else(|| MidiError::Other("MIDI output not initialized".to_string()))?;

        let port_opt = {
            let ports = midi_out.ports();
            ports.into_iter()
                .find(|p| {
                    midi_out.port_name(p)
                        .map(|name| name.to_lowercase().contains(&device_name.to_lowercase()))
                        .unwrap_or(false)
                })
        };

        let port = port_opt.ok_or_else(|| MidiError::DeviceNotFound(device_name.to_string()))?;

        let output = midi_out
            .connect(&port, "Librarian")
            .map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;

        let input = self.setup_midi_input(device_name, PedalType::Cxm1978, midi_channel)?;

        let connection = MidiConnection {
            output,
            input,
            midi_channel,
        };

        let state = Cxm1978::new(midi_channel);

        self.connections.insert(
            device_name.to_string(),
            DeviceConnection::Cxm1978 { connection, state },
        );

        println!("✅ Connected to CXM 1978: '{}' on MIDI Channel {}", device_name, midi_channel);

        self.midi_output = Some(MidiOutput::new("Librarian Output")
            .map_err(|e| MidiError::Other(e.to_string()))?);

        Ok(())
    }

    /// Send a parameter change to a CXM 1978
    pub fn send_cxm1978_parameter(
        &mut self,
        device_name: &str,
        param: Cxm1978Parameter,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;

        match device {
            DeviceConnection::Cxm1978 { connection, state } => {
                let cc_number = param.cc_number();
                let cc_value = param.cc_value();

                #[cfg(debug_assertions)]
                println!("[CXM 1978] Sending CC#{} = {} (ch {})", cc_number, cc_value, connection.midi_channel);

                connection.send_cc(cc_number, cc_value)?;
                state.update_state(&param);

                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a CXM 1978".to_string())),
        }
    }

    /// Send a Program Change to recall a CXM 1978 preset (PC 0-29)
    pub fn send_cxm1978_program_change(
        &mut self,
        device_name: &str,
        program: u8,
    ) -> MidiResult<()> {
        if program > 29 {
            return Err(MidiError::Other(format!("Invalid preset slot: {}. Must be 0-29", program)));
        }

        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;

        match device {
            DeviceConnection::Cxm1978 { connection, .. } => {
                connection.send_program_change(program)?;
                println!("[CXM 1978] Sent Program Change {} to recall preset {}", program, program);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a CXM 1978".to_string())),
        }
    }

    /// Recall a CXM 1978 preset by sending all parameters
    pub fn recall_cxm1978_preset(
        &mut self,
        device_name: &str,
        state: &Cxm1978State,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;

        match device {
            DeviceConnection::Cxm1978 { connection, state: device_state } => {
                let temp_cxm = Cxm1978 {
                    state: state.clone(),
                    midi_channel: connection.midi_channel,
                };
                let cc_map = temp_cxm.state_as_cc_map();

                // Sort by CC number for deterministic order
                let mut cc_pairs: Vec<(u8, u8)> = cc_map.into_iter().collect();
                cc_pairs.sort_by_key(|(cc, _)| *cc);

                for (cc_number, cc_value) in cc_pairs {
                    connection.send_cc(cc_number, cc_value)?;
                    tokio::task::block_in_place(|| thread::sleep(Duration::from_millis(20)));
                }

                device_state.state = state.clone();
                println!("[CXM 1978] Recalled preset state for '{}'", device_name);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a CXM 1978".to_string())),
        }
    }

    /// Save current state to a CXM 1978 preset slot (0-29)
    pub fn save_cxm1978_preset(
        &mut self,
        device_name: &str,
        slot: u8,
    ) -> MidiResult<()> {
        if slot > 29 {
            return Err(MidiError::Other(format!("Invalid preset slot: {}. Must be 0-29", slot)));
        }

        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;

        match device {
            DeviceConnection::Cxm1978 { connection, .. } => {
                connection.send_cc(CXM_CC_PRESET_SAVE, slot)?;
                println!("[CXM 1978] Saved current state to preset slot {}", slot);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a CXM 1978".to_string())),
        }
    }

    /// Get the current state of a CXM 1978
    pub fn get_cxm1978_state(&self, device_name: &str) -> MidiResult<Cxm1978State> {
        let device = self.connections.get(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;

        match device {
            DeviceConnection::Cxm1978 { state, .. } => Ok(state.state.clone()),
            _ => Err(MidiError::Other("Device is not a CXM 1978".to_string())),
        }
    }

    // ========================================================================
    // Chase Bliss Audio Mood MkII Methods
    // ========================================================================

    /// Connect to a Chase Bliss Audio Mood MkII
    pub fn connect_mood_mkii(
        &mut self,
        device_name: &str,
        midi_channel: u8,
    ) -> MidiResult<()> {
        if midi_channel < 1 || midi_channel > 16 {
            return Err(MidiError::InvalidChannel(midi_channel));
        }
        if self.connections.contains_key(device_name) {
            return Err(MidiError::AlreadyConnected(device_name.to_string()));
        }
        let midi_out = self.midi_output.take()
            .ok_or_else(|| MidiError::Other("MIDI output not initialized".to_string()))?;
        let port_opt = {
            let ports = midi_out.ports();
            ports.into_iter()
                .find(|p| {
                    midi_out.port_name(p)
                        .map(|name| name.to_lowercase().contains(&device_name.to_lowercase()))
                        .unwrap_or(false)
                })
        };
        let port = port_opt.ok_or_else(|| MidiError::DeviceNotFound(device_name.to_string()))?;
        let output = midi_out.connect(&port, "Librarian")
            .map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;
        let input = self.setup_midi_input(device_name, PedalType::MoodMkii, midi_channel)?;
        let connection = MidiConnection { output, input, midi_channel };
        let state = MoodMkii::new(midi_channel);
        self.connections.insert(device_name.to_string(), DeviceConnection::MoodMkii { connection, state });
        println!("✅ Connected to Mood MkII: '{}' on MIDI Channel {}", device_name, midi_channel);
        self.midi_output = Some(MidiOutput::new("Librarian Output")
            .map_err(|e| MidiError::Other(e.to_string()))?);
        Ok(())
    }

    /// Send a parameter change to a Mood MkII
    pub fn send_mood_mkii_parameter(
        &mut self,
        device_name: &str,
        param: MoodMkiiParameter,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::MoodMkii { connection, state } => {
                let cc_number = param.cc_number();
                let cc_value = param.cc_value();
                #[cfg(debug_assertions)]
                println!("[Mood MkII] Sending CC#{} = {} (ch {})", cc_number, cc_value, connection.midi_channel);
                connection.send_cc(cc_number, cc_value)?;
                state.update_state(&param);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Mood MkII".to_string())),
        }
    }

    /// Get the current state of a Mood MkII
    pub fn get_mood_mkii_state(&self, device_name: &str) -> MidiResult<MoodMkiiState> {
        let device = self.connections.get(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::MoodMkii { state, .. } => Ok(state.state.clone()),
            _ => Err(MidiError::Other("Device is not a Mood MkII".to_string())),
        }
    }

    /// Recall a preset on a Mood MkII (send all parameters)
    pub fn recall_mood_mkii_preset(
        &mut self,
        device_name: &str,
        state: &MoodMkiiState,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::MoodMkii { connection, state: device_state } => {
                let temp = MoodMkii { state: state.clone(), midi_channel: connection.midi_channel };
                let cc_map = temp.state_as_cc_map();
                println!("[Mood MkII] Recalling preset: sending {} CC messages", cc_map.len());
                for (cc_number, value) in cc_map.iter() {
                    connection.send_cc(*cc_number, *value)?;
                    tokio::task::block_in_place(|| thread::sleep(Duration::from_millis(20)));
                }
                println!("[Mood MkII] Preset recall complete");
                *device_state = temp;
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Mood MkII".to_string())),
        }
    }

    /// Save current state to a Mood MkII preset slot (1-122)
    pub fn save_mood_mkii_preset(
        &mut self,
        device_name: &str,
        slot: u8,
    ) -> MidiResult<()> {
        if slot < 1 || slot > 122 {
            return Err(MidiError::Other(format!("Invalid preset slot: {}. Must be 1-122", slot)));
        }
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::MoodMkii { connection, .. } => {
                connection.send_cc(MOOD_CC_PRESET_SAVE, slot)?;
                println!("[Mood MkII] Saved current state to preset slot {}", slot);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Mood MkII".to_string())),
        }
    }

    /// Send a program change to a Mood MkII (navigate to preset slot 1-122)
    pub fn send_mood_mkii_program_change(
        &mut self,
        device_name: &str,
        program: u8,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::MoodMkii { connection, .. } => {
                connection.send_program_change(program)?;
                println!("[Mood MkII] Sent PC {} (navigated to preset slot {})", program, program);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Mood MkII".to_string())),
        }
    }

    // ========================================================================
    // Chase Bliss Audio Billy Strings Wombtone Methods
    // ========================================================================

    /// Connect to a Chase Bliss Audio Billy Strings Wombtone
    pub fn connect_billy_strings_wombtone(
        &mut self,
        device_name: &str,
        midi_channel: u8,
    ) -> MidiResult<()> {
        if midi_channel < 1 || midi_channel > 16 {
            return Err(MidiError::InvalidChannel(midi_channel));
        }
        if self.connections.contains_key(device_name) {
            return Err(MidiError::AlreadyConnected(device_name.to_string()));
        }
        let midi_out = self.midi_output.take()
            .ok_or_else(|| MidiError::Other("MIDI output not initialized".to_string()))?;
        let port_opt = {
            let ports = midi_out.ports();
            ports.into_iter()
                .find(|p| {
                    midi_out.port_name(p)
                        .map(|name| name.to_lowercase().contains(&device_name.to_lowercase()))
                        .unwrap_or(false)
                })
        };
        let port = port_opt.ok_or_else(|| MidiError::DeviceNotFound(device_name.to_string()))?;
        let output = midi_out.connect(&port, "Librarian")
            .map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;
        let input = self.setup_midi_input(device_name, PedalType::BillyStringsWombtone, midi_channel)?;
        let connection = MidiConnection { output, input, midi_channel };
        let state = BillyStringsWombtone::new(midi_channel);
        self.connections.insert(device_name.to_string(), DeviceConnection::BillyStringsWombtone { connection, state });
        println!("✅ Connected to Billy Strings Wombtone: '{}' on MIDI Channel {}", device_name, midi_channel);
        self.midi_output = Some(MidiOutput::new("Librarian Output")
            .map_err(|e| MidiError::Other(e.to_string()))?);
        Ok(())
    }

    /// Send a parameter change to a Billy Strings Wombtone
    pub fn send_billy_strings_wombtone_parameter(
        &mut self,
        device_name: &str,
        param: BillyStringsWombtoneParameter,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::BillyStringsWombtone { connection, state } => {
                let cc_number = param.cc_number();
                let cc_value = param.cc_value();
                #[cfg(debug_assertions)]
                println!("[Billy Strings Wombtone] Sending CC#{} = {} (ch {})", cc_number, cc_value, connection.midi_channel);
                connection.send_cc(cc_number, cc_value)?;
                state.update_state(&param);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Billy Strings Wombtone".to_string())),
        }
    }

    /// Get the current state of a Billy Strings Wombtone
    pub fn get_billy_strings_wombtone_state(&self, device_name: &str) -> MidiResult<BillyStringsWombtoneState> {
        let device = self.connections.get(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::BillyStringsWombtone { state, .. } => Ok(state.state.clone()),
            _ => Err(MidiError::Other("Device is not a Billy Strings Wombtone".to_string())),
        }
    }

    /// Recall a preset on a Billy Strings Wombtone (send all parameters)
    pub fn recall_billy_strings_wombtone_preset(
        &mut self,
        device_name: &str,
        state: &BillyStringsWombtoneState,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::BillyStringsWombtone { connection, state: device_state } => {
                let temp = BillyStringsWombtone { state: state.clone(), midi_channel: connection.midi_channel };
                let cc_map = temp.state_as_cc_map();
                println!("[Billy Strings Wombtone] Recalling preset: sending {} CC messages", cc_map.len());
                for (cc_number, value) in cc_map.iter() {
                    connection.send_cc(*cc_number, *value)?;
                    tokio::task::block_in_place(|| thread::sleep(Duration::from_millis(20)));
                }
                println!("[Billy Strings Wombtone] Preset recall complete");
                *device_state = temp;
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Billy Strings Wombtone".to_string())),
        }
    }

    /// Save current state to a Billy Strings Wombtone preset slot (1-122)
    pub fn save_billy_strings_wombtone_preset(
        &mut self,
        device_name: &str,
        slot: u8,
    ) -> MidiResult<()> {
        if slot < 1 || slot > 122 {
            return Err(MidiError::Other(format!("Invalid preset slot: {}. Must be 1-122", slot)));
        }
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::BillyStringsWombtone { connection, .. } => {
                connection.send_cc(BSW_CC_PRESET_SAVE, slot)?;
                println!("[Billy Strings Wombtone] Saved current state to preset slot {}", slot);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Billy Strings Wombtone".to_string())),
        }
    }

    /// Send a program change to a Billy Strings Wombtone (navigate to preset slot 1-122)
    pub fn send_billy_strings_wombtone_program_change(
        &mut self,
        device_name: &str,
        program: u8,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::BillyStringsWombtone { connection, .. } => {
                connection.send_program_change(program)?;
                println!("[Billy Strings Wombtone] Sent PC {} (navigated to preset slot {})", program, program);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Billy Strings Wombtone".to_string())),
        }
    }

    // ========================================================================
    // Chase Bliss Audio Lossy Methods
    // ========================================================================

    /// Connect to a Chase Bliss Audio Lossy
    pub fn connect_lossy(
        &mut self,
        device_name: &str,
        midi_channel: u8,
    ) -> MidiResult<()> {
        if midi_channel < 1 || midi_channel > 16 {
            return Err(MidiError::InvalidChannel(midi_channel));
        }
        if self.connections.contains_key(device_name) {
            return Err(MidiError::AlreadyConnected(device_name.to_string()));
        }
        let midi_out = self.midi_output.take()
            .ok_or_else(|| MidiError::Other("MIDI output not initialized".to_string()))?;
        let port_opt = {
            let ports = midi_out.ports();
            ports.into_iter()
                .find(|p| {
                    midi_out.port_name(p)
                        .map(|name| name.to_lowercase().contains(&device_name.to_lowercase()))
                        .unwrap_or(false)
                })
        };
        let port = port_opt.ok_or_else(|| MidiError::DeviceNotFound(device_name.to_string()))?;
        let output = midi_out.connect(&port, "Librarian")
            .map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;
        let input = self.setup_midi_input(device_name, PedalType::Lossy, midi_channel)?;
        let connection = MidiConnection { output, input, midi_channel };
        let state = Lossy::new(midi_channel);
        self.connections.insert(device_name.to_string(), DeviceConnection::Lossy { connection, state });
        println!("✅ Connected to Lossy: '{}' on MIDI Channel {}", device_name, midi_channel);
        self.midi_output = Some(MidiOutput::new("Librarian Output")
            .map_err(|e| MidiError::Other(e.to_string()))?);
        Ok(())
    }

    /// Send a parameter change to a Lossy
    pub fn send_lossy_parameter(
        &mut self,
        device_name: &str,
        param: LossyParameter,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::Lossy { connection, state } => {
                let cc_number = param.cc_number();
                let cc_value = param.cc_value();
                #[cfg(debug_assertions)]
                println!("[Lossy] Sending CC#{} = {} (ch {})", cc_number, cc_value, connection.midi_channel);
                connection.send_cc(cc_number, cc_value)?;
                state.update_state(&param);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Lossy".to_string())),
        }
    }

    /// Get the current state of a Lossy
    pub fn get_lossy_state(&self, device_name: &str) -> MidiResult<LossyState> {
        let device = self.connections.get(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::Lossy { state, .. } => Ok(state.state.clone()),
            _ => Err(MidiError::Other("Device is not a Lossy".to_string())),
        }
    }

    /// Recall a preset on a Lossy (send all parameters)
    pub fn recall_lossy_preset(
        &mut self,
        device_name: &str,
        state: &LossyState,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::Lossy { connection, state: device_state } => {
                let temp = Lossy { state: state.clone(), midi_channel: connection.midi_channel };
                let cc_map = temp.state_as_cc_map();
                println!("[Lossy] Recalling preset: sending {} CC messages", cc_map.len());
                for (cc_number, value) in cc_map.iter() {
                    connection.send_cc(*cc_number, *value)?;
                    tokio::task::block_in_place(|| thread::sleep(Duration::from_millis(20)));
                }
                println!("[Lossy] Preset recall complete");
                *device_state = temp;
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Lossy".to_string())),
        }
    }

    /// Save current state to a Lossy preset slot (1-122)
    pub fn save_lossy_preset(
        &mut self,
        device_name: &str,
        slot: u8,
    ) -> MidiResult<()> {
        if slot < 1 || slot > 122 {
            return Err(MidiError::Other(format!("Invalid preset slot: {}. Must be 1-122", slot)));
        }
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::Lossy { connection, .. } => {
                connection.send_cc(LOSSY_CC_PRESET_SAVE, slot)?;
                println!("[Lossy] Saved current state to preset slot {}", slot);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Lossy".to_string())),
        }
    }

    /// Send a program change to a Lossy (navigate to preset slot 1-122)
    pub fn send_lossy_program_change(
        &mut self,
        device_name: &str,
        program: u8,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::Lossy { connection, .. } => {
                connection.send_program_change(program)?;
                println!("[Lossy] Sent PC {} (navigated to preset slot {})", program, program);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Lossy".to_string())),
        }
    }

    // ========================================================================
    // Chase Bliss Audio Brothers AM Methods
    // ========================================================================

    /// Connect to a Chase Bliss Brothers AM pedal
    pub fn connect_brothers_am(
        &mut self,
        device_name: &str,
        midi_channel: u8,
    ) -> MidiResult<()> {
        if midi_channel < 1 || midi_channel > 16 {
            return Err(MidiError::InvalidChannel(midi_channel));
        }
        if self.connections.contains_key(device_name) {
            return Err(MidiError::AlreadyConnected(device_name.to_string()));
        }
        let midi_out = self.midi_output.take()
            .ok_or_else(|| MidiError::Other("MIDI output not initialized".to_string()))?;
        let port_opt = {
            let ports = midi_out.ports();
            ports.into_iter().find(|p| {
                midi_out.port_name(p)
                    .map(|name| name.to_lowercase().contains(&device_name.to_lowercase()))
                    .unwrap_or(false)
            })
        };
        let port = port_opt.ok_or_else(|| MidiError::DeviceNotFound(device_name.to_string()))?;
        let output = midi_out.connect(&port, "Librarian")
            .map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;
        let input = self.setup_midi_input(device_name, PedalType::BrothersAm, midi_channel)?;
        let connection = MidiConnection { output, input, midi_channel };
        let state = BrothersAm::new(midi_channel);
        self.connections.insert(
            device_name.to_string(),
            DeviceConnection::BrothersAm { connection, state },
        );
        println!("✅ Connected to Brothers AM: '{}' on MIDI Channel {}", device_name, midi_channel);
        self.midi_output = Some(MidiOutput::new("Librarian Output")
            .map_err(|e| MidiError::Other(e.to_string()))?);
        Ok(())
    }

    /// Send a parameter change to a Brothers AM
    pub fn send_brothers_am_parameter(
        &mut self,
        device_name: &str,
        param: BrothersAmParameter,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::BrothersAm { connection, state } => {
                let cc_number = param.cc_number();
                let cc_value = param.cc_value();
                #[cfg(debug_assertions)]
                println!("[Brothers AM] Sending CC#{} = {} (ch {})", cc_number, cc_value, connection.midi_channel);
                connection.send_cc(cc_number, cc_value)?;
                state.update_state(&param);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Brothers AM".to_string())),
        }
    }

    /// Recall a preset on a Brothers AM (send all parameters)
    pub fn recall_brothers_am_preset(
        &mut self,
        device_name: &str,
        state: &BrothersAmState,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::BrothersAm { connection, state: device_state } => {
                let temp = BrothersAm {
                    state: state.clone(),
                    midi_channel: connection.midi_channel,
                };
                let cc_map = temp.state_as_cc_map();
                println!("[Brothers AM] Recalling preset: sending {} CC messages", cc_map.len());
                let mut cc_pairs: Vec<(u8, u8)> = cc_map.into_iter().collect();
                cc_pairs.sort_by_key(|(cc, _)| *cc);
                for (cc_number, value) in cc_pairs {
                    connection.send_cc(cc_number, value)?;
                    tokio::task::block_in_place(|| thread::sleep(Duration::from_millis(20)));
                }
                println!("[Brothers AM] Preset recall complete");
                *device_state = temp;
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Brothers AM".to_string())),
        }
    }

    /// Save current state to a Brothers AM preset slot (1-122) using CC 111
    pub fn save_brothers_am_preset(
        &mut self,
        device_name: &str,
        slot: u8,
    ) -> MidiResult<()> {
        if slot < 1 || slot > 122 {
            return Err(MidiError::Other(format!("Invalid preset slot: {}. Must be 1-122", slot)));
        }
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::BrothersAm { connection, .. } => {
                connection.send_cc(BROTHERS_AM_CC_PRESET_SAVE, slot)?;
                println!("[Brothers AM] Saved current state to preset slot {}", slot);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Brothers AM".to_string())),
        }
    }

    /// Send a program change to a Brothers AM (navigate to preset slot 1-122)
    pub fn send_brothers_am_program_change(
        &mut self,
        device_name: &str,
        program: u8,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::BrothersAm { connection, .. } => {
                connection.send_program_change(program)?;
                println!("[Brothers AM] Sent PC {} (navigated to preset slot {})", program, program);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Brothers AM".to_string())),
        }
    }

    /// Get the current state of a Brothers AM
    pub fn get_brothers_am_state(&self, device_name: &str) -> MidiResult<BrothersAmState> {
        let device = self.connections.get(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::BrothersAm { state, .. } => Ok(state.state.clone()),
            _ => Err(MidiError::Other("Device is not a Brothers AM".to_string())),
        }
    }

    // ========================================================================
    // Chase Bliss Audio Reverse Mode C Methods
    // ========================================================================

    /// Connect to a Chase Bliss Reverse Mode C pedal
    pub fn connect_reverse_mode_c(
        &mut self,
        device_name: &str,
        midi_channel: u8,
    ) -> MidiResult<()> {
        if midi_channel < 1 || midi_channel > 16 {
            return Err(MidiError::InvalidChannel(midi_channel));
        }
        if self.connections.contains_key(device_name) {
            return Err(MidiError::AlreadyConnected(device_name.to_string()));
        }
        let midi_out = self.midi_output.take()
            .ok_or_else(|| MidiError::Other("MIDI output not initialized".to_string()))?;
        let port_opt = {
            let ports = midi_out.ports();
            ports.into_iter().find(|p| {
                midi_out.port_name(p)
                    .map(|name| name.to_lowercase().contains(&device_name.to_lowercase()))
                    .unwrap_or(false)
            })
        };
        let port = port_opt.ok_or_else(|| MidiError::DeviceNotFound(device_name.to_string()))?;
        let output = midi_out.connect(&port, "Librarian")
            .map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;
        let input = self.setup_midi_input(device_name, PedalType::ReverseModeC, midi_channel)?;
        let connection = MidiConnection { output, input, midi_channel };
        let state = ReverseModeC::new(midi_channel);
        self.connections.insert(
            device_name.to_string(),
            DeviceConnection::ReverseModeC { connection, state },
        );
        println!("✅ Connected to Reverse Mode C: '{}' on MIDI Channel {}", device_name, midi_channel);
        self.midi_output = Some(MidiOutput::new("Librarian Output")
            .map_err(|e| MidiError::Other(e.to_string()))?);
        Ok(())
    }

    /// Send a parameter change to a Reverse Mode C
    pub fn send_reverse_mode_c_parameter(
        &mut self,
        device_name: &str,
        param: ReverseModeCParameter,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::ReverseModeC { connection, state } => {
                let cc_number = param.cc_number();
                let cc_value = param.cc_value();
                #[cfg(debug_assertions)]
                println!("[Reverse Mode C] Sending CC#{} = {} (ch {})", cc_number, cc_value, connection.midi_channel);
                connection.send_cc(cc_number, cc_value)?;
                state.update_state(&param);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Reverse Mode C".to_string())),
        }
    }

    /// Recall a preset on a Reverse Mode C (send all parameters)
    pub fn recall_reverse_mode_c_preset(
        &mut self,
        device_name: &str,
        state: &ReverseModeCState,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::ReverseModeC { connection, state: device_state } => {
                let temp = ReverseModeC {
                    state: state.clone(),
                    midi_channel: connection.midi_channel,
                };
                let cc_map = temp.state_as_cc_map();
                println!("[Reverse Mode C] Recalling preset: sending {} CC messages", cc_map.len());
                let mut cc_pairs: Vec<(u8, u8)> = cc_map.into_iter().collect();
                cc_pairs.sort_by_key(|(cc, _)| *cc);
                for (cc_number, value) in cc_pairs {
                    connection.send_cc(cc_number, value)?;
                    tokio::task::block_in_place(|| thread::sleep(Duration::from_millis(20)));
                }
                println!("[Reverse Mode C] Preset recall complete");
                device_state.state = state.clone();
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Reverse Mode C".to_string())),
        }
    }

    /// Save current state to a Reverse Mode C preset slot (1-122) using CC 111
    pub fn save_reverse_mode_c_preset(
        &mut self,
        device_name: &str,
        slot: u8,
    ) -> MidiResult<()> {
        if slot < 1 || slot > 122 {
            return Err(MidiError::Other(format!("Invalid preset slot: {}. Must be 1-122", slot)));
        }
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::ReverseModeC { connection, .. } => {
                connection.send_cc(REVERSE_MODE_C_CC_PRESET_SAVE, slot)?;
                println!("[Reverse Mode C] Saved current state to preset slot {}", slot);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Reverse Mode C".to_string())),
        }
    }

    /// Send a program change to a Reverse Mode C (navigate to preset slot 1-122)
    pub fn send_reverse_mode_c_program_change(
        &mut self,
        device_name: &str,
        program: u8,
    ) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::ReverseModeC { connection, .. } => {
                connection.send_program_change(program)?;
                println!("[Reverse Mode C] Sent PC {} (navigated to preset slot {})", program, program);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Reverse Mode C".to_string())),
        }
    }

    /// Get the current state of a Reverse Mode C
    pub fn get_reverse_mode_c_state(&self, device_name: &str) -> MidiResult<ReverseModeCState> {
        let device = self.connections.get(device_name)
            .ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::ReverseModeC { state, .. } => Ok(state.state.clone()),
            _ => Err(MidiError::Other("Device is not a Reverse Mode C".to_string())),
        }
    }

    // ========================================================================
    // Chase Bliss Audio Clean Methods
    // ========================================================================

    /// Connect to a Chase Bliss Audio Clean
    pub fn connect_clean(&mut self, device_name: &str, midi_channel: u8) -> MidiResult<()> {
        if midi_channel < 1 || midi_channel > 16 {
            return Err(MidiError::InvalidChannel(midi_channel));
        }
        if self.connections.contains_key(device_name) {
            return Err(MidiError::AlreadyConnected(device_name.to_string()));
        }
        let midi_out = self.midi_output.take()
            .ok_or_else(|| MidiError::Other("MIDI output not initialized".to_string()))?;
        let port_opt = {
            let ports = midi_out.ports();
            ports.into_iter().find(|p| midi_out.port_name(p).map(|name| name.to_lowercase().contains(&device_name.to_lowercase())).unwrap_or(false))
        };
        let port = port_opt.ok_or_else(|| MidiError::DeviceNotFound(device_name.to_string()))?;
        let output = midi_out.connect(&port, "Librarian").map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;
        let input = self.setup_midi_input(device_name, PedalType::Clean, midi_channel)?;
        let connection = MidiConnection { output, input, midi_channel };
        let state = Clean::new(midi_channel);
        self.connections.insert(device_name.to_string(), DeviceConnection::Clean { connection, state });
        println!("✅ Connected to Clean: '{}' on MIDI Channel {}", device_name, midi_channel);
        self.midi_output = Some(MidiOutput::new("Librarian Output").map_err(|e| MidiError::Other(e.to_string()))?);
        Ok(())
    }

    /// Send a parameter change to a Clean
    pub fn send_clean_parameter(&mut self, device_name: &str, param: CleanParameter) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name).ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::Clean { connection, state } => {
                connection.send_cc(param.cc_number(), param.cc_value())?;
                state.update_state(&param);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Clean".to_string())),
        }
    }

    /// Get current state of a Clean
    pub fn get_clean_state(&self, device_name: &str) -> MidiResult<CleanState> {
        let device = self.connections.get(device_name).ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::Clean { state, .. } => Ok(state.state.clone()),
            _ => Err(MidiError::Other("Device is not a Clean".to_string())),
        }
    }

    /// Recall a preset on a Clean (send all parameters)
    pub fn recall_clean_preset(&mut self, device_name: &str, state: &CleanState) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name).ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::Clean { connection, state: device_state } => {
                let temp = Clean { state: state.clone(), midi_channel: connection.midi_channel };
                let cc_map = temp.state_as_cc_map();
                for (cc_number, value) in cc_map.iter() {
                    connection.send_cc(*cc_number, *value)?;
                    tokio::task::block_in_place(|| thread::sleep(Duration::from_millis(20)));
                }
                *device_state = temp;
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Clean".to_string())),
        }
    }

    /// Save current state to a Clean preset slot (1-122)
    pub fn save_clean_preset(&mut self, device_name: &str, slot: u8) -> MidiResult<()> {
        if slot < 1 || slot > 122 {
            return Err(MidiError::Other(format!("Invalid preset slot: {}. Must be 1-122", slot)));
        }
        let device = self.connections.get_mut(device_name).ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::Clean { connection, .. } => {
                connection.send_cc(CLEAN_CC_PRESET_SAVE, slot)?;
                println!("[Clean] Saved current state to preset slot {}", slot);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Clean".to_string())),
        }
    }

    /// Send a program change to a Clean (navigate to preset slot 1-122)
    pub fn send_clean_program_change(&mut self, device_name: &str, program: u8) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name).ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::Clean { connection, .. } => {
                connection.send_program_change(program)?;
                println!("[Clean] Sent PC {} (navigated to preset slot {})", program, program);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not a Clean".to_string())),
        }
    }

    // ========================================================================
    // Chase Bliss Audio Onward Methods
    // ========================================================================

    /// Connect to a Chase Bliss Audio Onward
    pub fn connect_onward(&mut self, device_name: &str, midi_channel: u8) -> MidiResult<()> {
        if midi_channel < 1 || midi_channel > 16 {
            return Err(MidiError::InvalidChannel(midi_channel));
        }
        if self.connections.contains_key(device_name) {
            return Err(MidiError::AlreadyConnected(device_name.to_string()));
        }
        let midi_out = self.midi_output.take()
            .ok_or_else(|| MidiError::Other("MIDI output not initialized".to_string()))?;
        let port_opt = {
            let ports = midi_out.ports();
            ports.into_iter().find(|p| midi_out.port_name(p).map(|name| name.to_lowercase().contains(&device_name.to_lowercase())).unwrap_or(false))
        };
        let port = port_opt.ok_or_else(|| MidiError::DeviceNotFound(device_name.to_string()))?;
        let output = midi_out.connect(&port, "Librarian").map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;
        let input = self.setup_midi_input(device_name, PedalType::Onward, midi_channel)?;
        let connection = MidiConnection { output, input, midi_channel };
        let state = Onward::new(midi_channel);
        self.connections.insert(device_name.to_string(), DeviceConnection::Onward { connection, state });
        println!("✅ Connected to Onward: '{}' on MIDI Channel {}", device_name, midi_channel);
        self.midi_output = Some(MidiOutput::new("Librarian Output").map_err(|e| MidiError::Other(e.to_string()))?);
        Ok(())
    }

    /// Send a parameter change to an Onward
    pub fn send_onward_parameter(&mut self, device_name: &str, param: OnwardParameter) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name).ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::Onward { connection, state } => {
                connection.send_cc(param.cc_number(), param.cc_value())?;
                state.update_state(&param);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not an Onward".to_string())),
        }
    }

    /// Get current state of an Onward
    pub fn get_onward_state(&self, device_name: &str) -> MidiResult<OnwardState> {
        let device = self.connections.get(device_name).ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::Onward { state, .. } => Ok(state.state.clone()),
            _ => Err(MidiError::Other("Device is not an Onward".to_string())),
        }
    }

    /// Recall a preset on an Onward (send all parameters)
    pub fn recall_onward_preset(&mut self, device_name: &str, state: &OnwardState) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name).ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::Onward { connection, state: device_state } => {
                let temp = Onward { state: state.clone(), midi_channel: connection.midi_channel };
                let cc_map = temp.state_as_cc_map();
                for (cc_number, value) in cc_map.iter() {
                    connection.send_cc(*cc_number, *value)?;
                    tokio::task::block_in_place(|| thread::sleep(Duration::from_millis(20)));
                }
                *device_state = temp;
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not an Onward".to_string())),
        }
    }

    /// Save current state to an Onward preset slot (1-122)
    pub fn save_onward_preset(&mut self, device_name: &str, slot: u8) -> MidiResult<()> {
        if slot < 1 || slot > 122 {
            return Err(MidiError::Other(format!("Invalid preset slot: {}. Must be 1-122", slot)));
        }
        let device = self.connections.get_mut(device_name).ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::Onward { connection, .. } => {
                connection.send_cc(ONWARD_CC_PRESET_SAVE, slot)?;
                println!("[Onward] Saved current state to preset slot {}", slot);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not an Onward".to_string())),
        }
    }

    /// Send a program change to an Onward (navigate to preset slot 1-122)
    pub fn send_onward_program_change(&mut self, device_name: &str, program: u8) -> MidiResult<()> {
        let device = self.connections.get_mut(device_name).ok_or_else(|| MidiError::NotConnected(device_name.to_string()))?;
        match device {
            DeviceConnection::Onward { connection, .. } => {
                connection.send_program_change(program)?;
                println!("[Onward] Sent PC {} (navigated to preset slot {})", program, program);
                Ok(())
            }
            _ => Err(MidiError::Other("Device is not an Onward".to_string())),
        }
    }

    /// List all connected devices
    pub fn connected_devices(&self) -> Vec<ConnectedDevice> {
        self.connections.iter().map(|(name, device)| {
            let (pedal_type, midi_channel) = match device {
                DeviceConnection::Microcosm { connection, .. } => {
                    (PedalType::Microcosm, connection.midi_channel)
                }
                DeviceConnection::GenLossMkii { connection, .. } => {
                    (PedalType::GenLossMkii, connection.midi_channel)
                }
                DeviceConnection::ChromaConsole { connection, .. } => {
                    (PedalType::ChromaConsole, connection.midi_channel)
                }
                DeviceConnection::PreampMk2 { connection, .. } => {
                    (PedalType::PreampMk2, connection.midi_channel)
                }
                DeviceConnection::Cxm1978 { connection, .. } => {
                    (PedalType::Cxm1978, connection.midi_channel)
                }
                DeviceConnection::MoodMkii { connection, .. } => {
                    (PedalType::MoodMkii, connection.midi_channel)
                }
                DeviceConnection::BillyStringsWombtone { connection, .. } => {
                    (PedalType::BillyStringsWombtone, connection.midi_channel)
                }
                DeviceConnection::Lossy { connection, .. } => {
                    (PedalType::Lossy, connection.midi_channel)
                }
                DeviceConnection::BrothersAm { connection, .. } => {
                    (PedalType::BrothersAm, connection.midi_channel)
                }
                DeviceConnection::ReverseModeC { connection, .. } => {
                    (PedalType::ReverseModeC, connection.midi_channel)
                }
                DeviceConnection::Clean { connection, .. } => {
                    (PedalType::Clean, connection.midi_channel)
                }
                DeviceConnection::Onward { connection, .. } => {
                    (PedalType::Onward, connection.midi_channel)
                }
            };
            
            ConnectedDevice {
                device_name: name.clone(),
                pedal_type,
                midi_channel,
            }
        }).collect()
    }
    
    /// Check if a device is connected
    pub fn is_connected(&self, device_name: &str) -> bool {
        self.connections.contains_key(device_name)
    }
}

impl Default for MidiManager {
    fn default() -> Self {
        Self::new().expect("Failed to create MIDI Manager")
    }
}

// Thread-safe wrapper for use with Tauri State
pub type SharedMidiManager = Arc<Mutex<MidiManager>>;

/// Create a new shared MIDI Manager for use with Tauri
pub fn create_shared_manager() -> MidiResult<SharedMidiManager> {
    Ok(Arc::new(Mutex::new(MidiManager::new()?)))
}

// MIDI Manager - Central hub for all MIDI communication
// Handles device connections, message sending, and state management

use crate::midi::error::{MidiError, MidiResult};
use crate::midi::pedals::{Microcosm, GenLossMkii};
use crate::midi::pedals::microcosm::{MicrocosmParameter, MicrocosmState};
use crate::midi::pedals::gen_loss_mkii::{GenLossMkiiParameter, GenLossMkiiState};

use midir::{MidiInput, MidiOutput, MidiOutputConnection};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

/// Type of pedal device
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum PedalType {
    Microcosm,
    GenLossMkii,
}

/// Information about a connected device
#[derive(Debug, Clone)]
pub struct ConnectedDevice {
    pub device_name: String,
    pub pedal_type: PedalType,
    pub midi_channel: u8,
}

/// Active MIDI connection with send capability
struct MidiConnection {
    output: MidiOutputConnection,
    midi_channel: u8,
}

impl MidiConnection {
    /// Send a Control Change message
    fn send_cc(&mut self, cc_number: u8, value: u8) -> MidiResult<()> {
        // MIDI CC message format: [Status byte, CC number, Value]
        // Status byte = 0xB0 + (channel - 1)
        let status = 0xB0 + (self.midi_channel - 1);
        let message = [status, cc_number, value];
        
        // Debug logging
        println!("📤 Sending MIDI: Channel {}, CC {}, Value {} (bytes: [{:#04X}, {:#04X}, {:#04X}])", 
            self.midi_channel, cc_number, value, status, cc_number, value);
        
        self.output
            .send(&message)
            .map_err(|e| MidiError::SendFailed(e.to_string()))?;
        
        println!("✅ MIDI sent successfully");
        
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
}

/// Central MIDI Manager for all device communication
pub struct MidiManager {
    connections: HashMap<String, DeviceConnection>,
    midi_input: Option<MidiInput>,
    midi_output: Option<MidiOutput>,
}

impl MidiManager {
    /// Create a new MIDI Manager
    pub fn new() -> MidiResult<Self> {
        let midi_input = MidiInput::new("Librarian Input")
            .map_err(|e| MidiError::Other(e.to_string()))?;
        let midi_output = MidiOutput::new("Librarian Output")
            .map_err(|e| MidiError::Other(e.to_string()))?;
        
        Ok(Self {
            connections: HashMap::new(),
            midi_input: Some(midi_input),
            midi_output: Some(midi_output),
        })
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
        
        // Create connection and device state
        let connection = MidiConnection {
            output,
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
        
        // Create connection and device state
        let connection = MidiConnection {
            output,
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
                
                // Send all CC messages with throttling
                for (cc_number, value) in cc_map.iter() {
                    connection.send_cc(*cc_number, *value)?;
                    thread::sleep(Duration::from_millis(10)); // Throttle to avoid MIDI buffer overflow
                }
                
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
                
                // Send all CC messages with throttling
                for (cc_number, value) in cc_map.iter() {
                    connection.send_cc(*cc_number, *value)?;
                    thread::sleep(Duration::from_millis(10)); // Throttle to avoid MIDI buffer overflow
                }
                
                // Update device state
                *device_state = temp_gen_loss;
                
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

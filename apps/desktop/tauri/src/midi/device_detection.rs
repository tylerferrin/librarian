// MIDI device detection and enumeration using midir
// This module provides functions to list available MIDI input/output ports

use midir::{MidiInput, MidiOutput};
use std::error::Error;

/// Information about a detected MIDI device
#[derive(Debug, Clone)]
pub struct MidiDeviceInfo {
    pub index: usize,
    pub name: String,
    pub is_input: bool,
}

/// Lists all available MIDI input and output devices
///
/// Returns a Result containing vectors of input and output device information
pub fn list_midi_devices() -> Result<(Vec<MidiDeviceInfo>, Vec<MidiDeviceInfo>), Box<dyn Error>> {
    let mut input_devices = Vec::new();
    let mut output_devices = Vec::new();

    // List MIDI input ports
    let midi_in = MidiInput::new("Librarian MIDI Input Scanner")?;
    println!("\n=== MIDI Input Ports ===");
    
    for (i, port) in midi_in.ports().iter().enumerate() {
        match midi_in.port_name(port) {
            Ok(name) => {
                println!("  [{}] {}", i, name);
                input_devices.push(MidiDeviceInfo {
                    index: i,
                    name: name.clone(),
                    is_input: true,
                });
            }
            Err(e) => {
                eprintln!("  [{}] Error getting port name: {}", i, e);
            }
        }
    }
    
    if input_devices.is_empty() {
        println!("  (No MIDI input ports found)");
    }

    // List MIDI output ports
    let midi_out = MidiOutput::new("Librarian MIDI Output Scanner")?;
    println!("\n=== MIDI Output Ports ===");
    
    for (i, port) in midi_out.ports().iter().enumerate() {
        match midi_out.port_name(port) {
            Ok(name) => {
                println!("  [{}] {}", i, name);
                output_devices.push(MidiDeviceInfo {
                    index: i,
                    name: name.clone(),
                    is_input: false,
                });
            }
            Err(e) => {
                eprintln!("  [{}] Error getting port name: {}", i, e);
            }
        }
    }
    
    if output_devices.is_empty() {
        println!("  (No MIDI output ports found)");
    }

    println!();
    Ok((input_devices, output_devices))
}

/// Finds a MIDI device by name (case-insensitive partial match)
///
/// Useful for locating specific pedals like "Gen Loss" or "Generation Loss"
pub fn find_device_by_name(
    name_pattern: &str,
) -> Result<Option<MidiDeviceInfo>, Box<dyn Error>> {
    let (inputs, outputs) = list_midi_devices()?;
    let pattern_lower = name_pattern.to_lowercase();

    // Search inputs first
    for device in inputs.iter() {
        if device.name.to_lowercase().contains(&pattern_lower) {
            return Ok(Some(device.clone()));
        }
    }

    // Then search outputs
    for device in outputs.iter() {
        if device.name.to_lowercase().contains(&pattern_lower) {
            return Ok(Some(device.clone()));
        }
    }

    Ok(None)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_list_devices() {
        // This test will only pass if MIDI devices are connected
        // It's mainly for manual testing
        match list_midi_devices() {
            Ok((inputs, outputs)) => {
                println!("Found {} input(s) and {} output(s)", inputs.len(), outputs.len());
            }
            Err(e) => {
                println!("Error listing devices: {}", e);
            }
        }
    }
}

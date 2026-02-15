// MIDI Universal Device Inquiry (Identity Request/Reply)
// Implements the MIDI specification for device identification via SysEx

use crate::midi::error::{MidiError, MidiResult};
use midir::{MidiInput, MidiOutput};
use std::sync::{Arc, Mutex};
use std::time::Duration;

/// MIDI Universal Device Identity Request
/// Format: F0 7E 7F 06 01 F7
const IDENTITY_REQUEST: [u8; 6] = [
    0xF0, // SysEx Start
    0x7E, // Universal Non-Realtime
    0x7F, // Device ID (all devices)
    0x06, // Sub-ID #1: General Information
    0x01, // Sub-ID #2: Identity Request
    0xF7, // SysEx End
];

/// Parsed device identity information
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DeviceIdentity {
    pub manufacturer_id: Vec<u8>,
    pub device_family: u16,
    pub device_model: u16,
    pub software_version: Vec<u8>,
}

impl DeviceIdentity {
    /// Get manufacturer name if known
    pub fn manufacturer_name(&self) -> Option<&'static str> {
        // Single-byte manufacturer IDs (most common)
        if self.manufacturer_id.len() == 1 {
            match self.manufacturer_id[0] {
                0x00 => Some("Unknown (Extended ID)"),
                0x01 => Some("Sequential Circuits"),
                0x02 => Some("IDP/Big Briar"),
                0x03 => Some("Voyetra/Octave-Plateau"),
                0x04 => Some("Moog"),
                0x05 => Some("Passport Designs"),
                0x06 => Some("Lexicon"),
                0x07 => Some("Kurzweil"),
                0x08 => Some("Fender"),
                0x0F => Some("Ensoniq"),
                0x10 => Some("Oberheim/Gibson Labs"),
                0x13 => Some("Digidesign"),
                0x18 => Some("Emu"),
                0x1B => Some("Korg"),
                0x20 => Some("Kawai"),
                0x21 => Some("Roland"),
                0x22 => Some("Korg (alt)"),
                0x23 => Some("Yamaha"),
                0x24 => Some("Casio"),
                0x26 => Some("Kamiya Studio"),
                0x27 => Some("Akai"),
                0x29 => Some("Victor Company of Japan"),
                0x2F => Some("Fostex"),
                0x36 => Some("Zoom"),
                0x40 => Some("Kawai (alt)"),
                0x41 => Some("Roland (alt)"),
                0x42 => Some("Korg (alt 2)"),
                0x43 => Some("Yamaha (alt)"),
                0x44 => Some("Casio (alt)"),
                0x47 => Some("Akai (alt)"),
                _ => None,
            }
        } else if self.manufacturer_id.len() == 3 {
            // Extended manufacturer IDs (3 bytes: 00 XX XX)
            // Verified against official MMA table at midi.org/SysExIDtable
            match (self.manufacturer_id[0], self.manufacturer_id[1], self.manufacturer_id[2]) {
                (0x00, 0x02, 0x4D) => Some("Hologram Electronics LLC"),
                (0x00, 0x20, 0x63) => Some("Central Music Co. (CME)"),
                _ => None,
            }
        } else {
            None
        }
    }

    /// Check if this identity matches known pedal patterns
    pub fn matches_pedal(&self, _pedal_name: &str) -> bool {
        // We'll need to discover these IDs empirically by testing
        // For now, we can check against known patterns once we discover them
        
        // Placeholder - will update once we get real data
        false
    }

    /// Get a human-readable description
    pub fn description(&self) -> String {
        let mfg = self.manufacturer_name()
            .unwrap_or("Unknown Manufacturer");
        
        format!(
            "{} (ID: {:02X?}, Family: {:#04X}, Model: {:#04X})",
            mfg,
            self.manufacturer_id,
            self.device_family,
            self.device_model
        )
    }
}

/// Parse an Identity Reply SysEx message
/// Format: F0 7E [device] 06 02 [mfg] [family LSB] [family MSB] [model LSB] [model MSB] [version...] F7
fn parse_identity_reply(message: &[u8]) -> MidiResult<DeviceIdentity> {
    // Minimum valid message: F0 7E [dev] 06 02 [mfg] [fam] [fam] [mod] [mod] F7 = 11 bytes
    if message.len() < 11 {
        return Err(MidiError::Other(format!(
            "Identity reply too short: {} bytes",
            message.len()
        )));
    }

    // Verify it's an Identity Reply
    if message[0] != 0xF0 || message[1] != 0x7E || message[3] != 0x06 || message[4] != 0x02 {
        return Err(MidiError::Other(
            "Not a valid Identity Reply message".to_string(),
        ));
    }

    let mut pos = 5; // Start after F0 7E [dev] 06 02

    // Parse manufacturer ID
    let manufacturer_id = if message[pos] == 0x00 {
        // Extended manufacturer ID (3 bytes: 00 XX XX)
        if message.len() < pos + 3 {
            return Err(MidiError::Other(
                "Truncated extended manufacturer ID".to_string(),
            ));
        }
        let id = vec![message[pos], message[pos + 1], message[pos + 2]];
        pos += 3;
        id
    } else {
        // Single-byte manufacturer ID
        let id = vec![message[pos]];
        pos += 1;
        id
    };

    // Parse device family (14-bit, LSB first)
    if message.len() < pos + 2 {
        return Err(MidiError::Other("Truncated device family".to_string()));
    }
    let device_family = ((message[pos + 1] as u16) << 7) | (message[pos] as u16);
    pos += 2;

    // Parse device model (14-bit, LSB first)
    if message.len() < pos + 2 {
        return Err(MidiError::Other("Truncated device model".to_string()));
    }
    let device_model = ((message[pos + 1] as u16) << 7) | (message[pos] as u16);
    pos += 2;

    // Parse software version (remaining bytes until F7)
    let mut software_version = Vec::new();
    while pos < message.len() && message[pos] != 0xF7 {
        software_version.push(message[pos]);
        pos += 1;
    }

    Ok(DeviceIdentity {
        manufacturer_id,
        device_family,
        device_model,
        software_version,
    })
}

/// Request device identity from a MIDI device
/// Sends an Identity Request and waits for replies (may get multiple)
/// Returns the first pedal response (non-interface), or the first response if all are interfaces
pub fn request_device_identity(
    device_name: &str,
    timeout_ms: u64,
) -> MidiResult<Option<DeviceIdentity>> {
    println!("🔍 Requesting device identity from: {}", device_name);

    // Find the output port
    let midi_out = MidiOutput::new("Librarian Identity Request")
        .map_err(|e| MidiError::Other(e.to_string()))?;
    
    let out_ports = midi_out.ports();
    let out_port = out_ports
        .iter()
        .find(|p| {
            midi_out
                .port_name(p)
                .map(|name| name == device_name)
                .unwrap_or(false)
        })
        .ok_or_else(|| MidiError::DeviceNotFound(device_name.to_string()))?;

    // Find the input port
    let midi_in = MidiInput::new("Librarian Identity Listener")
        .map_err(|e| MidiError::Other(e.to_string()))?;
    
    let in_ports = midi_in.ports();
    let in_port = in_ports
        .iter()
        .find(|p| {
            midi_in
                .port_name(p)
                .map(|name| name == device_name)
                .unwrap_or(false)
        })
        .ok_or_else(|| MidiError::DeviceNotFound(format!("{} (input)", device_name)))?;

    // Shared state for capturing responses (may receive multiple)
    let responses = Arc::new(Mutex::new(Vec::new()));
    let responses_clone = Arc::clone(&responses);

    // Connect to input port with callback
    let _conn_in = midi_in
        .connect(
            in_port,
            "identity-listener",
            move |_timestamp, message, _| {
                // Check if this is an Identity Reply
                if message.len() >= 5
                    && message[0] == 0xF0
                    && message[1] == 0x7E
                    && message[3] == 0x06
                    && message[4] == 0x02
                {
                    println!("📥 Received Identity Reply: {} bytes", message.len());
                    println!("   Raw: {:02X?}", message);
                    
                    match parse_identity_reply(message) {
                        Ok(identity) => {
                            println!("✅ Parsed identity: {}", identity.description());
                            let mut resps = responses_clone.lock().unwrap();
                            resps.push(identity);
                        }
                        Err(e) => {
                            eprintln!("❌ Failed to parse identity reply: {}", e);
                        }
                    }
                }
            },
            (),
        )
        .map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;

    // Connect to output port
    let mut conn_out = midi_out
        .connect(out_port, "identity-requester")
        .map_err(|e| MidiError::ConnectionFailed(e.to_string()))?;

    // Send Identity Request
    println!("📤 Sending Identity Request: {:02X?}", IDENTITY_REQUEST);
    conn_out
        .send(&IDENTITY_REQUEST)
        .map_err(|e| MidiError::SendFailed(e.to_string()))?;
    
    println!("⏳ Waiting for response (timeout: {}ms)...", timeout_ms);

    // Wait for responses with timeout
    let start = std::time::Instant::now();
    let timeout = Duration::from_millis(timeout_ms);
    
    while start.elapsed() < timeout {
        // Check if we got any responses
        let resps = responses.lock().unwrap();
        if !resps.is_empty() {
            // Keep collecting responses for a bit longer (100ms) to get all of them
            drop(resps);
            std::thread::sleep(Duration::from_millis(100));
            break;
        }
        drop(resps);
        
        // Small sleep to avoid busy-waiting
        std::thread::sleep(Duration::from_millis(50));
    }

    let all_responses = responses.lock().unwrap();
    
    if all_responses.is_empty() {
        println!("⏱️ Timeout waiting for Identity Reply");
        return Ok(None);
    }
    
    println!("📊 Received {} identity response(s)", all_responses.len());
    
    // Known MIDI interface IDs (WIDI Jack, etc.)
    let interface_ids = vec![
        vec![0x00, 0x20, 0x63], // Central Music Co. (CME) - WIDI Jack
    ];
    
    // Prioritize non-interface responses (actual pedals)
    for identity in all_responses.iter() {
        let is_interface = interface_ids.iter().any(|id| id == &identity.manufacturer_id);
        if !is_interface {
            println!("🎯 Returning pedal identity (non-interface): {}", identity.description());
            return Ok(Some(identity.clone()));
        }
    }
    
    // If all responses are interfaces, return the first one
    println!("🔌 All responses are MIDI interfaces, returning first one");
    Ok(Some(all_responses[0].clone()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_identity_reply_single_byte_mfg() {
        // Example: Roland device
        // F0 7E 00 06 02 41 00 01 00 02 00 00 F7
        let message = vec![
            0xF0, 0x7E, 0x00, 0x06, 0x02, // Header
            0x41, // Roland manufacturer ID
            0x00, 0x01, // Family (LSB, MSB)
            0x00, 0x02, // Model (LSB, MSB)
            0x00, 0x00, // Software version
            0xF7, // End
        ];

        let result = parse_identity_reply(&message).unwrap();
        assert_eq!(result.manufacturer_id, vec![0x41]);
        assert_eq!(result.device_family, (1 << 7) | 0); // MSB << 7 | LSB
        assert_eq!(result.device_model, (2 << 7) | 0);
        assert_eq!(result.manufacturer_name(), Some("Roland (alt)"));
    }

    #[test]
    fn test_parse_identity_reply_extended_mfg() {
        // Example: Extended manufacturer ID
        // F0 7E 00 06 02 00 01 02 00 01 00 02 00 00 F7
        let message = vec![
            0xF0, 0x7E, 0x00, 0x06, 0x02, // Header
            0x00, 0x01, 0x02, // Extended manufacturer ID
            0x00, 0x01, // Family
            0x00, 0x02, // Model
            0x00, 0x00, // Software version
            0xF7, // End
        ];

        let result = parse_identity_reply(&message).unwrap();
        assert_eq!(result.manufacturer_id, vec![0x00, 0x01, 0x02]);
        assert_eq!(result.device_family, (1 << 7) | 0);
        assert_eq!(result.device_model, (2 << 7) | 0);
    }

    #[test]
    fn test_identity_request_format() {
        assert_eq!(
            IDENTITY_REQUEST,
            [0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7]
        );
    }
}

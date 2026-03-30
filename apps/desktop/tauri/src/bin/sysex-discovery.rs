//! SysEx Command Discovery Tool
//!
//! Systematically tests SysEx commands to discover undocumented
//! manufacturer-specific protocols.
//!
//! Usage:
//!   cargo run --bin sysex-discovery -- "Chroma Console"
//!   cargo run --bin sysex-discovery -- "Chroma Console" --full-scan
//!   cargo run --bin sysex-discovery -- "Chroma Console" --custom "F0 00 02 4D 40 F7"
//!
//! Safety:
//!   - Starts with read-only query commands
//!   - Rate-limited to avoid flooding the device
//!   - Saves all responses to files for analysis

use midir::{MidiInput, MidiOutput};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use std::fs;
use std::path::PathBuf;

/// Known manufacturer IDs
const HOLOGRAM_MFG_ID: [u8; 3] = [0x00, 0x02, 0x4D];

/// Command patterns to test
struct CommandPattern {
    bytes: Vec<u8>,
    description: &'static str,
    category: &'static str,
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    
    if args.len() < 2 {
        print_usage();
        return;
    }
    
    let device_name = &args[1];
    let full_scan = args.contains(&"--full-scan".to_string());
    let custom = args.iter().position(|a| a == "--custom");
    
    println!("╔═══════════════════════════════════════════════════════════╗");
    println!("║          SysEx Command Discovery Tool v1.0                ║");
    println!("╚═══════════════════════════════════════════════════════════╝");
    println!();
    println!("🎯 Target Device: {}", device_name);
    println!("📂 Results will be saved to: ./sysex-discovery-results/");
    println!();
    
    // Create results directory
    let results_dir = PathBuf::from("./sysex-discovery-results");
    fs::create_dir_all(&results_dir).expect("Failed to create results directory");
    
    if let Some(idx) = custom {
        if let Some(hex_string) = args.get(idx + 1) {
            test_custom_command(device_name, hex_string, &results_dir);
            return;
        }
    }
    
    if full_scan {
        println!("⚠️  FULL SCAN MODE - This will test 128 commands");
        println!("⚠️  Press Ctrl+C to abort\n");
        std::thread::sleep(Duration::from_secs(2));
        full_command_scan(device_name, &results_dir);
    } else {
        println!("🔍 Quick scan mode (testing common patterns)");
        println!("   Use --full-scan to test all possible commands\n");
        quick_scan(device_name, &results_dir);
    }
}

fn print_usage() {
    println!("SysEx Command Discovery Tool");
    println!();
    println!("Usage:");
    println!("  sysex-discovery <device-name>                  # Quick scan");
    println!("  sysex-discovery <device-name> --full-scan      # Test all 128 commands");
    println!("  sysex-discovery <device-name> --custom <hex>   # Test custom message");
    println!();
    println!("Examples:");
    println!("  sysex-discovery \"Chroma Console\"");
    println!("  sysex-discovery \"Chroma Console\" --full-scan");
    println!("  sysex-discovery \"Chroma Console\" --custom \"F0 00 02 4D 40 F7\"");
}

fn quick_scan(device_name: &str, results_dir: &PathBuf) {
    let patterns = get_common_patterns();
    
    println!("Testing {} common command patterns...\n", patterns.len());
    
    let mut successes = Vec::new();
    
    for (i, pattern) in patterns.iter().enumerate() {
        println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        println!("Test {}/{}: {} ({})", i + 1, patterns.len(), pattern.description, pattern.category);
        println!("📤 Sending: {:02X?}", pattern.bytes);
        
        match send_and_wait(device_name, &pattern.bytes, 1000) {
            Ok(Some(response)) => {
                println!("✅ RESPONSE RECEIVED!");
                println!("   Length: {} bytes", response.len());
                println!("   Data: {:02X?}", response);
                
                save_response(results_dir, i, pattern, &response);
                successes.push((pattern, response));
            }
            Ok(None) => {
                println!("❌ No response (timeout)");
            }
            Err(e) => {
                println!("⚠️  Error: {}", e);
            }
        }
        
        // Rate limiting - don't flood the device
        std::thread::sleep(Duration::from_millis(200));
    }
    
    print_summary(&successes);
}

fn full_command_scan(device_name: &str, results_dir: &PathBuf) {
    println!("Testing all command bytes (0x00 - 0x7F)...\n");
    
    let mut successes = Vec::new();
    
    for cmd in 0x00..=0x7F {
        // Basic command format: F0 [mfg] [cmd] F7
        let message = vec![
            0xF0, 
            HOLOGRAM_MFG_ID[0], HOLOGRAM_MFG_ID[1], HOLOGRAM_MFG_ID[2],
            cmd,
            0xF7
        ];
        
        let pattern = CommandPattern {
            bytes: message.clone(),
            description: "Command scan",
            category: "Sequential",
        };
        
        if cmd % 16 == 0 {
            println!("\n📊 Progress: {}/128 commands tested", cmd);
        }
        
        print!("0x{:02X} ", cmd);
        
        match send_and_wait(device_name, &message, 500) {
            Ok(Some(response)) => {
                println!("✅");
                successes.push((cmd, response.clone()));
                save_response(results_dir, cmd as usize, &pattern, &response);
            }
            Ok(None) => {
                print!(".");
            }
            Err(_) => {
                print!("⚠️ ");
            }
        }
        
        std::thread::sleep(Duration::from_millis(100));
    }
    
    println!("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("🎯 Full Scan Complete!");
    println!("   Tested: 128 commands");
    println!("   Responses: {}", successes.len());
    
    if !successes.is_empty() {
        println!("\n✨ Commands that received responses:");
        for (cmd, response) in &successes {
            println!("   0x{:02X} → {} bytes", cmd, response.len());
        }
    }
}

fn test_custom_command(device_name: &str, hex_string: &str, results_dir: &PathBuf) {
    println!("Testing custom command: {}\n", hex_string);
    
    // Parse hex string
    let bytes: Result<Vec<u8>, _> = hex_string
        .split_whitespace()
        .map(|s| u8::from_str_radix(s.trim_start_matches("0x"), 16))
        .collect();
    
    match bytes {
        Ok(message) => {
            println!("📤 Sending: {:02X?}", message);
            
            match send_and_wait(device_name, &message, 2000) {
                Ok(Some(response)) => {
                    println!("✅ RESPONSE RECEIVED!");
                    println!("   Length: {} bytes", response.len());
                    println!("   Data: {:02X?}", response);
                    
                    let pattern = CommandPattern {
                        bytes: message,
                        description: "Custom command",
                        category: "User-defined",
                    };
                    save_response(results_dir, 999, &pattern, &response);
                }
                Ok(None) => {
                    println!("❌ No response (timeout)");
                }
                Err(e) => {
                    println!("⚠️  Error: {}", e);
                }
            }
        }
        Err(e) => {
            println!("❌ Invalid hex string: {}", e);
            println!("   Format: \"F0 00 02 4D 40 F7\"");
        }
    }
}

fn send_and_wait(device_name: &str, message: &[u8], timeout_ms: u64) -> Result<Option<Vec<u8>>, String> {
    // Find output port
    let midi_out = MidiOutput::new("SysEx Discovery")
        .map_err(|e| format!("Failed to create MIDI output: {}", e))?;
    
    let out_ports = midi_out.ports();
    let out_port = out_ports
        .iter()
        .find(|p| {
            midi_out
                .port_name(p)
                .map(|name| name.contains(device_name))
                .unwrap_or(false)
        })
        .ok_or_else(|| format!("Output port not found: {}", device_name))?;
    
    // Find input port
    let midi_in = MidiInput::new("SysEx Discovery Listener")
        .map_err(|e| format!("Failed to create MIDI input: {}", e))?;
    
    let in_ports = midi_in.ports();
    let in_port = in_ports
        .iter()
        .find(|p| {
            midi_in
                .port_name(p)
                .map(|name| name.contains(device_name))
                .unwrap_or(false)
        })
        .ok_or_else(|| format!("Input port not found: {}", device_name))?;
    
    // Shared state for capturing response
    let response = Arc::new(Mutex::new(None));
    let response_clone = Arc::clone(&response);
    
    // Connect to input port
    let _conn_in = midi_in
        .connect(
            in_port,
            "sysex-listener",
            move |_timestamp, message, _| {
                // Capture any SysEx message
                if message.len() > 0 && message[0] == 0xF0 {
                    let mut resp = response_clone.lock().unwrap();
                    *resp = Some(message.to_vec());
                }
            },
            (),
        )
        .map_err(|e| format!("Failed to connect input: {}", e))?;
    
    // Connect to output port
    let mut conn_out = midi_out
        .connect(out_port, "sysex-sender")
        .map_err(|e| format!("Failed to connect output: {}", e))?;
    
    // Send message
    conn_out
        .send(message)
        .map_err(|e| format!("Failed to send: {}", e))?;
    
    // Wait for response
    let start = Instant::now();
    let timeout = Duration::from_millis(timeout_ms);
    
    while start.elapsed() < timeout {
        let resp = response.lock().unwrap();
        if resp.is_some() {
            return Ok(resp.clone());
        }
        drop(resp);
        
        std::thread::sleep(Duration::from_millis(10));
    }
    
    Ok(None)
}

fn save_response(results_dir: &PathBuf, test_num: usize, pattern: &CommandPattern, response: &[u8]) {
    let timestamp = chrono::Local::now().format("%Y%m%d-%H%M%S");
    let filename = format!("response-{}-test{:03}.txt", timestamp, test_num);
    let filepath = results_dir.join(filename);
    
    let content = format!(
        "Test: {}\n\
         Category: {}\n\
         Description: {}\n\
         \n\
         Sent:\n\
         {:02X?}\n\
         \n\
         Received:\n\
         {:02X?}\n\
         \n\
         Length: {} bytes\n\
         \n\
         Hex dump:\n\
         {}\n",
        test_num,
        pattern.category,
        pattern.description,
        pattern.bytes,
        response,
        response.len(),
        hex_dump(response)
    );
    
    fs::write(&filepath, content).ok();
    println!("   💾 Saved to: {}", filepath.display());
}

fn hex_dump(data: &[u8]) -> String {
    let mut result = String::new();
    for (i, chunk) in data.chunks(16).enumerate() {
        result.push_str(&format!("{:04X}  ", i * 16));
        
        // Hex values
        for (j, byte) in chunk.iter().enumerate() {
            result.push_str(&format!("{:02X} ", byte));
            if j == 7 {
                result.push(' ');
            }
        }
        
        // Padding
        for _ in chunk.len()..16 {
            result.push_str("   ");
        }
        
        result.push_str("  ");
        
        // ASCII representation
        for byte in chunk {
            let c = if *byte >= 32 && *byte < 127 {
                *byte as char
            } else {
                '.'
            };
            result.push(c);
        }
        
        result.push('\n');
    }
    result
}

fn print_summary(successes: &[(&CommandPattern, Vec<u8>)]) {
    println!("\n");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("📊 SCAN COMPLETE");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if successes.is_empty() {
        println!("\n❌ No responses received");
        println!("\nThis suggests:");
        println!("  • Device doesn't implement SysEx state dumps");
        println!("  • Commands tested don't match the protocol");
        println!("  • Device requires specific initialization first");
        println!("\nNext steps:");
        println!("  • Try --full-scan to test all possible commands");
        println!("  • Check if device manual mentions SysEx");
        println!("  • Contact manufacturer for protocol documentation");
    } else {
        println!("\n✨ {} command(s) received responses!", successes.len());
        println!("\nSuccessful commands:");
        for (pattern, response) in successes {
            println!("\n  {} ({})", pattern.description, pattern.category);
            println!("  📤 Sent: {:02X?}", pattern.bytes);
            println!("  📥 Received: {} bytes", response.len());
        }
        println!("\n💡 Responses saved to ./sysex-discovery-results/");
        println!("   Analyze these files to decode the protocol!");
    }
    
    println!("\n");
}

fn get_common_patterns() -> Vec<CommandPattern> {
    vec![
        // Request commands (typically safe, read-only)
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x11, 0xF7],
            description: "Request current program",
            category: "Standard",
        },
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x40, 0xF7],
            description: "Request data dump",
            category: "Standard",
        },
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x41, 0xF7],
            description: "Request all data",
            category: "Standard",
        },
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x42, 0xF7],
            description: "Request parameter",
            category: "Standard",
        },
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x0E, 0xF7],
            description: "Request identity (alt)",
            category: "Standard",
        },
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x20, 0xF7],
            description: "Request bank dump",
            category: "Standard",
        },
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x21, 0xF7],
            description: "Request program dump",
            category: "Standard",
        },
        
        // With device ID (0x00 = all devices)
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x11, 0x00, 0xF7],
            description: "Request current program (device 0)",
            category: "Device-specific",
        },
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x40, 0x00, 0xF7],
            description: "Request data dump (device 0)",
            category: "Device-specific",
        },
        
        // With device ID (0x7F = all devices)
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x11, 0x7F, 0xF7],
            description: "Request current program (all devices)",
            category: "Device-specific",
        },
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x40, 0x7F, 0xF7],
            description: "Request data dump (all devices)",
            category: "Device-specific",
        },
        
        // Eventide-style commands
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x4C, 0x00, 0xF7],
            description: "Request state (Eventide-style)",
            category: "Eventide-like",
        },
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x70, 0xF7],
            description: "Request parameter map",
            category: "Eventide-like",
        },
        
        // Sequential test
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x01, 0xF7],
            description: "Command 0x01",
            category: "Sequential",
        },
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x02, 0xF7],
            description: "Command 0x02",
            category: "Sequential",
        },
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x03, 0xF7],
            description: "Command 0x03",
            category: "Sequential",
        },
        CommandPattern {
            bytes: vec![0xF0, 0x00, 0x02, 0x4D, 0x10, 0xF7],
            description: "Command 0x10",
            category: "Sequential",
        },
    ]
}

// MIDI input listener test utility
// Run with: cargo run --bin test-midi-input
// This will listen for incoming MIDI messages and print them to the console

use midir::{MidiInput, Ignore};
use std::io;
use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    println!("╔═══════════════════════════════════════════════════════════╗");
    println!("║  Librarian - MIDI Input Listener Test                    ║");
    println!("║  Testing bidirectional MIDI with Microcosm                ║");
    println!("╚═══════════════════════════════════════════════════════════╝");
    println!();

    // Create MIDI input
    let mut midi_in = MidiInput::new("Librarian Input Test")?;
    midi_in.ignore(Ignore::None);

    // List available input ports
    println!("Available MIDI input ports:");
    let in_ports = midi_in.ports();
    for (i, port) in in_ports.iter().enumerate() {
        if let Ok(name) = midi_in.port_name(port) {
            println!("  {}. {}", i, name);
        }
    }
    println!();

    // Find Widi Midi Bluetooth or let user choose
    let port = in_ports.iter()
        .find(|p| {
            midi_in.port_name(p)
                .map(|name| name.to_lowercase().contains("widi") || name.to_lowercase().contains("microcosm"))
                .unwrap_or(false)
        });

    if port.is_none() {
        println!("❌ No WIDI or Microcosm device found!");
        println!("   Make sure your device is connected and try again.");
        return Ok(());
    }

    let port = port.unwrap();
    let port_name = midi_in.port_name(port)?;
    
    println!("✅ Found device: {}", port_name);
    println!();
    println!("🎧 Now listening for MIDI messages...");
    println!("   Turn knobs on your Microcosm and watch for incoming messages!");
    println!("   Press Ctrl+C to stop.");
    println!();
    println!("─────────────────────────────────────────────────────────");
    println!();

    // Connect to the port and start listening
    let _conn_in = midi_in.connect(
        port,
        "librarian-listener",
        |stamp, message, _| {
            // Parse MIDI message
            if message.len() >= 3 {
                let status = message[0];
                let data1 = message[1];
                let data2 = message[2];

                // Check if it's a Control Change message (0xB0-0xBF)
                if status >= 0xB0 && status <= 0xBF {
                    let channel = (status & 0x0F) + 1;
                    let cc_number = data1;
                    let cc_value = data2;

                    println!("📥 MIDI CC Received:");
                    println!("   Channel: {}", channel);
                    println!("   CC#: {}", cc_number);
                    println!("   Value: {}", cc_value);
                    println!("   Timestamp: {}", stamp);
                    println!("   Raw bytes: [{:#04X}, {:#04X}, {:#04X}]", status, data1, data2);
                    println!();
                }
            }
        },
        (),
    )?;

    println!("Press Enter to quit...");
    let mut input = String::new();
    io::stdin().read_line(&mut input)?;

    println!();
    println!("✅ Stopped listening. Goodbye!");

    Ok(())
}

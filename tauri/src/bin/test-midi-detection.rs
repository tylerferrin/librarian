// MIDI device detection test utility
// Run with: cargo run --bin test-midi-detection

use librarian_lib::midi::list_midi_devices;
use std::io;

fn main() {
    println!("╔═══════════════════════════════════════════════════════════╗");
    println!("║  Librarian - MIDI Device Detection Test                  ║");
    println!("║  Testing midir integration with macOS CoreMIDI            ║");
    println!("╚═══════════════════════════════════════════════════════════╝");
    println!();

    println!("Press Enter to scan for MIDI devices...");
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();

    match list_midi_devices() {
        Ok((inputs, outputs)) => {
            println!("✅ MIDI device enumeration successful!");
            println!();
            println!("Summary:");
            println!("  • Input ports found:  {}", inputs.len());
            println!("  • Output ports found: {}", outputs.len());
            
            // Check for supported pedals
            println!();
            println!("Searching for supported pedals...");
            println!();
            
            let mut found_gen_loss = false;
            let mut found_microcosm = false;
            
            // Search for Gen Loss MKII
            println!("🔍 Chase Bliss Gen Loss MKII:");
            for device in inputs.iter().chain(outputs.iter()) {
                let name_lower = device.name.to_lowercase();
                if (name_lower.contains("gen") && name_lower.contains("loss")) ||
                   (name_lower.contains("generation") && name_lower.contains("loss")) {
                    println!("  ✓ Found: {} ({})", 
                        device.name, 
                        if device.is_input { "Input" } else { "Output" }
                    );
                    found_gen_loss = true;
                }
            }
            if !found_gen_loss {
                println!("  ⚠ Not detected");
                println!("    (USB connection required)");
            }
            
            // Search for Hologram Microcosm
            println!();
            println!("🔍 Hologram Microcosm:");
            for device in inputs.iter().chain(outputs.iter()) {
                let name_lower = device.name.to_lowercase();
                if name_lower.contains("microcosm") ||
                   (name_lower.contains("hologram") && name_lower.contains("micro")) {
                    println!("  ✓ Found: {} ({})", 
                        device.name, 
                        if device.is_input { "Input" } else { "Output" }
                    );
                    found_microcosm = true;
                }
            }
            if !found_microcosm {
                println!("  ⚠ Not detected");
                println!("    (USB or Bluetooth MIDI connection required)");
            }
            
            println!();
            if !found_gen_loss && !found_microcosm {
                println!("💡 Tips:");
                println!("  • Make sure pedals are powered on");
                println!("  • For USB: Check cable connection");
                println!("  • For Bluetooth: Pair WIDI adapter in macOS Bluetooth settings first");
                println!("  • See docs/midi/ for setup guides");
            }

            println!();
            println!("macOS Permissions Check:");
            if inputs.is_empty() && outputs.is_empty() {
                println!("  ⚠ No MIDI devices found at all.");
                println!("    This could indicate:");
                println!("    1. No MIDI devices are connected");
                println!("    2. macOS privacy settings may be blocking access");
                println!("    3. MIDI drivers may need to be installed");
            } else {
                println!("  ✓ MIDI access appears to be working");
                println!("    CoreMIDI is accessible without permission dialogs");
            }

            println!();
            println!("Test complete!");
            
            std::process::exit(0);
        }
        Err(e) => {
            eprintln!();
            eprintln!("❌ Error during MIDI device enumeration:");
            eprintln!("   {}", e);
            eprintln!();
            eprintln!("Troubleshooting:");
            eprintln!("  1. Check if any MIDI devices are connected");
            eprintln!("  2. On macOS, check System Settings > Privacy & Security");
            eprintln!("  3. Try disconnecting and reconnecting your MIDI device");
            eprintln!("  4. Ensure the device is powered on");
            eprintln!();
            
            std::process::exit(1);
        }
    }
}

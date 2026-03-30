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
            
            // Check for Bluetooth MIDI adapters
            println!();
            println!("Searching for MIDI devices...");
            println!();
            
            let mut found_gen_loss = false;
            let mut found_microcosm = false;
            let mut found_bluetooth_adapter = false;
            let mut bluetooth_adapters = Vec::new();
            
            // Search for Bluetooth MIDI adapters first
            println!("🔍 Bluetooth MIDI Adapters:");
            for device in inputs.iter().chain(outputs.iter()) {
                let name_lower = device.name.to_lowercase();
                
                // Check for common Bluetooth adapter names
                if name_lower.contains("widi") ||
                   name_lower.contains("ble") ||
                   (name_lower.contains("bluetooth") && name_lower.contains("midi")) ||
                   name_lower.contains("bt-midi") {
                    if !bluetooth_adapters.contains(&device.name) {
                        println!("  ✓ Found: {} ({})", 
                            device.name, 
                            if device.is_input { "Input" } else { "Output" }
                        );
                        bluetooth_adapters.push(device.name.clone());
                        found_bluetooth_adapter = true;
                    }
                }
            }
            
            if found_bluetooth_adapter {
                println!();
                println!("  💡 Bluetooth adapters show their own names, not the pedal names.");
                println!("     Your pedal (Microcosm, Gen Loss, etc.) is connected to the adapter.");
                println!();
                println!("  📝 When connecting from the app, use the adapter name:");
                for adapter_name in &bluetooth_adapters {
                    println!("     → \"{}\"", adapter_name);
                }
            } else {
                println!("  ⚠ No Bluetooth MIDI adapters detected");
            }
            
            println!();
            println!("─────────────────────────────────────────────────────────");
            
            // Search for Gen Loss MKII (direct USB connection)
            println!();
            println!("🔍 Chase Bliss Gen Loss MKII (USB):");
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
                println!("    (Requires direct USB connection)");
            }
            
            // Search for Hologram Microcosm (direct USB connection)
            println!();
            println!("🔍 Hologram Microcosm (USB):");
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
                println!("    (Direct USB connection, or use Bluetooth adapter above)");
            }
            
            println!();
            println!("─────────────────────────────────────────────────────────");
            println!();
            
            // Provide helpful next steps
            if found_bluetooth_adapter {
                println!("✅ Ready to test MIDI communication!");
                println!();
                println!("Next steps:");
                println!("  1. Launch the app: pnpm run tauri dev");
                println!("  2. Open browser DevTools (Cmd+Option+I)");
                println!("  3. See docs/midi/testing-guide.md for test commands");
                println!("  4. Or use docs/midi/quick-test-commands.js for ready-to-paste tests");
            } else if !found_gen_loss && !found_microcosm {
                println!("💡 Connection Tips:");
                println!("  • Make sure pedals are powered on");
                println!("  • For USB: Check cable connection directly to pedal");
                println!("  • For Bluetooth: Pair WIDI adapter in macOS Bluetooth settings first");
                println!("  • See docs/midi/bluetooth-midi-setup.md for detailed setup");
                println!("  • See docs/midi/macos-setup.md for USB setup");
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

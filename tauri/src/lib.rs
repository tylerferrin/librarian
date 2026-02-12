// MIDI module for device detection and communication
pub mod midi;

// Tauri commands for frontend integration
pub mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize MIDI Manager
    let midi_manager = midi::create_shared_manager()
        .expect("Failed to create MIDI Manager");
    
    // Initialize the Tauri app with MIDI support
    let builder = tauri::Builder::default()
        .manage(midi_manager)
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::list_midi_devices,
            commands::connect_microcosm,
            commands::connect_gen_loss_mkii,
            commands::disconnect_device,
            commands::list_connected_devices,
            commands::send_microcosm_parameter,
            commands::send_gen_loss_parameter,
            commands::get_microcosm_state,
            commands::get_gen_loss_state,
            commands::recall_microcosm_preset,
            commands::recall_gen_loss_preset,
            commands::is_device_connected,
        ]);

    // Run the app with context
    if let Err(e) = builder.run(tauri::generate_context!()) {
        eprintln!("Failed to run Tauri application: {}", e);
        std::process::exit(1);
    }
}

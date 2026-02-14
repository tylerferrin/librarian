// MIDI module for device detection and communication
pub mod midi;

// Preset management module
pub mod presets;

// Tauri commands for frontend integration
pub mod commands;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize MIDI Manager
    let midi_manager = midi::create_shared_manager()
        .expect("Failed to create MIDI Manager");
    
    // Initialize the Tauri app with MIDI support and preset library
    let builder = tauri::Builder::default()
        .manage(midi_manager)
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Initialize preset library with proper app data directory
            let app_data_dir = app.path().app_data_dir()
                .expect("Failed to get app data directory");
            std::fs::create_dir_all(&app_data_dir)
                .expect("Failed to create app data directory");
            let db_path = app_data_dir.join("presets.db");
            let preset_library = presets::create_shared_library(db_path)
                .expect("Failed to create preset library");
            app.manage(preset_library);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_midi_devices,
            commands::connect_microcosm,
            commands::connect_gen_loss_mkii,
            commands::disconnect_device,
            commands::list_connected_devices,
            commands::send_microcosm_parameter,
            commands::send_microcosm_program_change,
            commands::send_gen_loss_parameter,
            commands::get_microcosm_state,
            commands::get_gen_loss_state,
            commands::recall_microcosm_preset,
            commands::recall_gen_loss_preset,
            commands::is_device_connected,
            commands::save_preset,
            commands::update_preset,
            commands::get_preset,
            commands::list_presets,
            commands::delete_preset,
            commands::toggle_favorite,
            commands::get_bank_state,
            commands::assign_to_bank,
            commands::save_preset_to_bank,
        ]);

    // Run the app with context
    if let Err(e) = builder.run(tauri::generate_context!()) {
        eprintln!("Failed to run Tauri application: {}", e);
        std::process::exit(1);
    }
}

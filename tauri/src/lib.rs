// MIDI module for device detection and communication
pub mod midi;

// Preset management module
pub mod presets;

// Tauri commands for frontend integration
pub mod commands;

// Test utilities module
#[cfg(test)]
pub mod test_utils;

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
            // Maximize the main window on startup
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.maximize();
            }
            
            // Set app handle on MIDI manager for event emission
            let midi_manager = app.state::<midi::SharedMidiManager>();
            if let Ok(mut manager) = midi_manager.lock() {
                manager.set_app_handle(app.handle().clone());
                println!("✅ MIDI Manager configured for bidirectional communication");
            }
            
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
            commands::connect_chroma_console,
            commands::disconnect_device,
            commands::list_connected_devices,
            commands::request_midi_device_identity,
            commands::send_microcosm_parameter,
            commands::send_microcosm_program_change,
            commands::send_gen_loss_parameter,
            commands::send_chroma_console_parameter,
            commands::send_chroma_console_program_change,
            commands::connect_preamp_mk2,
            commands::send_preamp_mk2_parameter,
            commands::get_preamp_mk2_state,
            commands::recall_preamp_mk2_preset,
            commands::save_preamp_mk2_preset,
            commands::send_preamp_mk2_program_change,
            commands::connect_cxm1978,
            commands::send_cxm1978_parameter,
            commands::get_cxm1978_state,
            commands::recall_cxm1978_preset,
            commands::save_cxm1978_preset,
            commands::send_cxm1978_program_change,
            commands::get_microcosm_state,
            commands::get_gen_loss_state,
            commands::get_chroma_console_state,
            commands::recall_microcosm_preset,
            commands::recall_gen_loss_preset,
            commands::recall_chroma_console_preset,
            commands::is_device_connected,
            commands::save_preset,
            commands::update_preset,
            commands::get_preset,
            commands::list_presets,
            commands::delete_preset,
            commands::toggle_favorite,
            commands::get_bank_state,
            commands::assign_to_bank,
            commands::clear_bank,
            commands::get_presets_with_banks,
            commands::save_preset_to_bank,
            commands::get_bank_config,
        ]);

    // Run the app with context
    if let Err(e) = builder.run(tauri::generate_context!()) {
        eprintln!("Failed to run Tauri application: {}", e);
        std::process::exit(1);
    }
}

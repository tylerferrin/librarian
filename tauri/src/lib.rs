#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize the Tauri app with simplified configuration for better macOS compatibility
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![]);

    // Run the app with context
    if let Err(e) = builder.run(tauri::generate_context!()) {
        eprintln!("Failed to run Tauri application: {}", e);
        std::process::exit(1);
    }
}

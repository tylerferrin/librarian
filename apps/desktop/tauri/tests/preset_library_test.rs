// Integration tests for PresetLibrary aggregate
// Tests the full workflow of saving presets and managing bank assignments

use librarian_lib::presets::PresetLibrary;
use tempfile::TempDir;

/// Helper to create a temporary database for testing
fn create_test_library() -> (PresetLibrary, TempDir) {
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("test.db");
    let library = PresetLibrary::new(db_path).unwrap();
    (library, temp_dir)
}

#[test]
fn test_save_preset_workflow() {
    let (library, _temp_dir) = create_test_library();
    
    // Step 1: Save a preset
    let preset = library.save_preset(
        "My Preset".to_string(),
        "Microcosm".to_string(),
        Some("A test preset".to_string()),
        serde_json::json!({"activity": 64, "mix": 100}),
        vec!["ambient".to_string(), "experimental".to_string()],
    ).unwrap();
    
    // Verify preset was saved
    assert_eq!(preset.name, "My Preset");
    assert_eq!(preset.pedal_type, "Microcosm");
    assert_eq!(preset.tags.len(), 2);
    assert!(!preset.is_favorite);
    
    // Step 2: Retrieve the preset
    let retrieved = library.get_preset(&preset.id).unwrap();
    assert_eq!(retrieved.id, preset.id);
    assert_eq!(retrieved.name, "My Preset");
    
    // Step 3: Update the preset
    let updated = library.update_preset(
        &preset.id,
        None,
        None,
        None,
        Some(true), // Mark as favorite
        None,
    ).unwrap();
    
    assert!(updated.is_favorite);
    
    // Step 4: Assign to bank
    library.assign_to_bank("Microcosm", 45, &preset.id).unwrap();
    
    // Verify bank assignment
    let banks = library.get_bank_state("Microcosm").unwrap();
    let bank_45 = banks.iter().find(|b| b.bank_number == 45).unwrap();
    assert!(bank_45.preset.is_some());
    assert_eq!(bank_45.preset.as_ref().unwrap().name, "My Preset");
}

#[test]
fn test_update_preset_workflow() {
    let (library, _temp_dir) = create_test_library();
    
    // Create initial preset
    let preset = library.save_preset(
        "Original".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({"activity": 50}),
        vec![],
    ).unwrap();
    
    // Update name
    let updated = library.update_preset(
        &preset.id,
        Some("Modified".to_string()),
        None,
        None,
        None,
        None,
    ).unwrap();
    assert_eq!(updated.name, "Modified");
    
    // Update description
    let updated = library.update_preset(
        &preset.id,
        None,
        Some("New description".to_string()),
        None,
        None,
        None,
    ).unwrap();
    assert_eq!(updated.description, Some("New description".to_string()));
    
    // Update tags
    let updated = library.update_preset(
        &preset.id,
        None,
        None,
        Some(vec!["tag1".to_string(), "tag2".to_string()]),
        None,
        None,
    ).unwrap();
    assert_eq!(updated.tags.len(), 2);
    
    // Update parameters
    let updated = library.update_preset(
        &preset.id,
        None,
        None,
        None,
        None,
        Some(serde_json::json!({"activity": 100, "mix": 80})),
    ).unwrap();
    assert_eq!(updated.parameters["activity"], 100);
    assert_eq!(updated.parameters["mix"], 80);
}

#[test]
fn test_delete_preset_workflow() {
    let (library, _temp_dir) = create_test_library();
    
    // Save preset and assign to banks
    let preset = library.save_preset(
        "To Delete".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    library.assign_to_bank("Microcosm", 45, &preset.id).unwrap();
    library.assign_to_bank("Microcosm", 46, &preset.id).unwrap();
    
    // Verify banks are assigned
    let banks_before = library.get_bank_state("Microcosm").unwrap();
    assert!(banks_before.iter().any(|b| b.bank_number == 45 && b.preset.is_some()));
    assert!(banks_before.iter().any(|b| b.bank_number == 46 && b.preset.is_some()));
    
    // Delete preset
    library.delete_preset(&preset.id).unwrap();
    
    // Verify preset is gone
    let result = library.get_preset(&preset.id);
    assert!(result.is_err());
    
    // Verify bank assignments are cleared (CASCADE DELETE)
    let banks_after = library.get_bank_state("Microcosm").unwrap();
    assert!(banks_after.iter().all(|b| b.preset.is_none()));
}

#[test]
fn test_bank_management_workflow() {
    let (library, _temp_dir) = create_test_library();
    
    // Create multiple presets
    let preset1 = library.save_preset(
        "Preset 1".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    let preset2 = library.save_preset(
        "Preset 2".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    let preset3 = library.save_preset(
        "Preset 3".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    // Assign to different banks
    library.assign_to_bank("Microcosm", 45, &preset1.id).unwrap();
    library.assign_to_bank("Microcosm", 46, &preset2.id).unwrap();
    library.assign_to_bank("Microcosm", 47, &preset3.id).unwrap();
    
    // Reassign bank 46 to preset1 (should overwrite)
    library.assign_to_bank("Microcosm", 46, &preset1.id).unwrap();
    
    // Get bank state
    let banks = library.get_bank_state("Microcosm").unwrap();
    
    // Verify assignments
    let bank_45 = banks.iter().find(|b| b.bank_number == 45).unwrap();
    assert_eq!(bank_45.preset.as_ref().unwrap().name, "Preset 1");
    
    let bank_46 = banks.iter().find(|b| b.bank_number == 46).unwrap();
    assert_eq!(bank_46.preset.as_ref().unwrap().name, "Preset 1");
    
    let bank_47 = banks.iter().find(|b| b.bank_number == 47).unwrap();
    assert_eq!(bank_47.preset.as_ref().unwrap().name, "Preset 3");
    
    // Clear bank 46
    library.clear_bank("Microcosm", 46).unwrap();
    
    let banks = library.get_bank_state("Microcosm").unwrap();
    let bank_46 = banks.iter().find(|b| b.bank_number == 46).unwrap();
    assert!(bank_46.preset.is_none());
}

#[test]
fn test_preset_library_with_multiple_pedal_types() {
    let (library, _temp_dir) = create_test_library();
    
    // Save presets for different pedals
    let microcosm_preset = library.save_preset(
        "Microcosm Preset".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({"activity": 64}),
        vec![],
    ).unwrap();
    
    let gen_loss_preset = library.save_preset(
        "Gen Loss Preset".to_string(),
        "GenLoss".to_string(),
        None,
        serde_json::json!({"wow": 50}),
        vec![],
    ).unwrap();
    
    let chroma_preset = library.save_preset(
        "Chroma Preset".to_string(),
        "ChromaConsole".to_string(),
        None,
        serde_json::json!({"drive": 100}),
        vec![],
    ).unwrap();
    
    // Assign to banks
    library.assign_to_bank("Microcosm", 45, &microcosm_preset.id).unwrap();
    // Note: GenLoss and ChromaConsole would have different bank ranges
    
    // Get bank states for each pedal type
    let microcosm_banks = library.get_bank_state("Microcosm").unwrap();
    assert_eq!(microcosm_banks.len(), 16); // Microcosm has 16 banks (45-60)
    
    let bank_45 = microcosm_banks.iter().find(|b| b.bank_number == 45).unwrap();
    assert_eq!(bank_45.preset.as_ref().unwrap().name, "Microcosm Preset");
    
    // Verify each preset is retrievable
    let retrieved_micro = library.get_preset(&microcosm_preset.id).unwrap();
    assert_eq!(retrieved_micro.pedal_type, "Microcosm");
    
    let retrieved_gen = library.get_preset(&gen_loss_preset.id).unwrap();
    assert_eq!(retrieved_gen.pedal_type, "GenLoss");
    
    let retrieved_chroma = library.get_preset(&chroma_preset.id).unwrap();
    assert_eq!(retrieved_chroma.pedal_type, "ChromaConsole");
}

#[test]
fn test_validation_constraints() {
    let (library, _temp_dir) = create_test_library();
    
    // Empty name
    let result = library.save_preset(
        "".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    );
    assert!(result.is_err());
    
    // Whitespace only name
    let result = library.save_preset(
        "   ".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    );
    assert!(result.is_err());
    
    // Duplicate name
    library.save_preset(
        "Unique Name".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    let result = library.save_preset(
        "Unique Name".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    );
    assert!(result.is_err());
    
    // Invalid bank number (too low)
    let preset = library.save_preset(
        "Test".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    let result = library.assign_to_bank("Microcosm", 44, &preset.id);
    assert!(result.is_err());
    
    // Invalid bank number (too high)
    let result = library.assign_to_bank("Microcosm", 61, &preset.id);
    assert!(result.is_err());
}

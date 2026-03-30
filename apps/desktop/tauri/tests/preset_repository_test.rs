// Integration tests for PresetRepository
// Tests CRUD operations against in-memory SQLite database

use librarian_lib::presets::{Preset, PresetId, PresetFilter};
use librarian_lib::presets::PresetLibrary;
use std::path::PathBuf;
use tempfile::TempDir;

/// Helper to create a temporary database for testing
fn create_test_library() -> (PresetLibrary, TempDir) {
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("test.db");
    let library = PresetLibrary::new(db_path).unwrap();
    (library, temp_dir)
}

#[test]
fn test_save_and_get_preset() {
    let (library, _temp_dir) = create_test_library();
    
    // Save a preset
    let preset = library.save_preset(
        "Test Preset".to_string(),
        "Microcosm".to_string(),
        Some("A test preset".to_string()),
        serde_json::json!({"activity": 64}),
        vec!["ambient".to_string()],
    ).unwrap();
    
    // Get the preset back
    let retrieved = library.get_preset(&preset.id).unwrap();
    
    assert_eq!(retrieved.name, "Test Preset");
    assert_eq!(retrieved.pedal_type, "Microcosm");
    assert_eq!(retrieved.description, Some("A test preset".to_string()));
    assert_eq!(retrieved.tags.len(), 1);
    assert_eq!(retrieved.tags[0], "ambient");
}

#[test]
fn test_save_preset_with_empty_name_fails() {
    let (library, _temp_dir) = create_test_library();
    
    let result = library.save_preset(
        "".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    );
    
    assert!(result.is_err());
}

#[test]
fn test_save_preset_with_whitespace_name_fails() {
    let (library, _temp_dir) = create_test_library();
    
    let result = library.save_preset(
        "   ".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    );
    
    assert!(result.is_err());
}

#[test]
fn test_save_preset_with_duplicate_name_fails() {
    let (library, _temp_dir) = create_test_library();
    
    // Save first preset
    library.save_preset(
        "Duplicate Name".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    // Try to save another with same name
    let result = library.save_preset(
        "Duplicate Name".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    );
    
    assert!(result.is_err());
}

#[test]
fn test_update_preset() {
    let (library, _temp_dir) = create_test_library();
    
    // Save initial preset
    let preset = library.save_preset(
        "Original Name".to_string(),
        "Microcosm".to_string(),
        Some("Original description".to_string()),
        serde_json::json!({"activity": 64}),
        vec!["tag1".to_string()],
    ).unwrap();
    
    // Update the preset
    let updated = library.update_preset(
        &preset.id,
        Some("Updated Name".to_string()),
        Some("Updated description".to_string()),
        Some(vec!["tag1".to_string(), "tag2".to_string()]),
        Some(true),
        Some(serde_json::json!({"activity": 100})),
    ).unwrap();
    
    assert_eq!(updated.name, "Updated Name");
    assert_eq!(updated.description, Some("Updated description".to_string()));
    assert_eq!(updated.tags.len(), 2);
    assert!(updated.is_favorite);
    assert_eq!(updated.parameters["activity"], 100);
}

#[test]
fn test_update_nonexistent_preset_fails() {
    let (library, _temp_dir) = create_test_library();
    
    let fake_id = PresetId::new("nonexistent".to_string());
    let result = library.update_preset(
        &fake_id,
        Some("New Name".to_string()),
        None,
        None,
        None,
        None,
    );
    
    assert!(result.is_err());
}

#[test]
fn test_delete_preset() {
    let (library, _temp_dir) = create_test_library();
    
    // Save a preset
    let preset = library.save_preset(
        "To Delete".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    // Delete it
    library.delete_preset(&preset.id).unwrap();
    
    // Try to get it (should fail)
    let result = library.get_preset(&preset.id);
    assert!(result.is_err());
}

#[test]
fn test_list_presets_no_filter() {
    let (library, _temp_dir) = create_test_library();
    
    // Save multiple presets
    library.save_preset(
        "Preset 1".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    library.save_preset(
        "Preset 2".to_string(),
        "GenLoss".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    library.save_preset(
        "Preset 3".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    // List all presets
    let presets = library.list_presets(PresetFilter::default()).unwrap();
    assert_eq!(presets.len(), 3);
}

#[test]
fn test_list_presets_filtered_by_pedal_type() {
    let (library, _temp_dir) = create_test_library();
    
    // Save presets for different pedals
    library.save_preset(
        "Microcosm 1".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    library.save_preset(
        "GenLoss 1".to_string(),
        "GenLoss".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    library.save_preset(
        "Microcosm 2".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    // Filter by Microcosm
    let filter = PresetFilter {
        pedal_type: Some("Microcosm".to_string()),
        ..Default::default()
    };
    
    let presets = library.list_presets(filter).unwrap();
    assert_eq!(presets.len(), 2);
    assert!(presets.iter().all(|p| p.pedal_type == "Microcosm"));
}

#[test]
fn test_toggle_favorite() {
    let (library, _temp_dir) = create_test_library();
    
    // Save a preset (not favorite by default)
    let preset = library.save_preset(
        "Test".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    assert!(!preset.is_favorite);
    
    // Toggle to favorite
    let toggled = library.toggle_favorite(&preset.id).unwrap();
    assert!(toggled.is_favorite);
    
    // Toggle back
    let toggled2 = library.toggle_favorite(&preset.id).unwrap();
    assert!(!toggled2.is_favorite);
}

#[test]
fn test_bank_state() {
    let (library, _temp_dir) = create_test_library();
    
    // Get initial bank state for Microcosm (should have 16 empty slots)
    let banks = library.get_bank_state("Microcosm").unwrap();
    
    // Microcosm has banks 45-60 (16 slots)
    assert_eq!(banks.len(), 16);
    assert!(banks.iter().all(|slot| slot.preset.is_none()));
}

#[test]
fn test_assign_to_bank() {
    let (library, _temp_dir) = create_test_library();
    
    // Save a preset
    let preset = library.save_preset(
        "Bank Test".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    // Assign to bank 45
    library.assign_to_bank("Microcosm", 45, &preset.id).unwrap();
    
    // Get bank state and verify assignment
    let banks = library.get_bank_state("Microcosm").unwrap();
    let bank_45 = banks.iter().find(|b| b.bank_number == 45).unwrap();
    
    assert!(bank_45.preset.is_some());
    assert_eq!(bank_45.preset.as_ref().unwrap().name, "Bank Test");
}

#[test]
fn test_assign_to_invalid_bank_fails() {
    let (library, _temp_dir) = create_test_library();
    
    // Save a preset
    let preset = library.save_preset(
        "Test".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    // Try to assign to invalid bank (Microcosm only supports 45-60)
    let result = library.assign_to_bank("Microcosm", 100, &preset.id);
    assert!(result.is_err());
}

#[test]
fn test_get_presets_with_banks() {
    let (library, _temp_dir) = create_test_library();
    
    // Save presets
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
    
    // Assign to banks
    library.assign_to_bank("Microcosm", 45, &preset1.id).unwrap();
    library.assign_to_bank("Microcosm", 46, &preset1.id).unwrap();
    library.assign_to_bank("Microcosm", 47, &preset2.id).unwrap();
    
    // Get presets with banks
    let presets_with_banks = library.get_presets_with_banks("Microcosm").unwrap();
    
    assert_eq!(presets_with_banks.len(), 2);
    
    // Find preset 1 and verify it has 2 bank assignments
    let p1 = presets_with_banks.iter().find(|p| p.preset.name == "Preset 1").unwrap();
    assert_eq!(p1.bank_numbers.len(), 2);
    assert!(p1.bank_numbers.contains(&45));
    assert!(p1.bank_numbers.contains(&46));
    
    // Find preset 2 and verify it has 1 bank assignment
    let p2 = presets_with_banks.iter().find(|p| p.preset.name == "Preset 2").unwrap();
    assert_eq!(p2.bank_numbers.len(), 1);
    assert!(p2.bank_numbers.contains(&47));
}

// E2E test for complete preset lifecycle
// Simulates a user workflow: create → edit → save to bank → recall → delete

use librarian_lib::presets::{PresetLibrary, PresetFilter};
use tempfile::TempDir;

fn create_test_library() -> (PresetLibrary, TempDir) {
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("test.db");
    let library = PresetLibrary::new(db_path).unwrap();
    (library, temp_dir)
}

#[test]
fn test_complete_preset_lifecycle() {
    let (library, _temp_dir) = create_test_library();
    
    // ====================================================================
    // STEP 1: User creates a new preset
    // ====================================================================
    let preset = library.save_preset(
        "Ambient Texture".to_string(),
        "Microcosm".to_string(),
        Some("A lush ambient soundscape".to_string()),
        serde_json::json!({
            "activity": 80,
            "mix": 100,
            "time": 90,
            "space": 127
        }),
        vec!["ambient".to_string(), "texture".to_string()],
    ).unwrap();
    
    println!("✅ Created preset: {} (ID: {})", preset.name, preset.id);
    
    assert_eq!(preset.name, "Ambient Texture");
    assert_eq!(preset.pedal_type, "Microcosm");
    assert!(!preset.is_favorite);
    
    // ====================================================================
    // STEP 2: User edits the preset (tweaks parameters)
    // ====================================================================
    let updated = library.update_preset(
        &preset.id,
        None,
        None,
        None,
        None,
        Some(serde_json::json!({
            "activity": 85,
            "mix": 110,
            "time": 95,
            "space": 127
        })),
    ).unwrap();
    
    println!("✅ Updated preset parameters");
    
    assert_eq!(updated.parameters["activity"], 85);
    assert_eq!(updated.parameters["mix"], 110);
    
    // ====================================================================
    // STEP 3: User marks it as favorite
    // ====================================================================
    let favorited = library.toggle_favorite(&preset.id).unwrap();
    println!("✅ Marked preset as favorite");
    
    assert!(favorited.is_favorite);
    
    // ====================================================================
    // STEP 4: User saves preset to bank slot on pedal
    // ====================================================================
    library.assign_to_bank("Microcosm", 45, &preset.id).unwrap();
    println!("✅ Saved preset to bank 45 (Bank 1A)");
    
    // Verify bank assignment
    let banks = library.get_bank_state("Microcosm").unwrap();
    let bank_45 = banks.iter().find(|b| b.bank_number == 45).unwrap();
    assert!(bank_45.preset.is_some());
    assert_eq!(bank_45.preset.as_ref().unwrap().name, "Ambient Texture");
    
    // ====================================================================
    // STEP 5: User recalls the preset from bank
    // ====================================================================
    let recalled = library.get_bank_preset("Microcosm", 45).unwrap();
    println!("✅ Recalled preset from bank 45");
    
    assert!(recalled.is_some());
    let recalled = recalled.unwrap();
    assert_eq!(recalled.name, "Ambient Texture");
    assert_eq!(recalled.parameters["activity"], 85);
    
    // ====================================================================
    // STEP 6: User creates another preset and saves to different bank
    // ====================================================================
    let preset2 = library.save_preset(
        "Glitch Pattern".to_string(),
        "Microcosm".to_string(),
        Some("Rhythmic glitchy texture".to_string()),
        serde_json::json!({
            "activity": 100,
            "mix": 90,
            "repeats": 127
        }),
        vec!["glitch".to_string(), "rhythm".to_string()],
    ).unwrap();
    
    library.assign_to_bank("Microcosm", 46, &preset2.id).unwrap();
    println!("✅ Created second preset and saved to bank 46");
    
    // ====================================================================
    // STEP 7: User lists all presets
    // ====================================================================
    let all_presets = library.list_presets(PresetFilter::default()).unwrap();
    println!("✅ Listed all presets: {} total", all_presets.len());
    
    assert_eq!(all_presets.len(), 2);
    
    // ====================================================================
    // STEP 8: User filters presets by favorites
    // ====================================================================
    let favorites = library.list_presets(PresetFilter {
        is_favorite: Some(true),
        ..Default::default()
    }).unwrap();
    println!("✅ Filtered favorites: {} found", favorites.len());
    
    assert_eq!(favorites.len(), 1);
    assert_eq!(favorites[0].name, "Ambient Texture");
    
    // ====================================================================
    // STEP 9: User filters presets by tags
    // ====================================================================
    let ambient_presets = library.list_presets(PresetFilter {
        tags: vec!["ambient".to_string()],
        ..Default::default()
    }).unwrap();
    println!("✅ Filtered by 'ambient' tag: {} found", ambient_presets.len());
    
    assert_eq!(ambient_presets.len(), 1);
    
    // ====================================================================
    // STEP 10: User views all presets with their bank assignments
    // ====================================================================
    let presets_with_banks = library.get_presets_with_banks("Microcosm").unwrap();
    println!("✅ Retrieved presets with bank assignments");
    
    assert_eq!(presets_with_banks.len(), 2);
    
    let p1 = presets_with_banks.iter().find(|p| p.preset.name == "Ambient Texture").unwrap();
    assert!(p1.bank_numbers.contains(&45));
    
    let p2 = presets_with_banks.iter().find(|p| p.preset.name == "Glitch Pattern").unwrap();
    assert!(p2.bank_numbers.contains(&46));
    
    // ====================================================================
    // STEP 11: User reassigns first preset to another bank
    // ====================================================================
    library.assign_to_bank("Microcosm", 47, &preset.id).unwrap();
    println!("✅ Assigned preset to additional bank 47");
    
    let presets_with_banks = library.get_presets_with_banks("Microcosm").unwrap();
    let p1 = presets_with_banks.iter().find(|p| p.preset.name == "Ambient Texture").unwrap();
    assert_eq!(p1.bank_numbers.len(), 2);
    assert!(p1.bank_numbers.contains(&45));
    assert!(p1.bank_numbers.contains(&47));
    
    // ====================================================================
    // STEP 12: User deletes the second preset
    // ====================================================================
    library.delete_preset(&preset2.id).unwrap();
    println!("✅ Deleted second preset");
    
    // Verify deletion
    let result = library.get_preset(&preset2.id);
    assert!(result.is_err());
    
    // Verify bank 46 is now empty
    let banks = library.get_bank_state("Microcosm").unwrap();
    let bank_46 = banks.iter().find(|b| b.bank_number == 46).unwrap();
    assert!(bank_46.preset.is_none());
    
    // ====================================================================
    // STEP 13: Final verification
    // ====================================================================
    let remaining_presets = library.list_presets(PresetFilter::default()).unwrap();
    println!("✅ Final verification: {} presets remaining", remaining_presets.len());
    
    assert_eq!(remaining_presets.len(), 1);
    assert_eq!(remaining_presets[0].name, "Ambient Texture");
    
    println!("\n🎉 Complete preset lifecycle test passed!");
}

#[test]
fn test_error_recovery_workflow() {
    let (library, _temp_dir) = create_test_library();
    
    // ====================================================================
    // SCENARIO 1: User tries to create preset with invalid name
    // ====================================================================
    let result = library.save_preset(
        "".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    );
    
    assert!(result.is_err());
    println!("✅ Rejected empty preset name");
    
    // ====================================================================
    // SCENARIO 2: User creates valid preset
    // ====================================================================
    let preset = library.save_preset(
        "Valid Preset".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    ).unwrap();
    
    println!("✅ Created valid preset");
    
    // ====================================================================
    // SCENARIO 3: User tries to create duplicate name
    // ====================================================================
    let result = library.save_preset(
        "Valid Preset".to_string(),
        "Microcosm".to_string(),
        None,
        serde_json::json!({}),
        vec![],
    );
    
    assert!(result.is_err());
    println!("✅ Rejected duplicate preset name");
    
    // ====================================================================
    // SCENARIO 4: User tries to assign to invalid bank
    // ====================================================================
    let result = library.assign_to_bank("Microcosm", 100, &preset.id);
    assert!(result.is_err());
    println!("✅ Rejected invalid bank number");
    
    // ====================================================================
    // SCENARIO 5: User assigns to valid bank
    // ====================================================================
    library.assign_to_bank("Microcosm", 45, &preset.id).unwrap();
    println!("✅ Assigned to valid bank");
    
    // ====================================================================
    // SCENARIO 6: User tries to update non-existent preset
    // ====================================================================
    let fake_id = librarian_lib::presets::PresetId::new("nonexistent".to_string());
    let result = library.update_preset(
        &fake_id,
        Some("New Name".to_string()),
        None,
        None,
        None,
        None,
    );
    
    assert!(result.is_err());
    println!("✅ Rejected update to non-existent preset");
    
    // ====================================================================
    // SCENARIO 7: User updates existing preset successfully
    // ====================================================================
    let updated = library.update_preset(
        &preset.id,
        Some("Updated Name".to_string()),
        None,
        None,
        None,
        None,
    ).unwrap();
    
    assert_eq!(updated.name, "Updated Name");
    println!("✅ Updated existing preset");
    
    println!("\n🎉 Error recovery workflow test passed!");
}

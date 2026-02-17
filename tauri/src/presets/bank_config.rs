// Bank configuration - defines preset bank layouts for different pedal types
use serde::Serialize;

/// How a pedal saves presets to internal memory via MIDI
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum MidiSaveCapability {
    /// Pedal supports MIDI save via Control Change
    #[serde(rename_all = "camelCase")]
    Supported { 
        cc_number: u8,
        description: String,
    },
    /// No MIDI save - user must manually save on pedal hardware
    #[serde(rename_all = "camelCase")]
    ManualOnly { 
        instructions: String,
    },
    /// Presets are automatically saved when recalled (no explicit save needed)
    AutoSave,
}

/// Bank configuration for a pedal type
/// Defines how preset banks are organized and displayed
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BankConfig {
    /// First program change number in the bank range
    pub program_change_start: u8,
    /// Last program change number in the bank range
    pub program_change_end: u8,
    /// Number of bank groups (e.g., 4 for Banks 1-4 or A-D)
    pub num_banks: usize,
    /// Number of preset slots per bank group
    pub slots_per_bank: usize,
    /// Labels for each bank group (e.g., ["1", "2", "3", "4"] or ["A", "B", "C", "D"])
    pub bank_labels: Vec<String>,
    /// Colors for each bank group (e.g., ["red", "yellow", "green", "blue"])
    pub bank_colors: Vec<String>,
    /// How this pedal saves presets to internal memory
    pub midi_save: MidiSaveCapability,
}

impl BankConfig {
    /// Get the total number of preset slots
    pub fn total_slots(&self) -> usize {
        self.num_banks * self.slots_per_bank
    }
    
    /// Calculate the bank index (0-based) from a program change number
    pub fn get_bank_index(&self, program_change: u8) -> Option<usize> {
        if program_change < self.program_change_start || program_change > self.program_change_end {
            return None;
        }
        let offset = program_change - self.program_change_start;
        Some((offset as usize) / self.slots_per_bank)
    }
    
    /// Calculate the slot index within a bank (0-based) from a program change number
    pub fn get_slot_index(&self, program_change: u8) -> Option<usize> {
        if program_change < self.program_change_start || program_change > self.program_change_end {
            return None;
        }
        let offset = program_change - self.program_change_start;
        Some((offset as usize) % self.slots_per_bank)
    }
    
    /// Format a bank slot label (e.g., "1A", "2C", "A-5", "B-12")
    pub fn format_label(&self, program_change: u8) -> Option<String> {
        let bank_idx = self.get_bank_index(program_change)?;
        let slot_idx = self.get_slot_index(program_change)?;
        
        let bank_label = &self.bank_labels[bank_idx];
        
        // For small banks (<=4 slots), use letter format: "1A", "2C"
        // For large banks (>4 slots), use number format: "A-5", "B-12"
        if self.slots_per_bank <= 4 {
            let slot_letter = char::from(b'A' + slot_idx as u8);
            Some(format!("{}{}", bank_label, slot_letter))
        } else {
            Some(format!("{}-{}", bank_label, slot_idx + 1))
        }
    }
    
    /// Get the color for a program change number
    pub fn get_color(&self, program_change: u8) -> Option<&str> {
        let bank_idx = self.get_bank_index(program_change)?;
        self.bank_colors.get(bank_idx).map(|s| s.as_str())
    }
}

/// Get the bank configuration for a specific pedal type
pub fn get_bank_config(pedal_type: &str) -> Option<BankConfig> {
    match pedal_type {
        "Microcosm" => Some(BankConfig {
            program_change_start: 45,
            program_change_end: 60,
            num_banks: 4,
            slots_per_bank: 4,
            bank_labels: vec![
                "1".to_string(),
                "2".to_string(),
                "3".to_string(),
                "4".to_string(),
            ],
            bank_colors: vec![
                "red".to_string(),
                "yellow".to_string(),
                "green".to_string(),
                "blue".to_string(),
            ],
            midi_save: MidiSaveCapability::Supported {
                cc_number: 46,
                description: "CC 46 - Preset Save".to_string(),
            },
        }),
        "ChromaConsole" => Some(BankConfig {
            program_change_start: 0,
            program_change_end: 79,
            num_banks: 4,
            slots_per_bank: 20,
            bank_labels: vec![
                "A".to_string(),
                "B".to_string(),
                "C".to_string(),
                "D".to_string(),
            ],
            bank_colors: vec![
                "red".to_string(),
                "orange".to_string(),
                "green".to_string(),
                "blue".to_string(),
            ],
            midi_save: MidiSaveCapability::ManualOnly {
                instructions: "Press and hold the footswitch to save the preset to the pedal's internal memory".to_string(),
            },
        }),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_microcosm_config() {
        let config = get_bank_config("Microcosm").unwrap();
        assert_eq!(config.program_change_start, 45);
        assert_eq!(config.program_change_end, 60);
        assert_eq!(config.total_slots(), 16);
        assert_eq!(config.format_label(45), Some("1A".to_string()));
        assert_eq!(config.format_label(48), Some("2A".to_string()));
        assert_eq!(config.format_label(60), Some("4D".to_string()));
        assert_eq!(config.get_color(45), Some("red"));
        assert_eq!(config.get_color(49), Some("yellow"));
        
        // Verify MIDI save capability
        match &config.midi_save {
            MidiSaveCapability::Supported { cc_number, .. } => {
                assert_eq!(*cc_number, 46, "Microcosm uses CC 46 for save");
            }
            _ => panic!("Microcosm should support MIDI save"),
        }
    }
    
    #[test]
    fn test_chroma_console_config() {
        let config = get_bank_config("ChromaConsole").unwrap();
        assert_eq!(config.program_change_start, 0);
        assert_eq!(config.program_change_end, 79);
        assert_eq!(config.total_slots(), 80);
        assert_eq!(config.format_label(0), Some("A-1".to_string()));
        assert_eq!(config.format_label(19), Some("A-20".to_string()));
        assert_eq!(config.format_label(20), Some("B-1".to_string()));
        assert_eq!(config.format_label(79), Some("D-20".to_string()));
        assert_eq!(config.get_color(0), Some("red"));
        assert_eq!(config.get_color(40), Some("green"));
        
        // Verify manual save capability
        match &config.midi_save {
            MidiSaveCapability::ManualOnly { instructions } => {
                assert!(!instructions.is_empty(), "Must provide save instructions");
            }
            _ => panic!("Chroma Console should be ManualOnly save"),
        }
    }
    
    #[test]
    fn all_pedals_have_save_capability_defined() {
        // Ensure every pedal type has a complete bank config with save capability
        let pedals = ["Microcosm", "ChromaConsole"];
        
        for pedal in pedals {
            let config = get_bank_config(pedal)
                .expect(&format!("{} must have a BankConfig", pedal));
            
            // Verify save capability is properly defined
            match &config.midi_save {
                MidiSaveCapability::Supported { cc_number, description } => {
                    assert!(*cc_number > 0, "{} save CC must be valid", pedal);
                    assert!(!description.is_empty(), "{} must have save description", pedal);
                }
                MidiSaveCapability::ManualOnly { instructions } => {
                    assert!(!instructions.is_empty(), "{} must have save instructions", pedal);
                }
                MidiSaveCapability::AutoSave => {}
            }
        }
    }
    
    #[test]
    fn all_pedals_with_library_have_bank_config() {
        // This test ensures we don't forget to add BankConfig when adding a new pedal
        // If this test fails, you need to add a BankConfig for the new pedal
        use crate::midi::pedals::*;
        
        let microcosm = Microcosm::new(1);
        let chroma = ChromaConsole::new(1);
        let gen_loss = GenLossMkii::new(1);
        
        // Pedals with preset library support must have BankConfig
        if microcosm.metadata().supports_preset_library {
            assert!(get_bank_config("Microcosm").is_some(), "Microcosm supports preset library but has no BankConfig");
        }
        
        if chroma.metadata().supports_preset_library {
            assert!(get_bank_config("ChromaConsole").is_some(), "ChromaConsole supports preset library but has no BankConfig");
        }
        
        if gen_loss.metadata().supports_preset_library {
            assert!(get_bank_config("GenLossMkii").is_some(), "GenLossMkii supports preset library but has no BankConfig");
        }
    }
}

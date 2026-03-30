// Preset domain types - entities, value objects, and domain concepts
use serde::{Deserialize, Serialize};
use std::fmt;

/// Preset entity - represents a saved pedal configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Preset {
    pub id: PresetId,
    pub name: String,
    pub pedal_type: String,
    pub description: Option<String>,
    pub parameters: serde_json::Value, // Stores MicrocosmState, GenLossState, etc. as JSON
    pub tags: Vec<String>,
    pub is_favorite: bool,
    pub created_at: i64,  // Unix timestamp
    pub updated_at: i64,  // Unix timestamp
}

/// Preset ID - value object ensuring valid IDs
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct PresetId(String);

impl PresetId {
    pub fn new(id: String) -> Self {
        Self(id)
    }
    
    pub fn generate() -> Self {
        Self(uuid::Uuid::new_v4().to_string())
    }
    
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for PresetId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Bank number - value object for pedal bank slots (validated against BankConfig)
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BankNumber {
    value: u8,
    label: String,
    color: String,
}

impl BankNumber {
    pub fn new(value: u8, config: &crate::presets::bank_config::BankConfig) -> std::result::Result<Self, PresetError> {
        if value < config.program_change_start || value > config.program_change_end {
            Err(PresetError::InvalidBankNumber {
                value,
                min: config.program_change_start,
                max: config.program_change_end,
            })
        } else {
            let label = config.format_label(value)
                .unwrap_or_else(|| format!("Bank {}", value));
            let color = config.get_color(value)
                .unwrap_or("gray")
                .to_string();
            
            Ok(Self {
                value,
                label,
                color,
            })
        }
    }
    
    pub fn value(&self) -> u8 {
        self.value
    }
    
    /// Get bank label (e.g., "Bank 1A", "Bank 2C", "Bank A-5")
    pub fn label(&self) -> String {
        format!("Bank {}", self.label)
    }
    
    /// Get bank color based on bank number
    pub fn color(&self) -> &str {
        &self.color
    }
}

/// Bank slot - represents a slot on the pedal with optional preset assignment
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BankSlot {
    pub bank_number: u8,
    pub bank_label: String,
    pub color: String,
    pub preset: Option<Preset>,
    pub synced_at: Option<i64>,
}

impl BankSlot {
    pub fn new(bank_number: BankNumber) -> Self {
        Self {
            bank_number: bank_number.value(),
            bank_label: bank_number.label(),
            color: bank_number.color().to_string(),
            preset: None,
            synced_at: None,
        }
    }
    
    pub fn with_preset(bank_number: BankNumber, preset: Preset, synced_at: i64) -> Self {
        Self {
            bank_number: bank_number.value(),
            bank_label: bank_number.label(),
            color: bank_number.color().to_string(),
            preset: Some(preset),
            synced_at: Some(synced_at),
        }
    }
}

/// Preset with bank assignments - used for library drawer display
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PresetWithBanks {
    #[serde(flatten)]
    pub preset: Preset,
    pub bank_numbers: Vec<u8>,
}

/// Preset filter criteria
#[derive(Debug, Clone, Default)]
pub struct PresetFilter {
    pub pedal_type: Option<String>,
    pub tags: Vec<String>,
    pub is_favorite: Option<bool>,
    pub search_query: Option<String>,
}

/// Domain errors for preset operations
#[derive(Debug, thiserror::Error)]
pub enum PresetError {
    #[error("Preset not found: {id}")]
    NotFound { id: String },
    
    #[error("Preset name already exists: {name}")]
    DuplicateName { name: String },
    
    #[error("Invalid bank number: {value} (must be between {min} and {max})")]
    InvalidBankNumber { value: u8, min: u8, max: u8 },
    
    #[error("Invalid preset name: {reason}")]
    InvalidName { reason: String },
    
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),
    
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    
    #[error("MIDI error: {0}")]
    Midi(String),
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

pub type Result<T> = std::result::Result<T, PresetError>;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::presets::bank_config;
    
    #[test]
    fn test_preset_id_generate() {
        let id1 = PresetId::generate();
        let id2 = PresetId::generate();
        
        // IDs should be unique
        assert_ne!(id1, id2);
        
        // IDs should be valid UUIDs (36 characters with hyphens)
        assert_eq!(id1.as_str().len(), 36);
        assert_eq!(id2.as_str().len(), 36);
    }
    
    #[test]
    fn test_preset_id_new() {
        let id = PresetId::new("test-id-123".to_string());
        assert_eq!(id.as_str(), "test-id-123");
    }
    
    #[test]
    fn test_preset_id_display() {
        let id = PresetId::new("test-id-456".to_string());
        assert_eq!(format!("{}", id), "test-id-456");
    }
    
    #[test]
    fn test_preset_id_equality() {
        let id1 = PresetId::new("same-id".to_string());
        let id2 = PresetId::new("same-id".to_string());
        let id3 = PresetId::new("different-id".to_string());
        
        assert_eq!(id1, id2);
        assert_ne!(id1, id3);
    }
    
    #[test]
    fn test_bank_number_valid() {
        let config = bank_config::get_bank_config("Microcosm").unwrap();
        
        // Valid bank number in range (45-60)
        let bank = BankNumber::new(45, &config).unwrap();
        assert_eq!(bank.value(), 45);
    }
    
    #[test]
    fn test_bank_number_invalid_too_low() {
        let config = bank_config::get_bank_config("Microcosm").unwrap();
        
        // Below minimum (45)
        let result = BankNumber::new(44, &config);
        assert!(result.is_err());
        
        match result {
            Err(PresetError::InvalidBankNumber { value, min, max }) => {
                assert_eq!(value, 44);
                assert_eq!(min, 45);
                assert_eq!(max, 60);
            }
            _ => panic!("Expected InvalidBankNumber error"),
        }
    }
    
    #[test]
    fn test_bank_number_invalid_too_high() {
        let config = bank_config::get_bank_config("Microcosm").unwrap();
        
        // Above maximum (60)
        let result = BankNumber::new(61, &config);
        assert!(result.is_err());
        
        match result {
            Err(PresetError::InvalidBankNumber { value, min, max }) => {
                assert_eq!(value, 61);
                assert_eq!(min, 45);
                assert_eq!(max, 60);
            }
            _ => panic!("Expected InvalidBankNumber error"),
        }
    }
    
    #[test]
    fn test_bank_number_label() {
        let config = bank_config::get_bank_config("Microcosm").unwrap();
        
        let bank = BankNumber::new(45, &config).unwrap();
        let label = bank.label();
        
        // Label should start with "Bank "
        assert!(label.starts_with("Bank "));
    }
    
    #[test]
    fn test_bank_number_color() {
        let config = bank_config::get_bank_config("Microcosm").unwrap();
        
        // Bank 45-48 should be red
        let bank = BankNumber::new(45, &config).unwrap();
        assert_eq!(bank.color(), "red");
    }
    
    #[test]
    fn test_bank_slot_new() {
        let config = bank_config::get_bank_config("Microcosm").unwrap();
        let bank_number = BankNumber::new(45, &config).unwrap();
        
        let slot = BankSlot::new(bank_number);
        
        assert_eq!(slot.bank_number, 45);
        assert!(slot.bank_label.starts_with("Bank "));
        assert_eq!(slot.color, "red");
        assert!(slot.preset.is_none());
        assert!(slot.synced_at.is_none());
    }
    
    #[test]
    fn test_bank_slot_with_preset() {
        let config = bank_config::get_bank_config("Microcosm").unwrap();
        let bank_number = BankNumber::new(45, &config).unwrap();
        
        let preset = Preset {
            id: PresetId::generate(),
            name: "Test Preset".to_string(),
            pedal_type: "microcosm".to_string(),
            description: None,
            parameters: serde_json::json!({}),
            tags: vec![],
            is_favorite: false,
            created_at: 0,
            updated_at: 0,
        };
        
        let synced_at = chrono::Utc::now().timestamp();
        let slot = BankSlot::with_preset(bank_number, preset.clone(), synced_at);
        
        assert_eq!(slot.bank_number, 45);
        assert!(slot.preset.is_some());
        assert_eq!(slot.preset.unwrap().name, "Test Preset");
        assert_eq!(slot.synced_at, Some(synced_at));
    }
    
    #[test]
    fn test_preset_filter_default() {
        let filter = PresetFilter::default();
        
        assert!(filter.pedal_type.is_none());
        assert_eq!(filter.tags.len(), 0);
        assert!(filter.is_favorite.is_none());
        assert!(filter.search_query.is_none());
    }
    
    #[test]
    fn test_preset_serialization() {
        let preset = Preset {
            id: PresetId::new("test-id".to_string()),
            name: "Test Preset".to_string(),
            pedal_type: "microcosm".to_string(),
            description: Some("A test preset".to_string()),
            parameters: serde_json::json!({"activity": 64}),
            tags: vec!["ambient".to_string(), "experimental".to_string()],
            is_favorite: true,
            created_at: 1234567890,
            updated_at: 1234567890,
        };
        
        // Serialize to JSON
        let json = serde_json::to_string(&preset).unwrap();
        
        // Deserialize back
        let deserialized: Preset = serde_json::from_str(&json).unwrap();
        
        assert_eq!(deserialized.id, preset.id);
        assert_eq!(deserialized.name, preset.name);
        assert_eq!(deserialized.pedal_type, preset.pedal_type);
        assert_eq!(deserialized.tags.len(), 2);
        assert!(deserialized.is_favorite);
    }
    
    #[test]
    fn test_preset_error_display() {
        let err = PresetError::NotFound {
            id: "test-id".to_string(),
        };
        assert_eq!(format!("{}", err), "Preset not found: test-id");
        
        let err = PresetError::DuplicateName {
            name: "My Preset".to_string(),
        };
        assert_eq!(format!("{}", err), "Preset name already exists: My Preset");
        
        let err = PresetError::InvalidBankNumber {
            value: 100,
            min: 45,
            max: 60,
        };
        assert_eq!(
            format!("{}", err),
            "Invalid bank number: 100 (must be between 45 and 60)"
        );
        
        let err = PresetError::InvalidName {
            reason: "Name cannot be empty".to_string(),
        };
        assert_eq!(format!("{}", err), "Invalid preset name: Name cannot be empty");
    }
}

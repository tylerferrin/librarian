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

/// Bank number - value object for Microcosm user banks (45-60)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct BankNumber(u8);

impl BankNumber {
    pub fn new(value: u8) -> std::result::Result<Self, PresetError> {
        if (45..=60).contains(&value) {
            Ok(Self(value))
        } else {
            Err(PresetError::InvalidBankNumber {
                value,
                min: 45,
                max: 60,
            })
        }
    }
    
    pub fn value(&self) -> u8 {
        self.0
    }
    
    /// Get bank label (e.g., "Bank 1A", "Bank 2C")
    pub fn label(&self) -> String {
        let bank_index = (self.0 - 45) / 4 + 1;  // 1-4
        let slot_index = (self.0 - 45) % 4;       // 0-3
        let slot_letter = char::from(b'A' + slot_index);
        format!("Bank {}{}", bank_index, slot_letter)
    }
    
    /// Get bank color based on bank number
    pub fn color(&self) -> &'static str {
        match (self.0 - 45) / 4 {
            0 => "red",
            1 => "yellow",
            2 => "green",
            3 => "blue",
            _ => "gray",
        }
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

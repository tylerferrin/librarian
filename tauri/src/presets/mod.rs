// Presets bounded context - aggregate root
// Handles preset management and pedal bank tracking

mod types;
mod repository;
mod bank_tracker;

pub use types::*;
use repository::PresetRepository;
use bank_tracker::BankTracker;

use std::path::PathBuf;
use std::sync::{Arc, Mutex};

/// Preset library - aggregate root for preset management
pub struct PresetLibrary {
    repository: Arc<PresetRepository>,
    bank_tracker: BankTracker,
}

impl PresetLibrary {
    /// Create a new preset library with the given database path
    pub fn new(db_path: PathBuf) -> Result<Self> {
        let repository = Arc::new(PresetRepository::new(db_path)?);
        let bank_tracker = BankTracker::new(Arc::clone(&repository));
        
        Ok(Self {
            repository,
            bank_tracker,
        })
    }
    
    /// Save a new preset or update an existing one
    pub fn save_preset(
        &self,
        name: String,
        pedal_type: String,
        description: Option<String>,
        parameters: serde_json::Value,
        tags: Vec<String>,
    ) -> Result<Preset> {
        // Validate name
        let trimmed_name = name.trim().to_string();
        if trimmed_name.is_empty() {
            return Err(PresetError::InvalidName {
                reason: "Name cannot be empty".to_string(),
            });
        }
        
        if trimmed_name.len() > 100 {
            return Err(PresetError::InvalidName {
                reason: "Name too long (max 100 characters)".to_string(),
            });
        }
        
        // Check for duplicate name
        if self.repository.find_by_name(&trimmed_name)?.is_some() {
            return Err(PresetError::DuplicateName {
                name: trimmed_name,
            });
        }
        
        let now = chrono::Utc::now().timestamp();
        let preset = Preset {
            id: PresetId::generate(),
            name: trimmed_name,
            pedal_type,
            description,
            parameters,
            tags,
            is_favorite: false,
            created_at: now,
            updated_at: now,
        };
        
        self.repository.save(&preset)?;
        
        Ok(preset)
    }
    
    /// Update an existing preset
    pub fn update_preset(
        &self,
        id: &PresetId,
        name: Option<String>,
        description: Option<String>,
        tags: Option<Vec<String>>,
        is_favorite: Option<bool>,
    ) -> Result<Preset> {
        let mut preset = self
            .repository
            .find_by_id(id)?
            .ok_or_else(|| PresetError::NotFound {
                id: id.to_string(),
            })?;
        
        if let Some(name) = name {
            let trimmed_name = name.trim().to_string();
            if trimmed_name.is_empty() {
                return Err(PresetError::InvalidName {
                    reason: "Name cannot be empty".to_string(),
                });
            }
            
            // Check for duplicate name (excluding current preset)
            if let Some(existing) = self.repository.find_by_name(&trimmed_name)? {
                if existing.id != *id {
                    return Err(PresetError::DuplicateName {
                        name: trimmed_name,
                    });
                }
            }
            
            preset.name = trimmed_name;
        }
        
        if let Some(desc) = description {
            preset.description = if desc.is_empty() { None } else { Some(desc) };
        }
        
        if let Some(tags) = tags {
            preset.tags = tags;
        }
        
        if let Some(fav) = is_favorite {
            preset.is_favorite = fav;
        }
        
        preset.updated_at = chrono::Utc::now().timestamp();
        
        self.repository.save(&preset)?;
        
        Ok(preset)
    }
    
    /// Get a preset by ID
    pub fn get_preset(&self, id: &PresetId) -> Result<Preset> {
        self.repository
            .find_by_id(id)?
            .ok_or_else(|| PresetError::NotFound {
                id: id.to_string(),
            })
    }
    
    /// List all presets with optional filtering
    pub fn list_presets(&self, filter: PresetFilter) -> Result<Vec<Preset>> {
        self.repository.list(&filter)
    }
    
    /// Delete a preset
    pub fn delete_preset(&self, id: &PresetId) -> Result<()> {
        self.repository.delete(id)
    }
    
    /// Toggle favorite status
    pub fn toggle_favorite(&self, id: &PresetId) -> Result<Preset> {
        let preset = self.get_preset(id)?;
        self.repository.set_favorite(id, !preset.is_favorite)?;
        self.get_preset(id)
    }
    
    /// Get the state of all pedal banks
    pub fn get_bank_state(&self, pedal_type: &str) -> Result<Vec<BankSlot>> {
        // Microcosm user banks are PC 45-60
        self.bank_tracker.get_bank_state(pedal_type, 45..=60)
    }
    
    /// Assign a preset to a specific pedal bank
    pub fn assign_to_bank(&self, pedal_type: &str, bank_number: u8, preset_id: &PresetId) -> Result<()> {
        let bank = BankNumber::new(bank_number)?;
        self.bank_tracker.assign_to_bank(pedal_type, bank, preset_id)
    }
    
    /// Clear a bank assignment
    pub fn clear_bank(&self, pedal_type: &str, bank_number: u8) -> Result<()> {
        let bank = BankNumber::new(bank_number)?;
        self.bank_tracker.clear_bank(pedal_type, bank)
    }
    
    /// Get the preset assigned to a specific bank
    pub fn get_bank_preset(&self, pedal_type: &str, bank_number: u8) -> Result<Option<Preset>> {
        let bank = BankNumber::new(bank_number)?;
        self.bank_tracker.get_bank_preset(pedal_type, bank)
    }
}

/// Create a shared preset library for use in Tauri state management
pub type SharedPresetLibrary = Arc<Mutex<PresetLibrary>>;

pub fn create_shared_library(db_path: PathBuf) -> Result<SharedPresetLibrary> {
    let library = PresetLibrary::new(db_path)?;
    Ok(Arc::new(Mutex::new(library)))
}

// Bank tracker - domain service for managing pedal bank assignments
use super::types::*;
use super::repository::PresetRepository;
use std::sync::Arc;

/// Domain service for tracking which presets are assigned to which banks
pub struct BankTracker {
    repository: Arc<PresetRepository>,
}

impl BankTracker {
    pub fn new(repository: Arc<PresetRepository>) -> Self {
        Self { repository }
    }
    
    /// Get the state of all banks for a pedal type with its bank configuration
    pub fn get_bank_state(
        &self, 
        pedal_type: &str, 
        bank_range: std::ops::RangeInclusive<u8>,
        config: &crate::presets::bank_config::BankConfig
    ) -> Result<Vec<BankSlot>> {
        // Get all bank assignments from database
        let assignments = self.repository.get_bank_assignments(pedal_type)?;
        
        // Create a map for quick lookup
        let assignment_map: std::collections::HashMap<_, _> = assignments
            .into_iter()
            .map(|(bank_num, preset_id, synced_at)| (bank_num, (preset_id, synced_at)))
            .collect();
        
        // Build bank slots for the entire range
        let mut bank_slots = Vec::new();
        
        for bank_num in bank_range {
            let bank_number = BankNumber::new(bank_num, config)?;
            
            if let Some((Some(preset_id), Some(synced_at))) = assignment_map.get(&bank_num) {
                // Bank has an assigned preset - fetch it
                if let Some(preset) = self.repository.find_by_id(preset_id)? {
                    bank_slots.push(BankSlot::with_preset(bank_number, preset, *synced_at));
                } else {
                    // Preset was deleted but bank assignment still exists - create empty slot
                    bank_slots.push(BankSlot::new(bank_number));
                }
            } else {
                // Empty bank slot
                bank_slots.push(BankSlot::new(bank_number));
            }
        }
        
        Ok(bank_slots)
    }
    
    /// Assign a preset to a specific bank
    pub fn assign_to_bank(&self, pedal_type: &str, bank_number: u8, preset_id: &PresetId) -> Result<()> {
        // Verify the preset exists
        self.repository
            .find_by_id(preset_id)?
            .ok_or_else(|| PresetError::NotFound {
                id: preset_id.to_string(),
            })?;
        
        // Assign to bank
        self.repository.assign_to_bank(pedal_type, bank_number, preset_id)?;
        
        Ok(())
    }
    
    /// Clear a bank assignment (mark as empty)
    pub fn clear_bank(&self, pedal_type: &str, bank_number: u8) -> Result<()> {
        self.repository.clear_bank(pedal_type, bank_number)?;
        Ok(())
    }
    
    /// Get the preset assigned to a specific bank (if any)
    pub fn get_bank_preset(&self, pedal_type: &str, bank_number: u8) -> Result<Option<Preset>> {
        let assignments = self.repository.get_bank_assignments(pedal_type)?;
        
        for (bank_num, preset_id, _synced_at) in assignments {
            if bank_num == bank_number {
                if let Some(preset_id) = preset_id {
                    return self.repository.find_by_id(&preset_id);
                }
            }
        }
        
        Ok(None)
    }
}

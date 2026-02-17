// Test data builders - provides fluent API for creating test data

use crate::presets::{Preset, PresetId};
use crate::midi::pedals::microcosm::MicrocosmState;
use crate::midi::pedals::gen_loss_mkii::GenLossMkiiState;
use crate::midi::pedals::chroma_console::ChromaConsoleState;

/// Builder for creating test Presets
pub struct PresetBuilder {
    id: Option<String>,
    name: String,
    pedal_type: String,
    description: Option<String>,
    parameters: serde_json::Value,
    tags: Vec<String>,
    is_favorite: bool,
    created_at: i64,
    updated_at: i64,
}

impl PresetBuilder {
    pub fn new() -> Self {
        Self {
            id: None,
            name: "Test Preset".to_string(),
            pedal_type: "microcosm".to_string(),
            description: None,
            parameters: serde_json::json!({}),
            tags: vec![],
            is_favorite: false,
            created_at: chrono::Utc::now().timestamp(),
            updated_at: chrono::Utc::now().timestamp(),
        }
    }
    
    pub fn with_id(mut self, id: String) -> Self {
        self.id = Some(id);
        self
    }
    
    pub fn with_name(mut self, name: impl Into<String>) -> Self {
        self.name = name.into();
        self
    }
    
    pub fn with_pedal_type(mut self, pedal_type: impl Into<String>) -> Self {
        self.pedal_type = pedal_type.into();
        self
    }
    
    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }
    
    pub fn with_parameters(mut self, parameters: serde_json::Value) -> Self {
        self.parameters = parameters;
        self
    }
    
    pub fn with_tags(mut self, tags: Vec<String>) -> Self {
        self.tags = tags;
        self
    }
    
    pub fn with_favorite(mut self, is_favorite: bool) -> Self {
        self.is_favorite = is_favorite;
        self
    }
    
    pub fn build(self) -> Preset {
        Preset {
            id: PresetId::new(self.id.unwrap_or_else(|| uuid::Uuid::new_v4().to_string())),
            name: self.name,
            pedal_type: self.pedal_type,
            description: self.description,
            parameters: self.parameters,
            tags: self.tags,
            is_favorite: self.is_favorite,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

impl Default for PresetBuilder {
    fn default() -> Self {
        Self::new()
    }
}

/// Helper to create a test Microcosm state
pub fn test_microcosm_state() -> MicrocosmState {
    MicrocosmState::default()
}

/// Helper to create a test Gen Loss MKII state
pub fn test_gen_loss_state() -> GenLossMkiiState {
    GenLossMkiiState::default()
}

/// Helper to create a test Chroma Console state
pub fn test_chroma_console_state() -> ChromaConsoleState {
    ChromaConsoleState::default()
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_preset_builder_defaults() {
        let preset = PresetBuilder::new().build();
        assert_eq!(preset.name, "Test Preset");
        assert_eq!(preset.pedal_type, "microcosm");
        assert_eq!(preset.tags.len(), 0);
        assert!(!preset.is_favorite);
    }
    
    #[test]
    fn test_preset_builder_with_custom_values() {
        let preset = PresetBuilder::new()
            .with_name("My Preset")
            .with_pedal_type("gen-loss-mkii")
            .with_description("A test preset")
            .with_tags(vec!["ambient".to_string(), "experimental".to_string()])
            .with_favorite(true)
            .build();
        
        assert_eq!(preset.name, "My Preset");
        assert_eq!(preset.pedal_type, "gen-loss-mkii");
        assert_eq!(preset.description, Some("A test preset".to_string()));
        assert_eq!(preset.tags.len(), 2);
        assert!(preset.is_favorite);
    }
}

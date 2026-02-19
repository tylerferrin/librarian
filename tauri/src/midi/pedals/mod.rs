// Pedal-specific MIDI definitions and implementations

pub mod microcosm;
pub mod gen_loss_mkii;
pub mod chroma_console;
pub mod preamp_mk2;
pub mod cxm1978;

pub use microcosm::Microcosm;
pub use gen_loss_mkii::GenLossMkii;
pub use chroma_console::ChromaConsole;
pub use preamp_mk2::PreampMk2;
pub use cxm1978::Cxm1978;

use std::collections::HashMap;

/// Metadata describing a pedal's capabilities
#[derive(Debug, Clone)]
pub struct PedalMetadata {
    pub name: &'static str,
    pub manufacturer: &'static str,
    pub supports_editor: bool,
    pub supports_preset_library: bool,
}

/// Trait that all pedal implementations must implement
/// This enforces a consistent interface across all supported pedals
pub trait PedalCapabilities {
    /// Associated types for pedal-specific state and parameters
    type State: Clone;
    type Parameter: Clone;
    
    /// Get pedal metadata (name, manufacturer, capabilities)
    fn metadata(&self) -> PedalMetadata;
    
    /// Does this pedal support program change messages?
    fn supports_program_change(&self) -> bool {
        true // Most pedals support this
    }
    
    /// Get the MIDI channel this pedal is configured for
    fn midi_channel(&self) -> u8;
    
    /// Get the current state
    fn state(&self) -> &Self::State;
    
    /// Update internal state from a parameter change
    fn update_state(&mut self, param: &Self::Parameter);
    
    /// Convert current state to a map of CC numbers to values
    /// Used for recalling presets (sending all parameters at once)
    fn state_as_cc_map(&self) -> HashMap<u8, u8>;
    
    /// Load a preset by program change number (if supported)
    fn load_preset(&mut self, program: u8) {
        let _ = program; // Default: no-op
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    /// Compile-time check: All pedals must implement PedalCapabilities
    #[test]
    fn all_pedals_implement_capabilities() {
        let microcosm = Microcosm::new(1);
        let _metadata = microcosm.metadata();
        let _supports_pc = microcosm.supports_program_change();
        
        let gen_loss = GenLossMkii::new(1);
        let _metadata = gen_loss.metadata();
        let _supports_pc = gen_loss.supports_program_change();
        
        let chroma = ChromaConsole::new(1);
        let _metadata = chroma.metadata();
        let _supports_pc = chroma.supports_program_change();

        let cxm = Cxm1978::new(2);
        let _metadata = cxm.metadata();
        let _supports_pc = cxm.supports_program_change();
    }
}

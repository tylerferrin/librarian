// MIDI module for Librarian
// Handles MIDI device detection, connection, and communication

pub mod device_detection;
pub mod error;
pub mod identity;
pub mod manager;
pub mod pedals;

// Re-export commonly used types
pub use device_detection::{list_midi_devices, MidiDeviceInfo};
pub use error::{MidiError, MidiResult};
pub use identity::{request_device_identity, DeviceIdentity};
pub use manager::{MidiManager, SharedMidiManager, create_shared_manager, ConnectedDevice, PedalType};
pub use pedals::{Microcosm, GenLossMkii};

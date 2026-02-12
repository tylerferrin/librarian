// MIDI error types for the Librarian application

use thiserror::Error;

/// Errors that can occur during MIDI operations
#[derive(Debug, Error)]
pub enum MidiError {
    /// Device is not currently connected
    #[error("Device not connected: {0}")]
    NotConnected(String),

    /// Invalid parameter value provided
    #[error("Invalid parameter value: expected {expected}, got {actual}")]
    InvalidValue { expected: String, actual: u8 },

    /// MIDI communication error
    #[error("MIDI communication error: {0}")]
    CommunicationError(String),

    /// Device not found during enumeration
    #[error("Device not found: {0}")]
    DeviceNotFound(String),

    /// Failed to create MIDI connection
    #[error("Failed to connect to device: {0}")]
    ConnectionFailed(String),

    /// Failed to send MIDI message
    #[error("Failed to send MIDI message: {0}")]
    SendFailed(String),

    /// Port error from midir
    #[error("MIDI port error: {0}")]
    PortError(String),

    /// Device is already connected
    #[error("Device already connected: {0}")]
    AlreadyConnected(String),

    /// Invalid MIDI channel (must be 1-16)
    #[error("Invalid MIDI channel: {0} (must be 1-16)")]
    InvalidChannel(u8),

    /// Generic MIDI error
    #[error("MIDI error: {0}")]
    Other(String),
}

/// Result type for MIDI operations
pub type MidiResult<T> = Result<T, MidiError>;

impl From<midir::ConnectError<midir::MidiInput>> for MidiError {
    fn from(err: midir::ConnectError<midir::MidiInput>) -> Self {
        MidiError::ConnectionFailed(err.to_string())
    }
}

impl From<midir::ConnectError<midir::MidiOutput>> for MidiError {
    fn from(err: midir::ConnectError<midir::MidiOutput>) -> Self {
        MidiError::ConnectionFailed(err.to_string())
    }
}

impl From<midir::SendError> for MidiError {
    fn from(err: midir::SendError) -> Self {
        MidiError::SendFailed(err.to_string())
    }
}

impl From<midir::InitError> for MidiError {
    fn from(err: midir::InitError) -> Self {
        MidiError::Other(err.to_string())
    }
}

// Mock MIDI infrastructure for testing without hardware

use std::sync::{Arc, Mutex};

/// Mock MIDI message
#[derive(Debug, Clone, PartialEq)]
pub enum MockMidiMessage {
    ControlChange { cc: u8, value: u8 },
    ProgramChange { program: u8 },
}

/// Mock MIDI connection that records sent messages
#[derive(Debug, Clone)]
pub struct MockMidiConnection {
    pub channel: u8,
    pub messages: Arc<Mutex<Vec<MockMidiMessage>>>,
}

impl MockMidiConnection {
    pub fn new(channel: u8) -> Self {
        Self {
            channel,
            messages: Arc::new(Mutex::new(Vec::new())),
        }
    }
    
    /// Send a CC message (records it)
    pub fn send_cc(&mut self, cc: u8, value: u8) {
        self.messages
            .lock()
            .unwrap()
            .push(MockMidiMessage::ControlChange { cc, value });
    }
    
    /// Send a program change (records it)
    pub fn send_program_change(&mut self, program: u8) {
        self.messages
            .lock()
            .unwrap()
            .push(MockMidiMessage::ProgramChange { program });
    }
    
    /// Get all recorded messages
    pub fn get_messages(&self) -> Vec<MockMidiMessage> {
        self.messages.lock().unwrap().clone()
    }
    
    /// Clear recorded messages
    pub fn clear_messages(&mut self) {
        self.messages.lock().unwrap().clear();
    }
    
    /// Get the count of recorded messages
    pub fn message_count(&self) -> usize {
        self.messages.lock().unwrap().len()
    }
    
    /// Find a specific CC message
    pub fn find_cc(&self, cc: u8) -> Option<u8> {
        self.messages
            .lock()
            .unwrap()
            .iter()
            .find_map(|msg| match msg {
                MockMidiMessage::ControlChange { cc: msg_cc, value } if *msg_cc == cc => {
                    Some(*value)
                }
                _ => None,
            })
    }
    
    /// Find all CC messages
    pub fn find_all_cc(&self, cc: u8) -> Vec<u8> {
        self.messages
            .lock()
            .unwrap()
            .iter()
            .filter_map(|msg| match msg {
                MockMidiMessage::ControlChange { cc: msg_cc, value } if *msg_cc == cc => {
                    Some(*value)
                }
                _ => None,
            })
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_mock_midi_connection_sends_cc() {
        let mut conn = MockMidiConnection::new(1);
        
        conn.send_cc(20, 64);
        conn.send_cc(21, 127);
        
        let messages = conn.get_messages();
        assert_eq!(messages.len(), 2);
        assert_eq!(
            messages[0],
            MockMidiMessage::ControlChange { cc: 20, value: 64 }
        );
        assert_eq!(
            messages[1],
            MockMidiMessage::ControlChange { cc: 21, value: 127 }
        );
    }
    
    #[test]
    fn test_mock_midi_connection_sends_program_change() {
        let mut conn = MockMidiConnection::new(1);
        
        conn.send_program_change(5);
        
        let messages = conn.get_messages();
        assert_eq!(messages.len(), 1);
        assert_eq!(messages[0], MockMidiMessage::ProgramChange { program: 5 });
    }
    
    #[test]
    fn test_mock_midi_connection_find_cc() {
        let mut conn = MockMidiConnection::new(1);
        
        conn.send_cc(20, 64);
        conn.send_cc(21, 127);
        
        assert_eq!(conn.find_cc(20), Some(64));
        assert_eq!(conn.find_cc(21), Some(127));
        assert_eq!(conn.find_cc(22), None);
    }
    
    #[test]
    fn test_mock_midi_connection_clear_messages() {
        let mut conn = MockMidiConnection::new(1);
        
        conn.send_cc(20, 64);
        assert_eq!(conn.message_count(), 1);
        
        conn.clear_messages();
        assert_eq!(conn.message_count(), 0);
    }
}

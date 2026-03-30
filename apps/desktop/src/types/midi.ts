// Shared TypeScript interfaces for MIDI components
// Re-export from the main MIDI lib for backwards compatibility
export type { DeviceInfo, PedalType } from '../lib/midi/types';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

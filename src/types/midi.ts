// Shared TypeScript interfaces for MIDI components
// Re-export DeviceInfo from the main MIDI lib for backwards compatibility
export type { DeviceInfo } from '../lib/midi';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

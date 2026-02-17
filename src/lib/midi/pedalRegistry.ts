// Plugin registry for pedal discovery
// This infrastructure layer has no pedal-specific knowledge

import type { BankConfig } from '../presets/types';

export interface PedalDefinition {
  type: string;
  name: string;
  manufacturer: string;
  icon: string;
  color: string;
  hasEditor: boolean;
  bankConfig?: BankConfig; // Optional - only for pedals with preset banks
}

class PedalRegistry {
  private pedals = new Map<string, PedalDefinition>();
  
  /**
   * Register a pedal definition
   * Called by pedal modules during initialization
   */
  register(definition: PedalDefinition): void {
    this.pedals.set(definition.type, definition);
  }
  
  /**
   * Get all registered pedal definitions
   */
  getAll(): PedalDefinition[] {
    return Array.from(this.pedals.values());
  }
  
  /**
   * Get a specific pedal definition by type
   */
  get(type: string): PedalDefinition | undefined {
    return this.pedals.get(type);
  }
  
  /**
   * Check if a pedal type is registered
   */
  has(type: string): boolean {
    return this.pedals.has(type);
  }
}

export const pedalRegistry = new PedalRegistry();

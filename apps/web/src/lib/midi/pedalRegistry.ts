// Plugin registry for pedal discovery

import type { BankConfig } from '../presets/types';

export interface PedalDefinition {
  type: string;
  name: string;
  manufacturer: string;
  icon: string;
  color: string;
  hasEditor: boolean;
  defaultMidiChannel?: number;
  bankConfig?: BankConfig;
}

class PedalRegistry {
  private pedals = new Map<string, PedalDefinition>();

  register(definition: PedalDefinition): void {
    this.pedals.set(definition.type, definition);
  }

  getAll(): PedalDefinition[] {
    return Array.from(this.pedals.values());
  }

  get(type: string): PedalDefinition | undefined {
    return this.pedals.get(type);
  }

  has(type: string): boolean {
    return this.pedals.has(type);
  }
}

export const pedalRegistry = new PedalRegistry();

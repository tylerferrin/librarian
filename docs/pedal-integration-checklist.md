# Pedal Integration Checklist

This checklist ensures complete and consistent integration when adding a new pedal to the Librarian application. Following this checklist prevents partial implementations and ensures all features work correctly across pedals.

## Overview

The Librarian system is designed to be modular and extensible. Every pedal must implement a consistent set of interfaces and capabilities to ensure feature parity and prevent bugs from incomplete implementations.

## Prerequisites

Before starting, gather the following information about the pedal:
- [ ] MIDI specification document (CC mappings, program change support, etc.)
- [ ] Number of preset banks and slots
- [ ] Whether the pedal supports MIDI save commands
- [ ] List of all controllable parameters
- [ ] Any special behaviors or limitations

## Phase 1: Rust Backend Implementation

### 1. Create Pedal Module

Create a new module in `tauri/src/midi/pedals/`:

**For simple pedals (single file):**
- [ ] Create `tauri/src/midi/pedals/pedal_name.rs`

**For complex pedals (directory structure):**
- [ ] Create `tauri/src/midi/pedals/pedal_name/` directory
- [ ] Create `mod.rs` - main pedal struct and implementation
- [ ] Create `types.rs` - state and parameter enums
- [ ] Create `mapper.rs` - CC number mapping logic

### 2. Define Core Types

In your pedal module, define:

- [ ] **Pedal Struct**: Main struct containing `state` and `midi_channel`
  ```rust
  pub struct PedalName {
      pub state: PedalNameState,
      pub midi_channel: u8,
  }
  ```

- [ ] **State Struct**: Complete state with all parameters (must derive `Clone, Serialize, Deserialize`)
  ```rust
  #[derive(Debug, Clone, Serialize, Deserialize)]
  pub struct PedalNameState {
      // All controllable parameters
  }
  ```

- [ ] **Parameter Enum**: All possible parameters (must derive `Clone, Serialize, Deserialize`)
  ```rust
  #[derive(Debug, Clone, Serialize, Deserialize)]
  pub enum PedalNameParameter {
      // All parameters with their values
  }
  ```

### 3. Implement Core Methods

- [ ] `new(midi_channel: u8) -> Self` - Constructor with default state
- [ ] `update_state(&mut self, param: &PedalNameParameter)` - Update state from parameter changes
- [ ] `state_as_cc_map(&self) -> HashMap<u8, u8>` - Convert state to CC map for preset recall
- [ ] `load_preset(&mut self, program: u8)` - Handle program change (if supported)

### 4. Implement PedalCapabilities Trait

**MANDATORY** - This enforces compile-time checking:

```rust
impl super::PedalCapabilities for PedalName {
    type State = PedalNameState;
    type Parameter = PedalNameParameter;
    
    fn metadata(&self) -> super::PedalMetadata {
        super::PedalMetadata {
            name: "PedalName",
            manufacturer: "Manufacturer Name",
            supports_editor: true,  // Set based on your implementation
            supports_preset_library: true,  // Set based on your implementation
        }
    }
    
    fn supports_program_change(&self) -> bool {
        true  // or false
    }
    
    fn midi_channel(&self) -> u8 {
        self.midi_channel
    }
    
    fn state(&self) -> &Self::State {
        &self.state
    }
    
    fn update_state(&mut self, param: &Self::Parameter) {
        self.update_state(param)
    }
    
    fn state_as_cc_map(&self) -> HashMap<u8, u8> {
        self.state_as_cc_map()
    }
    
    fn load_preset(&mut self, program: u8) {
        self.load_preset(program)
    }
}
```

- [ ] Implemented `PedalCapabilities` trait
- [ ] Verified compilation passes

### 5. Register in Pedals Module

In `tauri/src/midi/pedals/mod.rs`:

- [ ] Add module declaration: `pub mod pedal_name;`
- [ ] Export pedal struct: `pub use pedal_name::PedalName;`

### 6. Add to MIDI Manager

In `tauri/src/midi/manager.rs`:

- [ ] Import pedal types: `use crate::midi::pedals::pedal_name::*;`
- [ ] Add pedal field to `MidiManager`: `pedal_name: Option<PedalName>,`
- [ ] Initialize in `new()`: `pedal_name: None,`
- [ ] Add device detection in `update_devices()` method
- [ ] Implement `send_pedal_name_parameter()` method
- [ ] Implement `recall_pedal_name_preset()` method
- [ ] If program change supported: Implement `send_pedal_name_program_change()` method

### 7. Add Tauri Commands

In `tauri/src/commands.rs`:

- [ ] Add command for sending parameters
- [ ] Add command for recalling presets
- [ ] Add command for program change (if supported)
- [ ] Update `save_preset_to_bank` match statement with pedal-specific logic

In `tauri/src/lib.rs`:

- [ ] Register all new commands in `.invoke_handler()`

### 8. Define Bank Configuration (if preset library supported)

**MANDATORY** if the pedal supports preset library:

In `tauri/src/presets/bank_config.rs`, add to `get_bank_config()`:

- [ ] Define `BankConfig` with all required fields:
  ```rust
  "PedalName" => Some(BankConfig {
      program_change_start: 0,  // First PC number
      program_change_end: 79,   // Last PC number
      num_banks: 4,             // Number of bank groups
      slots_per_bank: 20,       // Slots per bank group
      bank_labels: vec!["A", "B", "C", "D"],  // Bank labels
      bank_colors: vec!["red", "orange", "green", "blue"],  // Bank colors
      midi_save: MidiSaveCapability::Supported {  // Choose appropriate type
          cc_number: 46,
          description: "CC 46 - Preset Save".to_string(),
      },
      // OR MidiSaveCapability::ManualOnly {
      //     instructions: "Press and hold...".to_string(),
      // }
      // OR MidiSaveCapability::AutoSave
  }),
  ```

- [ ] Run test: `cargo test presets::bank_config::tests::all_pedals_with_library_have_bank_config`
- [ ] Verify test passes

## Phase 2: TypeScript Frontend Implementation

### 9. Create Pedal Definition

Create `/src/lib/midi/pedals/pedal_name/definition.ts`:

- [ ] Define `PedalDefinition` with `bankConfig`:
  ```typescript
  export const pedalNameDefinition: PedalDefinition = {
    type: 'PedalName',
    name: 'Pedal Display Name',
    manufacturer: 'Manufacturer Name',
    icon: '/pedals/pedal-icon.svg',
    color: '#hexcolor',
    hasEditor: true,
    bankConfig: {
      programChangeStart: 0,
      programChangeEnd: 79,
      numBanks: 4,
      slotsPerBank: 20,
      bankLabels: ['A', 'B', 'C', 'D'],
      bankColors: ['red', 'orange', 'green', 'blue'],
      midiSave: {
        type: 'supported',
        ccNumber: 46,
        description: 'CC 46 - Preset Save'
      }
    }
  };
  ```

### 10. Create Type Definitions

Create `/src/lib/midi/pedals/pedal_name/types.ts`:

- [ ] Define `PedalNameState` interface (must match Rust struct)
- [ ] Define `PedalNameParameter` enum/type (must match Rust enum)
- [ ] Export all types

### 11. Create API Functions

Create `/src/lib/midi/pedals/pedal_name/api.ts`:

- [ ] `sendPedalNameParameter()` - wrapper for Tauri command
- [ ] `recallPedalNamePreset()` - wrapper for Tauri command
- [ ] `sendPedalNameProgramChange()` - wrapper for Tauri command (if supported)

### 12. Register in Pedal Registry

In `/src/lib/midi/pedalRegistry.ts`:

- [ ] Import definition: `import { pedalNameDefinition } from './pedals/pedal_name/definition';`
- [ ] Add to registry: `pedalNameDefinition,`

### 13. Create Editor Component (if hasEditor: true)

Create `/src/components/pedals/pedal_name/PedalNameEditor.tsx`:

- [ ] Create editor component with all parameter controls
- [ ] Use `useDeviceState` hook for state management
- [ ] Import from `/src/lib/midi/pedals/pedal_name`
- [ ] Handle preset save/recall
- [ ] Handle manual save instructions (if applicable)

### 14. Register Editor Route

In `/src/components/pedals/index.tsx`:

- [ ] Import editor component
- [ ] Add to `PEDAL_EDITORS` registry

## Phase 3: Testing & Verification

### 15. Run Automated Tests

- [ ] **Backend compilation**: `cd tauri && cargo build`
- [ ] **Trait implementation test**: `cargo test pedals::tests::all_pedals_implement_capabilities`
- [ ] **Bank config test**: `cargo test presets::bank_config::tests::all_pedals_with_library_have_bank_config`
- [ ] **All tests**: `cargo test`
- [ ] **Frontend compilation**: `npm run build`
- [ ] **TypeScript checks**: `npm run type-check`
- [ ] **Linting**: `npm run lint`

### 16. Manual Testing

With physical pedal connected:

- [ ] **Device Detection**: Pedal is detected and shown in device list
- [ ] **Editor**: All parameters control the pedal correctly
- [ ] **Preset Save**: Can save current state to app preset library
- [ ] **Preset Recall**: Can recall saved presets from library
- [ ] **Bank Assignment**: Can assign presets to bank slots
- [ ] **Save to Bank**: Can save preset to pedal bank (loads preset, sends save command or shows manual instructions)
- [ ] **Manual Save Instructions**: If manual save required, modal shows correct instructions
- [ ] **Preset Manager**: Bank view shows correct number of slots with correct labels and colors
- [ ] **Program Change**: If supported, can recall pedal's internal presets

Without physical pedal:

- [ ] **Editor Mock Mode**: Editor works in mock mode for development
- [ ] **No Crashes**: App doesn't crash when pedal not connected

## Phase 4: Documentation

### 17. Create Manual

Create `/docs/manuals/pedal-name.md`:

- [ ] Overview and features
- [ ] MIDI specification details
- [ ] Bank/preset structure
- [ ] Special behaviors or limitations
- [ ] CC parameter mapping table
- [ ] Program change mapping (if supported)

### 18. Update Main Documentation

- [ ] Update `/docs/README.md` with link to manual
- [ ] Add pedal to supported devices list
- [ ] Add screenshots to `/docs/screenshots/`

## Common Pitfalls to Avoid

❌ **Don't**:
- Forget to implement `PedalCapabilities` trait
- Forget to define `BankConfig` for pedals with preset library
- Hardcode pedal-specific logic in shared code
- Mix up frontend and backend type definitions
- Skip tests
- Forget to register Tauri commands
- Use different field names between Rust and TypeScript

✅ **Do**:
- Follow the DDD module pattern (types.rs → repository.rs → mod.rs → commands.rs)
- Use the trait system for compile-time enforcement
- Match Rust and TypeScript types exactly
- Test with and without physical hardware
- Document MIDI specifications thoroughly
- Use `BankConfig` for dynamic bank rendering

## Quick Reference: Required Files

**Backend (Rust)**:
- `tauri/src/midi/pedals/pedal_name/mod.rs` (or `.rs`)
- `tauri/src/midi/pedals/pedal_name/types.rs`
- `tauri/src/midi/pedals/pedal_name/mapper.rs`
- Updates to `tauri/src/midi/pedals/mod.rs`
- Updates to `tauri/src/midi/manager.rs`
- Updates to `tauri/src/commands.rs`
- Updates to `tauri/src/lib.rs`
- Updates to `tauri/src/presets/bank_config.rs`

**Frontend (TypeScript)**:
- `src/lib/midi/pedals/pedal_name/definition.ts`
- `src/lib/midi/pedals/pedal_name/types.ts`
- `src/lib/midi/pedals/pedal_name/api.ts`
- `src/components/pedals/pedal_name/PedalNameEditor.tsx`
- Updates to `src/lib/midi/pedalRegistry.ts`
- Updates to `src/components/pedals/index.tsx`

**Documentation**:
- `docs/manuals/pedal-name.md`
- Updates to `docs/README.md`

## Verification Commands

```bash
# Backend tests
cd tauri
cargo build
cargo test
cargo test pedals::tests::all_pedals_implement_capabilities
cargo test presets::bank_config::tests::all_pedals_with_library_have_bank_config

# Frontend checks
npm run build
npm run type-check
npm run lint

# Full integration test
npm run tauri build
```

## Success Criteria

✅ Your integration is complete when:
1. All checkboxes in this document are checked
2. All automated tests pass
3. Manual testing with hardware works for all features
4. No TypeScript or Rust compiler errors
5. Preset library works correctly with proper bank labels and save behavior
6. Documentation is complete

## Need Help?

- Review existing pedal implementations: Microcosm or ChromaConsole
- Check `PedalCapabilities` trait in `tauri/src/midi/pedals/mod.rs`
- Review `BankConfig` in `tauri/src/presets/bank_config.rs`
- Refer to architecture docs in `/docs/architecture.md`

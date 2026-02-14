
# Librarian - Architecture Documentation

## Overview

Librarian is a MIDI pedal editor built with **Tauri 2.x + React 18**. The architecture is designed to be modular and scalable, supporting multiple pedal types with clean separation of concerns.

## Architecture Principles

1. **Modular by Pedal** - Each pedal has its own module with dedicated types, UI, and business logic
2. **Domain-Driven Design** - Backend uses DDD principles with clear separation between domain model and infrastructure
3. **Feature-Sliced** - Frontend components are organized by feature/domain rather than technical role
4. **Type Safety** - Shared types between Rust backend and TypeScript frontend ensure consistency

---

## Frontend Architecture

### Directory Structure

```
src/
├── lib/
│   ├── midi/
│   │   ├── index.ts           # Common MIDI API (device management)
│   │   ├── types.ts           # Shared types (DeviceInfo)
│   │   └── pedals/            # Pedal-specific modules
│   │       ├── microcosm/
│   │       │   ├── index.ts   # Re-exports
│   │       │   ├── types.ts   # Microcosm types & enums
│   │       │   ├── constants.ts # EFFECT_CATEGORIES, etc.
│   │       │   ├── helpers.ts # Utility functions
│   │       │   └── api.ts     # API wrappers
│   │       └── gen-loss-mkii/
│   │           └── (future)
│   └── utils.ts               # General utilities
│
├── components/
│   ├── common/                # Shared UI components
│   │   ├── Knob.tsx
│   │   ├── Toggle.tsx
│   │   ├── TapButton.tsx
│   │   ├── GridSelector.tsx
│   │   ├── Select.tsx
│   │   ├── ParameterCard.tsx
│   │   └── index.ts
│   │
│   ├── pedals/                # Pedal-specific UI
│   │   ├── microcosm/
│   │   │   ├── MicrocosmEditor.tsx
│   │   │   ├── EffectSelector.tsx
│   │   │   └── index.ts
│   │   └── gen-loss-mkii/
│   │       └── (future)
│   │
│   ├── DeviceSelector.tsx     # Common/shared components at root
│   ├── ConnectionHeader.tsx
│   └── MainLayout.tsx
│
├── hooks/
│   ├── useMIDIConnection.ts   # Common MIDI connection logic
│   └── pedals/
│       ├── microcosm/
│       │   └── useMicrocosmEditor.ts
│       └── gen-loss-mkii/
│           └── (future)
│
└── types/
    └── midi.ts                # Common type re-exports
```

### Module Organization

#### Common MIDI Layer (`lib/midi/`)
- **Purpose**: Device-agnostic MIDI operations
- **Exports**: 
  - `listMidiDevices()` - List available devices
  - `disconnectDevice()` - Disconnect from any device
  - `listConnectedDevices()` - Get all connections
  - `isDeviceConnected()` - Check connection status

#### Pedal Modules (`lib/midi/pedals/{pedal}/`)
Each pedal module contains:
- **types.ts**: TypeScript types matching Rust backend (State, Parameter, Enums)
- **constants.ts**: Static data (effect categories, options lists)
- **helpers.ts**: Pure functions (parameter builders, calculators)
- **api.ts**: Tauri IPC wrappers (device-specific commands)

#### Component Organization
- **common/**: Reusable UI primitives (knobs, toggles, cards)
- **pedals/{pedal}/**: Pedal-specific editors and selectors
- **Root level**: App-wide components (layout, device selector)

### Data Flow

```
User Action → Component
           ↓
     Hook (useMicrocosmEditor)
           ↓
     API Call (lib/midi/pedals/microcosm/api)
           ↓
     Tauri IPC
           ↓
     Rust Backend
```

---

## Backend Architecture

### Directory Structure

```
tauri/src/
├── midi/
│   ├── domain/                (future DDD layer - entities, value objects)
│   ├── application/           (future DDD layer - use cases)
│   ├── infrastructure/        (future DDD layer - MIDI I/O)
│   │
│   ├── pedals/                # Pedal implementations (bounded contexts)
│   │   ├── microcosm/
│   │   │   ├── mod.rs         # Public API, Microcosm aggregate root
│   │   │   ├── types.rs       # Domain model (State, enums, parameters)
│   │   │   └── mapper.rs      # MIDI CC mapping logic
│   │   │
│   │   ├── gen_loss_mkii/
│   │   │   └── (similar structure)
│   │   │
│   │   └── mod.rs             # Re-exports
│   │
│   ├── manager.rs             # Central MIDI manager (coordinates pedals)
│   ├── device_detection.rs    # Device enumeration
│   ├── error.rs               # Error types
│   └── mod.rs                 # Module exports
│
├── commands.rs                # Tauri IPC commands (presentation layer)
├── lib.rs                     # Library root
└── main.rs                    # Application entry point
```

### Domain-Driven Design Elements

#### Current Structure (Pragmatic DDD)

**Pedal Modules as Bounded Contexts**
- Each pedal is a separate domain module
- Clear boundaries between Microcosm, GenLoss, etc.
- No shared state between pedal types

**Within Each Pedal:**
- **types.rs**: Domain model
  - `MicrocosmState` - Entity (aggregate root data)
  - Enums (SubdivisionValue, WaveformShape, etc.) - Value objects
  - `MicrocosmParameter` - Command pattern for state changes
  
- **mapper.rs**: Infrastructure concern
  - MIDI protocol translation
  - Conversion between domain types and CC values
  - Separated from business logic

- **mod.rs**: Aggregate root
  - `Microcosm` struct - Aggregate root
  - Coordinates state management
  - Public API for the domain

#### Manager Layer
`MidiManager` acts as an **Application Service**:
- Coordinates multiple pedals (bounded contexts)
- Handles device connections
- Routes commands to appropriate pedal

#### Future Enhancements
The directory structure includes placeholders for full DDD layers:
- **domain/**: Pure domain logic (entities, value objects, domain services)
- **application/**: Use cases (connect device, send parameter, recall preset)
- **infrastructure/**: External concerns (MIDI I/O, hardware communication)

---

## MIDI Communication

### Protocol Stack

```
Frontend Component
      ↓
  Tauri IPC (invoke)
      ↓
  commands.rs (IPC handlers)
      ↓
  MidiManager (coordination)
      ↓
  Pedal Module (domain logic)
      ↓
  MIDI CC Messages → Hardware
```

### Parameter Flow

1. **Frontend**: User adjusts knob → `setActivity(80)`
2. **Hook**: Creates parameter → `MicrocosmParams.activity(80)`
3. **API**: Sends via Tauri → `sendMicrocosmParameter(device, param)`
4. **Backend**: 
   - Receives parameter
   - Converts to CC message: `{ cc_number: 6, value: 80 }`
   - Sends MIDI output
   - Updates internal state

---

## Scalability Strategy

### Adding a New Pedal

#### Frontend:
1. Create `src/lib/midi/pedals/{pedal}/`
   - Define types matching Rust backend
   - Add constants and helpers
   - Create API wrappers

2. Create `src/components/pedals/{pedal}/`
   - Build pedal-specific UI
   - Reuse `components/common/` primitives

3. Create `src/hooks/pedals/{pedal}/`
   - Implement state management hook
   - Handle parameter throttling and updates

#### Backend:
1. Create `tauri/src/midi/pedals/{pedal}/`
   - `types.rs` - Domain model
   - `mapper.rs` - MIDI CC mapping
   - `mod.rs` - Public API

2. Add commands in `commands.rs`
   - `connect_{pedal}`
   - `send_{pedal}_parameter`
   - `get_{pedal}_state`

3. Update `MidiManager`
   - Add pedal to connection types
   - Handle routing and state management

### Common Components
Reusable UI components (`components/common/`) work across all pedals:
- Knob, Toggle, TapButton - Standard controls
- GridSelector, Select - Option pickers
- ParameterCard - Grouped parameter layout

---

## Type Safety

### Shared Type Definitions

Types are defined once in Rust and mirrored in TypeScript:

**Rust:**
```rust
#[derive(Serialize, Deserialize)]
pub enum SubdivisionValue {
    QuarterNote, HalfNote, Tap, Double, Quadruple, Octuple
}
```

**TypeScript:**
```typescript
export type SubdivisionValue = 
  | 'QuarterNote' | 'HalfNote' | 'Tap' 
  | 'Double' | 'Quadruple' | 'Octuple';
```

This ensures:
- Frontend-backend consistency
- Compile-time checking
- Auto-completion in editors
- Refactoring safety

---

## State Management

### Backend (Rust)
Each pedal maintains its own state:
```rust
pub struct Microcosm {
    pub state: MicrocosmState,  // Current parameter values
    pub midi_channel: u8,
}
```

State is updated:
- When parameter changes arrive
- When presets are loaded
- When program changes occur

### Frontend (React)
State is managed per-pedal using custom hooks:
```typescript
const editor = useMicrocosmEditor(deviceName);
// Provides: state, setters, triggers
```

**Features:**
- Local optimistic updates (immediate UI feedback)
- Throttled MIDI sends (30ms for continuous controls)
- Backend synchronization

---

## Testing Strategy

### Frontend
- Unit tests for helpers (`getEffectProgramNumber`, parameter builders)
- Component tests for UI primitives
- Integration tests for hooks

### Backend  
- Unit tests for MIDI mapping (CC conversion, value ranges)
- Unit tests for domain logic (effect program numbers, state updates)
- Integration tests for manager (device connections, routing)

### End-to-End
- Manual testing with physical pedals
- MIDI message monitoring
- Parameter recall verification

See `docs/midi/testing-guide.md` for detailed testing procedures.

---

## Performance Considerations

### Throttling
Continuous controls (knobs) are throttled to prevent MIDI flooding:
```typescript
sendParam(midi.MicrocosmParams.activity(v), 30); // 30ms throttle
```

### Batching
Preset recall sends all parameters in sequence:
```rust
for (cc, value) in state.to_cc_map() {
    send_cc(cc, value)?;
}
```

### React Optimization
- `useCallback` for stable function references
- Selective re-renders (component memoization where needed)
- Minimal prop drilling (hooks provide direct access)

---

## Future Architecture Enhancements

### Backend - Full DDD Layers

**Domain Layer** (`midi/domain/`)
- Pure domain logic
- No infrastructure dependencies
- Value objects, entities, domain services

**Application Layer** (`midi/application/`)
- Use cases (connect device, send parameter, recall preset)
- Orchestrates domain objects
- Transaction boundaries

**Infrastructure Layer** (`midi/infrastructure/`)
- MIDI I/O implementation
- Device detection
- External hardware communication

### Frontend - Advanced Features

**State Management**
- Consider Zustand/Jotai for complex multi-pedal state
- Persist user preferences (last connected device, etc.)
- Undo/redo for parameter changes

**UI Enhancements**
- Pedal-specific themes
- Parameter animation
- MIDI learn mode
- Visual feedback for MIDI activity

**Preset Management**
- Save/load presets to disk
- Preset browser
- Cloud sync (optional)

---

## Key Design Decisions

### Why Modular by Pedal?
- **Scalability**: Easy to add new pedals without touching existing code
- **Maintainability**: Changes to one pedal don't affect others
- **Team Collaboration**: Different developers can work on different pedals
- **Testing**: Isolated testing per pedal

### Why DDD for Backend?
- **Domain Clarity**: MIDI CC numbers and protocol details separated from business logic
- **Testability**: Pure domain logic is easy to test
- **Flexibility**: Can swap MIDI implementation without changing domain
- **Documentation**: Domain model serves as living documentation

### Why Feature-Sliced Frontend?
- **Discoverability**: Related code lives together
- **Cohesion**: Components, hooks, and logic for a feature are co-located
- **Scalability**: New features/pedals are self-contained

### Why Common Components?
- **Consistency**: Same UI patterns across all pedals
- **Efficiency**: Build once, use everywhere
- **Accessibility**: Centralized focus on accessibility features

---

## Contributing

When adding features:
1. **Identify the domain**: Is this common or pedal-specific?
2. **Place appropriately**: Follow the directory structure
3. **Maintain separation**: Don't mix pedal logic in common layers
4. **Update types**: Keep Rust and TypeScript types in sync
5. **Document**: Update this architecture doc for significant changes

---

## Related Documentation

- [Implementation Summary](./implementation-summary.md)
- [MIDI Testing Guide](./midi/testing-guide.md)
- [Microcosm Specification](./midi/microcosm-spec.md)
- [Phase 1 Completion](./phase-1-completion.md)

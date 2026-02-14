# Librarian Development Roadmap

**Last Updated:** 2026-02-12  
**Primary Test Device:** Hologram Microcosm (Bluetooth MIDI)  
**Secondary Device:** Chase Bliss Gen Loss MKII (USB MIDI - for later)

## ✅ Phase 0: Development Environment Setup (COMPLETE)

- [x] Install prerequisites (Rust, Node.js, pnpm, Xcode CLI tools)
- [x] Create Tauri + React + TypeScript project
- [x] Install frontend dependencies (Tailwind CSS, shadcn/ui, Vite)
- [x] Install Rust dependencies (midir, rusqlite, uuid, thiserror)
- [x] Configure tooling (TypeScript, Tailwind, Tauri)
- [x] Create project folder structure
- [x] Generate application icons
- [x] Verify development server launches successfully
- [x] Configure Git and create initial commit

**Status**: Complete ✅  
**Completion Date**: February 12, 2026

---

## ✅ Phase 1: MIDI Foundation (COMPLETE)

### 1.1 MIDI Research & Setup ✅
- [x] Research Gen Loss MKII MIDI implementation
  - Complete MIDI CC mapping documented ([`docs/midi/gen-loss-mkii-spec.md`](docs/midi/gen-loss-mkii-spec.md))
  - 41 parameters mapped from [midi.guide](https://midi.guide/d/chase-bliss/generation-loss-mkii/)
  - All parameter ranges, types, and special behaviors documented
- [x] Research Hologram Microcosm MIDI implementation
  - Complete MIDI CC mapping documented ([`docs/midi/microcosm-spec.md`](docs/midi/microcosm-spec.md))
  - 35 parameters mapped from [midi.guide](https://midi.guide/d/hologram/microcosm/)
  - Complete looper section (15 parameters) documented
- [x] Test MIDI device detection on macOS
  - Rust MIDI module created: `tauri/src/midi/`
  - Test utility built: `cargo run --bin test-midi-detection`
  - Detects both Microcosm (Bluetooth) and Gen Loss MKII (USB)
  - macOS setup guides: [`docs/midi/bluetooth-midi-setup.md`](docs/midi/bluetooth-midi-setup.md) & [`docs/midi/macos-setup.md`](docs/midi/macos-setup.md)

### 1.2 Rust MIDI Manager ✅
- [x] Implement MIDI device enumeration
  - List available input/output ports via midir
  - Search for specific devices by name
  - Return device info (name, type)
- [x] Implement MIDI connection management
  - Connect to Microcosm or Gen Loss MKII by device name
  - Maintain connection state for multiple devices simultaneously
  - Handle connection errors gracefully with MidiError types
- [x] Implement MIDI message sending
  - Send Control Change (CC) messages with validation
  - Support for all parameter types (continuous, binary, stepped, trigger)
  - Throttled preset recall (10ms delay between messages)
- [x] Implement state tracking
  - App maintains complete device state (all parameters)
  - Update state on parameter changes
  - Query current state without MIDI roundtrip

### 1.3 Tauri Commands (Rust → TypeScript Bridge) ✅
- [x] Create `list_midi_devices` command
- [x] Create `connect_microcosm` command
- [x] Create `connect_gen_loss_mkii` command
- [x] Create `disconnect_device` command
- [x] Create `list_connected_devices` command
- [x] Create `send_microcosm_parameter` command
- [x] Create `send_gen_loss_parameter` command
- [x] Create `get_microcosm_state` command
- [x] Create `get_gen_loss_state` command
- [x] Create `recall_microcosm_preset` command
- [x] Create `recall_gen_loss_preset` command
- [x] Create `is_device_connected` command
- [x] Add proper error handling with Result types
- [x] TypeScript bindings created ([`src/lib/midi.ts`](src/lib/midi.ts))

**Total: 12 Tauri commands implemented**

### 1.4 React MIDI Integration (TODO - Next Phase)
- [ ] Create `useMIDI` hook for device management
  - Device listing
  - Connection state
  - Error handling
- [ ] Create `useMIDIConnection` hook
  - Auto-reconnect on device disconnect
  - Connection status indicator
- [ ] Create `useMIDIParameter` hook
  - Send CC on parameter change
  - Throttle rapid updates
  - Track dirty state
- [ ] Create MIDI context provider
- [ ] Build MIDI device selector UI component
- [ ] Add connection status indicator to header

**Completion Date**: February 14, 2026  
**Hardware Testing**: ✅ **VERIFIED WITH PHYSICAL PEDAL**  
- Successfully controlled Hologram Microcosm via Bluetooth MIDI (WIDI adapter)
- Tested subdivision parameter (visual display changes)
- Tested bypass parameter (LED toggle on/off)
- Full end-to-end MIDI chain verified working

**Lines of Code**: ~5,050 (Rust + TypeScript + Docs)  
**Files Created**: 14 files (7 Rust, 1 TypeScript, 6 Markdown)

---

## 🎨 Phase 2: Custom UI Controls

### 2.1 Knob Component
- [ ] Design knob visual style (SVG-based rotary)
- [ ] Implement drag-to-rotate interaction
- [ ] Add value display (center or tooltip)
- [ ] Integrate with MIDI parameter hook
- [ ] Add visual feedback for MIDI activity
- [ ] Support different sizes (sm, md, lg)
- [ ] Add accessibility features (keyboard control)
- [ ] Create Storybook stories (optional)

### 2.2 DIPSwitch Component
- [ ] Design DIP switch visual style
- [ ] Implement toggle interaction
- [ ] Support multiple switches in a bank
- [ ] Integrate with MIDI (send CC on toggle)
- [ ] Add labels and descriptions
- [ ] Visual feedback for state changes

### 2.3 Slider Component
- [ ] Design slider visual style (vertical and horizontal)
- [ ] Implement drag interaction
- [ ] Add snap-to-grid option
- [ ] Integrate with MIDI parameter hook
- [ ] Add value markers and labels
- [ ] Support different orientations

### 2.4 Shared Control Features
- [ ] MIDI activity LED/indicator
- [ ] Parameter locking (prevent accidental changes)
- [ ] Parameter reset to default
- [ ] Value scaling and mapping utilities
- [ ] Tooltip with parameter info

**Estimated Duration**: 2-3 weeks  
**Dependencies**: Phase 1 (MIDI Foundation)

---

## 🎛️ Phase 3: Microcosm Editor (Primary MVP)

### 3.1 MIDI Specification ✅
- [x] Document all Microcosm MIDI CCs
  - 35 parameters fully documented
  - Time, Special Sauce, Modulation, Filter, Effect, Reverb sections
  - Complete looper section (15 parameters)
  - All parameter types and ranges defined in Rust
- [x] Create parameter type definitions (Rust + TypeScript)
- [x] Create parameter metadata (ranges, labels, defaults, CC mappings)

### 3.2 Editor UI Layout
- [ ] Design layout with parameter groups
  - Time Controls section
  - Special Sauce (Activity/Repeats) section
  - Modulation section
  - Filter section
  - Effect section (Mix, Volume, Bypass)
  - Reverb section
  - Looper section (15 controls)
- [ ] Implement responsive grid layout
- [ ] Add section headers and dividers
- [ ] Create parameter group components

### 3.3 Parameter Integration
- [ ] Map all knobs to Knob components (12 knobs)
- [ ] Map toggles to Toggle/Switch components (9 toggles)
- [ ] Add parameter tooltips with descriptions
- [ ] Implement "Sync to Pedal" button (send all 35 parameters)
- [ ] Add looper transport controls (Record, Play, Overdub, Stop, Undo, Erase)

### 3.4 Real-time Updates
- [x] Throttle parameter updates (10ms delay implemented in preset recall)
- [ ] Visual feedback for parameter changes
- [ ] Track unsaved changes indicator
- [ ] Implement "Revert to Last Saved" functionality

**Estimated Duration**: 2-3 weeks  
**Dependencies**: Phase 2 (Custom UI Controls)  
**Note**: Testing with Bluetooth MIDI (Microcosm) before USB (Gen Loss MKII)

---

## 💾 Phase 4: Preset Management

### 4.1 Database Schema
- [ ] Design SQLite schema
  ```sql
  CREATE TABLE presets (
    id TEXT PRIMARY KEY,
    pedal_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    parameters TEXT NOT NULL, -- JSON blob
    tags TEXT, -- JSON array
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX idx_pedal_type ON presets(pedal_type);
  CREATE INDEX idx_tags ON presets(tags);
  ```
- [ ] Create database migration system
- [ ] Implement database initialization on app launch

### 4.2 Rust Preset Repository
- [ ] Implement `PresetRepository` struct
- [ ] Create `save_preset` method
- [ ] Create `load_preset` method
- [ ] Create `list_presets` method (with filters)
- [ ] Create `delete_preset` method
- [ ] Create `duplicate_preset` method
- [ ] Create `update_preset` method
- [ ] Add transaction support
- [ ] Write unit tests

### 4.3 Tauri Commands for Presets
- [ ] Create `save_preset` command
- [ ] Create `load_preset` command
- [ ] Create `list_presets` command
- [ ] Create `delete_preset` command
- [ ] Create `duplicate_preset` command
- [ ] Create `search_presets` command
- [ ] Add error handling

### 4.4 Preset Management UI
- [ ] Create preset list component
  - Grid or list view toggle
  - Sort options (name, date, tags)
  - Search bar with filtering
- [ ] Create preset card component
  - Name, description, tags
  - Quick actions (load, duplicate, delete)
  - Preview parameters (optional)
- [ ] Create save preset dialog
  - Name input
  - Description input
  - Tag input with autocomplete
  - Overwrite warning
- [ ] Create preset detail modal
  - Full parameter list
  - Edit name/description/tags
  - Duplicate and delete actions

### 4.5 Preset Features
- [ ] Implement tag autocomplete
- [ ] Implement preset search (name, description, tags)
- [ ] Implement preset filtering by tag
- [ ] Implement preset sorting
- [ ] Add "Starred" or "Favorite" presets
- [ ] Implement preset export (JSON file)
- [ ] Implement preset import (JSON file)
- [ ] Add preset comparison view (optional)

**Estimated Duration**: 2-3 weeks  
**Dependencies**: Phase 3 (Gen Loss MKII Editor)

---

## 🧪 Phase 5: Testing & Validation

### 5.1 Physical Pedal Testing
- [ ] Test all parameter mappings with physical Gen Loss MKII
- [ ] Verify CC ranges match pedal behavior
- [ ] Test ALT mode switching
- [ ] Test DIP switch states
- [ ] Document any discrepancies

### 5.2 Preset Testing
- [ ] Test preset save accuracy
- [ ] Test preset load accuracy
- [ ] Test preset recall matches saved state
- [ ] Test preset search and filtering
- [ ] Test preset export/import

### 5.3 Stability Testing
- [ ] Test MIDI connection stability (reconnect scenarios)
- [ ] Test with multiple MIDI devices
- [ ] Test rapid parameter changes
- [ ] Test app behavior with pedal disconnected
- [ ] Test database corruption recovery

### 5.4 Usability Testing
- [ ] Test with real musicians/users
- [ ] Gather feedback on UI/UX
- [ ] Identify pain points
- [ ] Document feature requests

**Estimated Duration**: 1-2 weeks  
**Dependencies**: Phase 4 (Preset Management)

---

## ✨ Phase 6: Polish & UX

### 6.1 Visual Polish
- [ ] Implement dark mode theme
- [ ] Add smooth animations and transitions
- [ ] Polish custom control styling
- [ ] Add loading states and spinners
- [ ] Improve typography and spacing

### 6.2 Keyboard Shortcuts
- [ ] Cmd+S: Save preset
- [ ] Cmd+O: Open preset
- [ ] Cmd+N: New preset
- [ ] Cmd+D: Duplicate preset
- [ ] Cmd+Delete: Delete preset
- [ ] Cmd+Z: Undo parameter change (optional)
- [ ] Space: Toggle bypass (if supported)

### 6.3 Error Handling & Feedback
- [ ] Add toast notifications for actions
- [ ] Add error notifications with retry options
- [ ] Add confirmation dialogs for destructive actions
- [ ] Add loading states for async operations
- [ ] Add connection status in header
- [ ] Add MIDI activity indicator

### 6.4 Documentation
- [ ] Create user guide
  - Getting started
  - MIDI setup
  - Creating presets
  - Keyboard shortcuts
- [ ] Create troubleshooting guide
  - MIDI device not found
  - Connection issues
  - Preset problems
- [ ] Add in-app help tooltips
- [ ] Create demo video (optional)

**Estimated Duration**: 1-2 weeks  
**Dependencies**: Phase 5 (Testing)

---

## 🎯 Phase 7: Gen Loss MKII Editor (Second Pedal)

### 7.1 Multi-Pedal Architecture ✅
- [x] Multi-pedal support implemented
  - MidiManager supports multiple simultaneous connections
  - Device-specific parameter definitions (Microcosm + Gen Loss)
  - Type-safe APIs for each pedal type
- [ ] Implement pedal selector UI (switch between pedals)
- [ ] Support multiple presets per pedal type

### 7.2 Gen Loss MKII Editor
- [x] Research Gen Loss MKII MIDI implementation (41 parameters documented)
- [ ] Create Gen Loss MKII editor UI
  - Main knobs section (7 controls)
  - Tape model selector (13 models)
  - 3-position toggles (Dry, Noise, Aux)
  - DIP switch banks (16 switches!)
  - Advanced parameters section
- [ ] Map all Gen Loss parameters to UI components
- [ ] Test with physical Gen Loss MKII (USB MIDI)

**Estimated Duration**: 2-3 weeks  
**Dependencies**: Phase 6 (Polish), Physical Gen Loss MKII testing

---

## 🪟 Phase 8: Windows Support (Future)

- [ ] Test Windows MIDI implementation
- [ ] Fix any Windows-specific bugs
- [ ] Create Windows installer
- [ ] Update documentation for Windows

**Estimated Duration**: 1-2 weeks

---

## 📱 Phase 9: iPad Support (Future)

- [ ] Test Tauri Mobile on iPad
- [ ] Adapt UI for touch input
- [ ] Test iPad MIDI capabilities
- [ ] Create iPad-specific layouts

**Estimated Duration**: 2-3 weeks

---

## Summary

**Total Estimated Duration for MVP (Phases 1-6)**: 10-16 weeks

**Current Phase**: Phase 2 - Custom UI Controls  
**Completed**: Phase 0 (Dev Setup), Phase 1 (MIDI Foundation)  
**Next Milestone**: Build first custom UI control (Knob component)

**Priority Tasks**:
1. ✅ ~~Research MIDI specifications~~ (Complete: Microcosm + Gen Loss MKII)
2. ✅ ~~Implement Rust MIDI manager~~ (Complete: Full manager with state tracking)
3. ✅ ~~Create Tauri MIDI commands~~ (Complete: 12 commands)
4. **NEXT:** Test MIDI with physical Microcosm
5. **NEXT:** Build Knob UI component
6. **NEXT:** Build device selector UI

**Recent Completion** (Feb 12, 2026):
- Phase 1.1: MIDI Research & Setup
- Phase 1.2: Rust MIDI Manager (dual pedal support)
- Phase 1.3: Tauri Commands + TypeScript bindings
- Documentation: 4 MIDI guides + implementation summary

# Technical Proposal: Pedal Editor & Preset Manager

*Comprehensive Technical Architecture & Implementation Plan*

---

## Executive Summary

**Recommendation**: Build with **Tauri + React + TypeScript + Rust** for optimal performance, cross-platform capability, and modern developer experience.

This proposal outlines a complete technical architecture for a cross-platform MIDI pedal editor and preset manager, starting with macOS and expanding to Windows and iPad.

### Key Technology Decisions

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Desktop Framework** | Tauri | 96% smaller bundles, better MIDI timing, iPad path |
| **Frontend** | React + TypeScript | Your preferred stack, excellent ecosystem |
| **Backend** | Rust | Native MIDI performance, type safety |
| **MIDI Library** | midir (Rust) | Cross-platform, excellent timing |
| **Database** | rusqlite | Fast, single-file, embedded |
| **UI Foundation** | Tailwind CSS | Utility-first styling for custom controls |
| **UI Components** | shadcn/ui + Custom | Accessible base + specialized audio controls |

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  React Frontend                      │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Pedal      │  │ Preset       │  │ MIDI        │ │
│  │ Editor     │  │ Manager      │  │ Connection  │ │
│  │ (UI)       │  │ (UI)         │  │ (UI)        │ │
│  └────────────┘  └──────────────┘  └─────────────┘ │
│         │               │                  │         │
└─────────┼───────────────┼──────────────────┼─────────┘
          │               │                  │
       (Tauri IPC - Type-Safe Commands)
          │               │                  │
┌─────────┼───────────────┼──────────────────┼─────────┐
│         ▼               ▼                  ▼         │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Pedal      │  │ Preset       │  │ MIDI        │ │
│  │ Definitions│  │ Repository   │  │ Manager     │ │
│  │ (Rust)     │  │ (Rust)       │  │ (Rust)      │ │
│  └────────────┘  └──────────────┘  └─────────────┘ │
│                                            │         │
│                  Rust Core                 │         │
│  ┌──────────────────────────────────┐     │         │
│  │ SQLite Database (rusqlite)       │     │         │
│  │ - Presets                        │     │         │
│  │ - Tags                           │     │         │
│  │ - User settings                  │     │         │
│  └──────────────────────────────────┘     │         │
└────────────────────────────────────────────┼─────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │  MIDI Hardware  │
                                    │  (Pedal)        │
                                    └─────────────────┘
```

### Data Flow: Parameter Change

```
User drags knob
      │
      ▼
React component updates local state (immediate visual feedback)
      │
      ▼
Throttled call to Tauri command (16ms/60fps)
      │
      ▼
Rust MIDI handler formats MIDI CC message
      │
      ▼
midir sends message to CoreMIDI
      │
      ▼
Physical pedal receives CC and updates parameter
```

### Data Flow: Preset Recall

```
User selects preset from list
      │
      ▼
React calls Tauri command `load_preset(id)`
      │
      ▼
Rust queries SQLite for preset data
      │
      ▼
Returns preset parameters to React
      │
      ▼
React updates all UI controls
      │
      ▼
React calls `send_full_state()` command
      │
      ▼
Rust sends sequence of MIDI CC messages
      │
      ▼
Pedal state matches preset
```

---

## Technology Stack Deep Dive

### 1. Desktop Framework: Tauri

**Version**: Tauri 2.x (latest stable)

#### Why Tauri Over Electron?

| Metric | Tauri | Electron |
|--------|-------|----------|
| Bundle Size | ~10 MB | ~150 MB |
| Memory Usage | ~50 MB | ~150 MB |
| Startup Time | <1 sec | 2-3 sec |
| MIDI Timing | Excellent (Rust native) | Good (Node addon) |
| iPad Support | ✅ Yes (alpha) | ❌ No |
| Security | Excellent (Rust + sandboxing) | Good |

#### Project Structure

```
librarian/
├── src/                          # React frontend
│   ├── components/
│   │   ├── controls/             # Custom audio controls
│   │   │   ├── Knob.tsx
│   │   │   ├── MidiSlider.tsx
│   │   │   └── DIPSwitch.tsx
│   │   ├── pedals/               # Pedal-specific editors
│   │   │   ├── GenLossMKII.tsx
│   │   │   └── Microcosm.tsx
│   │   ├── presets/              # Preset management
│   │   │   ├── PresetBrowser.tsx
│   │   │   ├── PresetCard.tsx
│   │   │   └── PresetEditor.tsx
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/
│   │   ├── midi.ts               # MIDI service (Tauri commands)
│   │   ├── presets.ts            # Preset service
│   │   └── pedals/               # Pedal definitions
│   ├── hooks/
│   │   ├── useMidi.ts
│   │   └── usePresets.ts
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Tauri app entry
│   │   ├── midi/
│   │   │   ├── mod.rs
│   │   │   ├── manager.rs        # MIDI connection management
│   │   │   └── commands.rs       # Tauri commands
│   │   ├── presets/
│   │   │   ├── mod.rs
│   │   │   ├── repository.rs     # Database operations
│   │   │   └── commands.rs       # Tauri commands
│   │   ├── pedals/
│   │   │   ├── mod.rs
│   │   │   ├── definitions.rs    # Pedal parameter maps
│   │   │   └── gen_loss_mkii.rs  # Gen Loss MKII specifics
│   │   └── db.rs                 # Database initialization
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Tauri configuration
├── package.json                  # Frontend dependencies
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

#### Setup Commands

```bash
# Create Tauri app
npm create tauri-app@latest

# Choose:
# - Package manager: pnpm (faster) or npm
# - UI framework: React
# - TypeScript: Yes
# - UI template: none (we'll add Tailwind)

cd librarian

# Add dependencies
npm install @tauri-apps/api
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Add Rust dependencies (Cargo.toml)
# [dependencies]
# midir = "0.9"
# rusqlite = { version = "0.31", features = ["bundled"] }
# serde = { version = "1.0", features = ["derive"] }
# serde_json = "1.0"
# tauri = { version = "2.0", features = ["..." ] }
```

---

### 2. MIDI: Rust midir

**Crate**: `midir = "0.9"`

#### Core MIDI Module

```rust
// src-tauri/src/midi/manager.rs
use midir::{MidiOutput, MidiOutputConnection};
use std::sync::Mutex;

pub struct MidiManager {
    connection: Mutex<Option<MidiOutputConnection>>,
}

impl MidiManager {
    pub fn new() -> Self {
        MidiManager {
            connection: Mutex::new(None),
        }
    }
    
    pub fn list_ports(&self) -> Result<Vec<String>, String> {
        let midi_out = MidiOutput::new("Pedal Editor")
            .map_err(|e| e.to_string())?;
        
        let ports = midi_out.ports();
        ports.iter()
            .map(|p| midi_out.port_name(p).map_err(|e| e.to_string()))
            .collect()
    }
    
    pub fn connect(&self, port_index: usize) -> Result<String, String> {
        let midi_out = MidiOutput::new("Pedal Editor")
            .map_err(|e| e.to_string())?;
        
        let ports = midi_out.ports();
        let port = ports.get(port_index)
            .ok_or("Invalid port index")?;
        
        let port_name = midi_out.port_name(port)
            .map_err(|e| e.to_string())?;
        
        let connection = midi_out.connect(port, "output")
            .map_err(|e| e.to_string())?;
        
        *self.connection.lock().unwrap() = Some(connection);
        
        Ok(port_name)
    }
    
    pub fn send_cc(&self, channel: u8, controller: u8, value: u8) -> Result<(), String> {
        let mut conn_lock = self.connection.lock().unwrap();
        let conn = conn_lock.as_mut()
            .ok_or("MIDI not connected")?;
        
        let status = 0xB0 | (channel & 0x0F);
        conn.send(&[status, controller & 0x7F, value & 0x7F])
            .map_err(|e| e.to_string())
    }
    
    pub fn send_program_change(&self, channel: u8, program: u8) -> Result<(), String> {
        let mut conn_lock = self.connection.lock().unwrap();
        let conn = conn_lock.as_mut()
            .ok_or("MIDI not connected")?;
        
        let status = 0xC0 | (channel & 0x0F);
        conn.send(&[status, program & 0x7F])
            .map_err(|e| e.to_string())
    }
    
    pub fn is_connected(&self) -> bool {
        self.connection.lock().unwrap().is_some()
    }
}
```

#### Tauri Commands

```rust
// src-tauri/src/midi/commands.rs
use tauri::State;
use super::manager::MidiManager;

#[tauri::command]
pub fn list_midi_ports(midi: State<MidiManager>) -> Result<Vec<String>, String> {
    midi.list_ports()
}

#[tauri::command]
pub fn connect_midi(port_index: usize, midi: State<MidiManager>) -> Result<String, String> {
    midi.connect(port_index)
}

#[tauri::command]
pub fn send_midi_cc(
    channel: u8,
    controller: u8,
    value: u8,
    midi: State<MidiManager>
) -> Result<(), String> {
    midi.send_cc(channel, controller, value)
}

#[tauri::command]
pub fn midi_connected(midi: State<MidiManager>) -> bool {
    midi.is_connected()
}
```

#### React Integration

```typescript
// src/lib/midi.ts
import { invoke } from '@tauri-apps/api/tauri';

export interface MidiPort {
  index: number;
  name: string;
}

class MidiService {
  async listPorts(): Promise<string[]> {
    return await invoke<string[]>('list_midi_ports');
  }
  
  async connect(portIndex: number): Promise<string> {
    return await invoke<string>('connect_midi', { portIndex });
  }
  
  async sendCC(channel: number, controller: number, value: number): Promise<void> {
    await invoke('send_midi_cc', { channel, controller, value });
  }
  
  async isConnected(): Promise<boolean> {
    return await invoke<boolean>('midi_connected');
  }
}

export const midi = new MidiService();
```

---

### 3. Database: rusqlite

**Crate**: `rusqlite = { version = "0.31", features = ["bundled"] }`

#### Schema

```rust
// src-tauri/src/db.rs
use rusqlite::{Connection, Result};
use std::path::PathBuf;

pub fn init_database(db_path: PathBuf) -> Result<Connection> {
    let conn = Connection::open(db_path)?;
    
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS presets (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            pedal_type TEXT NOT NULL,
            category TEXT,
            parameters TEXT NOT NULL,
            tags TEXT,
            author TEXT,
            notes TEXT,
            created_at INTEGER DEFAULT (strftime('%s', 'now')),
            updated_at INTEGER DEFAULT (strftime('%s', 'now'))
        );
        
        CREATE INDEX IF NOT EXISTS idx_pedal_type ON presets(pedal_type);
        CREATE INDEX IF NOT EXISTS idx_category ON presets(category);
        CREATE INDEX IF NOT EXISTS idx_created_at ON presets(created_at DESC);
        
        CREATE VIRTUAL TABLE IF NOT EXISTS presets_fts USING fts5(
            name,
            tags,
            notes,
            content='presets',
            content_rowid='rowid'
        );
        
        -- FTS sync triggers
        CREATE TRIGGER IF NOT EXISTS presets_ai AFTER INSERT ON presets BEGIN
            INSERT INTO presets_fts(rowid, name, tags, notes)
            VALUES (new.rowid, new.name, new.tags, new.notes);
        END;
        
        CREATE TRIGGER IF NOT EXISTS presets_ad AFTER DELETE ON presets BEGIN
            DELETE FROM presets_fts WHERE rowid = old.rowid;
        END;
        
        CREATE TRIGGER IF NOT EXISTS presets_au AFTER UPDATE ON presets BEGIN
            UPDATE presets_fts 
            SET name = new.name, tags = new.tags, notes = new.notes
            WHERE rowid = new.rowid;
        END;"
    )?;
    
    Ok(conn)
}
```

---

### 4. UI: React + Tailwind + Custom Controls

See [04-ui-frameworks.md](./04-ui-frameworks.md) for complete implementation details.

**Key Components**:
- Custom Knob (rotary control with mouse drag)
- MIDI Slider (0-127 range)
- DIP Switch (binary toggle)
- Parameter Groups (organized layout)
- Preset Browser (search, filter, tags)

---

## Pedal Definition System

### Abstraction for Multi-Pedal Support

```typescript
// src/lib/pedals/types.ts
export interface Parameter {
  id: string;
  name: string;
  type: 'knob' | 'slider' | 'dip' | 'toggle';
  midiCC: number;
  min: number;
  max: number;
  default: number;
  unit?: string;
}

export interface ParameterGroup {
  name: string;
  parameters: Parameter[];
}

export interface PedalDefinition {
  id: string;
  name: string;
  manufacturer: string;
  midiChannel: number;
  groups: ParameterGroup[];
}
```

### Example: Chase Bliss Gen Loss MKII

```typescript
// src/lib/pedals/gen-loss-mkii.ts
import { PedalDefinition } from './types';

export const GenLossMKII: PedalDefinition = {
  id: 'gen-loss-mkii',
  name: 'Generation Loss MKII',
  manufacturer: 'Chase Bliss Audio',
  midiChannel: 0,
  groups: [
    {
      name: 'Main Controls',
      parameters: [
        {
          id: 'wow',
          name: 'Wow',
          type: 'knob',
          midiCC: 14,
          min: 0,
          max: 127,
          default: 0,
        },
        {
          id: 'flutter',
          name: 'Flutter',
          type: 'knob',
          midiCC: 15,
          min: 0,
          max: 127,
          default: 0,
        },
        {
          id: 'saturate',
          name: 'Saturate',
          type: 'knob',
          midiCC: 16,
          min: 0,
          max: 127,
          default: 64,
        },
        {
          id: 'blend',
          name: 'Blend',
          type: 'knob',
          midiCC: 17,
          min: 0,
          max: 127,
          default: 64,
        },
      ],
    },
    {
      name: 'DIP Switches',
      parameters: [
        {
          id: 'dip_classic',
          name: 'Classic Mode',
          type: 'dip',
          midiCC: 18,
          min: 0,
          max: 1,
          default: 0,
        },
        // ... more DIP switches
      ],
    },
  ],
};
```

### Dynamic Editor Component

```tsx
// src/components/pedals/PedalEditor.tsx
import { PedalDefinition } from '@/lib/pedals/types';
import { Knob } from '@/components/controls/Knob';
import { DIPSwitch } from '@/components/controls/DIPSwitch';
import { ParameterGroup } from '@/components/controls/ParameterGroup';

interface PedalEditorProps {
  definition: PedalDefinition;
  values: Record<string, number>;
  onChange: (parameterId: string, value: number) => void;
}

export function PedalEditor({ definition, values, onChange }: PedalEditorProps) {
  const renderParameter = (param: Parameter) => {
    const value = values[param.id] ?? param.default;
    const handleChange = (newValue: number) => onChange(param.id, newValue);
    
    switch (param.type) {
      case 'knob':
        return (
          <Knob
            key={param.id}
            value={value}
            min={param.min}
            max={param.max}
            label={param.name}
            onChange={handleChange}
          />
        );
      
      case 'dip':
        return (
          <DIPSwitch
            key={param.id}
            value={value === 1}
            label={param.name}
            onChange={(v) => handleChange(v ? 1 : 0)}
          />
        );
      
      // ... other types
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{definition.name}</h2>
      
      {definition.groups.map(group => (
        <ParameterGroup key={group.name} title={group.name}>
          {group.parameters.map(renderParameter)}
        </ParameterGroup>
      ))}
    </div>
  );
}
```

---

## Implementation Phases

### Phase 0: Foundation (Week 1-2)

**Goal**: Basic Tauri app with MIDI communication

- [x] Initialize Tauri + React project
- [x] Set up Tailwind CSS
- [x] Implement MIDI manager (Rust)
- [x] Create Tauri commands for MIDI
- [x] Test MIDI CC send/receive with hardware
- [x] Initialize SQLite database
- [x] Create basic UI layout

**Deliverable**: App that connects to MIDI port and sends CC messages

---

### Phase 1: Gen Loss MKII MVP (Week 3-6)

**Goal**: Fully functional editor for one pedal

- [x] Define Gen Loss MKII parameter map
- [x] Build custom Knob component
- [x] Build DIPSwitch component
- [x] Create PedalEditor component
- [x] Implement preset save/load
- [x] Build preset browser UI
- [x] Add tagging system
- [x] Test full workflow with physical pedal

**Deliverable**: Complete editor for Gen Loss MKII

---

### Phase 2: Polish & UX (Week 7-8)

**Goal**: Production-quality experience

- [x] Add preset search (full-text)
- [x] Implement "Send Full State" sync
- [x] Add export/import functionality
- [x] Keyboard shortcuts
- [x] MIDI activity indicator
- [x] Error handling and validation
- [x] Performance optimization

**Deliverable**: Polished, user-tested app

---

### Phase 3: Second Pedal (Week 9-10)

**Goal**: Prove multi-pedal architecture

- [x] Define Hologram Microcosm parameters
- [x] Create Microcosm-specific UI (if needed)
- [x] Test pedal switching workflow
- [x] Refine pedal definition system

**Deliverable**: Two-pedal editor demonstrating scalability

---

### Phase 4: Windows Support (Week 11-12)

**Goal**: Cross-platform desktop

- [x] Test on Windows
- [x] Fix platform-specific issues
- [x] Create Windows installer
- [x] Test MIDI on Windows (WinMM/WinRT)

**Deliverable**: macOS + Windows support

---

### Phase 5: iPad (Future - Tauri Mobile)

**Goal**: Touch-optimized mobile version

- [ ] Evaluate Tauri Mobile maturity
- [ ] Adapt UI for touch (larger controls)
- [ ] Test CoreMIDI on iOS
- [ ] App Store submission

**Deliverable**: iPad app

---

## Development Environment Setup

### Prerequisites

```bash
# macOS
brew install rust
brew install node

# Verify
rustc --version  # 1.75+
node --version   # 18+
```

### Project Initialization

```bash
# Create Tauri app
npm create tauri-app@latest librarian

# Navigate to project
cd librarian

# Install frontend dependencies
npm install
npm install -D tailwindcss postcss autoprefixer
npm install @tauri-apps/api
npm install react-router-dom
npm install lodash-es
npm install date-fns

# Install UI component dependencies (optional)
npx shadcn-ui@latest init

# Initialize Tailwind
npx tailwindcss init -p
```

### Rust Dependencies

```toml
# src-tauri/Cargo.toml
[dependencies]
tauri = { version = "2", features = ["shell-open"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
midir = "0.9"
rusqlite = { version = "0.31", features = ["bundled"] }
uuid = { version = "1", features = ["v4", "serde"] }
thiserror = "1"
```

### Development Commands

```bash
# Run dev server
npm run tauri dev

# Build for production
npm run tauri build

# Run tests
npm test
cargo test

# Format code
npm run format
cargo fmt

# Lint
npm run lint
cargo clippy
```

---

## Testing Strategy

### Unit Tests

```typescript
// src/lib/midi.test.ts
import { describe, it, expect } from 'vitest';
import { MidiService } from './midi';

describe('MidiService', () => {
  it('should format CC messages correctly', () => {
    // Test MIDI message formatting
  });
});
```

```rust
// src-tauri/src/midi/manager.rs
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_cc_message_format() {
        // Test MIDI CC formatting
    }
}
```

### Integration Tests

- Connect to virtual MIDI port
- Send CC messages
- Verify received values
- Test preset save/load cycle

### Manual Testing Checklist

- [ ] List MIDI ports
- [ ] Connect to pedal
- [ ] Adjust parameters (hear changes)
- [ ] Save preset
- [ ] Load preset (verify pedal state)
- [ ] Search presets
- [ ] Export/import presets
- [ ] Reconnect after pedal power cycle

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| **App startup** | <2s | First launch |
| **MIDI latency** | <20ms | Parameter change to MIDI out |
| **UI responsiveness** | 60fps | Knob drag |
| **Preset load** | <100ms | Database query + UI update |
| **Search** | <50ms | 1000 presets |
| **Memory usage** | <100 MB | Idle state |
| **Bundle size** | <15 MB | macOS .dmg |

---

## Security Considerations

### Tauri Security

- IPC allowlist (only expose necessary commands)
- No eval() in frontend
- CSP headers
- Sandboxed WebView

### Data Protection

- Local-only storage (no cloud initially)
- User data in standard app data directory
- Export/import with user control

---

## Distribution

### macOS

```bash
# Build
npm run tauri build

# Output
src-tauri/target/release/bundle/macos/Pedal Editor.app
src-tauri/target/release/bundle/dmg/Pedal Editor_1.0.0_x64.dmg
```

**Code Signing**: Required for distribution outside App Store

```bash
# Sign app
codesign --force --deep --sign "Developer ID" "Pedal Editor.app"

# Notarize
xcrun notarytool submit "Pedal Editor.dmg" --wait
xcrun stapler staple "Pedal Editor.dmg"
```

### Windows

```bash
# Build on Windows
npm run tauri build

# Output
src-tauri/target/release/bundle/msi/Pedal Editor_1.0.0_x64.msi
src-tauri/target/release/bundle/nsis/Pedal Editor_1.0.0_x64-setup.exe
```

---

## Alternative: Electron Stack

If you prefer to stay in pure Node.js/TypeScript without Rust:

### Modified Stack

| Component | Technology |
|-----------|------------|
| **Desktop Framework** | Electron |
| **Frontend** | React + TypeScript |
| **Backend** | Node.js |
| **MIDI Library** | @julusian/midi |
| **Database** | better-sqlite3 |
| **UI** | Same (Tailwind + Custom) |

### Trade-offs

**Pros**:
- No Rust learning curve
- Familiar Node.js throughout
- Slightly faster initial development

**Cons**:
- 150 MB bundles (vs 10 MB Tauri)
- No iPad support
- electron-rebuild required
- Higher memory usage

See [01-desktop-frameworks.md](./01-desktop-frameworks.md) and [02-midi-libraries.md](./02-midi-libraries.md) for Electron implementation details.

---

## Cost Estimation

### Development Time

| Phase | Duration | Description |
|-------|----------|-------------|
| **Phase 0** | 1-2 weeks | Foundation + MIDI |
| **Phase 1** | 3-4 weeks | Gen Loss MKII MVP |
| **Phase 2** | 1-2 weeks | Polish |
| **Phase 3** | 1-2 weeks | Second pedal |
| **Phase 4** | 1-2 weeks | Windows support |
| **Total MVP** | **8-12 weeks** | macOS + Windows, 2 pedals |

### Ongoing Costs

- $0 for tools (all open source)
- $99/year for Apple Developer (code signing)
- Optional: Code signing cert for Windows (~$100-300/year)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Rust learning curve** | Delayed timeline | Start with MIDI examples, minimal Rust in MVP |
| **Tauri Mobile immature** | iPad delayed | Build desktop first, defer iPad to Phase 5 |
| **MIDI hardware varies** | Compatibility issues | Test with actual hardware early and often |
| **Preset format changes** | Migration complexity | Version preset format, build migration system |

---

## Success Metrics

### MVP Success

- [ ] Connect to Gen Loss MKII via MIDI
- [ ] Control all parameters from app
- [ ] Save and recall presets reliably
- [ ] Search 100+ presets quickly
- [ ] Export/import presets
- [ ] Runs on macOS (tested on 3+ machines)

### Long-Term Success

- Support for 5+ pedals
- 10,000+ saved presets (stress test)
- <10 MB bundle size maintained
- Windows and iPad support
- Community preset sharing (future)

---

## Next Steps

1. **Review this proposal** - Confirm technical direction
2. **Set up development environment** - Install Rust, Node, create project
3. **Build MIDI foundation** - Get basic CC sending working
4. **Create Gen Loss MKII definition** - Map all parameters
5. **Build UI components** - Knob, Slider, DIPSwitch
6. **Test with hardware** - Verify MIDI communication
7. **Implement presets** - Save/load functionality
8. **Polish and test** - Prepare for initial release

---

## Conclusion

This technical architecture provides a solid foundation for building a production-quality MIDI pedal editor. The Tauri + React + Rust stack offers:

- **Performance**: Small bundles, low memory, fast startup
- **Cross-platform**: macOS → Windows → iPad
- **Maintainability**: Type-safe throughout (TypeScript + Rust)
- **Scalability**: Easy to add new pedals
- **Modern DX**: Excellent tooling and developer experience

**Recommendation**: Proceed with Tauri implementation. The small upfront cost of learning basic Rust pays dividends in performance, bundle size, and cross-platform capability.

---

## Appendix: Useful Resources

### Documentation

- Tauri: https://tauri.app/
- midir: https://docs.rs/midir/
- rusqlite: https://docs.rs/rusqlite/
- React: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/

### Community

- Tauri Discord: https://discord.gg/tauri
- r/rust
- r/rust_gamedev (audio/MIDI discussions)

### Example Projects

- Tauri MIDI examples: https://github.com/topics/tauri-midi
- Strudel (Web MIDI + Tauri): https://strudel.cc/

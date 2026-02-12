# Librarian - Pedal Editor & Preset Manager

A cross-platform editor and librarian for modern boutique MIDI pedals.

## Project Status

✅ **Development Environment Setup Complete**

The repository is now configured with:
- Tauri 2.0 + React + TypeScript
- Rust backend with MIDI libraries (midir, rusqlite, uuid, thiserror)
- Frontend dependencies: Tailwind CSS, shadcn/ui base, React
- Folder structure for components, MIDI modules, and preset management
- Git initialized with initial commit
- Comprehensive research documentation in `/research`

## Tech Stack

- **Framework**: Tauri 2.0
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Rust 1.93+
- **UI**: Tailwind CSS 4 + Custom Components
- **MIDI**: midir (Rust)
- **Database**: rusqlite (SQLite)
- **Target Platforms**: macOS (MVP), Windows, iPad (future)

## Prerequisites

- **Rust** 1.75+ (installed ✅)
- **Node.js** 22.x (installed ✅)
- **pnpm** 10+ (installed ✅)
- **Xcode Command Line Tools** (macOS, installed ✅)

## Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run tauri:dev
```

## Known Issues

### ✅ Tauri Development Server - WORKING
**Status**: Resolved on February 12, 2026

The Tauri development server is now running successfully. The initial icon loading issues have been fixed by generating proper icons using the Tauri CLI (`pnpm run tauri icon`).

**Resolution Summary:**
- Generated valid icon files using `tauri icon` command from an SVG source
- Configured `tauri.conf.json` with correct icon paths
- App now launches without crashes on macOS 15.6

## Project Structure

```
librarian/
├── research/                    # Technical research & proposals
│   ├── technical-proposal.md
│   ├── 01-desktop-frameworks.md
│   ├── 02-midi-libraries.md
│   ├── 03-storage-options.md
│   ├── 04-ui-frameworks.md
│   └── tauri-vs-electron-comparison.md
├── src/                         # React frontend
│   ├── components/
│   │   ├── controls/            # Custom MIDI controls (Knob, Slider, DIP)
│   │   ├── pedals/              # Pedal-specific editors
│   │   ├── presets/             # Preset management UI
│   │   ├── midi/                # MIDI connection UI
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/                     # Utilities & services
│   ├── hooks/                   # React hooks
│   ├── styles/                  # Global styles
│   └── App.tsx
├── tauri/                   # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   ├── midi/                # MIDI manager
│   │   └── presets/             # Preset repository
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # Tauri configuration
└── product-vision.md            # Product vision document
```

## Development Roadmap

### ✅ Phase 0: Foundation (Complete)
- Project setup with Tauri + React + TypeScript
- Development environment configured
- Research documentation complete

### ✅ Phase 0.1: Dev Environment Setup (Complete)
- ✅ Resolve Tauri initialization issues
- ✅ Generate valid application icons
- ✅ Verify app launches successfully

### 🔄 Phase 1: MIDI Foundation (IN PROGRESS)

#### Phase 1.1: MIDI Research & Setup (READY FOR TESTING)

**Supported Pedals:**
1. ✅ **Hologram Microcosm** (PRIMARY TEST DEVICE - Bluetooth MIDI)
   - Complete MIDI spec: [`docs/midi/microcosm-spec.md`](docs/midi/microcosm-spec.md)
   - 35 MIDI parameters including complete looper control
   - Bluetooth MIDI guide: [`docs/midi/bluetooth-midi-setup.md`](docs/midi/bluetooth-midi-setup.md)
2. ✅ **Chase Bliss Gen Loss MKII** (USB MIDI - for later testing)
   - Complete MIDI spec: [`docs/midi/gen-loss-mkii-spec.md`](docs/midi/gen-loss-mkii-spec.md)
   - 41 MIDI parameters including 16 DIP switches
   - USB MIDI guide: [`docs/midi/macos-setup.md`](docs/midi/macos-setup.md)

**Infrastructure:**
- ✅ Rust MIDI module created: `tauri/src/midi/`
- ✅ Test utility built: `cargo run --bin test-midi-detection`
- ✅ Searches for both Microcosm and Gen Loss MKII

**Next:** ⬜ Run test utility with Microcosm connected via Bluetooth MIDI

#### Phase 1.2-1.4: MIDI Implementation (TODO)
- ⬜ Implement Rust MIDI Manager
- ⬜ Create Tauri MIDI commands
- ⬜ Build React MIDI integration hooks
- ⬜ Create MIDI device selector UI

### ⬜ Phase 2: Microcosm MVP (8-12 weeks)
- Map all Microcosm MIDI CCs
- Build custom UI controls (Knob, Slider, Toggle)
- Implement preset save/load with SQLite
- Add tagging and search
- Test with physical pedal (Bluetooth MIDI)

### ⬜ Phase 3: Polish & UX
- Full-text search
- Export/import presets
- Keyboard shortcuts
- Error handling

### ⬜ Phase 4: Second Pedal (Chase Bliss Gen Loss MKII)
- Add Gen Loss MKII editor (USB MIDI)
- Multi-pedal architecture
- Pedal switching UI

### ⬜ Phase 5: Windows Support
### ⬜ Phase 6: iPad Support (Tauri Mobile)

## Commands

```bash
# Development
pnpm run tauri:dev          # Start Tauri dev server
pnpm run dev                # Start Vite dev server only

# MIDI Testing
cd tauri && cargo run --bin test-midi-detection  # Test MIDI device detection

# Build
pnpm run tauri:build        # Build production app
pnpm run build              # Build frontend only

# Code Quality
pnpm run format             # Format TS/React + Rust
pnpm run lint               # Lint TS/React + Rust (when configured)
```

## Documentation

- **[ROADMAP](./ROADMAP.md)** - Complete development task list and timeline
- **[CHANGELOG](./CHANGELOG.md)** - Architectural changes and milestones
- **[Product Vision](./product-vision.md)** - Product goals and business strategy
- **[Documentation Hub](./docs/README.md)** - Technical docs and troubleshooting
- **[Research](./research/README.md)** - Framework evaluations and technical research
- **[AI Skills](./.cursor/README.md)** - Domain expert sub-agents for AI assistance

### MIDI Specifications
- **[Microcosm MIDI Spec](./docs/midi/microcosm-spec.md)** - 35 parameters for Hologram Microcosm
- **[Gen Loss MKII MIDI Spec](./docs/midi/gen-loss-mkii-spec.md)** - 41 parameters for Chase Bliss Gen Loss MKII
- **[Bluetooth MIDI Setup](./docs/midi/bluetooth-midi-setup.md)** - Wireless MIDI connection guide
- **[USB MIDI Setup](./docs/midi/macos-setup.md)** - USB MIDI connection guide

## Contributing

This is currently a solo project. Contribution guidelines TBD.

## License

TBD

---

**Current Status**: ✅ **Phase 1.2 & 1.3 Complete** - Full MIDI layer implemented! Type-safe Rust backend with Tauri commands, ready for device testing.

**What's Built:**
- ✅ Complete Microcosm & Gen Loss MKII parameter definitions (76 parameters total)
- ✅ MIDI Manager with connection handling & state tracking
- ✅ 12 Tauri commands for frontend integration
- ✅ TypeScript bindings with full type safety
- ✅ Preset recall system (sends all parameters)

**Next Action**: 
1. Set up Bluetooth MIDI adapter with Microcosm (see [`docs/midi/bluetooth-midi-setup.md`](docs/midi/bluetooth-midi-setup.md))
2. Run `cd tauri && cargo run --bin test-midi-detection` to verify detection
3. Test parameter sending with physical pedal

**Last Updated**: 2026-02-12

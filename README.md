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

### ✅ Tauri macOS Initialization Crash - FIXED
**Status**: Fixed on February 12, 2026

The app was crashing during Tauri window initialization on macOS 15.6. This has been resolved. See [troubleshooting guide](./docs/troubleshooting/macos-initialization-crash.md) for details.

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

### 🔄 Phase 0.1: Fix Dev Environment (In Progress)
- ✅ Resolve Tauri initialization crash
- ⬜ Test MIDI communication
- ⬜ Create first UI component

### ⬜ Phase 1: Gen Loss MKII MVP (8-12 weeks)
- Map all Gen Loss MKII MIDI CCs
- Build custom UI controls (Knob, DIPSwitch, Slider)
- Implement preset save/load with SQLite
- Add tagging and search
- Test with physical pedal

### ⬜ Phase 2: Polish & UX
- Full-text search
- Export/import presets
- Keyboard shortcuts
- Error handling

### ⬜ Phase 3: Second Pedal (Hologram Microcosm)
- Multi-pedal architecture
- Pedal switching

### ⬜ Phase 4: Windows Support
### ⬜ Phase 5: iPad Support (Tauri Mobile)

## Commands

```bash
# Development
pnpm run tauri:dev          # Start Tauri dev server
pnpm run dev                # Start Vite dev server only

# Build
pnpm run tauri:build        # Build production app
pnpm run build              # Build frontend only

# Code Quality
pnpm run format             # Format TS/React + Rust
pnpm run lint               # Lint TS/React + Rust (when configured)
```

## Documentation

- **[CHANGELOG](./CHANGELOG.md)** - Architectural changes and milestones
- **[Product Vision](./product-vision.md)** - Product goals and roadmap
- **[Documentation Hub](./docs/README.md)** - Technical docs and troubleshooting
- **[Research](./research/README.md)** - Framework evaluations and technical research
- **[AI Skills](./.cursor/README.md)** - Domain expert sub-agents for AI assistance

## Contributing

This is currently a solo project. Contribution guidelines TBD.

## License

TBD

---

**Current Status**: Development environment setup complete. Tauri initialization crash fixed. Ready to proceed with MIDI implementation.

**Last Updated**: 2026-02-12

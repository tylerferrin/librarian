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

### Tauri Dev Server Crash
The app currently crashes during Tauri initialization. This is a known issue being investigated. Possible causes:
- Window configuration in `tauri.conf.json`
- Icon file configuration
- Tauri 2.0 + macOS compatibility

**Next Steps to Fix**:
1. Simplify `tauri.conf.json` to minimal config
2. Test with Tauri examples
3. Update to latest Tauri 2.x patch version
4. Check Tauri GitHub issues for similar crashes on macOS 15.6

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
├── src-tauri/                   # Rust backend
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
- Resolve Tauri initialization crash
- Test MIDI communication
- Create first UI component

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

See the `/research` folder for comprehensive technical documentation:

- **[Technical Proposal](./research/technical-proposal.md)** - Complete architecture & implementation plan
- **[Tauri vs Electron](./research/tauri-vs-electron-comparison.md)** - Framework comparison & decision rationale
- **[Desktop Frameworks](./research/01-desktop-frameworks.md)** - Detailed framework analysis
- **[MIDI Libraries](./research/02-midi-libraries.md)** - MIDI implementation guide
- **[Storage Options](./research/03-storage-options.md)** - Database strategy
- **[UI Frameworks](./research/04-ui-frameworks.md)** - UI component architecture

## Contributing

This is currently a solo project. Contribution guidelines TBD.

## License

TBD

---

**Current Status**: Development environment setup complete. Investigating Tauri initialization crash before proceeding with MIDI implementation.

**Last Updated**: 2026-02-12

# Technical Research for Pedal Editor

This folder contains comprehensive research and technical proposals for building a cross-platform MIDI pedal editor and preset manager.

---

## Documents Overview

### 📋 [technical-proposal.md](./technical-proposal.md) - **START HERE**

**The complete technical architecture and implementation plan.**

Covers:
- Recommended technology stack (Tauri + React + Rust)
- Complete system architecture with diagrams
- Project structure and organization
- MIDI implementation details
- Database design
- UI component architecture
- Phased development plan (Phases 0-5)
- Timeline estimates (8-12 weeks for MVP)
- Risk mitigation strategies

**This is your blueprint for building the application.**

---

### ⚖️ [tauri-vs-electron-comparison.md](./tauri-vs-electron-comparison.md)

**Side-by-side comparison for final decision-making.**

Quick reference covering:
- Bundle size (Tauri: 10 MB vs Electron: 150 MB)
- Performance metrics
- MIDI timing comparison
- Cross-platform support (including iPad)
- Developer experience
- Real-world examples
- Decision matrix
- Next steps

**Read this if you need to justify the Tauri decision or want a quick summary.**

---

### 🖥️ [01-desktop-frameworks.md](./01-desktop-frameworks.md)

**Deep dive into desktop application frameworks.**

Compares:
- **Tauri**: Modern, Rust-based, excellent performance
- **Electron**: Mature, JavaScript-focused, large ecosystem
- **React Native macOS**: Native rendering, Apple-focused

Includes:
- Detailed pros/cons
- MIDI suitability analysis
- Cross-platform strategies
- Production examples
- Code samples

---

### 🎹 [02-midi-libraries.md](./02-midi-libraries.md)

**MIDI library analysis for both Tauri and Electron.**

#### For Tauri (Rust):
- **midir**: Cross-platform, excellent timing
- Complete implementation examples
- Tauri command integration

#### For Electron (Node.js):
- **@julusian/midi**: Actively maintained, prebuilt binaries
- **easymidi**: Higher-level API
- **JZZ**: Feature-rich universal MIDI

Includes:
- API examples
- Performance comparison
- MIDI message reference
- Testing strategies

---

### 💾 [03-storage-options.md](./03-storage-options.md)

**Local database and storage solutions.**

Compares:
1. **SQLite** (Recommended)
   - **better-sqlite3** (Node.js/Electron)
   - **rusqlite** (Rust/Tauri)
   - Fast, reliable, single-file
   - Full-text search with FTS5

2. **JSON + Indexing**
   - **lowdb**: Simple file-based storage
   - **lowdb + Lunr**: With full-text search
   - Good for prototyping

3. **Embedded NoSQL**
   - PouchDB, LevelDB (not recommended for this use case)

Includes:
- Complete code examples
- Schema design
- Performance benchmarks
- Backup/export strategies
- Migration paths

---

### 🎨 [04-ui-frameworks.md](./04-ui-frameworks.md)

**UI component strategy for music production apps.**

**Recommendation**: Build custom controls with Tailwind CSS + shadcn/ui

Covers:
- Custom MIDI control implementations:
  - Rotary Knob (mouse drag, touch support)
  - MIDI Slider (0-127 range)
  - DIP Switch (binary toggle)
  - Parameter Groups
- Standard UI components (shadcn/ui)
- Dark mode color schemes
- Layout recommendations
- Accessibility (keyboard navigation)
- Performance optimization
- Testing with Storybook

**Why not use heavy component libraries?**
Music hardware UI requires specialized controls not found in generic libraries. Better to build custom.

---

## Quick Start Guide

### 1. Read the Proposal

Start with [technical-proposal.md](./technical-proposal.md) to understand the complete architecture.

### 2. Review the Comparison

Check [tauri-vs-electron-comparison.md](./tauri-vs-electron-comparison.md) to confirm the Tauri decision.

### 3. Deep Dive as Needed

- Building MIDI? → Read [02-midi-libraries.md](./02-midi-libraries.md)
- Setting up database? → Read [03-storage-options.md](./03-storage-options.md)
- Designing UI? → Read [04-ui-frameworks.md](./04-ui-frameworks.md)

### 4. Start Building

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Create Tauri project
npm create tauri-app@latest librarian

# Choose: React + TypeScript
cd librarian

# Install dependencies
npm install

# Start development
npm run tauri dev
```

---

## Technology Stack Summary

### Recommended Stack (Tauri)

```
┌─────────────────────────────────────┐
│         Frontend Layer              │
├─────────────────────────────────────┤
│ React + TypeScript                  │
│ Tailwind CSS                        │
│ shadcn/ui (standard components)     │
│ Custom controls (Knob, Slider, DIP) │
└─────────────────────────────────────┘
              ⬍ Tauri IPC ⬍
┌─────────────────────────────────────┐
│         Backend Layer               │
├─────────────────────────────────────┤
│ Rust                                │
│ midir (MIDI)                        │
│ rusqlite (database)                 │
│ Tauri commands                      │
└─────────────────────────────────────┘
              ⬍ CoreMIDI ⬍
┌─────────────────────────────────────┐
│         Hardware Layer              │
├─────────────────────────────────────┤
│ MIDI Pedals                         │
│ (Gen Loss MKII, Microcosm, etc.)    │
└─────────────────────────────────────┘
```

---

## Development Phases

### Phase 0: Foundation (1-2 weeks)
- Set up Tauri + React project
- Implement MIDI manager (Rust)
- Test MIDI communication with hardware
- Initialize SQLite database

**Deliverable**: App that sends MIDI CC messages

---

### Phase 1: Gen Loss MKII MVP (3-4 weeks)
- Define Gen Loss MKII parameter map
- Build custom UI controls (Knob, DIPSwitch)
- Implement preset save/load
- Build preset browser
- Add tagging system

**Deliverable**: Complete editor for one pedal

---

### Phase 2: Polish & UX (1-2 weeks)
- Full-text search
- "Send Full State" sync
- Export/import functionality
- Keyboard shortcuts
- Error handling

**Deliverable**: Production-quality experience

---

### Phase 3: Second Pedal (1-2 weeks)
- Define Hologram Microcosm parameters
- Test multi-pedal architecture
- Refine pedal definition system

**Deliverable**: Proof of scalability

---

### Phase 4: Windows Support (1-2 weeks)
- Test on Windows
- Fix platform-specific issues
- Create installers

**Deliverable**: Cross-platform desktop app

---

### Phase 5: iPad (Future)
- Evaluate Tauri Mobile maturity
- Adapt UI for touch
- App Store submission

**Deliverable**: iPad support

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Desktop Framework** | Tauri | 96% smaller bundles, better MIDI timing, iPad path |
| **MIDI Library** | midir (Rust) | Native performance, cross-platform, no rebuild issues |
| **Database** | rusqlite | Fast, single-file, full-text search |
| **UI Foundation** | Tailwind CSS | Perfect for custom controls |
| **UI Components** | Custom + shadcn/ui | Music apps need specialized controls |
| **Language** | TypeScript + Rust | Type safety throughout, best of both worlds |

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Bundle size | <15 MB | macOS .dmg |
| Memory usage | <100 MB | Idle state |
| App startup | <2s | First launch |
| MIDI latency | <20ms | Parameter to MIDI out |
| UI responsiveness | 60fps | Knob dragging |
| Preset load | <100ms | Query + UI update |
| Search | <50ms | 1000 presets |

---

## Next Actions

### Immediate (This Week)
1. ✅ Review all research documents
2. ✅ Confirm Tauri decision
3. ⬜ Install Rust and Node.js
4. ⬜ Create Tauri project
5. ⬜ Set up Git repository

### Week 1-2
1. ⬜ Implement basic MIDI manager (Rust)
2. ⬜ Create Tauri commands
3. ⬜ Test MIDI CC with hardware pedal
4. ⬜ Initialize SQLite database
5. ⬜ Set up React + Tailwind

### Week 3-4
1. ⬜ Build Knob component
2. ⬜ Build DIPSwitch component
3. ⬜ Map Gen Loss MKII parameters
4. ⬜ Create pedal editor UI
5. ⬜ Test with physical pedal

### Week 5-6
1. ⬜ Implement preset save/load
2. ⬜ Build preset browser
3. ⬜ Add tagging system
4. ⬜ Add search functionality
5. ⬜ Test full workflow

---

## Resources

### Documentation
- [Tauri Docs](https://tauri.app/)
- [midir Docs](https://docs.rs/midir/)
- [rusqlite Docs](https://docs.rs/rusqlite/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

### Learning Resources
- [Rust Book](https://doc.rust-lang.org/book/) (for basics)
- [Tauri Examples](https://github.com/tauri-apps/tauri/tree/dev/examples)
- [MIDI Specification](https://www.midi.org/specifications)

### Community
- [Tauri Discord](https://discord.gg/tauri)
- [r/rust](https://reddit.com/r/rust)
- [r/MusicProduction](https://reddit.com/r/MusicProduction)

---

## Questions?

If you have questions about any of these documents or need clarification on technical decisions, please refer to:

1. **Technical Proposal** for architecture questions
2. **Tauri vs Electron Comparison** for framework questions
3. **Specific research docs** for implementation details

---

## Document Updates

These documents are living references. As you build and learn, update them with:
- Real-world findings
- Performance measurements
- Challenges encountered
- Solutions discovered

**Last Updated**: 2026-02-12

---

**Ready to build?** Start with the [technical proposal](./technical-proposal.md) and let's create an amazing pedal editor! 🎸🎹

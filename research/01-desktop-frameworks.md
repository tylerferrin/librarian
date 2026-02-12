# Desktop Framework Comparison

*Research for Pedal Editor & Preset Manager - Cross-Platform Desktop Application*

---

## Executive Summary

For a MIDI pedal editor targeting macOS → Windows → iPad, **Tauri** provides the best balance of performance, bundle size, and cross-platform capabilities while supporting React + TypeScript development.

### Quick Comparison

| Criteria | Electron | Tauri | React Native macOS |
|----------|----------|-------|-------------------|
| **Bundle Size** | ~150 MB | ~5-15 MB | ~10-20 MB |
| **Memory Usage** | High (100-300 MB) | Low (58% less) | Low |
| **MIDI Timing** | Good (native addons) | Excellent (Rust) | Excellent (native) |
| **React/TypeScript DX** | Excellent | Good | Good (different) |
| **Windows Support** | ✅ Excellent | ✅ Excellent | ⚠️ Weak |
| **iPad Support** | ❌ No | ✅ Yes (alpha) | ✅ Yes |
| **Ecosystem Maturity** | Very High | Growing | Medium |
| **Learning Curve** | Low | Medium (Rust) | Medium (native) |

---

## 1. Electron

### Overview

Electron bundles Chromium + Node.js to create desktop apps using web technologies. Used by VS Code, Slack, Discord, and thousands of applications.

### Technical Architecture

```
Electron App
├── Main Process (Node.js)
│   ├── Native modules (MIDI, file system)
│   └── App lifecycle
└── Renderer Process (Chromium)
    └── React UI
```

### MIDI Suitability

- **Native MIDI**: Via Node addons (`@julusian/midi`, `node-midi`)
- **CoreMIDI Access**: Through RtMidi bindings
- **Timing**: Good for preset editing (50-100ms latency typical)
- **Web MIDI API**: Available but less predictable timing

**Verdict**: Adequate for preset editor use case. Not suitable for sample-accurate DAW-style timing, but perfect for parameter control.

### Performance Characteristics

- **Bundle Size**: 150-200 MB minimum (includes Chromium runtime)
- **Memory**: 100-300 MB for simple apps
- **Startup Time**: 1-3 seconds typical
- **CPU**: Higher baseline due to Chromium

### Native API Access

- **CoreMIDI**: Via native Node addons (requires `electron-rebuild`)
- **File System**: Full Node.js access
- **System Integration**: Good (notifications, menus, dialogs)
- **Native Modules**: Requires rebuild for each Electron version

**Challenge**: Native module version compatibility. Each Electron update requires rebuilding native addons.

### Cross-Platform Strategy

✅ **macOS**: First-class support, code signing straightforward  
✅ **Windows**: Excellent support, MSI/EXE installers  
✅ **Linux**: AppImage, deb, rpm packages  
❌ **iPad**: Not supported (desktop only)

**Expansion Path**: Desktop platforms only. Would need separate React Native codebase for iPad.

### Developer Experience

**Pros**:
- Familiar: Pure JavaScript/TypeScript throughout
- Rich ecosystem: npm packages, React libraries, tooling
- Excellent documentation and community
- Hot reload and DevTools work perfectly
- Many examples and tutorials

**Cons**:
- Native module complexity (`electron-rebuild`, version matching)
- Large bundle sizes
- Distribution and updates more complex than native apps

### Production Examples

- **Visual Studio Code**: Text editor
- **Slack**: Communication
- **Discord**: Gaming chat
- **Figma**: Design tool (desktop version)

### Cost Analysis

- **Development Speed**: Fast (familiar stack)
- **Distribution Size**: ~150 MB download per platform
- **Performance**: Good enough, not optimal
- **Maintenance**: Native module updates required

---

## 2. Tauri (Recommended)

### Overview

Tauri uses Rust backend + system WebView for frontend. Combines native performance with web UI flexibility.

### Technical Architecture

```
Tauri App
├── Rust Core
│   ├── MIDI handler (midir)
│   ├── Database (rusqlite/better-sqlite3)
│   ├── File system
│   └── Commands (IPC bridge)
└── WebView (System)
    └── React UI
```

### MIDI Suitability

- **Native MIDI**: Via Rust `midir` crate
- **CoreMIDI**: Direct bindings, no wrapper overhead
- **Timing**: Excellent (Rust is close to C/C++ performance)
- **Reliability**: More stable than Web MIDI in testing

**Research Finding**: Strudel's Tauri MIDI bridge showed more stable timing than Chromium's Web MIDI API.

**Verdict**: Superior to Electron for MIDI timing and reliability.

### Performance Characteristics

- **Bundle Size**: 5-15 MB (96% smaller than Electron)
- **Memory**: 58% lower than Electron in benchmarks
- **Startup Time**: <1 second typical
- **CPU**: Minimal overhead (system WebView)

**Real-World Example**: 10 MB .dmg for macOS (vs 150 MB for equivalent Electron app)

### Native API Access

- **CoreMIDI**: Direct via `midir` or `coremidi` crate
- **File System**: Rust std library
- **System Integration**: Native (better than Electron)
- **No Rebuild Issues**: Rust compiles to native; no version mismatches

**Key Advantage**: Direct native integration without native module compatibility hell.

### Cross-Platform Strategy

✅ **macOS**: First-class support (x64 & ARM64)  
✅ **Windows**: Excellent (uses Edge WebView2)  
✅ **Linux**: Good (WebKitGTK)  
✅ **iPad**: Yes (via Tauri Mobile - alpha stage)

**Expansion Path**: 
1. macOS → Windows → Linux (stable, production-ready)
2. iPad/iOS via Tauri Mobile (alpha, but viable for 2026)

**Single Codebase**: React frontend works across all platforms. Platform-specific Rust as needed.

### Developer Experience

**Pros**:
- Modern: Vite, React, TypeScript out of the box
- Type-safe IPC: Generate TypeScript types from Rust commands
- Hot reload works well
- Growing ecosystem with active development
- Better security model than Electron

**Cons**:
- Need to learn Rust basics for backend
- Smaller ecosystem than Electron
- Fewer third-party examples
- Debugging spans two languages

**Learning Curve**: Medium. Basic Rust needed for MIDI bridge, can copy/paste much of the boilerplate.

### Production Examples

- **1Password**: Password manager (migrating from Electron)
- **Spacedrive**: File explorer
- **Lapce**: Code editor
- Many smaller utilities and tools

### Cost Analysis

- **Development Speed**: Slightly slower initially (Rust learning), faster long-term
- **Distribution Size**: ~10 MB (faster downloads, smaller hosting costs)
- **Performance**: Excellent (better user experience)
- **Maintenance**: Lower (no native module version issues)

---

## 3. React Native macOS

### Overview

Brings React Native to desktop platforms. Native AppKit/UIKit rendering instead of web view.

### Technical Architecture

```
React Native macOS
├── JavaScript Core / Hermes
│   └── React components
└── Native Modules
    ├── Swift/ObjC (macOS)
    └── Native UI rendering
```

### MIDI Suitability

- **Native MIDI**: Full CoreMIDI access via Swift/ObjC
- **Libraries**: MIDIKit, MIKMIDI, MorkAndMIDI
- **Timing**: Excellent (native)
- **Integration**: First-class for Apple platforms

**Verdict**: Best MIDI integration on Apple platforms, but weak Windows story makes it unsuitable for this project.

### Cross-Platform Strategy

✅ **macOS**: Excellent (native AppKit)  
✅ **iPad**: Excellent (native UIKit)  
⚠️ **Windows**: Exists but niche, weak ecosystem  
❌ **Linux**: Not really supported

**Deal Breaker**: Windows support is too weak for your expansion plans.

### Developer Experience

**Pros**:
- React skills transfer
- Native performance
- Excellent Apple platform integration

**Cons**:
- Different from web React (no DOM)
- More native module work required
- Smaller desktop community (mobile-focused)
- Platform-specific code increases with Windows

**Verdict**: Only consider if you're Apple-ecosystem-only.

---

## Decision Matrix

### Use Electron If:

- ❌ You want zero learning curve (pure Node.js)
- ❌ iPad support is not required (desktop only is fine)
- ❌ Bundle size doesn't matter
- ❌ You need maximum ecosystem maturity today

### Use Tauri If:

- ✅ You want best performance and smallest bundles
- ✅ iPad support is important (even if deferred)
- ✅ You're willing to learn basic Rust
- ✅ You want better MIDI timing
- ✅ You value modern tooling and architecture

### Use React Native macOS If:

- ❌ You're only targeting macOS + iPad
- ❌ Windows support is not important
- ❌ You prefer native UI over web UI

---

## Recommendation: Tauri

### Why Tauri Wins for This Project

1. **Performance**: 96% smaller bundles, 58% less memory
2. **MIDI**: Better timing via Rust `midir`
3. **Cross-Platform**: macOS → Windows → iPad all supported
4. **Future-Proof**: Growing ecosystem, modern architecture
5. **User Experience**: Faster, lighter, more native feel

### Addressing the Rust Learning Curve

**You don't need to be a Rust expert**. For this project:

- **MIDI bridge**: ~100-200 lines of Rust (can start from examples)
- **Database**: Use Rust or Node.js SQLite (your choice)
- **Business logic**: Stays in TypeScript/React
- **UI**: Pure React (zero Rust)

**Estimated Rust Code**: 10-15% of total codebase.

### Risk Mitigation

- **Rust unfamiliar?** Start with Tauri MIDI examples, copy/paste initially
- **Tauri Mobile alpha?** Build desktop first, defer iPad to Phase 3+
- **Smaller ecosystem?** Core needs (MIDI, React, SQLite) are well-supported
- **Need help?** Active Discord community, good documentation

---

## Technical Implementation Notes

### Tauri MIDI Setup

```rust
// tauri/src/midi.rs
use midir::{MidiOutput, MidiOutputConnection};

#[tauri::command]
fn send_midi_cc(channel: u8, controller: u8, value: u8) -> Result<(), String> {
    let status = 0xB0 | channel;
    connection.send(&[status, controller, value])
        .map_err(|e| e.to_string())
}
```

```typescript
// src/hooks/useMidi.ts
import { invoke } from '@tauri-apps/api/tauri';

export function useMidi() {
  const sendCC = async (channel: number, cc: number, value: number) => {
    await invoke('send_midi_cc', { channel, controller: cc, value });
  };
  
  return { sendCC };
}
```

### Electron MIDI Setup

```typescript
// main.js (Node.js process)
const midi = require('@julusian/midi');
const output = new midi.Output();

ipcMain.handle('send-midi-cc', (event, channel, cc, value) => {
  const status = 0xB0 | channel;
  output.sendMessage([status, cc, value]);
});
```

```typescript
// renderer.tsx (React)
import { ipcRenderer } from 'electron';

const sendCC = async (channel: number, cc: number, value: number) => {
  await ipcRenderer.invoke('send-midi-cc', channel, cc, value);
};
```

---

## Conclusion

**Choose Tauri** for the best balance of performance, developer experience, and cross-platform capability for a modern MIDI pedal editor.

The small investment in learning basic Rust pays off with:
- Better user experience (smaller, faster)
- Better developer experience (no native module hell)
- Better long-term maintainability
- Path to iPad when you're ready

**Start building with Tauri today. The ecosystem is mature enough for production use.**

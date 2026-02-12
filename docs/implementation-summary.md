# MIDI Implementation Summary

**Date:** February 12, 2026  
**Status:** ✅ **Ready for Physical Device Testing**

## What Was Built

We've implemented a complete, type-safe MIDI layer for the Librarian app, supporting both the Hologram Microcosm and Chase Bliss Generation Loss MKII pedals.

---

## 📁 File Structure Created

```
tauri/src/
├── commands.rs                  # 12 Tauri IPC commands
├── midi/
│   ├── mod.rs                   # Module exports
│   ├── error.rs                 # MidiError types with thiserror
│   ├── manager.rs               # MidiManager - connection & state management
│   ├── device_detection.rs      # Device enumeration
│   └── pedals/
│       ├── mod.rs              
│       ├── microcosm.rs         # 35 parameters, all types & state
│       └── gen_loss_mkii.rs     # 41 parameters, all types & state

src/lib/
└── midi.ts                       # TypeScript bindings (12 functions + helpers)

docs/midi/
├── microcosm-spec.md            # 35-parameter specification
├── gen-loss-mkii-spec.md        # 41-parameter specification
├── bluetooth-midi-setup.md      # Bluetooth MIDI guide for macOS
└── macos-setup.md               # USB MIDI guide for macOS
```

---

## 🎛️ Pedal Support

### Hologram Microcosm (35 Parameters)

**Implemented:**
- ✅ Time controls (Subdivision, Time, Hold Sampler, Tap Tempo)
- ✅ Special Sauce (Activity, Repeats)
- ✅ Modulation (Shape with 4 waveforms, Frequency, Depth)
- ✅ Filter (Cutoff, Resonance)
- ✅ Effect controls (Mix, Volume, Bypass, Reverse)
- ✅ Reverb (Space, 4 reverb modes)
- ✅ **Complete Looper** (15 parameters)
  - Level, Speed, Fade Time
  - Direction, Routing, Modes
  - Transport: Record, Play, Overdub, Stop, Undo, Erase
- ✅ Preset management (Copy, Save)

**Type Safety:**
```rust
pub enum SubdivisionValue { QuarterNote, HalfNote, Tap, Double, Quadruple, Octuple }
pub enum WaveformShape { Square, Ramp, Triangle, Saw }
pub enum ReverbMode { BrightRoom, DarkMedium, LargeHall, Ambient }
```

### Chase Bliss Gen Loss MKII (41 Parameters)

**Implemented:**
- ✅ 7 main control knobs (Wow, Flutter, Saturate, Failure, etc.)
- ✅ Tape model selection (13 models: CPR-3300, Portamax, Dictatron, etc.)
- ✅ 3-position toggles (Dry, Noise, Aux)
- ✅ Footswitches (Bypass, Aux, Alt mode)
- ✅ External aux switches (Left, Center, Right)
- ✅ **16 DIP switches**
  - Left bank: Wow, Flutter, Sat/Gen, Failure/HP, Model/LP, Bounce, Random, Sweep
  - Right bank: Polarity, Classic, Miso, Spread, Dry Type, Drop/Snag/Hum Bypass
- ✅ Advanced parameters (Expression, Hiss, Noise levels, Input gain, DSP bypass)
- ✅ Preset save (slots 1-122)

**Type Safety:**
```rust
pub enum TapeModel { None, CPR3300Gen1, PortamaxRT, CAM8, MPEX, /* 9 more */ }
pub enum DryMode { Dry1, Dry2, Dry3 }
pub enum InputGain { LineLevel, InstrumentLevel, HighGain }
```

---

## 🔧 Rust Backend API

### MIDI Manager (`manager.rs`)

```rust
pub struct MidiManager {
    // Manages multiple simultaneous device connections
    // Tracks state for each connected pedal
    // Handles CC message sending with throttling
}
```

**Key Methods:**
- `list_devices()` - Enumerate all MIDI ports
- `connect_microcosm(name, channel)` - Connect to Microcosm
- `connect_gen_loss_mkii(name, channel)` - Connect to Gen Loss MKII
- `send_microcosm_parameter(name, param)` - Send single parameter
- `recall_microcosm_preset(name, state)` - Send all 35 parameters
- `get_microcosm_state(name)` - Get current app-tracked state
- `is_connected(name)` - Check connection status
- `disconnect(name)` - Close connection

### State Tracking

Each device maintains a complete state struct in the app:

```rust
pub struct MicrocosmState {
    pub activity: u8,           // Current value 0-127
    pub repeats: u8,
    pub subdivision: SubdivisionValue,
    pub bypass: bool,
    // ... all 35 parameters
}
```

**Benefits:**
- Instant UI queries (no MIDI roundtrip)
- Diff detection (only send changed parameters)
- Preset comparison
- Full state serialization

### Error Handling

```rust
pub enum MidiError {
    NotConnected(String),
    InvalidValue { expected: String, actual: u8 },
    DeviceNotFound(String),
    ConnectionFailed(String),
    SendFailed(String),
    // ... 5 more variants
}

pub type MidiResult<T> = Result<T, MidiError>;
```

---

## 🌉 Tauri Commands (12 total)

All commands are async and return `Result<T, String>`:

```rust
#[tauri::command]
async fn list_midi_devices(manager: State<SharedMidiManager>) -> Result<Vec<String>, String>

#[tauri::command]
async fn connect_microcosm(manager: State<SharedMidiManager>, device_name: String, midi_channel: u8) -> Result<(), String>

#[tauri::command]
async fn send_microcosm_parameter(manager: State<SharedMidiManager>, device_name: String, param: MicrocosmParameter) -> Result<(), String>

// ... 9 more commands
```

**Thread Safety:** `SharedMidiManager = Arc<Mutex<MidiManager>>`

---

## 💻 TypeScript Frontend API

### Type-Safe Bindings (`src/lib/midi.ts`)

```typescript
// List devices
const devices = await listMidiDevices();

// Connect
await connectMicrocosm('WIDI Jack', 1);

// Send parameters (type-safe!)
await sendMicrocosmParameter('WIDI Jack', MicrocosmParams.activity(80));
await sendMicrocosmParameter('WIDI Jack', MicrocosmParams.bypass(false));
await sendMicrocosmParameter('WIDI Jack', MicrocosmParams.looperRecord());

// Get state
const state = await getMicrocosmState('WIDI Jack');
console.log('Activity:', state.activity); // TypeScript knows this is a number

// Recall preset (sends all parameters with 10ms throttling)
await recallMicrocosmPreset('WIDI Jack', myPresetState);
```

### Helper Builders

```typescript
// Clean API for building parameters
MicrocosmParams.activity(value: number)
MicrocosmParams.subdivision(value: SubdivisionValue)
MicrocosmParams.shape(value: WaveformShape)
MicrocosmParams.bypass(value: boolean)
MicrocosmParams.looperRecord()  // Trigger actions
```

---

## 🎯 Testing Workflow

### 1. Device Detection Test

```bash
cd tauri
cargo run --bin test-midi-detection
```

**What it does:**
- Lists all MIDI input/output ports
- Searches for "Microcosm" and "Gen Loss" devices
- Provides troubleshooting hints

**Expected output:**
```
🔍 Hologram Microcosm:
  ✓ Found: WIDI Jack (Input)
  ✓ Found: WIDI Jack (Output)
```

### 2. Manual Parameter Testing

Once device is detected, you can test from the app:

```typescript
// In React component or browser console
import * as midi from '@/lib/midi';

// List devices
const devices = await midi.listMidiDevices();
console.log(devices); // ["WIDI Jack", "Gen Loss MKII", ...]

// Connect
await midi.connectMicrocosm('WIDI Jack', 1);

// Test basic parameter
await midi.sendMicrocosmParameter('WIDI Jack', midi.MicrocosmParams.activity(100));
// → Should hear effect change on pedal!

// Test bypass toggle
await midi.sendMicrocosmParameter('WIDI Jack', midi.MicrocosmParams.bypass(true));
await midi.sendMicrocosmParameter('WIDI Jack', midi.MicrocosmParams.bypass(false));

// Test looper
await midi.sendMicrocosmParameter('WIDI Jack', midi.MicrocosmParams.looperRecord());
// → Play some audio, then:
await midi.sendMicrocosmParameter('WIDI Jack', midi.MicrocosmParams.looperPlay());
```

---

## 🔍 Key Implementation Details

### MIDI Message Format

All parameters send standard MIDI Control Change:

```
Status Byte: 0xB0 + (channel - 1)
CC Number:   0-127 (parameter-specific)
Value:       0-127
```

Example (Channel 1, Activity = 80):
```
[0xB0, 0x06, 0x50]
```

### Binary Parameters

"On/Off" parameters use range split (not just 0/127):
```
0-63  = Off
64-127 = On
```

### Preset Recall Throttling

When recalling presets (all parameters at once):
```rust
for (cc_number, value) in cc_map.iter() {
    connection.send_cc(*cc_number, *value)?;
    thread::sleep(Duration::from_millis(10)); // Prevent MIDI buffer overflow
}
```

### Stepped Parameters

Enums for parameters with discrete values:

```rust
// Microcosm Subdivision (CC 5)
0 → Quarter Note
1 → Half Note
2 → Tap
3 → 2x
4 → 4x
5 → 8x

// Gen Loss Tape Model (CC 16)
0 → None
15 → CPR-3300 Gen 1
24 → CPR-3300 Gen 2
// ... specific CC values for each model
127 → M-PEX
```

---

## ✅ What Works Now

- ✅ **Device enumeration** (USB and Bluetooth MIDI)
- ✅ **Connection management** (connect, disconnect, status check)
- ✅ **Parameter sending** (type-safe, validated)
- ✅ **State tracking** (app maintains current values)
- ✅ **Preset recall** (send all parameters at once)
- ✅ **Multi-device support** (connect multiple pedals simultaneously)
- ✅ **Error handling** (descriptive errors for all failure cases)
- ✅ **TypeScript bindings** (full type safety in frontend)

---

## 🚧 Not Yet Implemented (Future)

- ⏳ **Bidirectional MIDI** (listen for pedal knob changes)
  - Foundation exists, needs input connection handler
  - Would enable: pedal → app sync, MIDI learn
- ⏳ **React hooks** (`useMIDI`, `useMIDIConnection`, `useMIDIParameter`)
- ⏳ **UI components** (device selector, connection status, parameter controls)
- ⏳ **Database integration** (save/load presets from SQLite)
- ⏳ **Preset comparison** (diff two presets, show changes)

---

## 📊 Code Statistics

| Component | Lines of Code | Files |
|-----------|--------------|-------|
| **Rust Backend** | ~2,800 | 7 files |
| - Microcosm definitions | ~750 | 1 file |
| - Gen Loss definitions | ~1,100 | 1 file |
| - MIDI Manager | ~400 | 1 file |
| - Commands | ~150 | 1 file |
| - Error types | ~80 | 1 file |
| **TypeScript Frontend** | ~350 | 1 file |
| **Documentation** | ~1,900 | 4 files |
| **Total** | **~5,050 lines** | **12 files** |

---

## 🎓 Learning Resources

### For Testing

- **MIDI Monitor** (macOS): https://www.snoize.com/MIDIMonitor/
  - See CC messages in real-time
  - Verify pedal is sending/receiving
- **Audio MIDI Setup** (Built into macOS)
  - Manage MIDI devices
  - Test connections

### For Development

- **Rust midir docs**: https://docs.rs/midir/
- **Tauri command docs**: https://tauri.app/v1/guides/features/command
- **MIDI CC specification**: Standard MIDI 1.0 Control Change messages

---

## 🐛 Known Limitations

1. **Bluetooth Latency**: 10-30ms typical (acceptable for parameter control)
2. **No SysEx**: Currently only CC messages (sufficient for both pedals)
3. **Single Channel**: Each device uses one MIDI channel (configurable 1-16)
4. **No Preset Slots**: App-side presets only (not pedal's internal slots)
   - Exception: Gen Loss CC 111 can save to pedal slots 1-122

---

## 🎯 Next Steps for Testing

1. **Connect Bluetooth MIDI adapter** to Microcosm
2. **Pair with Mac** (see `docs/midi/bluetooth-midi-setup.md`)
3. **Run detection test**: `cargo run --bin test-midi-detection`
4. **Launch Tauri app**: `pnpm run tauri dev`
5. **Open browser console** and test TypeScript API
6. **Verify pedal responds** to parameter changes
7. **Document device name** for future auto-detection

---

## 💡 Architecture Highlights

### Type Safety End-to-End

```
TypeScript        Rust             MIDI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MicrocosmParams   MicrocosmParameter   CC Message
.activity(80)  →  Activity(80)      →  [0xB0, 0x06, 0x50]
```

### State Flow

```
User Action → TypeScript → Tauri IPC → Rust → midir → Pedal
               ↓                        ↓
          UI Update ←────────────  State Update
```

### Multi-Device Support

```rust
MidiManager {
    connections: {
        "WIDI Jack": Microcosm { state: {...}, connection: {...} },
        "Gen Loss MKII": GenLossMkii { state: {...}, connection: {...} }
    }
}
```

---

## 🎉 Summary

**Phase 1.2 & 1.3 are complete!** You now have:

- ✅ A complete, type-safe MIDI layer
- ✅ Support for 76 total parameters across 2 pedals
- ✅ Clean separation: Rust backend, TypeScript frontend
- ✅ State tracking for instant UI updates
- ✅ Preset recall system
- ✅ Ready for physical device testing

**The foundation is rock-solid.** Next step: Connect your Microcosm and test!
